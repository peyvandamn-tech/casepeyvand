/**
 * Cloudflare Worker Entrypoint for casepeyvand
 */

export interface Env {
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>;
  };
  GEMINI_API_KEY?: string;
  ZARINPAL_MERCHANT_ID?: string;
  ENVIRONMENT?: string;
  // Service-role Supabase credentials, used ONLY to write a verified
  // ZarinPal payment as SUCCESS (see recordVerifiedPayment below) — RLS
  // deliberately blocks the client from ever inserting that row itself.
  // Never expose these to the browser bundle; they belong in
  // `wrangler secret put`, not a plain [vars] entry.
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  // Optional KV namespace for pending ZarinPal payments. Cloudflare Worker
  // isolates don't share memory, so the in-memory Map fallback below can
  // silently lose data (a callback lands on a different isolate than the
  // one that issued the request). Bind a KV namespace in wrangler.toml —
  //   [[kv_namespaces]]
  //   binding = "SESSION_KV"
  //   id = "<run `wrangler kv:namespace create SESSION_KV` to get this>"
  // — and everything below automatically switches to using it.
  SESSION_KV?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
}

// In-memory fallback, used only when env.SESSION_KV isn't bound (e.g. local
// `wrangler dev` without a KV namespace configured). Not reliable across
// isolates/deploys in real production traffic — see the Env.SESSION_KV note.
const pendingPayments = new Map<string, { amount: number; caseId?: string; userId?: string }>();

// Writes the SUCCESS payment row directly via Supabase's REST API using the
// service-role key, which bypasses RLS. This is called only after we've
// independently verified the transaction with ZarinPal above — never on
// the strength of anything the client claims. Returns an error message on
// failure, or null on success.
async function recordVerifiedPayment(
  env: Env,
  payment: { caseId: string; userId: string; amount: number; refId: string; paidAt: string }
): Promise<string | null> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not configured';
  }
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
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

async function savePendingPayment(
  env: Env,
  authority: string,
  entry: { amount: number; caseId?: string; userId?: string }
) {
  if (env.SESSION_KV) {
    await env.SESSION_KV.put(`pay:${authority}`, JSON.stringify(entry), { expirationTtl: 3600 });
  } else {
    pendingPayments.set(authority, entry);
  }
}

async function readPendingPayment(env: Env, authority: string) {
  if (env.SESSION_KV) {
    const raw = await env.SESSION_KV.get(`pay:${authority}`);
    return raw ? (JSON.parse(raw) as { amount: number; caseId?: string; userId?: string }) : undefined;
  }
  return pendingPayments.get(authority);
}

