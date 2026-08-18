/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Case,
  Profile,
  Consent,
  TestCatalog,
  Question,
  TestAssignment,
  TestResult,
  ExpertNote,
  MatchCandidate,
  Introduction,
  Message,
  Appointment,
  Payment,
  AuditLog,
  SystemPaymentSettings,
  IntroductionFeedback,
  FamilyMeeting,
  VideoCallInvite,
  GroupSession,
  GroupSessionBooking,
  ContentArticle,
} from '../types';
import { INITIAL_TEST_CATALOG, MOCK_QUESTIONS } from '../data/mockData';
import { supabase } from './supabaseClient';
import { Database } from '../types/database';

export const DEFAULT_PAYMENT_SETTINGS: SystemPaymentSettings = {
  zarinpalEnabled: false,
  zarinpalMerchantId: '00000000-0000-0000-0000-000000000000',
  cardToCardEnabled: true,
  bankDetails: {
    bankName: 'بانک ملی ایران',
    cardNumber: '۶۰۳۷-۹۹۷۹-۱۲۳۴-۵۶۷۸',
    accountHolder: 'مرکز تخصصی مشاوره پیوند امن (مهناز خوینی)',
    shebaNumber: 'IR۴۵۰۱۷۰۰۰۰۰۰۰۱۲۳۴۵۶۷۸۹۰۰۱',
  },
};

