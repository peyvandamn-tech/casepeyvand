/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'CLIENT' | 'EXPERT' | 'COUNSELOR' | 'FINANCE' | 'ADMIN' | 'SUPER_ADMIN';

export type CaseStatus =
  | 'REGISTERED'
  | 'CONSENT_PENDING'
  | 'PAYMENT_PENDING'
  | 'PROFILE_PENDING'
  | 'TEST_PENDING'
  | 'TEST_COMPLETED'
  | 'EXPERT_REVIEW'
  | 'NEEDS_MORE_INFORMATION'
  | 'READY_FOR_MATCHING'
  | 'MATCHING'
  | 'WAITING_FOR_EXPERT_APPROVAL'
  | 'INTRODUCTION_PENDING'
  | 'INTRODUCED'
  | 'COUNSELING'
  | 'CLOSED';

export type ConsentType =
  | 'PRIVACY'
  | 'ASSESSMENT'
  | 'INTRODUCTION'
  | 'COUNSELING'
  | 'EXPERT_DISCLAIMER';

export interface User {
  id: string;
  phone: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  role: Role;
  createdAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  caseId: string;
  // Base Information
  age: number;
  city: string;
  province: string;
  education: string;
  fieldOfStudy: string;
  jobTitle: string;
  maritalStatus: 'SINGLE' | 'DIVORCED' | 'WIDOWED';
  hasChildren: boolean;
  childrenCount: number;
  height: number;
  // Lifestyle
  workingHoursPerDay: number;
  hobbies: string[];
  livingArrangement: string; // e.g. independent, with family
  migrationIntention: 'NEVER' | 'CONSIDERING' | 'DEFINITE_PLAN';
  socialStyle: string;
  // Marriage Goals
  marriageGoal: string;
  expectedTimelineMonths: number;
  desireForChildren: 'DEFINITE_YES' | 'OPEN_TO_DISCUSS' | 'DEFINITE_NO';
  preferredLivingLocation: string;
  // Family & Religion/Culture
  familyRelationshipStyle: string;
  familyDependencyLevel: 'LOW' | 'MODERATE' | 'HIGH';
  familyExpectations: string;
  // Economic
  financialAttitude: string;
  monthlyIncomeRange: string;
  housingStatus: string;
  // Spouse Criteria (Hard & Soft)
  criteria: {
    minAge: number;
    maxAge: number;
    targetCities: string[];
    educationRequired: string;
    acceptChildren: boolean;
    acceptPreviousMarriage: boolean;
    desireForChildrenRequirement: 'MUST_WANT' | 'DONT_CARE' | 'MUST_NOT_WANT';
    hardCriteriaNotes: string;
    softPreferences: string[];
  };
}

export interface Case {
  id: string; // e.g. CASE-2026-00128
  userId: string;
  status: CaseStatus;
  assignedExpertId: string; // e.g., expert-mahnaz
  createdAt: string;
  updatedAt: string;
  closeReason?: string;
}

export interface Consent {
  id: string;
  userId: string;
  caseId: string;
  type: ConsentType;
  version: string;
  contentHash: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
  status: 'ACCEPTED' | 'REVOKED';
}

export interface TestCatalog {
  id: string;
  code: 'NEO' | 'ECR' | 'PAM' | 'FMS' | 'LAS';
  name: string;
  version: string;
  questionCount: number;
  description: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  licenseStatus: 'PUBLIC_DOMAIN' | 'PERMISSION_REQUIRED' | 'LICENSED';
  matchingEnabled: boolean;
  subscales: string[];
}

export interface QuestionOption {
  value: number;
  label: string;
}

export interface Question {
  id: string;
  testId: string;
  order: number;
  text: string;
  type: 'LIKERT_5' | 'LIKERT_7' | 'YES_NO';
  reverse: boolean;
  subscale: string;
  weight: number;
  tags: string[];
  options?: QuestionOption[];
}

export interface TestAssignment {
  id: string;
  caseId: string;
  testId: string;
  assignedAt: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  autosavedAnswers: Record<string, number>; // questionId -> answerValue
  completedAt?: string;
}

