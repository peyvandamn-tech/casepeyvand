// Supabase "Send SMS Hook" Edge Function.
//
// Supabase Auth calls this endpoint every time it needs to send an OTP by
// SMS (phone signup/login). It replaces Supabase's built-in SMS sending so
// we can use Melipayamak (ملی‌پیامک) instead of Twilio/MessageBird/Vonage,
// which don't support Iranian numbers.
//
// Contract (fixed by Supabase, do not change):
//   Input:  POST { user: { phone, ... }, sms: { otp } }
//   Output: HTTP 200 with an empty JSON body `{}` on success.
//           Any other status is treated as a failed send and surfaces an
//           error to the client calling supabase.auth.signInWithOtp().
//
// Deploy with:
//   npx supabase functions deploy send-sms-hook --no-verify-jwt
//
// Then in the Supabase Dashboard → Authentication → Hooks → "Send SMS
// hook": enable it, set type HTTPS, point it at this function's URL, and
// copy the generated signing secret into SEND_SMS_HOOK_SECRET below
// (Dashboard → Edge Functions → send-sms-hook → Settings → Secrets).
//
// Also set these secrets for Melipayamak:
//   MELIPAYAMAK_USERNAME   - your Melipayamak panel username
//   MELIPAYAMAK_PASSWORD   - your Melipayamak panel password
//   MELIPAYAMAK_BODY_ID    - the numeric pattern ("bodyId") you registered
//                            in the Melipayamak panel with a single {0}
//                            placeholder for the OTP code, e.g.
//                            "کد ورود شما به پیوند امن: {0}"

import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';

const MELIPAYAMAK_REST_URL = 'https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber';

interface SendSmsHookPayload {
  user: { phone?: string };
  sms: { otp: string };
}

// Sends the OTP through Melipayamak's shared-line pattern API.
//
// NOTE ON THE RESPONSE FORMAT: Melipayamak's documented convention is that
// the response value is either a RecId (a numeric string longer than 15
// digits = accepted for delivery) or a short error code (0, -1, -3, 6, 7,
// 9, ...). The exact JSON field name (RecId / Value / a bare number) can
// vary slightly by account/API version — verify against a real test send
// once you have credentials, and adjust the `extractRecId` helper below if
// needed. We deliberately fail loudly on anything we can't positively
// confirm as success, rather than silently telling Supabase "sent" when
// nothing went out.
async function sendOtpViaMelipayamak(
  username: string,
  password: string,
  bodyId: string,
  phone: string,
  code: string
) {
  const res = await fetch(MELIPAYAMAK_REST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      password,
      to: normalizeIranianPhone(phone),
      bodyId,
      text: code,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Melipayamak HTTP ${res.status}: ${raw}`);
  }

  const recId = extractRecId(raw);
  if (!isSuccessfulRecId(recId)) {
    throw new Error(`Melipayamak rejected the send (response: ${raw})`);
  }
}

function extractRecId(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string' || typeof parsed === 'number') return String(parsed);
    if (parsed && typeof parsed === 'object') {
      return String(parsed.RecId ?? parsed.recId ?? parsed.Value ?? parsed.value ?? raw);
    }
  } catch {
    // Not JSON — Melipayamak sometimes returns a bare number as plain text.
  }
  return raw.trim();
}

function isSuccessfulRecId(value: string): boolean {
  // Success responses are purely-numeric strings longer than 15 digits.
  // Everything else (0, -1, -3, 6, 7, 9, ...) is a documented error code.
  return /^\d{16,}$/.test(value.trim());
}

// Melipayamak expects local Iranian format (0912...), not +98/E.164.
function normalizeIranianPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('98') && digits.length === 12) return '0' + digits.slice(2);
  if (digits.startsWith('0')) return digits;
  return '0' + digits;
}

Deno.serve(async (req: Request) => {
  try {
    const rawBody = await req.text();

    // Verify this request genuinely came from Supabase Auth using the
    // signing secret from Dashboard -> Authentication -> Hooks. Without
    // this check, anyone who finds this URL could spam arbitrary phone
    // numbers through your Melipayamak line/credits.
    const hookSecret = Deno.env.get('SEND_SMS_HOOK_SECRET');
    if (!hookSecret) {
      return jsonResponse({ error: { http_code: 500, message: 'SEND_SMS_HOOK_SECRET is not configured' } }, 500);
    }

    const wh = new Webhook(hookSecret);
    let payload: SendSmsHookPayload;
    try {
      payload = wh.verify(rawBody, Object.fromEntries(req.headers)) as SendSmsHookPayload;
    } catch (err) {
      return jsonResponse({ error: { http_code: 401, message: 'Invalid webhook signature' } }, 401);
    }

    const phone = payload.user?.phone;
    const otp = payload.sms?.otp;
    if (!phone || !otp) {
      return jsonResponse({ error: { http_code: 400, message: 'Missing phone or otp in payload' } }, 400);
    }

    const username = Deno.env.get('MELIPAYAMAK_USERNAME');
    const password = Deno.env.get('MELIPAYAMAK_PASSWORD');
    const bodyId = Deno.env.get('MELIPAYAMAK_BODY_ID');
    if (!username || !password || !bodyId) {
      return jsonResponse(
        { error: { http_code: 500, message: 'Melipayamak credentials are not configured' } },
        500
      );
    }

    await sendOtpViaMelipayamak(username, password, bodyId, phone, otp);

    // Supabase requires exactly an empty JSON object on success.
    return jsonResponse({}, 200);
  } catch (err) {
    console.error('send-sms-hook error:', err);
    return jsonResponse(
      { error: { http_code: 500, message: err instanceof Error ? err.message : 'Unknown error sending SMS' } },
      500
    );
  }
});

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