function db() {
  if (!supabase) {
    throw new Error('Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing).');
  }
  return supabase;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ---------------------------------------------------------------------------
// Row <-> app-type mapping. The DB uses snake_case (see supabaseClient.ts's
// SUPABASE_SQL_SCHEMA); every app type uses camelCase. Keeping the
// translation here means no component needs to know the DB's column names.
// ---------------------------------------------------------------------------

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

function rowToUser(r: Row<'users'>): User {
  return {
    id: r.id,
    phone: r.phone || '',
    fullName: r.full_name,
    gender: (r.gender || 'FEMALE') as User['gender'],
    role: r.role,
    createdAt: r.created_at,
  };
}

function rowToCase(r: Row<'cases'>): Case {
  return {
    id: r.id,
    userId: r.user_id,
    status: r.status as Case['status'],
    assignedExpertId: r.assigned_expert_id || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    closeReason: r.close_reason || undefined,
  };
}

function rowToProfile(r: Row<'profiles'>): Profile {
  const extra = (r.data || {}) as Partial<Profile>;
  return {
    id: r.id,
    userId: r.user_id,
    caseId: r.case_id,
    age: r.age ?? 0,
    city: r.city || '',
    province: r.province || '',
    education: r.education || '',
    fieldOfStudy: r.field_of_study || '',
    jobTitle: r.job_title || '',
    maritalStatus: (r.marital_status as Profile['maritalStatus']) || 'SINGLE',
    hasChildren: r.has_children ?? false,
    childrenCount: r.children_count ?? 0,
    height: r.height ?? 0,
    workingHoursPerDay: r.working_hours ?? 0,
    hobbies: extra.hobbies || [],
    livingArrangement: extra.livingArrangement || '',
    migrationIntention: extra.migrationIntention || 'NEVER',
    socialStyle: extra.socialStyle || '',
    marriageGoal: extra.marriageGoal || '',
    expectedTimelineMonths: extra.expectedTimelineMonths || 0,
    desireForChildren: extra.desireForChildren || 'OPEN_TO_DISCUSS',
    preferredLivingLocation: extra.preferredLivingLocation || '',
    familyRelationshipStyle: extra.familyRelationshipStyle || '',
    familyDependencyLevel: extra.familyDependencyLevel || 'MODERATE',
    familyExpectations: extra.familyExpectations || '',
    financialAttitude: extra.financialAttitude || '',
    monthlyIncomeRange: extra.monthlyIncomeRange || '',
    housingStatus: extra.housingStatus || '',
    criteria: extra.criteria || {
      minAge: 20,
      maxAge: 45,
      targetCities: [],
      educationRequired: '',
      acceptChildren: true,
      acceptPreviousMarriage: true,
      desireForChildrenRequirement: 'DONT_CARE',
      hardCriteriaNotes: '',
      softPreferences: [],
    },
  };
}

function profileToRow(p: Profile): Database['public']['Tables']['profiles']['Insert'] {
  const {
    id, userId, caseId, age, city, province, education, fieldOfStudy, jobTitle,
    maritalStatus, hasChildren, childrenCount, height, workingHoursPerDay,
    ...rest // everything else (hobbies, criteria, marriageGoal, ...) -> JSONB
  } = p;
  return {
    id: id || newId('prof'),
    user_id: userId,
    case_id: caseId,
    age, city, province, education,
    field_of_study: fieldOfStudy,
    job_title: jobTitle,
    marital_status: maritalStatus,
    has_children: hasChildren,
    children_count: childrenCount,
    height,
    working_hours: workingHoursPerDay,
    data: rest,
    updated_at: new Date().toISOString(),
  };
}

function rowToConsent(r: Row<'consents'>): Consent {
  return {
    id: r.id,
    userId: r.user_id,
    caseId: r.case_id,
    type: r.type,
    version: r.version,
    contentHash: r.content_hash || '',
    acceptedAt: r.accepted_at,
    ipAddress: r.ip_address || '',
    userAgent: r.user_agent || '',
    status: r.status,
  };
}

function rowToTestAssignment(r: Row<'test_assignments'>): TestAssignment {
  return {
    id: r.id,
    caseId: r.case_id,
    testId: r.test_id,
    assignedAt: r.assigned_at,
    status: r.status,
    autosavedAnswers: r.autosaved_answers || {},
    completedAt: r.completed_at || undefined,
  };
}

function rowToTestResult(r: Row<'test_results'>): TestResult {
  return {
    id: r.id,
    caseId: r.case_id,
    testId: r.test_id,
    subscaleScores: r.subscale_scores || {},
    standardScores: r.standard_scores || {},
    interpretation: (r.interpretation as TestResult['interpretation']) || {
      summary: '', strengths: [], vulnerabilities: [], clinicalFlags: [],
    },
    completedAt: r.completed_at,
  };
}

function rowToExpertNote(r: Row<'expert_notes'>): ExpertNote {
  return {
    id: r.id,
    caseId: r.case_id,
    expertId: r.expert_id,
    expertName: r.expert_name,
    content: r.content,
    type: r.type,
    createdAt: r.created_at,
  };
}

function rowToMatchCandidate(r: Row<'match_candidates'>): MatchCandidate {
  return {
    id: r.id,
    caseAId: r.case_a_id,
    caseBId: r.case_b_id,
    compatibilityScore: r.compatibility_score ?? 0,
    breakdown: (r.breakdown as MatchCandidate['breakdown']) || {
      marriageGoals: 0, values: 0, attachment: 0, communication: 0, personality: 0, lifestyle: 0, other: 0,
    },
    hardConflicts: r.hard_conflicts || [],
    softDifferences: r.soft_differences || [],
    expertDecision: r.expert_decision,
    expertNotes: r.expert_notes || undefined,
    generatedAt: r.generated_at,
  };
}

function matchCandidateToRow(m: MatchCandidate): Database['public']['Tables']['match_candidates']['Insert'] {
  return {
    id: m.id,
    case_a_id: m.caseAId,
    case_b_id: m.caseBId,
    compatibility_score: m.compatibilityScore,
    breakdown: m.breakdown,
    hard_conflicts: m.hardConflicts,
    soft_differences: m.softDifferences,
    expert_decision: m.expertDecision,
    expert_notes: m.expertNotes || null,
    generated_at: m.generatedAt,
  };
}

function rowToIntroduction(r: Row<'introductions'>): Introduction {
  return {
    id: r.id,
    matchCandidateId: r.match_candidate_id,
    caseAId: r.case_a_id,
    caseBId: r.case_b_id,
    status: r.status,
    aConsentAt: r.a_consent_at || undefined,
    bConsentAt: r.b_consent_at || undefined,
    anonymousPreviewA: r.anonymous_preview_a as Introduction['anonymousPreviewA'],
    anonymousPreviewB: r.anonymous_preview_b as Introduction['anonymousPreviewB'],
    contactExchangeRequestedByA: r.contact_exchange_requested_by_a || undefined,
    contactExchangeRequestedByB: r.contact_exchange_requested_by_b || undefined,
    contactExchangeApprovedAt: r.contact_exchange_approved_at || undefined,
    createdAt: r.created_at,
  };
}

function introToRow(i: Introduction): Database['public']['Tables']['introductions']['Insert'] {
  return {
    id: i.id,
    match_candidate_id: i.matchCandidateId,
    case_a_id: i.caseAId,
    case_b_id: i.caseBId,
    status: i.status,
    a_consent_at: i.aConsentAt || null,
    b_consent_at: i.bConsentAt || null,
    anonymous_preview_a: i.anonymousPreviewA,
    anonymous_preview_b: i.anonymousPreviewB,
    contact_exchange_requested_by_a: i.contactExchangeRequestedByA ?? false,
    contact_exchange_requested_by_b: i.contactExchangeRequestedByB ?? false,
    contact_exchange_approved_at: i.contactExchangeApprovedAt || null,
  };
}

function rowToMessage(r: Row<'messages'>): Message {
  return {
    id: r.id,
    introductionId: r.introduction_id,
    senderUserId: r.sender_user_id,
    senderName: r.sender_name,
    content: r.content,
    timestamp: r.timestamp,
    isRead: r.is_read,
  };
}

function rowToAppointment(r: Row<'appointments'>): Appointment {
  return {
    id: r.id,
    caseId: r.case_id,
    clientName: '', // resolved by the caller from `users` when needed
    expertId: r.expert_id,
    expertName: r.expert_name,
    type: r.type as Appointment['type'],
    scheduledAt: r.scheduled_at,
    durationMinutes: r.duration_minutes,
    status: r.status,
    meetingUrl: r.meeting_url || undefined,
    notes: r.notes || undefined,
  };
}

function rowToPayment(r: Row<'payments'>): Payment {
  return {
    id: r.id,
    caseId: r.case_id,
    userId: r.user_id,
    amount: Number(r.amount),
    gateway: r.gateway,
    transactionId: r.transaction_id,
    status: r.status,
    createdAt: r.created_at,
    paidAt: r.paid_at || undefined,
    cardReceiptInfo: (r.card_receipt_info as Payment['cardReceiptInfo']) || undefined,
  };
}

function rowToAuditLog(r: Row<'audit_logs'>): AuditLog {
  return {
    id: r.id,
    actorId: r.actor_id,
    actorRole: r.actor_role as AuditLog['actorRole'],
    action: r.action,
    resource: r.resource,
    resourceId: r.resource_id || '',
    timestamp: r.timestamp,
    ip: r.ip || '',
    metadata: (r.metadata as Record<string, unknown>) || undefined,
  };
}

function rowToArticle(r: Row<'content_articles'>): ContentArticle {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    coverImageUrl: r.cover_image_url || undefined,
    body: r.body,
    authorId: r.author_id || undefined,
    authorName: r.author_name || undefined,
    published: r.published,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export class StorageService {
  // -------------------------------------------------------------------
  // Session (backed by Supabase Auth — see OtpAuthModal.tsx)
  // -------------------------------------------------------------------
  static async getCurrentUser(): Promise<User | null> {
    const { data: authData } = await db().auth.getUser();
    if (!authData.user) return null;
    const { data, error } = await db().from('users').select('*').eq('id', authData.user.id).maybeSingle();
    if (error || !data) return null;
    return rowToUser(data);
  }

  static async signOut(): Promise<void> {
    await db().auth.signOut();
  }

  // -------------------------------------------------------------------
  // Catalog & Questions — test names/descriptions/question banks are
  // static app content; only the matching-enabled flag is persisted.
  // -------------------------------------------------------------------
  static async getTestCatalog(): Promise<TestCatalog[]> {
    const { data, error } = await db().from('test_catalog_settings').select('*');
    if (error || !data) return INITIAL_TEST_CATALOG;
    const overrides = new Map(data.map((r) => [r.test_id, r.matching_enabled]));
    return INITIAL_TEST_CATALOG.map((t) => ({
      ...t,
      matchingEnabled: overrides.has(t.id) ? overrides.get(t.id)! : t.matchingEnabled,
    }));
  }

  static async toggleTestMatching(testId: string): Promise<void> {
    const catalog = await this.getTestCatalog();
    const current = catalog.find((t) => t.id === testId);
    if (!current) return;
    const { error } = await db()
      .from('test_catalog_settings')
      .upsert({ test_id: testId, matching_enabled: !current.matchingEnabled });
    if (error) throw error;
  }

  static getQuestionsForTest(testId: string): Question[] {
    return MOCK_QUESTIONS[testId] || MOCK_QUESTIONS['test-neo'] || [];
  }

  // -------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------
  static async getUsers(): Promise<User[]> {
    const { data, error } = await db().from('users').select('*');
    if (error || !data) return [];
    return data.map(rowToUser);
  }

  static async saveUser(user: User): Promise<void> {
    const { error } = await db().from('users').upsert({
      id: user.id,
      phone: user.phone,
      full_name: user.fullName,
      gender: user.gender,
      role: user.role,
    });
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Cases
  // -------------------------------------------------------------------
  static async getCases(): Promise<Case[]> {
    const { data, error } = await db().from('cases').select('*');
    if (error || !data) return [];
    return data.map(rowToCase);
  }

  static async getCaseByUserId(userId: string): Promise<Case | undefined> {
    const { data, error } = await db()
      .from('cases')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'CLOSED')
      .maybeSingle();
    if (error || !data) return undefined;
    return rowToCase(data);
  }

  static async getCaseById(caseId: string): Promise<Case | undefined> {
    const { data, error } = await db().from('cases').select('*').eq('id', caseId).maybeSingle();
    if (error || !data) return undefined;
    return rowToCase(data);
  }

  // Staff-only (RLS enforces this): manual status corrections. Normal
  // forward progress (consent -> payment -> profile -> tests -> review)
  // happens automatically via DB triggers — see SUPABASE_SQL_SCHEMA.
  static async updateCaseStatus(caseId: string, status: Case['status'], closeReason?: string): Promise<void> {
    const { error } = await db()
      .from('cases')
      .update({ status, close_reason: closeReason, updated_at: new Date().toISOString() })
      .eq('id', caseId);
    if (error) throw error;

    const me = await this.getCurrentUser();
    if (me) {
      await this.addAuditLog(me.id, me.role, 'CASE_STATUS_UPDATED', 'Case', caseId, { newStatus: status, closeReason });
    }
  }

  static async createCase(userId: string): Promise<Case> {
    const { count } = await db().from('cases').select('id', { count: 'exact', head: true });
    const id = `CASE-2026-${String((count || 0) + 129).padStart(5, '0')}`;
    const newCase: Database['public']['Tables']['cases']['Insert'] = {
      id,
      user_id: userId,
      status: 'CONSENT_PENDING',
      assigned_expert_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await db().from('cases').insert(newCase).select('*').single();
    if (error || !data) throw error || new Error('Failed to create case');

    await this.addAuditLog(userId, 'CLIENT', 'CASE_CREATED', 'Case', id);

    return rowToCase(data);
  }

  // -------------------------------------------------------------------
  // Profiles
  // -------------------------------------------------------------------
  static async getProfiles(): Promise<Profile[]> {
    const { data, error } = await db().from('profiles').select('*');
    if (error || !data) return [];
    return data.map(rowToProfile);
  }

  static async getProfileByCaseId(caseId: string): Promise<Profile | undefined> {
    const { data, error } = await db().from('profiles').select('*').eq('case_id', caseId).maybeSingle();
    if (error || !data) return undefined;
    return rowToProfile(data);
  }

  // Case status advances PROFILE_PENDING -> TEST_PENDING automatically via
  // the on_profile_saved DB trigger — no client-side status update needed.
  static async saveProfile(profile: Profile): Promise<void> {
    const { error } = await db().from('profiles').upsert(profileToRow(profile), { onConflict: 'case_id' });
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Consents
  // -------------------------------------------------------------------
  static async getConsents(): Promise<Consent[]> {
    const { data, error } = await db().from('consents').select('*');
    if (error || !data) return [];
    return data.map(rowToConsent);
  }

  static async getConsentsByCaseId(caseId: string): Promise<Consent[]> {
    const { data, error } = await db().from('consents').select('*').eq('case_id', caseId);
    if (error || !data) return [];
    return data.map(rowToConsent);
  }

  // Case status advances CONSENT_PENDING -> PAYMENT_PENDING automatically
  // once all 3 required consents exist, via the on_consent_change DB
  // trigger — no client-side status update needed.
  static async saveConsent(consent: Consent): Promise<void> {
    const { error } = await db().from('consents').insert({
      id: consent.id,
      user_id: consent.userId,
      case_id: consent.caseId,
      type: consent.type,
      version: consent.version,
      content_hash: consent.contentHash,
      status: consent.status,
      accepted_at: consent.acceptedAt,
      ip_address: consent.ipAddress,
      user_agent: consent.userAgent,
    });
    if (error) throw error;
  }

  static async addConsentWithDetails(
    caseId: string,
    userId: string,
    type: Consent['type'],
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.saveConsent({
      id: newId('c'),
      userId,
      caseId,
      type,
      version: '1.0',
      contentHash: `hash-${type.toLowerCase()}-v1`,
      acceptedAt: new Date().toISOString(),
      ipAddress,
      userAgent,
      status: 'ACCEPTED',
    });
  }

  static async addConsent(caseId: string, userId: string, type: Consent['type']): Promise<void> {
    await this.addConsentWithDetails(
      caseId,
      userId,
      type,
      '',
      typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    );
  }

  // -------------------------------------------------------------------
  // Test Assignments & Answers
  // -------------------------------------------------------------------
  static async getTestAssignments(): Promise<TestAssignment[]> {
    const { data, error } = await db().from('test_assignments').select('*');
    if (error || !data) return [];
    return data.map(rowToTestAssignment);
  }

  static async getTestAssignmentsByCaseId(caseId: string): Promise<TestAssignment[]> {
    const { data, error } = await db().from('test_assignments').select('*').eq('case_id', caseId);
    if (error || !data) return [];
    return data.map(rowToTestAssignment);
  }

  static async saveTestAnswers(assignmentId: string, answers: Record<string, number>, isCompleted = false): Promise<void> {
    const { error } = await db()
      .from('test_assignments')
      .update({
        autosaved_answers: answers || {},
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', assignmentId);
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Test Results — case status advances to EXPERT_REVIEW automatically
  // once every assignment is COMPLETED, via the on_test_result_saved DB
  // trigger — no client-side status update needed.
  // -------------------------------------------------------------------
  static async getTestResults(): Promise<TestResult[]> {
    const { data, error } = await db().from('test_results').select('*');
    if (error || !data) return [];
    return data.map(rowToTestResult);
  }

  static async getTestResultsByCaseId(caseId: string): Promise<TestResult[]> {
    const { data, error } = await db().from('test_results').select('*').eq('case_id', caseId);
    if (error || !data) return [];
    return data.map(rowToTestResult);
  }

  static async saveTestResult(result: TestResult): Promise<void> {
    const { error } = await db().from('test_results').upsert(
      {
        id: result.id,
        case_id: result.caseId,
        test_id: result.testId,
        subscale_scores: result.subscaleScores,
        standard_scores: result.standardScores,
        interpretation: result.interpretation,
        completed_at: result.completedAt,
      },
      { onConflict: 'case_id,test_id' }
    );
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Expert Notes
  // -------------------------------------------------------------------
  static async getExpertNotes(): Promise<ExpertNote[]> {
    const { data, error } = await db().from('expert_notes').select('*');
    if (error || !data) return [];
    return data.map(rowToExpertNote);
  }

  static async getExpertNotesByCaseId(caseId: string): Promise<ExpertNote[]> {
    const { data, error } = await db().from('expert_notes').select('*').eq('case_id', caseId);
    if (error || !data) return [];
    return data.map(rowToExpertNote);
  }

  static async addExpertNote(caseId: string, content: string, type: 'INTERNAL' | 'SHAREABLE'): Promise<void> {
    const me = await this.getCurrentUser();
    const { error } = await db().from('expert_notes').insert({
      id: newId('en'),
      case_id: caseId,
      expert_id: me?.id || '',
      expert_name: me?.fullName || '',
      content,
      type,
    });
    if (error) throw error;
  }

  static async saveExpertNote(note: ExpertNote): Promise<void> {
    const { error } = await db().from('expert_notes').insert({
      id: note.id,
      case_id: note.caseId,
      expert_id: note.expertId,
      expert_name: note.expertName,
      content: note.content,
      type: note.type,
    });
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Match Candidates (staff-only, enforced by RLS)
  // -------------------------------------------------------------------
  static async getMatchCandidates(): Promise<MatchCandidate[]> {
    const { data, error } = await db().from('match_candidates').select('*');
    if (error || !data) return [];
    return data.map(rowToMatchCandidate);
  }

  static async saveMatchCandidate(candidate: MatchCandidate): Promise<void> {
    const { error } = await db()
      .from('match_candidates')
      .upsert(matchCandidateToRow(candidate), { onConflict: 'case_a_id,case_b_id' });
    if (error) throw error;
  }

  static async updateMatchCandidateStatus(matchId: string, status: MatchCandidate['expertDecision']): Promise<void> {
    const { error } = await db().from('match_candidates').update({ expert_decision: status }).eq('id', matchId);
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Introductions
  // -------------------------------------------------------------------
  static async getIntroductions(): Promise<Introduction[]> {
    const { data, error } = await db().from('introductions').select('*');
    if (error || !data) return [];
    return data.map(rowToIntroduction);
  }

  static async getIntroductionsForCase(caseId: string): Promise<Introduction[]> {
    const { data, error } = await db()
      .from('introductions')
      .select('*')
      .or(`case_a_id.eq.${caseId},case_b_id.eq.${caseId}`);
    if (error || !data) return [];
    return data.map(rowToIntroduction);
  }

  static async saveIntroduction(intro: Introduction): Promise<void> {
    const { error } = await db().from('introductions').upsert(introToRow(intro));
    if (error) throw error;
  }

  static async updateIntroductionStatus(introId: string, status: Introduction['status']): Promise<void> {
    const { error } = await db().from('introductions').update({ status }).eq('id', introId);
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Messages
  // -------------------------------------------------------------------
  static async getMessagesByIntroId(introId: string): Promise<Message[]> {
    const { data, error } = await db().from('messages').select('*').eq('introduction_id', introId).order('timestamp');
    if (error || !data) return [];
    return data.map(rowToMessage);
  }

  static async addMessage(introId: string, senderUserId: string, senderName: string, content: string): Promise<Message> {
    const row = {
      id: newId('msg'),
      introduction_id: introId,
      sender_user_id: senderUserId,
      sender_name: senderName,
      content,
      is_read: false,
      timestamp: new Date().toISOString(),
    };
    const { data, error } = await db().from('messages').insert(row).select('*').single();
    if (error || !data) throw error || new Error('Failed to send message');
    return rowToMessage(data);
  }

  // -------------------------------------------------------------------
  // Appointments
  // -------------------------------------------------------------------
  static async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await db().from('appointments').select('*');
    if (error || !data) return [];
    return data.map(rowToAppointment);
  }

  static async getAppointmentsByCaseId(caseId: string): Promise<Appointment[]> {
    const { data, error } = await db().from('appointments').select('*').eq('case_id', caseId);
    if (error || !data) return [];
    return data.map(rowToAppointment);
  }

  static async saveAppointment(apt: Appointment): Promise<void> {
    const { error } = await db().from('appointments').upsert({
      id: apt.id,
      case_id: apt.caseId,
      expert_id: apt.expertId,
      expert_name: apt.expertName,
      type: apt.type,
      scheduled_at: apt.scheduledAt,
      duration_minutes: apt.durationMinutes,
      status: apt.status,
      meeting_url: apt.meetingUrl,
      notes: apt.notes,
    });
    // A unique-violation here means the slot was already taken by someone
    // else between the client's own conflict check and this write —
    // surface it as a normal error so the UI can tell the user to pick
    // another time, instead of silently overwriting the other booking.
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Payments
  // -------------------------------------------------------------------
  static async getPayments(): Promise<Payment[]> {
    const { data, error } = await db().from('payments').select('*');
    if (error || !data) return [];
    return data.map(rowToPayment);
  }

  // Only ever inserts a PENDING card-to-card receipt — RLS rejects a
  // client-inserted SUCCESS/ZarinPal row on purpose (see
  // SUPABASE_SQL_SCHEMA's payments_insert_own_pending_card policy). A
  // verified ZarinPal SUCCESS payment is written server-side by the Worker
  // with the service-role key after it independently confirms with
  // ZarinPal — never by the client.
  static async submitCardToCardReceipt(payment: Payment): Promise<void> {
    const { error } = await db().from('payments').insert({
      id: payment.id,
      case_id: payment.caseId,
      user_id: payment.userId,
      amount: payment.amount,
      gateway: 'CARD_TO_CARD',
      transaction_id: payment.transactionId,
      status: 'PENDING',
      card_receipt_info: payment.cardReceiptInfo,
    });
    if (error) throw error;
  }

  // Staff-only (RLS enforces this): approve/reject a pending card-to-card
  // receipt. Case status advances to PROFILE_PENDING automatically via the
  // on_payment_success DB trigger when status becomes SUCCESS.
  static async updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<void> {
    const { error } = await db()
      .from('payments')
      .update({ status, paid_at: status === 'SUCCESS' ? new Date().toISOString() : null })
      .eq('id', paymentId);
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // System Payment Settings
  // -------------------------------------------------------------------
  static async getPaymentSettings(): Promise<SystemPaymentSettings> {
    const { data, error } = await db().from('payment_settings').select('*').eq('id', 1).maybeSingle();
    if (error || !data) return DEFAULT_PAYMENT_SETTINGS;
    return {
      zarinpalEnabled: data.zarinpal_enabled,
      zarinpalMerchantId: data.zarinpal_merchant_id || '',
      cardToCardEnabled: data.card_to_card_enabled,
      bankDetails: (data.bank_details as SystemPaymentSettings['bankDetails']) || DEFAULT_PAYMENT_SETTINGS.bankDetails,
    };
  }

  static async savePaymentSettings(settings: SystemPaymentSettings): Promise<void> {
    const { error } = await db().from('payment_settings').upsert({
      id: 1,
      zarinpal_enabled: settings.zarinpalEnabled,
      zarinpal_merchant_id: settings.zarinpalMerchantId,
      card_to_card_enabled: settings.cardToCardEnabled,
      bank_details: settings.bankDetails,
    });
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Audit Logs (staff-only read, enforced by RLS)
  // -------------------------------------------------------------------
  static async getAuditLogs(): Promise<AuditLog[]> {
    const { data, error } = await db().from('audit_logs').select('*').order('timestamp', { ascending: false });
    if (error || !data) return [];
    return data.map(rowToAuditLog);
  }

  static async addAuditLog(
    actorId: string,
    actorRole: User['role'],
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const { error } = await db().from('audit_logs').insert({
      id: newId('audit'),
      actor_id: actorId,
      actor_role: actorRole,
      action,
      resource,
      resource_id: resourceId,
      timestamp: new Date().toISOString(),
      ip: '',
      metadata,
    });
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Introduction Feedback
  // -------------------------------------------------------------------
  static async getFeedbackForIntroduction(introId: string): Promise<IntroductionFeedback[]> {
    const { data, error } = await db().from('introduction_feedback').select('*').eq('introduction_id', introId);
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id,
      introductionId: r.introduction_id,
      caseId: r.case_id,
      metInPerson: r.met_in_person,
      wantsToContinue: r.wants_to_continue ?? undefined,
      rating: r.rating ?? undefined,
      comments: r.comments || undefined,
      submittedAt: r.submitted_at,
    }));
  }

  static async submitIntroductionFeedback(
    feedback: Omit<IntroductionFeedback, 'id' | 'submittedAt'>
  ): Promise<void> {
    const { error } = await db().from('introduction_feedback').upsert(
      {
        id: newId('fb'),
        introduction_id: feedback.introductionId,
        case_id: feedback.caseId,
        met_in_person: feedback.metInPerson,
        wants_to_continue: feedback.wantsToContinue,
        rating: feedback.rating,
        comments: feedback.comments,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'introduction_id,case_id' }
    );
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Family Meetings
  // -------------------------------------------------------------------
  static async getFamilyMeetingsForIntroduction(introId: string): Promise<FamilyMeeting[]> {
    const { data, error } = await db().from('family_meetings').select('*').eq('introduction_id', introId);
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id,
      introductionId: r.introduction_id,
      status: r.status,
      scheduledAt: r.scheduled_at || undefined,
      location: r.location || undefined,
      notes: r.notes || undefined,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }));
  }

  // Staff-only (RLS enforces this): propose a family introduction meeting.
  static async proposeFamilyMeeting(introId: string, scheduledAt: string, location: string, notes?: string): Promise<void> {
    const me = await this.getCurrentUser();
    const { error } = await db().from('family_meetings').insert({
      id: newId('fm'),
      introduction_id: introId,
      status: 'PROPOSED',
      scheduled_at: scheduledAt,
      location,
      notes,
      created_by: me?.id || '',
    });
    if (error) throw error;
  }

  static async updateFamilyMeetingStatus(meetingId: string, status: FamilyMeeting['status']): Promise<void> {
    const { error } = await db().from('family_meetings').update({ status }).eq('id', meetingId);
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Video Call Invites — the room_slug drives a Jitsi Meet URL
  // (https://meet.jit.si/<room_slug>) client-side; no video infra to run.
  // -------------------------------------------------------------------
  static async getVideoCallInvitesForIntroduction(introId: string): Promise<VideoCallInvite[]> {
    const { data, error } = await db().from('video_call_invites').select('*').eq('introduction_id', introId);
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id,
      introductionId: r.introduction_id,
      requestedByCaseId: r.requested_by_case_id,
      status: r.status,
      roomSlug: r.room_slug,
      scheduledAt: r.scheduled_at || undefined,
      createdAt: r.created_at,
    }));
  }

  static async requestVideoCall(introId: string, requestedByCaseId: string): Promise<VideoCallInvite> {
    const roomSlug = `peyvand-${introId}-${Math.random().toString(36).slice(2, 10)}`;
    const row = {
      id: newId('vc'),
      introduction_id: introId,
      requested_by_case_id: requestedByCaseId,
      status: 'REQUESTED' as const,
      room_slug: roomSlug,
    };
    const { data, error } = await db().from('video_call_invites').insert(row).select('*').single();
    if (error || !data) throw error || new Error('Failed to request video call');
    return {
      id: data.id,
      introductionId: data.introduction_id,
      requestedByCaseId: data.requested_by_case_id,
      status: data.status,
      roomSlug: data.room_slug,
      scheduledAt: data.scheduled_at || undefined,
      createdAt: data.created_at,
    };
  }

  static async updateVideoCallStatus(inviteId: string, status: VideoCallInvite['status']): Promise<void> {
    const { error } = await db().from('video_call_invites').update({ status }).eq('id', inviteId);
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Group Sessions (workshops) — open to any authenticated user, not
  // tied to a matchmaking case.
  // -------------------------------------------------------------------
  static async getGroupSessions(): Promise<GroupSession[]> {
    const { data, error } = await db().from('group_sessions').select('*').order('scheduled_at');
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || undefined,
      facilitatorId: r.facilitator_id,
      facilitatorName: r.facilitator_name,
      scheduledAt: r.scheduled_at,
      durationMinutes: r.duration_minutes,
      capacity: r.capacity,
      price: Number(r.price),
      status: r.status,
      meetingUrl: r.meeting_url || undefined,
      createdAt: r.created_at,
    }));
  }

  // Staff-only (RLS enforces this).
  static async saveGroupSession(session: Omit<GroupSession, 'id' | 'createdAt'> & { id?: string }): Promise<void> {
    const { error } = await db().from('group_sessions').upsert({
      id: session.id || newId('gs'),
      title: session.title,
      description: session.description,
      facilitator_id: session.facilitatorId,
      facilitator_name: session.facilitatorName,
      scheduled_at: session.scheduledAt,
      duration_minutes: session.durationMinutes,
      capacity: session.capacity,
      price: session.price,
      status: session.status,
      meeting_url: session.meetingUrl,
    });
    if (error) throw error;
  }

  static async getGroupSessionBookings(sessionId: string): Promise<GroupSessionBooking[]> {
    const { data, error } = await db().from('group_session_bookings').select('*').eq('session_id', sessionId);
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id,
      sessionId: r.session_id,
      userId: r.user_id,
      userName: r.user_name,
      status: r.status,
      paymentId: r.payment_id || undefined,
      bookedAt: r.booked_at,
    }));
  }

  static async bookGroupSession(sessionId: string, userId: string, userName: string): Promise<void> {
    const { error } = await db().from('group_session_bookings').insert({
      id: newId('gsb'),
      session_id: sessionId,
      user_id: userId,
      user_name: userName,
      status: 'BOOKED',
    });
    if (error) throw error;
  }

  static async cancelGroupSessionBooking(bookingId: string): Promise<void> {
    const { error } = await db().from('group_session_bookings').update({ status: 'CANCELLED' }).eq('id', bookingId);
    if (error) throw error;
  }

  // -------------------------------------------------------------------
  // Content Articles ("مجله آنلاین") — published ones are public.
  // -------------------------------------------------------------------
  static async getPublishedArticles(): Promise<ContentArticle[]> {
    const { data, error } = await db()
      .from('content_articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(rowToArticle);
  }

  static async getAllArticles(): Promise<ContentArticle[]> {
    const { data, error } = await db().from('content_articles').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(rowToArticle);
  }

  // Staff-only (RLS enforces this).
  static async saveArticle(article: Omit<ContentArticle, 'createdAt' | 'updatedAt'> & { id?: string }): Promise<void> {
    const me = await this.getCurrentUser();
    const { error } = await db().from('content_articles').upsert({
      id: article.id || newId('art'),
      slug: article.slug,
      title: article.title,
      category: article.category,
      cover_image_url: article.coverImageUrl,
      body: article.body,
      author_id: me?.id,
      author_name: me?.fullName,
      published: article.published,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }
}