export interface TestResult {
  id: string;
  caseId: string;
  testId: string;
  subscaleScores: Record<string, number>; // Subscale -> Raw Score
  standardScores: Record<string, number>; // Subscale -> Standardized Score (T-Score / %ile)
  interpretation: {
    summary: string;
    strengths: string[];
    vulnerabilities: string[];
    clinicalFlags: string[];
  };
  completedAt: string;
}

export interface ExpertNote {
  id: string;
  caseId: string;
  expertId: string;
  expertName: string;
  content: string;
  type: 'INTERNAL' | 'SHAREABLE';
  createdAt: string;
}

export interface MatchCandidate {
  id: string;
  caseAId: string;
  caseBId: string;
  compatibilityScore: number; // 0 - 100
  breakdown: {
    marriageGoals: number; // e.g., max 25
    values: number;        // max 20
    attachment: number;    // max 15
    communication: number; // max 15
    personality: number;   // max 10
    lifestyle: number;     // max 10
    other: number;         // max 5
  };
  hardConflicts: string[];
  softDifferences: string[];
  expertDecision: 'GENERATED' | 'EXPERT_REVIEW' | 'APPROVED' | 'DECLINED' | 'INTRODUCED';
  expertNotes?: string;
  generatedAt: string;
}

export interface Introduction {
  id: string;
  matchCandidateId: string;
  caseAId: string;
  caseBId: string;
  status: 'A_PENDING' | 'A_ACCEPTED' | 'B_PENDING' | 'B_ACCEPTED' | 'ACTIVE' | 'DECLINED' | 'CLOSED';
  aConsentAt?: string;
  bConsentAt?: string;
  anonymousPreviewA: {
    firstName: string;
    age: number;
    city: string;
    educationLevel: string;
    occupationCategory: string;
    shortBio: string;
    keyValues: string[];
  };
  anonymousPreviewB: {
    firstName: string;
    age: number;
    city: string;
    educationLevel: string;
    occupationCategory: string;
    shortBio: string;
    keyValues: string[];
  };
  contactExchangeRequestedByA?: boolean;
  contactExchangeRequestedByB?: boolean;
  contactExchangeApprovedAt?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  introductionId: string;
  senderUserId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Appointment {
  id: string;
  caseId: string;
  clientName: string;
  expertId: string;
  expertName: string;
  type: 'INDIVIDUAL' | 'JOINT_SESSION' | 'ONLINE' | 'IN_PERSON';
  scheduledAt: string;
  durationMinutes: number;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  meetingUrl?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  caseId: string;
  userId: string;
  amount: number; // Rials / Tomans
  gateway: string; // 'ZarinPal' | 'CARD_TO_CARD'
  transactionId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  paidAt?: string;
  cardReceiptInfo?: {
    cardNumberLast4?: string;
    trackingCode: string;
    receiptDate: string;
    notes?: string;
  };
}

export interface SystemPaymentSettings {
  zarinpalEnabled: boolean;
  zarinpalMerchantId: string;
  cardToCardEnabled: boolean;
  bankDetails: {
    bankName: string;
    cardNumber: string;
    accountHolder: string;
    shebaNumber: string;
  };
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: Role;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ip: string;
  metadata?: Record<string, any>;
}

export interface IntroductionFeedback {
  id: string;
  introductionId: string;
  caseId: string;
  metInPerson: boolean;
  wantsToContinue?: boolean;
  rating?: number;
  comments?: string;
  submittedAt: string;
}

export interface FamilyMeeting {
  id: string;
  introductionId: string;
  status: 'PROPOSED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  scheduledAt?: string;
  location?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface VideoCallInvite {
  id: string;
  introductionId: string;
  requestedByCaseId: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  roomSlug: string;
  scheduledAt?: string;
  createdAt: string;
}

export interface GroupSession {
  id: string;
  title: string;
  description?: string;
  facilitatorId: string;
  facilitatorName: string;
  scheduledAt: string;
  durationMinutes: number;
  capacity: number;
  price: number;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  meetingUrl?: string;
  createdAt: string;
}

export interface GroupSessionBooking {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  status: 'BOOKED' | 'CANCELLED' | 'ATTENDED';
  paymentId?: string;
  bookedAt: string;
}

export interface ContentArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  coverImageUrl?: string;
  body: string;
  authorId?: string;
  authorName?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
