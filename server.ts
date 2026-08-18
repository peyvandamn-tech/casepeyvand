import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// In-memory OTP cache for demonstration / production fallback
// Pending ZarinPal payment requests awaiting verification, keyed by authority.
// NOTE: in-memory only, lost on process restart. Fine for a single
// long-running Node process; move to a DB/KV if you scale to multiple
// instances.
const pendingPayments = new Map<string, { amount: number; caseId?: string; userId?: string }>();

// API Routes

// Client context route for legal consents
app.get('/api/client-info', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';
  res.json({ ip, userAgent });
});

// OTP login now goes through Supabase Auth's phone provider (see
// src/components/client/OtpAuthModal.tsx), which routes the actual SMS
// send through supabase/functions/send-sms-hook — so this server no
// longer issues or verifies OTP codes itself.

// ZarinPal Payment Gateway Routes
// Writes the SUCCESS payment row directly via Supabase's REST API using the
// service-role key, which bypasses RLS. Called only after independently
// verifying the transaction with ZarinPal below — never on the strength of
// anything the client claims. Returns an error message on failure, null on
// success.
async function recordVerifiedPayment(payment: {
  caseId: string;
  userId: string;
  amount: number;
  refId: string;
  paidAt: string;
}): Promise<string | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not configured';
  }
  const res = await fetch(`${supabaseUrl}/rest/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      case_id: payment.caseId,
      user_id: payment.userId,
      amount: payment.amount,
      gateway: 'ZarinPal',
      transaction_id: payment.refId,
      status: 'SUCCESS',
      paid_at: payment.paidAt,
    }),
  });
  if (!res.ok) {
    return `Supabase insert failed (HTTP ${res.status}): ${await res.text()}`;
  }
  return null;
}

app.post('/api/payment/request', async (req, res) => {
  try {
    const { caseId, userId, amount, description } = req.body;
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;

    if (!merchantId) {
      return res.status(500).json({ error: 'درگاه پرداخت پیکربندی نشده است (ZARINPAL_MERCHANT_ID تنظیم نشده است).' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'مبلغ پرداخت نامعتبر است' });
    }
    if (!caseId || !userId) {
      return res.status(400).json({ error: 'شناسه پرونده یا کاربر برای ثبت پرداخت ارسال نشده است' });
    }

    const callbackUrl = process.env.ZARINPAL_CALLBACK_URL || `${req.protocol}://${req.get('host')}/payment/callback`;

    const zpRes = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount,
        callback_url: callbackUrl,
        description: description || 'پرداخت خدمات مرکز مشاوره پیوند امن',
        metadata: { caseId, userId },
      }),
    });
    const zpJson: any = await zpRes.json();

    if (zpJson?.data?.code === 100 && zpJson.data.authority) {
      const authority = zpJson.data.authority;
      pendingPayments.set(authority, { amount, caseId, userId });
      return res.json({
        success: true,
        authority,
        paymentUrl: `https://www.zarinpal.com/pg/StartPay/${authority}`,
        amount,
        merchantId,
      });
    }

    console.error('ZarinPal request rejected:', zpJson);
    return res.status(502).json({ error: zpJson?.errors?.message || 'خطا در ایجاد درخواست پرداخت زرین‌پال' });
  } catch (err) {
    console.error('Error creating payment request:', err);
    return res.status(500).json({ error: 'خطا در درگاه پرداخت' });
  }
});

app.post('/api/payment/verify', async (req, res) => {
  try {
    const { authority } = req.body;
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    const pending = pendingPayments.get(authority);

    if (!merchantId) {
      return res.status(500).json({ error: 'درگاه پرداخت پیکربندی نشده است.' });
    }
    if (!pending) {
      return res.status(400).json({ error: 'تراکنش نامعتبر یا منقضی شده است.' });
    }
    if (!pending.caseId || !pending.userId) {
      return res.status(400).json({ error: 'اطلاعات پرونده برای این تراکنش ناقص است.' });
    }

    const zpRes = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount: pending.amount,
        authority,
      }),
    });
    const zpJson: any = await zpRes.json();
    pendingPayments.delete(authority);

    // 100 = fresh success, 101 = already verified previously — both count
    // as a valid paid transaction, per ZarinPal's own docs.
    if (zpJson?.data?.code === 100 || zpJson?.data?.code === 101) {
      const paidAt = new Date().toISOString();

      // Write the SUCCESS row ourselves with the service-role key — RLS
      // deliberately rejects a client-inserted SUCCESS/ZarinPal payment row
      // (see payments_insert_own_pending_card in SUPABASE_SQL_SCHEMA). The
      // on_payment_success DB trigger then advances the case status
      // automatically.
      const writeError = await recordVerifiedPayment({
        caseId: pending.caseId,
        userId: pending.userId,
        amount: pending.amount,
        refId: String(zpJson.data.ref_id),
        paidAt,
      });
      if (writeError) {
        console.error('Failed to persist verified payment:', writeError);
        return res.status(502).json({
          success: false,
          error: 'پرداخت با بانک تأیید شد اما ثبت آن با خطا مواجه شد. لطفاً با پشتیبانی تماس بگیرید.',
        });
      }

      return res.json({
        success: true,
        status: String(zpJson.data.code),
        refId: zpJson.data.ref_id,
        message: zpJson.data.code === 101 ? 'این تراکنش پیش‌تر تأیید شده است' : 'تراکنش با موفقیت تأیید شد',
        paidAt,
      });
    }

    console.error('ZarinPal verify failed:', zpJson);
    return res.status(400).json({ success: false, error: zpJson?.errors?.message || 'تراکنش تأیید نشد' });
  } catch (err) {
    console.error('Error verifying payment:', err);
    return res.status(500).json({ error: 'خطا در تایید تراکنش' });
  }
});