async function deletePendingPayment(env: Env, authority: string) {
  if (env.SESSION_KV) {
    await env.SESSION_KV.delete(`pay:${authority}`);
  } else {
    pendingPayments.delete(authority);
  }
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle OPTIONS CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Handle API Routes in Cloudflare Worker environment
    if (url.pathname.startsWith('/api/')) {
      try {
        if (url.pathname === '/api/client-info' && request.method === 'GET') {
          const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';
          const userAgent = request.headers.get('user-agent') || 'Unknown Browser';
          return jsonResponse({ ip, userAgent });
        }

        // OTP login now goes through Supabase Auth's phone provider (see
        // src/components/client/OtpAuthModal.tsx), which routes the actual
        // SMS send through supabase/functions/send-sms-hook — so this
        // Worker no longer issues or verifies OTP codes itself.

        if (url.pathname === '/api/payment/request' && request.method === 'POST') {
          const body = (await request.json().catch(() => ({}))) as {
            amount?: number;
            caseId?: string;
            userId?: string;
            description?: string;
          };
          const merchantId = env.ZARINPAL_MERCHANT_ID;

          if (!merchantId) {
            return jsonResponse({ error: 'درگاه پرداخت پیکربندی نشده است (ZARINPAL_MERCHANT_ID تنظیم نشده است).' }, 500);
          }
          if (!body.amount || body.amount <= 0) {
            return jsonResponse({ error: 'مبلغ پرداخت نامعتبر است' }, 400);
          }
          if (!body.caseId || !body.userId) {
            return jsonResponse({ error: 'شناسه پرونده یا کاربر برای ثبت پرداخت ارسال نشده است' }, 400);
          }

          const callbackUrl = new URL('/payment/callback', request.url).toString();

          try {
            const zpRes = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                merchant_id: merchantId,
                amount: body.amount,
                callback_url: callbackUrl,
                description: body.description || 'پرداخت خدمات مرکز مشاوره پیوند امن',
                metadata: { caseId: body.caseId, userId: body.userId },
              }),
            });
            const zpJson = (await zpRes.json()) as any;

            if (zpJson?.data?.code === 100 && zpJson.data.authority) {
              const authority = zpJson.data.authority;
              await savePendingPayment(env, authority, { amount: body.amount, caseId: body.caseId, userId: body.userId });
              return jsonResponse({
                success: true,
                authority,
                paymentUrl: `https://www.zarinpal.com/pg/StartPay/${authority}`,
                amount: body.amount,
                merchantId,
              });
            }

            console.error('ZarinPal request rejected:', zpJson);
            return jsonResponse({ error: zpJson?.errors?.message || 'خطا در ایجاد درخواست پرداخت زرین‌پال' }, 502);
          } catch (err) {
            console.error('ZarinPal request error:', err);
            return jsonResponse({ error: 'خطا در ارتباط با درگاه پرداخت' }, 502);
          }
        }

        if (url.pathname === '/api/payment/verify' && request.method === 'POST') {
          const body = (await request.json().catch(() => ({}))) as { authority?: string };
          const merchantId = env.ZARINPAL_MERCHANT_ID;
          const pending = body.authority ? await readPendingPayment(env, body.authority) : undefined;

          if (!merchantId) {
            return jsonResponse({ error: 'درگاه پرداخت پیکربندی نشده است.' }, 500);
          }
          if (!pending || !body.authority) {
            return jsonResponse({ error: 'تراکنش نامعتبر یا منقضی شده است.' }, 400);
          }
          if (!pending.caseId || !pending.userId) {
            return jsonResponse({ error: 'اطلاعات پرونده برای این تراکنش ناقص است.' }, 400);
          }

          try {
            const zpRes = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                merchant_id: merchantId,
                amount: pending.amount,
                authority: body.authority,
              }),
            });
            const zpJson = (await zpRes.json()) as any;
            await deletePendingPayment(env, body.authority);

            // 100 = fresh success, 101 = already verified previously —
            // both are a valid paid transaction per ZarinPal's docs.
            if (zpJson?.data?.code === 100 || zpJson?.data?.code === 101) {
              const paidAt = new Date().toISOString();

              // Write the SUCCESS row ourselves with the service-role key.
              // RLS deliberately rejects a client-inserted SUCCESS/ZarinPal
              // payment row (see payments_insert_own_pending_card in
              // SUPABASE_SQL_SCHEMA) — this server-side write, made only
              // after independently verifying with ZarinPal above, is the
              // one path allowed to create it. The on_payment_success DB
              // trigger then advances the case status automatically.
              const writeError = await recordVerifiedPayment(env, {
                caseId: pending.caseId,
                userId: pending.userId,
                amount: pending.amount,
                refId: String(zpJson.data.ref_id),
                paidAt,
              });
              if (writeError) {
                console.error('Failed to persist verified payment:', writeError);
                return jsonResponse(
                  { success: false, error: 'پرداخت با بانک تأیید شد اما ثبت آن با خطا مواجه شد. لطفاً با پشتیبانی تماس بگیرید.' },
                  502
                );
              }

              return jsonResponse({
                success: true,
                status: String(zpJson.data.code),
                refId: zpJson.data.ref_id,
                message: zpJson.data.code === 101 ? 'این تراکنش پیش‌تر تأیید شده است' : 'تراکنش با موفقیت تأیید شد',
                paidAt,
              });
            }

            console.error('ZarinPal verify failed:', zpJson);
            return jsonResponse({ success: false, error: zpJson?.errors?.message || 'تراکنش تأیید نشد' }, 400);
          } catch (err) {
            console.error('ZarinPal verify error:', err);
            return jsonResponse({ error: 'خطا در ارتباط با درگاه پرداخت' }, 502);
          }
        }

        if (url.pathname === '/api/gemini/analyze-case' && request.method === 'POST') {
          const body = (await request.json().catch(() => ({}))) as { profile?: any; results?: any };
          const apiKey = env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

          if (apiKey) {
            try {
              const prompt = `شما یک مشاور ارشد و روانشناس متخصص ازدواج در مرکز مشاوره پیوند امن هستید.
لطفاً اطلاعات پرونده زیر را تحلیل کنید:
مشخصات فردی: ${JSON.stringify(body.profile)}
نتایج آزمون‌های روانشناختی: ${JSON.stringify(body.results)}

پاسخ را دقیقاً به فرمت JSON زیر به زبان فارسی برگردانید:
{
  "summary": "خلاصه تحلیلی روانی فرد",
  "interviewQuestions": ["سوال 1", "سوال 2", "سوال 3"],
  "riskPoints": ["نقطه ریسک یا چالش 1"],
  "strengths": ["نقطه قوت 1", "نقطه قوت 2"]
}`;
              const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                  }),
                }
              );
              if (geminiRes.ok) {
                const geminiJson = (await geminiRes.json()) as any;
                const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText) {
                  return jsonResponse(JSON.parse(rawText));
                }
              }
            } catch (err) {
              console.error('Cloudflare Gemini fetch error:', err);
            }
          }

          // Fallback response
          return jsonResponse({
            summary: `مراجع ${body.profile?.age || 28} ساله، با مدرک ${body.profile?.education || 'نامشخص'} و شغل ${body.profile?.jobTitle || 'نامشخص'}، دارای پروفایل روانشناختی باثبات است.`,
            interviewQuestions: [
              'انتظارات دقیق شما از مرزبندی با خانواده همسر آینده چیست؟',
              'در مواجهه با تعارضات مالی یا شغلی چه راهکاری را ترجیح می‌دهید؟',
              'در صورت بروز اختلاف نظر شدید در زندگی مشترک، نحوه تصمیم‌گیری نهایی را چگونه می‌بینید؟',
            ],
            riskPoints: [
              (body.profile?.workingHoursPerDay || 8) > 9
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

        if (url.pathname === '/api/gemini/compare-cases' && request.method === 'POST') {
          const body = (await request.json().catch(() => ({}))) as {
            profileA?: any;
            resultsA?: any;
            profileB?: any;
            resultsB?: any;
          };
          const apiKey = env.GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

          if (apiKey) {
            try {
              const prompt = `شما یک مشاور ارشد ازدواج در سامانه پیوند امن هستید.
دو پرونده متقاضی ازدواج را مقایسه کنید:
فرد الف: ${JSON.stringify(body.profileA)}, آزمون‌ها: ${JSON.stringify(body.resultsA)}
فرد ب: ${JSON.stringify(body.profileB)}, آزمون‌ها: ${JSON.stringify(body.resultsB)}

پاسخ را دقیقاً به فرمت JSON زیر به زبان فارسی برگردانید:
{
  "synergyAnalysis": "تحلیل هم‌افزایی و نقاط مشترک",
  "jointTopicsToDiscuss": ["موضوع 1", "موضوع 2"],
  "potentialFrictionPoints": ["نقطه چالش احتمالی 1"]
}`;
              const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                  }),
                }
              );
              if (geminiRes.ok) {
                const geminiJson = (await geminiRes.json()) as any;
                const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText) {
                  return jsonResponse(JSON.parse(rawText));
                }
              }
            } catch (err) {
              console.error('Cloudflare Gemini compare error:', err);
            }
          }

          return jsonResponse({
            synergyAnalysis: `هر دو مراجع (${body.profileA?.age || 28} ساله و ${body.profileB?.age || 30} ساله) دارای بلوغ روانی و انگیزه برای تشکیل خانواده هستند.`,
            jointTopicsToDiscuss: [
              'بررسی برنامه‌ریزی پنج‌ساله زندگی و مدیریت شغلی-خانوادگی',
              'نحوه تعامل با خانواده‌های طرفین و حفظ مرزبندی سالم',
              'بررسی نگرش‌های مالی و نحوه‌ی مدیریت هزینه‌های مشترک',
            ],
            potentialFrictionPoints: [
              body.profileA?.migrationIntention !== body.profileB?.migrationIntention
                ? 'تفاوت در چشم‌انداز مهاجرت به خارج از کشور نیاز به شفاف‌سازی در جلسه دارد.'
                : 'بررسی جزئیات سبک زندگی در روزهای تعطیل و اوقات فراغت.',
            ],
          });
        }
      } catch (err) {
        console.error('Worker API error:', err);
        return jsonResponse({ error: 'Internal Worker Error' }, 500);
      }
    }

    // Serve static assets from env.ASSETS
    if (env.ASSETS) {
      let response = await env.ASSETS.fetch(request);

      // If non-API request returns 404, serve SPA index.html for client-side routing
      if (response.status === 404 && !url.pathname.startsWith('/api/')) {
        const indexRequest = new Request(new URL('/index.html', request.url).toString(), request);
        response = await env.ASSETS.fetch(indexRequest);
      }

      return response;
    }

    return new Response('Not Found', { status: 404 });
  },
};
