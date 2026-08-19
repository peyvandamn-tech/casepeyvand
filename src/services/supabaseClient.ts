/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const env = (import.meta as unknown as { env: Record<string, string> }).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Full SQL Schema, role-in-JWT hook, state-transition triggers, and RLS
 * policies for Supabase SQL Editor. Run top to bottom on a fresh project.
 *
 * Design summary:
 *  - Every user-owning row keys off auth.users(id) (UUID) instead of the
 *    old hand-rolled "user-<timestamp>" TEXT ids, so RLS can compare
 *    auth.uid() directly with no extra lookup.
 *  - Role (CLIENT/EXPERT/ADMIN/...) is copied into the JWT's app_metadata
 *    via a Custom Access Token Hook, so RLS reads it from the token
 *    instead of re-querying public.users on every check.
 *  - State transitions that used to be client-side "if (allDone) update
 *    case status" logic in storage.ts are now DB triggers, so clients
 *    never need UPDATE rights on `cases` for normal flow — only staff do
 *    (manual overrides, closing a case, etc).
 *  - `payments` never accepts a client-inserted SUCCESS/ZarinPal row —
 *    only a PENDING card-to-card receipt. Verified ZarinPal payments are
 *    written by the Worker using the service-role key (bypasses RLS by
 *    design, since that's the one write path that already re-verifies
 *    with ZarinPal's API before writing).
 */
export const SUPABASE_SQL_SCHEMA = `
-- =========================================================================
-- 1. TABLES
-- =========================================================================

-- Public profile row for every authenticated user (client, expert, admin).
-- Populated automatically by handle_new_user() below — never inserted by
-- the client directly.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'CLIENT'
    CHECK (role IN ('CLIENT','EXPERT','COUNSELOR','FINANCE','ADMIN','SUPER_ADMIN')),
  gender TEXT CHECK (gender IN ('MALE','FEMALE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY, -- e.g. CASE-2026-00128, assigned by the app
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'CONSENT_PENDING',
  assigned_expert_id UUID REFERENCES users(id),
  close_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
  age INT,
  city TEXT,
  province TEXT,
  education TEXT,
  field_of_study TEXT,
  job_title TEXT,
  marital_status TEXT,
  has_children BOOLEAN,
  children_count INT,
  height INT,
  working_hours INT,
  data JSONB, -- remaining Profile fields (lifestyle, criteria, etc.) as-is
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('PRIVACY','ASSESSMENT','INTRODUCTION','COUNSELING','EXPERT_DISCLAIMER')),
  version TEXT DEFAULT '1.0',
  content_hash TEXT,
  status TEXT DEFAULT 'ACCEPTED' CHECK (status IN ('ACCEPTED','REVOKED')),
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS test_assignments (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  autosaved_answers JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ
);
ALTER TABLE test_assignments ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS test_results (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  subscale_scores JSONB,
  standard_scores JSONB,
  interpretation JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (case_id, test_id)
);

CREATE TABLE IF NOT EXISTS expert_notes (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES users(id),
  expert_name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INTERNAL' CHECK (type IN ('INTERNAL','SHAREABLE')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_candidates (
  id TEXT PRIMARY KEY,
  case_a_id TEXT NOT NULL REFERENCES cases(id),
  case_b_id TEXT NOT NULL REFERENCES cases(id),
  compatibility_score INT,
  expert_decision TEXT DEFAULT 'GENERATED'
    CHECK (expert_decision IN ('GENERATED','EXPERT_REVIEW','APPROVED','DECLINED','INTRODUCED')),
  breakdown JSONB,
  hard_conflicts JSONB,
  soft_differences JSONB,
  expert_notes TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (case_a_id, case_b_id)
);
ALTER TABLE match_candidates ADD COLUMN IF NOT EXISTS expert_notes TEXT;

CREATE TABLE IF NOT EXISTS introductions (
  id TEXT PRIMARY KEY,
  match_candidate_id TEXT NOT NULL REFERENCES match_candidates(id),
  case_a_id TEXT NOT NULL REFERENCES cases(id),
  case_b_id TEXT NOT NULL REFERENCES cases(id),
  status TEXT NOT NULL DEFAULT 'A_PENDING'
    CHECK (status IN ('A_PENDING','A_ACCEPTED','B_PENDING','B_ACCEPTED','ACTIVE','DECLINED','CLOSED')),
  a_consent_at TIMESTAMPTZ,
  b_consent_at TIMESTAMPTZ,
  anonymous_preview_a JSONB,
  anonymous_preview_b JSONB,
  contact_exchange_requested_by_a BOOLEAN DEFAULT FALSE,
  contact_exchange_requested_by_b BOOLEAN DEFAULT FALSE,
  contact_exchange_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent patch for projects that already ran an earlier version of this
-- schema without the contact-exchange columns above.
ALTER TABLE introductions ADD COLUMN IF NOT EXISTS contact_exchange_requested_by_a BOOLEAN DEFAULT FALSE;
ALTER TABLE introductions ADD COLUMN IF NOT EXISTS contact_exchange_requested_by_b BOOLEAN DEFAULT FALSE;
ALTER TABLE introductions ADD COLUMN IF NOT EXISTS contact_exchange_approved_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  introduction_id TEXT NOT NULL REFERENCES introductions(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES users(id),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES users(id),
  expert_name TEXT NOT NULL,
  type TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  status TEXT DEFAULT 'BOOKED' CHECK (status IN ('BOOKED','COMPLETED','CANCELLED')),
  meeting_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One expert can't be double-booked for the same slot.
  UNIQUE (expert_id, scheduled_at)
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  gateway TEXT NOT NULL DEFAULT 'ZarinPal' CHECK (gateway IN ('ZarinPal','CARD_TO_CARD')),
  transaction_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
  card_receipt_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Test names/descriptions/question banks are static app content (shipped in
-- src/data/mockData.ts), not user data — no table needed for those. The one
-- thing an admin actually changes at runtime is whether a test counts
-- toward matching, so only that flag is persisted, keyed by test id.
CREATE TABLE IF NOT EXISTS test_catalog_settings (
  test_id TEXT PRIMARY KEY,
  matching_enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS payment_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- single row, system-wide
  zarinpal_enabled BOOLEAN DEFAULT FALSE,
  zarinpal_merchant_id TEXT,
  card_to_card_enabled BOOLEAN DEFAULT TRUE,
  bank_details JSONB
);

-- SMS / OTP settings: controls the phone-login toggle shown to clients and
-- holds the Melipayamak credentials used by the send-sms-hook Edge
-- Function. Unlike payment_settings this is NOT publicly readable — it
-- contains a password — only staff can select or write it. The Edge
-- Function itself reads this table with the service-role key, which
-- bypasses RLS entirely.
CREATE TABLE IF NOT EXISTS sms_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- single row, system-wide
  otp_login_enabled BOOLEAN DEFAULT FALSE,
  melipayamak_username TEXT,
  melipayamak_password TEXT,
  melipayamak_body_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Post-introduction feedback: after an Introduction, each side reports
-- how it went. Feeds the expert's judgment on future matches and is the
-- source data for the admin success dashboard below.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS introduction_feedback (
  id TEXT PRIMARY KEY,
  introduction_id TEXT NOT NULL REFERENCES introductions(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL REFERENCES cases(id), -- whose feedback this is
  met_in_person BOOLEAN NOT NULL DEFAULT FALSE,
  wants_to_continue BOOLEAN,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (introduction_id, case_id)
);

-- ---------------------------------------------------------------------
-- Family introduction session ("جلسه معارفه خانوادگی") — a formal,
-- expert-scheduled meeting stage between the two families, tracked
-- against the introduction it belongs to.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_meetings (
  id TEXT PRIMARY KEY,
  introduction_id TEXT NOT NULL REFERENCES introductions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED','CONFIRMED','COMPLETED','CANCELLED')),
  scheduled_at TIMESTAMPTZ,
  location TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Secure in-app video call: a room reference tied to one introduction so
-- neither party's phone number is ever exposed. room_slug is an
-- unguessable token used to build a Jitsi Meet URL client-side
-- (https://meet.jit.si/<room_slug>) — no separate video infrastructure
-- to run or pay for.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video_call_invites (
  id TEXT PRIMARY KEY,
  introduction_id TEXT NOT NULL REFERENCES introductions(id) ON DELETE CASCADE,
  requested_by_case_id TEXT NOT NULL REFERENCES cases(id),
  status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED','ACCEPTED','DECLINED','COMPLETED')),
  room_slug TEXT NOT NULL UNIQUE,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Group sessions (workshops) — a separate income line from 1:1
-- matchmaking, open to any authenticated user (not tied to a case).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS group_sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  facilitator_id UUID NOT NULL REFERENCES users(id),
  facilitator_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 90,
  capacity INT NOT NULL DEFAULT 12,
  price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED','CANCELLED','COMPLETED')),
  meeting_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_session_bookings (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES group_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  user_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'BOOKED' CHECK (status IN ('BOOKED','CANCELLED','ATTENDED')),
  payment_id TEXT REFERENCES payments(id),
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, user_id)
);

-- ---------------------------------------------------------------------
-- Educational content library ("مجله آنلاین") — published articles are
-- public (readable even signed-out) since this doubles as marketing
-- content that Instagram traffic lands on; only staff can write.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  cover_image_url TEXT,
  body TEXT NOT NULL,
  author_id UUID REFERENCES users(id),
  author_name TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id UUID NOT NULL REFERENCES users(id),
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip TEXT,
  metadata JSONB
);

-- =========================================================================
-- 2. ROLE-IN-JWT: keeps RLS from re-querying public.users on every check.
--    After creating this function, enable it in Supabase Dashboard ->
--    Authentication -> Hooks -> "Customize Access Token (Claims) Hook".
-- =========================================================================
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = (event->>'user_id')::uuid;
  claims := event->'claims';
  claims := jsonb_set(claims, '{app_metadata,role}', to_jsonb(coalesce(user_role, 'CLIENT')));
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

CREATE OR REPLACE FUNCTION public.jwt_role() RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'CLIENT');
$$;

CREATE OR REPLACE FUNCTION public.is_staff() RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT public.jwt_role() IN ('EXPERT','COUNSELOR','FINANCE','ADMIN','SUPER_ADMIN');
$$;

-- Lets the OTP login screen check whether phone login is turned on
-- WITHOUT granting SELECT on sms_settings (which holds a password).
-- SECURITY DEFINER runs as the function owner, bypassing sms_settings' RLS.
CREATE OR REPLACE FUNCTION public.is_otp_login_enabled() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT coalesce((SELECT otp_login_enabled FROM sms_settings WHERE id = 1), false);
$$;

-- =========================================================================
-- 3. AUTO-CREATE public.users ON SIGNUP
--    Staff accounts (EXPERT/ADMIN/...) are created separately by an admin
--    using the service-role key with an explicit role — this trigger only
--    ever assigns 'CLIENT', so nobody can sign up as staff via phone OTP.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, phone, full_name, role)
  VALUES (NEW.id, NEW.phone, coalesce(NEW.raw_user_meta_data->>'full_name', ''), 'CLIENT')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Prevent a client from granting themselves EXPERT/ADMIN via a normal
-- profile update — role changes are only allowed for the service role
-- (i.e. an admin action run with the service-role key), never through the
-- anon/authenticated RLS path.
CREATE OR REPLACE FUNCTION public.guard_role_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.role() <> 'service_role' THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_role_change_trigger ON users;
CREATE TRIGGER guard_role_change_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION public.guard_role_change();

-- =========================================================================
-- 4. STATE-TRANSITION TRIGGERS
--    These replace the "if (allDone) StorageService.updateCaseStatus(...)"
--    side effects that used to live in the client. Because these run as
--    triggers, clients never need UPDATE rights on 'cases' for the normal
--    flow — only staff do (manual overrides / closing a case).
-- =========================================================================

-- All 3 required consents ACCEPTED -> case moves to PAYMENT_PENDING
CREATE OR REPLACE FUNCTION public.on_consent_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_all boolean;
BEGIN
  SELECT
    bool_and(exists (
      SELECT 1 FROM consents c2
      WHERE c2.case_id = NEW.case_id AND c2.type = req AND c2.status = 'ACCEPTED'
    ))
  INTO has_all
  FROM unnest(ARRAY['PRIVACY','ASSESSMENT','EXPERT_DISCLAIMER']) AS req;

  IF has_all THEN
    UPDATE cases SET status = 'PAYMENT_PENDING', updated_at = NOW()
    WHERE id = NEW.case_id AND status = 'CONSENT_PENDING';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_consent_change_trigger ON consents;
CREATE TRIGGER on_consent_change_trigger
  AFTER INSERT OR UPDATE ON consents
  FOR EACH ROW EXECUTE FUNCTION public.on_consent_change();

-- Payment recorded as SUCCESS -> case moves to PROFILE_PENDING
CREATE OR REPLACE FUNCTION public.on_payment_success()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'SUCCESS' THEN
    UPDATE cases SET status = 'PROFILE_PENDING', updated_at = NOW()
    WHERE id = NEW.case_id AND status IN ('PAYMENT_PENDING','CONSENT_PENDING');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_payment_success_trigger ON payments;
CREATE TRIGGER on_payment_success_trigger
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION public.on_payment_success();

-- Profile saved -> case moves from PROFILE_PENDING to TEST_PENDING
CREATE OR REPLACE FUNCTION public.on_profile_saved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE cases SET status = 'TEST_PENDING', updated_at = NOW()
  WHERE id = NEW.case_id AND status = 'PROFILE_PENDING';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_saved_trigger ON profiles;
CREATE TRIGGER on_profile_saved_trigger
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.on_profile_saved();

-- All assigned tests COMPLETED -> case goes TEST_COMPLETED then EXPERT_REVIEW
CREATE OR REPLACE FUNCTION public.on_test_result_saved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  all_done boolean;
BEGIN
  SELECT
    count(*) > 0 AND bool_and(status = 'COMPLETED')
  INTO all_done
  FROM test_assignments WHERE case_id = NEW.case_id;

  IF all_done THEN
    UPDATE cases SET status = 'EXPERT_REVIEW', updated_at = NOW()
    WHERE id = NEW.case_id AND status IN ('TEST_PENDING','TEST_COMPLETED');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_test_result_saved_trigger ON test_results;
CREATE TRIGGER on_test_result_saved_trigger
  AFTER INSERT ON test_results
  FOR EACH ROW EXECUTE FUNCTION public.on_test_result_saved();

-- =========================================================================
-- 5. ENABLE RLS ON EVERY TABLE
-- =========================================================================
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases              ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_assignments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results       ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_notes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_candidates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE introductions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_catalog_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE introduction_feedback  ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_meetings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_call_invites     ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_articles       ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 6. RLS POLICIES
--    No table gets a blanket "authenticated can do anything" policy.
--    Every INSERT/UPDATE is scoped to auth.uid() ownership or is_staff().
-- =========================================================================

-- USERS: everyone sees their own row, staff sees everyone. Insert happens
-- only via the handle_new_user() trigger (SECURITY DEFINER) — no client
-- INSERT policy exists on purpose. Role changes are blocked by the
-- guard_role_change trigger above regardless of what UPDATE allows.
CREATE POLICY "users_select_own_or_staff" ON users FOR SELECT
  USING (id = auth.uid() OR public.is_staff());
CREATE POLICY "users_update_own_or_staff" ON users FOR UPDATE
  USING (id = auth.uid() OR public.is_staff());

-- CASES: client creates/sees their own case; assigned expert and staff see
-- it too. No client UPDATE policy — status moves via the triggers above,
-- and staff make manual corrections (e.g. closing a case) with is_staff().
CREATE POLICY "cases_select_owner_expert_staff" ON cases FOR SELECT
  USING (user_id = auth.uid() OR assigned_expert_id = auth.uid() OR public.is_staff());
CREATE POLICY "cases_insert_own" ON cases FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "cases_update_staff" ON cases FOR UPDATE
  USING (public.is_staff());

-- PROFILES: owner manages their own profile; staff can see/edit any (for
-- corrections during expert review).
CREATE POLICY "profiles_select_own_or_staff" ON profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update_own_or_staff" ON profiles FOR UPDATE
  USING (user_id = auth.uid() OR public.is_staff());

-- CONSENTS: append-only audit trail. Owner inserts their own consent
-- records; nobody updates them (a revocation is a new row with status
-- REVOKED, matching how addConsentWithDetails already always inserts).
CREATE POLICY "consents_select_own_or_staff" ON consents FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff());
CREATE POLICY "consents_insert_own" ON consents FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- TEST ASSIGNMENTS: staff assigns tests to a case; the case owner fills
-- them in (autosaved_answers/status) as they take the test.
CREATE POLICY "test_assignments_select_owner_or_staff" ON test_assignments FOR SELECT
  USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()) OR public.is_staff());
CREATE POLICY "test_assignments_insert_staff" ON test_assignments FOR INSERT
  WITH CHECK (public.is_staff());
CREATE POLICY "test_assignments_update_owner_or_staff" ON test_assignments FOR UPDATE
  USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()) OR public.is_staff());

-- TEST RESULTS: the case owner submits their own scored result once the
-- test engine finishes scoring client-side; staff can see all.
CREATE POLICY "test_results_select_owner_or_staff" ON test_results FOR SELECT
  USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()) OR public.is_staff());
CREATE POLICY "test_results_insert_owner" ON test_results FOR INSERT
  WITH CHECK (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()));

-- EXPERT NOTES: staff-only writes. Clients may read only their own
-- SHAREABLE notes (never INTERNAL ones).
CREATE POLICY "expert_notes_select" ON expert_notes FOR SELECT
  USING (
    public.is_staff()
    OR (type = 'SHAREABLE' AND case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()))
  );
CREATE POLICY "expert_notes_insert_staff" ON expert_notes FOR INSERT
  WITH CHECK (public.is_staff());

-- MATCH CANDIDATES: staff-only end to end. Clients never see raw
-- algorithmic candidates or scores — only the anonymized "introductions"
-- once staff approves one.
CREATE POLICY "match_candidates_staff_all" ON match_candidates FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- INTRODUCTIONS: staff creates them (on match approval); either party can
-- see and update their own (accept/decline, request contact exchange).
CREATE POLICY "introductions_select_party_or_staff" ON introductions FOR SELECT
  USING (
    public.is_staff()
    OR case_a_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
    OR case_b_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
  );
CREATE POLICY "introductions_insert_staff" ON introductions FOR INSERT
  WITH CHECK (public.is_staff());
CREATE POLICY "introductions_update_party_or_staff" ON introductions FOR UPDATE
  USING (
    public.is_staff()
    OR case_a_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
    OR case_b_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
  );

-- MESSAGES: only the two parties of an ACTIVE introduction can read/send.
CREATE POLICY "messages_select_party_or_staff" ON messages FOR SELECT
  USING (
    public.is_staff()
    OR introduction_id IN (
      SELECT id FROM introductions
      WHERE case_a_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
         OR case_b_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "messages_insert_party" ON messages FOR INSERT
  WITH CHECK (
    sender_user_id = auth.uid()
    AND introduction_id IN (
      SELECT id FROM introductions
      WHERE status = 'ACTIVE'
        AND (case_a_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
             OR case_b_id IN (SELECT id FROM cases WHERE user_id = auth.uid()))
    )
  );

-- APPOINTMENTS: case owner books/sees their own; staff manages all.
CREATE POLICY "appointments_select_owner_or_staff" ON appointments FOR SELECT
  USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()) OR public.is_staff());
CREATE POLICY "appointments_insert_owner_or_staff" ON appointments FOR INSERT
  WITH CHECK (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()) OR public.is_staff());
CREATE POLICY "appointments_update_staff" ON appointments FOR UPDATE
  USING (public.is_staff());

-- PAYMENTS: the critical one. A client may only ever insert a PENDING
-- card-to-card receipt for their own case — never a SUCCESS row, and
-- never a ZarinPal row (those are written exclusively by the Worker with
-- the service-role key, after independently verifying with ZarinPal).
CREATE POLICY "payments_select_owner_or_staff" ON payments FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff());
CREATE POLICY "payments_insert_own_pending_card" ON payments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'PENDING'
    AND gateway = 'CARD_TO_CARD'
  );
CREATE POLICY "payments_update_staff" ON payments FOR UPDATE
  USING (public.is_staff());

-- TEST CATALOG SETTINGS: everyone can read which tests count toward
-- matching; only staff can change it.
CREATE POLICY "test_catalog_settings_select_all" ON test_catalog_settings FOR SELECT
  USING (true);
CREATE POLICY "test_catalog_settings_upsert_staff" ON test_catalog_settings FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- PAYMENT SETTINGS: readable by everyone (client needs to know which
-- gateways are enabled), editable only by staff.
CREATE POLICY "payment_settings_select_all" ON payment_settings FOR SELECT
  USING (true);
CREATE POLICY "payment_settings_upsert_staff" ON payment_settings FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- SMS SETTINGS: staff-only, both read and write — it holds a password.
-- The public client only needs to know whether OTP login is on, which is
-- exposed through a SECURITY DEFINER function instead of table access.
CREATE POLICY "sms_settings_staff_only" ON sms_settings FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- INTRODUCTION FEEDBACK: only the two matched parties (or staff) can see
-- it; a party can only insert feedback about their own case, and only
-- once (UNIQUE constraint above handles re-submission — use UPDATE).
CREATE POLICY "introduction_feedback_select_party_or_staff" ON introduction_feedback FOR SELECT
  USING (
    public.is_staff()
    OR case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
  );
CREATE POLICY "introduction_feedback_insert_own" ON introduction_feedback FOR INSERT
  WITH CHECK (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()));
CREATE POLICY "introduction_feedback_update_own" ON introduction_feedback FOR UPDATE
  USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()));

-- FAMILY MEETINGS: staff proposes/manages; either matched party can view
-- and confirm their own introduction's meeting.
CREATE POLICY "family_meetings_select_party_or_staff" ON family_meetings FOR SELECT
  USING (
    public.is_staff()
    OR introduction_id IN (
      SELECT id FROM introductions
      WHERE case_a_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
         OR case_b_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "family_meetings_insert_staff" ON family_meetings FOR INSERT
  WITH CHECK (public.is_staff());
CREATE POLICY "family_meetings_update_party_or_staff" ON family_meetings FOR UPDATE
  USING (
    public.is_staff()
    OR introduction_id IN (
      SELECT id FROM introductions
      WHERE case_a_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
         OR case_b_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
    )
  );

-- VIDEO CALL INVITES: only the two matched parties (or staff) can see or
-- act on a call for their own introduction — this is what keeps the room
-- slug (and therefore the call) private to just those two people.
CREATE POLICY "video_call_invites_select_party_or_staff" ON video_call_invites FOR SELECT
  USING (
    public.is_staff()
    OR introduction_id IN (
      SELECT id FROM introductions
      WHERE case_a_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
         OR case_b_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "video_call_invites_insert_party" ON video_call_invites FOR INSERT
  WITH CHECK (
    requested_by_case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
    AND introduction_id IN (
      SELECT id FROM introductions
      WHERE case_a_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
         OR case_b_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "video_call_invites_update_party_or_staff" ON video_call_invites FOR UPDATE
  USING (
    public.is_staff()
    OR introduction_id IN (
      SELECT id FROM introductions
      WHERE case_a_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
         OR case_b_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
    )
  );

-- GROUP SESSIONS: any authenticated user can see scheduled workshops
-- (this is a marketing surface too); only staff creates/edits them.
CREATE POLICY "group_sessions_select_all" ON group_sessions FOR SELECT
  USING (true);
CREATE POLICY "group_sessions_staff_write" ON group_sessions FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- GROUP SESSION BOOKINGS: a user books/sees only their own; staff sees all
-- (needed to run attendance).
CREATE POLICY "group_session_bookings_select_own_or_staff" ON group_session_bookings FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff());
CREATE POLICY "group_session_bookings_insert_own" ON group_session_bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "group_session_bookings_update_own_or_staff" ON group_session_bookings FOR UPDATE
  USING (user_id = auth.uid() OR public.is_staff());

-- CONTENT ARTICLES: published articles are public — readable by anyone,
-- signed in or not, since this doubles as marketing/SEO content. Only
-- staff can write, and only staff can see unpublished drafts.
CREATE POLICY "content_articles_select_published_or_staff" ON content_articles FOR SELECT
  USING (published = true OR public.is_staff());
CREATE POLICY "content_articles_staff_write" ON content_articles FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());
GRANT SELECT ON content_articles TO anon;

-- AUDIT LOGS: any authenticated user can log their own actions; only
-- staff can browse the log (matches AdminAuditLog.tsx being staff-only).
CREATE POLICY "audit_logs_select_staff" ON audit_logs FOR SELECT
  USING (public.is_staff());
CREATE POLICY "audit_logs_insert_own_or_staff" ON audit_logs FOR INSERT
  WITH CHECK (actor_id = auth.uid() OR public.is_staff());
`;