app.post('/api/gemini/analyze-case', async (req, res) => {
  try {
    const { profile, results } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        summary: `مراجع ${profile?.age || 28} ساله، با مدرک ${profile?.education || 'نامشخص'} و شغل ${profile?.jobTitle || 'نامشخص'}، دارای پروفایل روانشناختی باثبات است.`,
        interviewQuestions: [
          'انتظارات دقیق شما از مرزبندی با خانواده همسر آینده چیست؟',
          'در مواجهه با تعارضات مالی یا شغلی چه راهکاری را ترجیح می‌دهید؟',
          'در صورت بروز اختلاف نظر شدید در زندگی مشترک، نحوه تصمیم‌گیری نهایی را چگونه می‌بینید؟',
        ],
        riskPoints: [
          (profile?.workingHoursPerDay || 8) > 9
            ? 'ساعات کاری طولانی ممکن است نیازمند بالانس زمان با خانواده باشد.'
            : 'مورد خاصی در زمینه ساعات کاری مشهود نیست.',
        ],
        strengths: [
          'شفافیت در بیان اهداف ازدواج و فرزندآوری',
          'ثبات شغلی و استقلال مناسب',
          'آمادگی روانی کامل جهت شروع فرآیند معرفی',
        ],
      });
    }

    const prompt = `شما یک مشاور ارشد و روانشناس متخصص ازدواج در مرکز مشاوره پیوند امن هستید.
لطفاً اطلاعات پرونده زیر را تحلیل کنید:
مشخصات فردی: ${JSON.stringify(profile)}
نتایج آزمون‌های روانشناختی: ${JSON.stringify(results)}

پاسخ را دقیقاً به فرمت JSON زیر به زبان فارسی برگردانید:
{
  "summary": "خلاصه تحلیلی روانی فرد",
  "interviewQuestions": ["سوال 1", "سوال 2", "سوال 3"],
  "riskPoints": ["نقطه ریسک یا چالش 1"],
  "strengths": ["نقطه قوت 1", "نقطه قوت 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    }
    throw new Error('No text returned from Gemini');
  } catch (err) {
    console.error('Error analyzing case with Gemini:', err);
    return res.status(500).json({ error: 'Failed to analyze case' });
  }
});

app.post('/api/gemini/compare-cases', async (req, res) => {
  try {
    const { profileA, resultsA, profileB, resultsB } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        synergyAnalysis: `هر دو مراجع (${profileA?.age || 28} ساله و ${profileB?.age || 30} ساله) دارای بلوغ روانی و انگیزه برای تشکیل خانواده هستند.`,
        jointTopicsToDiscuss: [
          'بررسی برنامه‌ریزی پنج‌ساله زندگی و مدیریت شغلی-خانوادگی',
          'نحوه تعامل با خانواده‌های طرفین و حفظ مرزبندی سالم',
          'بررسی نگرش‌های مالی و نحوه‌ی مدیریت هزینه‌های مشترک',
        ],
        potentialFrictionPoints: [
          profileA?.migrationIntention !== profileB?.migrationIntention
            ? 'تفاوت در چشم‌انداز مهاجرت به خارج از کشور نیاز به شفاف‌سازی در جلسه دارد.'
            : 'بررسی جزئیات سبک زندگی در روزهای تعطیل و اوقات فراغت.',
        ],
      });
    }

    const prompt = `شما یک مشاور ارشد ازدواج در سامانه پیوند امن هستید.
دو پرونده متقاضی ازدواج را مقایسه کنید:
فرد الف: ${JSON.stringify(profileA)}, آزمون‌ها: ${JSON.stringify(resultsA)}
فرد ب: ${JSON.stringify(profileB)}, آزمون‌ها: ${JSON.stringify(resultsB)}

پاسخ را دقیقاً به فرمت JSON زیر به زبان فارسی برگردانید:
{
  "synergyAnalysis": "تحلیل هم‌افزایی و نقاط مشترک",
  "jointTopicsToDiscuss": ["موضوع 1", "موضوع 2"],
  "potentialFrictionPoints": ["نقطه چالش احتمالی 1"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    }
    throw new Error('No text returned from Gemini');
  } catch (err) {
    console.error('Error comparing cases with Gemini:', err);
    return res.status(500).json({ error: 'Failed to compare cases' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
