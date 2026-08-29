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
  SystemSmsSettings,
  IntroductionFeedback,
  FamilyMeeting,
  VideoCallInvite,
  GroupSession,
  GroupSessionBooking,
  ContentArticle,
} from '../types';
import {
  INITIAL_TEST_CATALOG,
  MOCK_QUESTIONS,
  INITIAL_USERS,
  INITIAL_CASES,
  INITIAL_PROFILES,
  INITIAL_CONSENTS,
  INITIAL_TEST_ASSIGNMENTS,
  INITIAL_TEST_RESULTS,
  INITIAL_EXPERT_NOTES,
  INITIAL_MATCH_CANDIDATES,
  INITIAL_INTRODUCTIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_PAYMENTS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
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

export const DEFAULT_SMS_SETTINGS: SystemSmsSettings = {
  otpLoginEnabled: true,
  melipayamakUsername: '',
  melipayamakPassword: '',
  melipayamakBodyId: '',
};

const SESSION_USER_KEY = 'peyvand_active_session_user';

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// Local in-memory / local-storage store for offline/demo/preview fallback
class LocalStore {
  private static get<T>(key: string, defaultVal: T): T {
    try {
      const stored = localStorage.getItem(`peyvand_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private static set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(`peyvand_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  static users: User[] = LocalStore.get('users', INITIAL_USERS);
  static cases: Case[] = LocalStore.get('cases', INITIAL_CASES);
  static profiles: Profile[] = LocalStore.get('profiles', INITIAL_PROFILES);
  static consents: Consent[] = LocalStore.get('consents', INITIAL_CONSENTS);
  static testAssignments: TestAssignment[] = LocalStore.get('assignments', INITIAL_TEST_ASSIGNMENTS);
  static testResults: TestResult[] = LocalStore.get('results', INITIAL_TEST_RESULTS);
  static expertNotes: ExpertNote[] = LocalStore.get('notes', INITIAL_EXPERT_NOTES);
  static matchCandidates: MatchCandidate[] = LocalStore.get('matches', INITIAL_MATCH_CANDIDATES);
  static introductions: Introduction[] = LocalStore.get('intros', INITIAL_INTRODUCTIONS);
  static appointments: Appointment[] = LocalStore.get('appointments', INITIAL_APPOINTMENTS);
  static payments: Payment[] = LocalStore.get('payments', INITIAL_PAYMENTS);
  static auditLogs: AuditLog[] = LocalStore.get('audit', INITIAL_AUDIT_LOGS);
  static paymentSettings: SystemPaymentSettings = LocalStore.get('payment_settings', DEFAULT_PAYMENT_SETTINGS);
  static smsSettings: SystemSmsSettings = LocalStore.get('sms_settings', DEFAULT_SMS_SETTINGS);
  static testCatalogOverrides: Record<string, boolean> = LocalStore.get('catalog_overrides', {});
  static articles: ContentArticle[] = LocalStore.get('articles', []);
  static groupSessions: GroupSession[] = LocalStore.get('groups', []);
  static groupBookings: GroupSessionBooking[] = LocalStore.get('group_bookings', []);
  static familyMeetings: FamilyMeeting[] = LocalStore.get('family_meetings', []);
  static videoCalls: VideoCallInvite[] = LocalStore.get('video_calls', []);
  static feedback: IntroductionFeedback[] = LocalStore.get('feedback', []);
  static messages: Record<string, Message[]> = LocalStore.get('messages', {});

  static persist(key: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (LocalStore as any)[key];
    if (val !== undefined) {
      LocalStore.set(key, val);
    }
  }
}

// ---------------------------------------------------------------------------
// Row <-> app-type mapping.
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
  // Session (backed by Supabase Auth or Local Session for Demo/Preview)
  // -------------------------------------------------------------------
  static async getCurrentUser(): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData.user) {
          const { data, error } = await supabase.from('users').select('*').eq('id', authData.user.id).maybeSingle();
          if (!error && data) {
            return rowToUser(data);
          }
        }
      } catch (e) {
        console.warn('Supabase auth check fallback:', e);
      }
    }
    
    // Check local session
    try {
      const stored = localStorage.getItem(SESSION_USER_KEY);
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch {
      // ignore
    }
    return null;
  }

  static async setSessionUser(user: User | null): Promise<void> {
    try {
      if (user) {
        localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(SESSION_USER_KEY);
      }
    } catch {
      // ignore
    }
  }

  static async setCurrentUser(user: User | null): Promise<void> {
    return this.setSessionUser(user);
  }

  static async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    await this.setSessionUser(null);
  }

  // -------------------------------------------------------------------
  // Catalog & Questions
  // -------------------------------------------------------------------
  static async getTestCatalog(): Promise<TestCatalog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('test_catalog_settings').select('*');
        if (!error && data) {
          const overrides = new Map(data.map((r) => [r.test_id, r.matching_enabled]));
          return INITIAL_TEST_CATALOG.map((t) => ({
            ...t,
            matchingEnabled: overrides.has(t.id) ? overrides.get(t.id)! : t.matchingEnabled,
          }));
        }
      } catch (e) {
        console.warn('getTestCatalog fallback:', e);
      }
    }
    return INITIAL_TEST_CATALOG.map((t) => ({
      ...t,
      matchingEnabled: LocalStore.testCatalogOverrides[t.id] !== undefined
        ? LocalStore.testCatalogOverrides[t.id]
        : t.matchingEnabled,
    }));
  }

  static async toggleTestMatching(testId: string): Promise<void> {
    const catalog = await this.getTestCatalog();
    const current = catalog.find((t) => t.id === testId);
    if (!current) return;
    const newVal = !current.matchingEnabled;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('test_catalog_settings').upsert({ test_id: testId, matching_enabled: newVal });
        return;
      } catch (e) {
        console.warn('toggleTestMatching fallback:', e);
      }
    }
    LocalStore.testCatalogOverrides[testId] = newVal;
    LocalStore.persist('testCatalogOverrides');
  }

  static getQuestionsForTest(testId: string): Question[] {
    return MOCK_QUESTIONS[testId] || MOCK_QUESTIONS['test-neo'] || [];
  }

  // -------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------
  static async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data && data.length > 0) {
          return data.map(rowToUser);
        }
      } catch (e) {
        console.warn('getUsers fallback:', e);
      }
    }
    return LocalStore.users;
  }

  static async saveUser(user: User): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('users').upsert({
          id: user.id,
          phone: user.phone,
          full_name: user.fullName,
          gender: user.gender,
          role: user.role,
        });
      } catch (e) {
        console.warn('saveUser fallback:', e);
      }
    }
    const idx = LocalStore.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      LocalStore.users[idx] = user;
    } else {
      LocalStore.users.push(user);
    }
    LocalStore.persist('users');
  }

  // -------------------------------------------------------------------
  // Cases
  // -------------------------------------------------------------------
  static async getCases(): Promise<Case[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('cases').select('*');
        if (!error && data && data.length > 0) {
          return data.map(rowToCase);
        }
      } catch (e) {
        console.warn('getCases fallback:', e);
      }
    }
    return LocalStore.cases;
  }

  static async getCaseByUserId(userId: string): Promise<Case | undefined> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .eq('user_id', userId)
          .neq('status', 'CLOSED')
          .maybeSingle();
        if (!error && data) {
          return rowToCase(data);
        }
      } catch (e) {
        console.warn('getCaseByUserId fallback:', e);
      }
    }
    return LocalStore.cases.find((c) => c.userId === userId && c.status !== 'CLOSED');
  }

  static async getCaseById(caseId: string): Promise<Case | undefined> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('cases').select('*').eq('id', caseId).maybeSingle();
        if (!error && data) return rowToCase(data);
      } catch (e) {
        console.warn('getCaseById fallback:', e);
      }
    }
    return LocalStore.cases.find((c) => c.id === caseId);
  }

  static async updateCaseStatus(caseId: string, status: Case['status'], closeReason?: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('cases')
          .update({ status, close_reason: closeReason, updated_at: new Date().toISOString() })
          .eq('id', caseId);
      } catch (e) {
        console.warn('updateCaseStatus fallback:', e);
      }
    }
    const c = LocalStore.cases.find((x) => x.id === caseId);
    if (c) {
      c.status = status;
      c.closeReason = closeReason;
      c.updatedAt = new Date().toISOString();
      LocalStore.persist('cases');
    }

    const me = await this.getCurrentUser();
    if (me) {
      await this.addAuditLog(me.id, me.role, 'CASE_STATUS_UPDATED', 'Case', caseId, { newStatus: status, closeReason });
    }
  }

  static async createCase(userId: string): Promise<Case> {
    const id = `CASE-2026-${String(LocalStore.cases.length + 129).padStart(5, '0')}`;
    const newCaseObj: Case = {
      id,
      userId,
      status: 'CONSENT_PENDING',
      assignedExpertId: 'user-mahnaz',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('cases').insert({
          id,
          user_id: userId,
          status: 'CONSENT_PENDING',
          assigned_expert_id: 'user-mahnaz',
          created_at: newCaseObj.createdAt,
          updated_at: newCaseObj.updatedAt,
        });
      } catch (e) {
        console.warn('createCase fallback:', e);
      }
    }

    LocalStore.cases.push(newCaseObj);
    LocalStore.persist('cases');
    await this.addAuditLog(userId, 'CLIENT', 'CASE_CREATED', 'Case', id);
    return newCaseObj;
  }

  // -------------------------------------------------------------------
  // Profiles
  // -------------------------------------------------------------------
  static async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!error && data && data.length > 0) return data.map(rowToProfile);
      } catch (e) {
        console.warn('getProfiles fallback:', e);
      }
    }
    return LocalStore.profiles;
  }

  static async getProfileByCaseId(caseId: string): Promise<Profile | undefined> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('case_id', caseId).maybeSingle();
        if (!error && data) return rowToProfile(data);
      } catch (e) {
        console.warn('getProfileByCaseId fallback:', e);
      }
    }
    return LocalStore.profiles.find((p) => p.caseId === caseId);
  }

  static async saveProfile(profile: Profile): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').upsert(
          {
            id: profile.id,
            user_id: profile.userId,
            case_id: profile.caseId,
            age: profile.age,
            city: profile.city,
            province: profile.province,
            education: profile.education,
            field_of_study: profile.fieldOfStudy,
            job_title: profile.jobTitle,
            marital_status: profile.maritalStatus,
            has_children: profile.hasChildren,
            children_count: profile.childrenCount,
            height: profile.height,
            working_hours: profile.workingHoursPerDay,
            data: {
              hobbies: profile.hobbies,
              livingArrangement: profile.livingArrangement,
              migrationIntention: profile.migrationIntention,
              socialStyle: profile.socialStyle,
              marriageGoal: profile.marriageGoal,
              expectedTimelineMonths: profile.expectedTimelineMonths,
              desireForChildren: profile.desireForChildren,
              preferredLivingLocation: profile.preferredLivingLocation,
              familyRelationshipStyle: profile.familyRelationshipStyle,
              familyDependencyLevel: profile.familyDependencyLevel,
              familyExpectations: profile.familyExpectations,
              financialAttitude: profile.financialAttitude,
              monthlyIncomeRange: profile.monthlyIncomeRange,
              housingStatus: profile.housingStatus,
              criteria: profile.criteria,
            },
          },
          { onConflict: 'case_id' }
        );
      } catch (e) {
        console.warn('saveProfile fallback:', e);
      }
    }
    const idx = LocalStore.profiles.findIndex((p) => p.caseId === profile.caseId);
    if (idx >= 0) {
      LocalStore.profiles[idx] = profile;
    } else {
      LocalStore.profiles.push(profile);
    }
    LocalStore.persist('profiles');
  }

  // -------------------------------------------------------------------
  // Consents
  // -------------------------------------------------------------------
  static async getConsents(): Promise<Consent[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('consents').select('*');
        if (!error && data && data.length > 0) return data.map(rowToConsent);
      } catch (e) {
        console.warn('getConsents fallback:', e);
      }
    }
    return LocalStore.consents;
  }

  static async getConsentsByCaseId(caseId: string): Promise<Consent[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('consents').select('*').eq('case_id', caseId);
        if (!error && data && data.length > 0) return data.map(rowToConsent);
      } catch (e) {
        console.warn('getConsentsByCaseId fallback:', e);
      }
    }
    return LocalStore.consents.filter((c) => c.caseId === caseId);
  }

  static async saveConsent(consent: Consent): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('consents').insert({
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
      } catch (e) {
        console.warn('saveConsent fallback:', e);
      }
    }
    LocalStore.consents.push(consent);
    LocalStore.persist('consents');
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
      ipAddress: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'Client Browser',
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
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('test_assignments').select('*');
        if (!error && data && data.length > 0) return data.map(rowToTestAssignment);
      } catch (e) {
        console.warn('getTestAssignments fallback:', e);
      }
    }
    return LocalStore.testAssignments;
  }

  static async getTestAssignmentsByCaseId(caseId: string): Promise<TestAssignment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('test_assignments').select('*').eq('case_id', caseId);
        if (!error && data && data.length > 0) return data.map(rowToTestAssignment);
      } catch (e) {
        console.warn('getTestAssignmentsByCaseId fallback:', e);
      }
    }
    return LocalStore.testAssignments.filter((a) => a.caseId === caseId);
  }

  static async saveTestAnswers(assignmentId: string, answers: Record<string, number>, isCompleted = false): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('test_assignments')
          .update({
            autosaved_answers: answers || {},
            status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq('id', assignmentId);
      } catch (e) {
        console.warn('saveTestAnswers fallback:', e);
      }
    }
    const a = LocalStore.testAssignments.find((x) => x.id === assignmentId);
    if (a) {
      a.autosavedAnswers = answers;
      a.status = isCompleted ? 'COMPLETED' : 'IN_PROGRESS';
      a.completedAt = isCompleted ? new Date().toISOString() : undefined;
      LocalStore.persist('testAssignments');
    }
  }

  // -------------------------------------------------------------------
  // Test Results
  // -------------------------------------------------------------------
  static async getTestResults(): Promise<TestResult[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('test_results').select('*');
        if (!error && data && data.length > 0) return data.map(rowToTestResult);
      } catch (e) {
        console.warn('getTestResults fallback:', e);
      }
    }
    return LocalStore.testResults;
  }

  static async getTestResultsByCaseId(caseId: string): Promise<TestResult[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('test_results').select('*').eq('case_id', caseId);
        if (!error && data && data.length > 0) return data.map(rowToTestResult);
      } catch (e) {
        console.warn('getTestResultsByCaseId fallback:', e);
      }
    }
    return LocalStore.testResults.filter((r) => r.caseId === caseId);
  }

  static async saveTestResult(result: TestResult): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('test_results').upsert(
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
      } catch (e) {
        console.warn('saveTestResult fallback:', e);
      }
    }
    const idx = LocalStore.testResults.findIndex((r) => r.caseId === result.caseId && r.testId === result.testId);
    if (idx >= 0) {
      LocalStore.testResults[idx] = result;
    } else {
      LocalStore.testResults.push(result);
    }
    LocalStore.persist('testResults');
  }

  // -------------------------------------------------------------------
  // Expert Notes
  // -------------------------------------------------------------------
  static async getExpertNotes(): Promise<ExpertNote[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('expert_notes').select('*');
        if (!error && data && data.length > 0) return data.map(rowToExpertNote);
      } catch (e) {
        console.warn('getExpertNotes fallback:', e);
      }
    }
    return LocalStore.expertNotes;
  }

  static async getExpertNotesByCaseId(caseId: string): Promise<ExpertNote[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('expert_notes').select('*').eq('case_id', caseId);
        if (!error && data && data.length > 0) return data.map(rowToExpertNote);
      } catch (e) {
        console.warn('getExpertNotesByCaseId fallback:', e);
      }
    }
    return LocalStore.expertNotes.filter((n) => n.caseId === caseId);
  }

  static async addExpertNote(caseId: string, content: string, type: 'INTERNAL' | 'SHAREABLE'): Promise<void> {
    const me = await this.getCurrentUser();
    const note: ExpertNote = {
      id: newId('en'),
      caseId,
      expertId: me?.id || 'user-mahnaz',
      expertName: me?.fullName || 'سرکار خانم مهناز خوینی',
      content,
      type,
      createdAt: new Date().toISOString(),
    };
    await this.saveExpertNote(note);
  }

  static async saveExpertNote(note: ExpertNote): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('expert_notes').insert({
          id: note.id,
          case_id: note.caseId,
          expert_id: note.expertId,
          expert_name: note.expertName,
          content: note.content,
          type: note.type,
        });
      } catch (e) {
        console.warn('saveExpertNote fallback:', e);
      }
    }
    LocalStore.expertNotes.push(note);
    LocalStore.persist('expertNotes');
  }

  // -------------------------------------------------------------------
  // Match Candidates
  // -------------------------------------------------------------------
  static async getMatchCandidates(): Promise<MatchCandidate[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('match_candidates').select('*');
        if (!error && data && data.length > 0) return data.map(rowToMatchCandidate);
      } catch (e) {
        console.warn('getMatchCandidates fallback:', e);
      }
    }
    return LocalStore.matchCandidates;
  }

  static async saveMatchCandidate(candidate: MatchCandidate): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('match_candidates')
          .upsert(matchCandidateToRow(candidate), { onConflict: 'case_a_id,case_b_id' });
      } catch (e) {
        console.warn('saveMatchCandidate fallback:', e);
      }
    }
    const idx = LocalStore.matchCandidates.findIndex((m) => m.id === candidate.id);
    if (idx >= 0) {
      LocalStore.matchCandidates[idx] = candidate;
    } else {
      LocalStore.matchCandidates.push(candidate);
    }
    LocalStore.persist('matchCandidates');
  }

  static async updateMatchCandidateStatus(matchId: string, status: MatchCandidate['expertDecision']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('match_candidates').update({ expert_decision: status }).eq('id', matchId);
      } catch (e) {
        console.warn('updateMatchCandidateStatus fallback:', e);
      }
    }
    const m = LocalStore.matchCandidates.find((x) => x.id === matchId);
    if (m) {
      m.expertDecision = status;
      LocalStore.persist('matchCandidates');
    }
  }

  // -------------------------------------------------------------------
  // Introductions
  // -------------------------------------------------------------------
  static async getIntroductions(): Promise<Introduction[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('introductions').select('*');
        if (!error && data && data.length > 0) return data.map(rowToIntroduction);
      } catch (e) {
        console.warn('getIntroductions fallback:', e);
      }
    }
    return LocalStore.introductions;
  }

  static async getIntroductionsForCase(caseId: string): Promise<Introduction[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('introductions')
          .select('*')
          .or(`case_a_id.eq.${caseId},case_b_id.eq.${caseId}`);
        if (!error && data && data.length > 0) return data.map(rowToIntroduction);
      } catch (e) {
        console.warn('getIntroductionsForCase fallback:', e);
      }
    }
    return LocalStore.introductions.filter((i) => i.caseAId === caseId || i.caseBId === caseId);
  }

  static async saveIntroduction(intro: Introduction): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('introductions').upsert(introToRow(intro));
      } catch (e) {
        console.warn('saveIntroduction fallback:', e);
      }
    }
    const idx = LocalStore.introductions.findIndex((i) => i.id === intro.id);
    if (idx >= 0) {
      LocalStore.introductions[idx] = intro;
    } else {
      LocalStore.introductions.push(intro);
    }
    LocalStore.persist('introductions');
  }

  static async updateIntroductionStatus(introId: string, status: Introduction['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('introductions').update({ status }).eq('id', introId);
      } catch (e) {
        console.warn('updateIntroductionStatus fallback:', e);
      }
    }
    const i = LocalStore.introductions.find((x) => x.id === introId);
    if (i) {
      i.status = status;
      LocalStore.persist('introductions');
    }
  }

  // -------------------------------------------------------------------
  // Messages
  // -------------------------------------------------------------------
  static async getMessagesByIntroId(introId: string): Promise<Message[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('introduction_id', introId)
          .order('timestamp');
        if (!error && data && data.length > 0) return data.map(rowToMessage);
      } catch (e) {
        console.warn('getMessagesByIntroId fallback:', e);
      }
    }
    return LocalStore.messages[introId] || [];
  }

  static async addMessage(introId: string, senderUserId: string, senderName: string, content: string): Promise<Message> {
    const msg: Message = {
      id: newId('msg'),
      introductionId: introId,
      senderUserId,
      senderName,
      content,
      isRead: false,
      timestamp: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').insert({
          id: msg.id,
          introduction_id: introId,
          sender_user_id: senderUserId,
          sender_name: senderName,
          content,
          is_read: false,
          timestamp: msg.timestamp,
        });
      } catch (e) {
        console.warn('addMessage fallback:', e);
      }
    }

    if (!LocalStore.messages[introId]) {
      LocalStore.messages[introId] = [];
    }
    LocalStore.messages[introId].push(msg);
    LocalStore.persist('messages');
    return msg;
  }

  // -------------------------------------------------------------------
  // Appointments
  // -------------------------------------------------------------------
  static async getAppointments(): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('appointments').select('*');
        if (!error && data && data.length > 0) return data.map(rowToAppointment);
      } catch (e) {
        console.warn('getAppointments fallback:', e);
      }
    }
    return LocalStore.appointments;
  }

  static async getAppointmentsByCaseId(caseId: string): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('appointments').select('*').eq('case_id', caseId);
        if (!error && data && data.length > 0) return data.map(rowToAppointment);
      } catch (e) {
        console.warn('getAppointmentsByCaseId fallback:', e);
      }
    }
    return LocalStore.appointments.filter((a) => a.caseId === caseId);
  }

  static async saveAppointment(apt: Appointment): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('appointments').upsert({
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
      } catch (e) {
        console.warn('saveAppointment fallback:', e);
      }
    }
    const idx = LocalStore.appointments.findIndex((a) => a.id === apt.id);
    if (idx >= 0) {
      LocalStore.appointments[idx] = apt;
    } else {
      LocalStore.appointments.push(apt);
    }
    LocalStore.persist('appointments');
  }

  // -------------------------------------------------------------------
  // Payments
  // -------------------------------------------------------------------
  static async getPayments(): Promise<Payment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('payments').select('*');
        if (!error && data && data.length > 0) return data.map(rowToPayment);
      } catch (e) {
        console.warn('getPayments fallback:', e);
      }
    }
    return LocalStore.payments;
  }

  static async submitCardToCardReceipt(payment: Payment): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('payments').insert({
          id: payment.id,
          case_id: payment.caseId,
          user_id: payment.userId,
          amount: payment.amount,
          gateway: 'CARD_TO_CARD',
          transaction_id: payment.transactionId,
          status: 'PENDING',
          card_receipt_info: payment.cardReceiptInfo,
        });
      } catch (e) {
        console.warn('submitCardToCardReceipt fallback:', e);
      }
    }
    LocalStore.payments.push(payment);
    LocalStore.persist('payments');
  }

  static async updatePaymentStatus(paymentId: string, status: Payment['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('payments')
          .update({ status, paid_at: status === 'SUCCESS' ? new Date().toISOString() : null })
          .eq('id', paymentId);
      } catch (e) {
        console.warn('updatePaymentStatus fallback:', e);
      }
    }
    const p = LocalStore.payments.find((x) => x.id === paymentId);
    if (p) {
      p.status = status;
      p.paidAt = status === 'SUCCESS' ? new Date().toISOString() : undefined;
      LocalStore.persist('payments');
    }
  }

  // -------------------------------------------------------------------
  // System Payment Settings
  // -------------------------------------------------------------------
  static async getPaymentSettings(): Promise<SystemPaymentSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('payment_settings').select('*').eq('id', 1).maybeSingle();
        if (!error && data) {
          return {
            zarinpalEnabled: data.zarinpal_enabled,
            zarinpalMerchantId: data.zarinpal_merchant_id || '',
            cardToCardEnabled: data.card_to_card_enabled,
            bankDetails: (data.bank_details as SystemPaymentSettings['bankDetails']) || DEFAULT_PAYMENT_SETTINGS.bankDetails,
          };
        }
      } catch (e) {
        console.warn('getPaymentSettings fallback:', e);
      }
    }
    return LocalStore.paymentSettings;
  }

  static async savePaymentSettings(settings: SystemPaymentSettings): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('payment_settings').upsert({
          id: 1,
          zarinpal_enabled: settings.zarinpalEnabled,
          zarinpal_merchant_id: settings.zarinpalMerchantId,
          card_to_card_enabled: settings.cardToCardEnabled,
          bank_details: settings.bankDetails,
        });
      } catch (e) {
        console.warn('savePaymentSettings fallback:', e);
      }
    }
    LocalStore.paymentSettings = settings;
    LocalStore.persist('paymentSettings');
  }

  // -------------------------------------------------------------------
  // System SMS Settings
  // -------------------------------------------------------------------
  static async getSmsSettings(): Promise<SystemSmsSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('sms_settings').select('*').eq('id', 1).maybeSingle();
        if (!error && data) {
          return {
            otpLoginEnabled: data.otp_login_enabled,
            melipayamakUsername: data.melipayamak_username || '',
            melipayamakPassword: data.melipayamak_password || '',
            melipayamakBodyId: data.melipayamak_body_id || '',
            updatedAt: data.updated_at || undefined,
          };
        }
      } catch (e) {
        console.warn('getSmsSettings fallback:', e);
      }
    }
    return LocalStore.smsSettings;
  }

  static async saveSmsSettings(settings: SystemSmsSettings): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('sms_settings').upsert({
          id: 1,
          otp_login_enabled: settings.otpLoginEnabled,
          melipayamak_username: settings.melipayamakUsername,
          melipayamak_password: settings.melipayamakPassword,
          melipayamak_body_id: settings.melipayamakBodyId,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('saveSmsSettings fallback:', e);
      }
    }
    LocalStore.smsSettings = settings;
    LocalStore.persist('smsSettings');
  }

  static async isOtpLoginEnabled(): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('is_otp_login_enabled');
        if (!error && data !== null) return Boolean(data);
      } catch {
        // fallback
      }
    }
    return LocalStore.smsSettings.otpLoginEnabled ?? true;
  }

  // -------------------------------------------------------------------
  // Audit Logs
  // -------------------------------------------------------------------
  static async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        if (!error && data && data.length > 0) return data.map(rowToAuditLog);
      } catch (e) {
        console.warn('getAuditLogs fallback:', e);
      }
    }
    return LocalStore.auditLogs;
  }

  static async addAuditLog(
    actorId: string,
    actorRole: User['role'],
    action: string,
    resource: string,
    resourceId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const log: AuditLog = {
      id: newId('audit'),
      actorId,
      actorRole,
      action,
      resource,
      resourceId: resourceId || '',
      timestamp: new Date().toISOString(),
      ip: '127.0.0.1',
      metadata,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('audit_logs').insert({
          id: log.id,
          actor_id: actorId,
          actor_role: actorRole,
          action,
          resource,
          resource_id: resourceId,
          timestamp: log.timestamp,
          ip: '',
          metadata,
        });
      } catch (e) {
        console.warn('addAuditLog fallback:', e);
      }
    }
    LocalStore.auditLogs.unshift(log);
    LocalStore.persist('auditLogs');
  }

  // -------------------------------------------------------------------
  // Introduction Feedback
  // -------------------------------------------------------------------
  static async getFeedbackForIntroduction(introId: string): Promise<IntroductionFeedback[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('introduction_feedback').select('*').eq('introduction_id', introId);
        if (!error && data && data.length > 0) {
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
      } catch (e) {
        console.warn('getFeedbackForIntroduction fallback:', e);
      }
    }
    return LocalStore.feedback.filter((f) => f.introductionId === introId);
  }

  static async submitIntroductionFeedback(
    feedback: Omit<IntroductionFeedback, 'id' | 'submittedAt'>
  ): Promise<void> {
    const fbObj: IntroductionFeedback = {
      id: newId('fb'),
      ...feedback,
      submittedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('introduction_feedback').upsert(
          {
            id: fbObj.id,
            introduction_id: fbObj.introductionId,
            case_id: fbObj.caseId,
            met_in_person: fbObj.metInPerson,
            wants_to_continue: fbObj.wantsToContinue,
            rating: fbObj.rating,
            comments: fbObj.comments,
            submitted_at: fbObj.submittedAt,
          },
          { onConflict: 'introduction_id,case_id' }
        );
      } catch (e) {
        console.warn('submitIntroductionFeedback fallback:', e);
      }
    }
    LocalStore.feedback.push(fbObj);
    LocalStore.persist('feedback');
  }

  // -------------------------------------------------------------------
  // Family Meetings
  // -------------------------------------------------------------------
  static async getFamilyMeetingsForIntroduction(introId: string): Promise<FamilyMeeting[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('family_meetings').select('*').eq('introduction_id', introId);
        if (!error && data && data.length > 0) {
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
      } catch (e) {
        console.warn('getFamilyMeetings fallback:', e);
      }
    }
    return LocalStore.familyMeetings.filter((m) => m.introductionId === introId);
  }

  static async proposeFamilyMeeting(introId: string, scheduledAt: string, location: string, notes?: string): Promise<void> {
    const me = await this.getCurrentUser();
    const fm: FamilyMeeting = {
      id: newId('fm'),
      introductionId: introId,
      status: 'PROPOSED',
      scheduledAt,
      location,
      notes,
      createdBy: me?.id || 'staff',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('family_meetings').insert({
          id: fm.id,
          introduction_id: introId,
          status: 'PROPOSED',
          scheduled_at: scheduledAt,
          location,
          notes,
          created_by: me?.id || '',
        });
      } catch (e) {
        console.warn('proposeFamilyMeeting fallback:', e);
      }
    }
    LocalStore.familyMeetings.push(fm);
    LocalStore.persist('familyMeetings');
  }

  static async updateFamilyMeetingStatus(meetingId: string, status: FamilyMeeting['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('family_meetings').update({ status }).eq('id', meetingId);
      } catch (e) {
        console.warn('updateFamilyMeetingStatus fallback:', e);
      }
    }
    const fm = LocalStore.familyMeetings.find((x) => x.id === meetingId);
    if (fm) {
      fm.status = status;
      LocalStore.persist('familyMeetings');
    }
  }

  // -------------------------------------------------------------------
  // Video Call Invites
  // -------------------------------------------------------------------
  static async getVideoCallInvitesForIntroduction(introId: string): Promise<VideoCallInvite[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('video_call_invites').select('*').eq('introduction_id', introId);
        if (!error && data && data.length > 0) {
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
      } catch (e) {
        console.warn('getVideoCallInvites fallback:', e);
      }
    }
    return LocalStore.videoCalls.filter((v) => v.introductionId === introId);
  }

  static async requestVideoCall(introId: string, requestedByCaseId: string): Promise<VideoCallInvite> {
    const roomSlug = `peyvand-${introId}-${Math.random().toString(36).slice(2, 10)}`;
    const invite: VideoCallInvite = {
      id: newId('vc'),
      introductionId: introId,
      requestedByCaseId,
      status: 'REQUESTED',
      roomSlug,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('video_call_invites').insert({
          id: invite.id,
          introduction_id: introId,
          requested_by_case_id: requestedByCaseId,
          status: 'REQUESTED',
          room_slug: roomSlug,
        });
      } catch (e) {
        console.warn('requestVideoCall fallback:', e);
      }
    }

    LocalStore.videoCalls.push(invite);
    LocalStore.persist('videoCalls');
    return invite;
  }

  static async updateVideoCallStatus(inviteId: string, status: VideoCallInvite['status']): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('video_call_invites').update({ status }).eq('id', inviteId);
      } catch (e) {
        console.warn('updateVideoCallStatus fallback:', e);
      }
    }
    const vc = LocalStore.videoCalls.find((x) => x.id === inviteId);
    if (vc) {
      vc.status = status;
      LocalStore.persist('videoCalls');
    }
  }

  // -------------------------------------------------------------------
  // Group Sessions
  // -------------------------------------------------------------------
  static async getGroupSessions(): Promise<GroupSession[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('group_sessions').select('*').order('scheduled_at');
        if (!error && data && data.length > 0) {
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
      } catch (e) {
        console.warn('getGroupSessions fallback:', e);
      }
    }
    return LocalStore.groupSessions;
  }

  static async saveGroupSession(session: Omit<GroupSession, 'id' | 'createdAt'> & { id?: string }): Promise<void> {
    const sObj: GroupSession = {
      id: session.id || newId('gs'),
      title: session.title,
      description: session.description,
      facilitatorId: session.facilitatorId,
      facilitatorName: session.facilitatorName,
      scheduledAt: session.scheduledAt,
      durationMinutes: session.durationMinutes,
      capacity: session.capacity,
      price: session.price,
      status: session.status,
      meetingUrl: session.meetingUrl,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('group_sessions').upsert({
          id: sObj.id,
          title: sObj.title,
          description: sObj.description,
          facilitator_id: sObj.facilitatorId,
          facilitator_name: sObj.facilitatorName,
          scheduled_at: sObj.scheduledAt,
          duration_minutes: sObj.durationMinutes,
          capacity: sObj.capacity,
          price: sObj.price,
          status: sObj.status,
          meeting_url: sObj.meetingUrl,
        });
      } catch (e) {
        console.warn('saveGroupSession fallback:', e);
      }
    }

    const idx = LocalStore.groupSessions.findIndex((x) => x.id === sObj.id);
    if (idx >= 0) {
      LocalStore.groupSessions[idx] = sObj;
    } else {
      LocalStore.groupSessions.push(sObj);
    }
    LocalStore.persist('groupSessions');
  }

  static async getGroupSessionBookings(sessionId: string): Promise<GroupSessionBooking[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('group_session_bookings').select('*').eq('session_id', sessionId);
        if (!error && data && data.length > 0) {
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
      } catch (e) {
        console.warn('getGroupSessionBookings fallback:', e);
      }
    }
    return LocalStore.groupBookings.filter((b) => b.sessionId === sessionId);
  }

  static async bookGroupSession(sessionId: string, userId: string, userName: string): Promise<void> {
    const booking: GroupSessionBooking = {
      id: newId('gsb'),
      sessionId,
      userId,
      userName,
      status: 'BOOKED',
      bookedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('group_session_bookings').insert({
          id: booking.id,
          session_id: sessionId,
          user_id: userId,
          user_name: userName,
          status: 'BOOKED',
        });
      } catch (e) {
        console.warn('bookGroupSession fallback:', e);
      }
    }
    LocalStore.groupBookings.push(booking);
    LocalStore.persist('groupBookings');
  }

  static async cancelGroupSessionBooking(bookingId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('group_session_bookings').update({ status: 'CANCELLED' }).eq('id', bookingId);
      } catch (e) {
        console.warn('cancelGroupSessionBooking fallback:', e);
      }
    }
    const b = LocalStore.groupBookings.find((x) => x.id === bookingId);
    if (b) {
      b.status = 'CANCELLED';
      LocalStore.persist('groupBookings');
    }
  }

  // -------------------------------------------------------------------
  // Content Articles
  // -------------------------------------------------------------------
  static async getPublishedArticles(): Promise<ContentArticle[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('content_articles')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data.map(rowToArticle);
      } catch (e) {
        console.warn('getPublishedArticles fallback:', e);
      }
    }
    return LocalStore.articles.filter((a) => a.published);
  }

  static async getAllArticles(): Promise<ContentArticle[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('content_articles').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data.map(rowToArticle);
      } catch (e) {
        console.warn('getAllArticles fallback:', e);
      }
    }
    return LocalStore.articles;
  }

  static async saveArticle(article: Omit<ContentArticle, 'createdAt' | 'updatedAt'> & { id?: string }): Promise<void> {
    const me = await this.getCurrentUser();
    const artObj: ContentArticle = {
      id: article.id || newId('art'),
      slug: article.slug,
      title: article.title,
      category: article.category,
      coverImageUrl: article.coverImageUrl,
      body: article.body,
      authorId: me?.id || 'staff',
      authorName: me?.fullName || 'تیم تحریریه پیوند امن',
      published: article.published,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('content_articles').upsert({
          id: artObj.id,
          slug: artObj.slug,
          title: artObj.title,
          category: artObj.category,
          cover_image_url: artObj.coverImageUrl,
          body: artObj.body,
          author_id: me?.id,
          author_name: me?.fullName,
          published: artObj.published,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('saveArticle fallback:', e);
      }
    }
    const idx = LocalStore.articles.findIndex((a) => a.id === artObj.id);
    if (idx >= 0) {
      LocalStore.articles[idx] = artObj;
    } else {
      LocalStore.articles.push(artObj);
    }
    LocalStore.persist('articles');
  }
}
