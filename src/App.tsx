/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/storage';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { ScoringEngine } from './services/scoringEngine';
import { MatchingEngine } from './services/matchingEngine';
import {
  User, Case, Profile, TestAssignment, TestResult, ExpertNote, MatchCandidate,
  Introduction, Appointment, AuditLog, TestCatalog, Payment,
} from './types';

// Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ClientDashboard } from './components/client/ClientDashboard';
import { TestEngine } from './components/client/TestEngine';
import { IntroductionsView } from './components/client/IntroductionsView';
import { AppointmentBooking } from './components/client/AppointmentBooking';
import { ProfileForm } from './components/client/ProfileForm';
import { OtpAuthModal } from './components/client/OtpAuthModal';
import { CaseConsentModal } from './components/client/CaseConsentModal';
import { PaymentGatewayModal } from './components/client/PaymentGatewayModal';
import { ExpertDashboard } from './components/expert/ExpertDashboard';
import { ExpertMatchingTable } from './components/expert/ExpertMatchingTable';
import { ExpertAppointmentList } from './components/expert/ExpertAppointmentList';
import { AdminTestCatalog } from './components/admin/AdminTestCatalog';
import { AdminAuditLog } from './components/admin/AdminAuditLog';
import { AdminPaymentSettings } from './components/admin/AdminPaymentSettings';
import { AdminSmsSettings } from './components/admin/AdminSmsSettings';
import { AdminSuccessDashboard } from './components/admin/AdminSuccessDashboard';
import { AdminContentManager } from './components/admin/AdminContentManager';
import { AdminGroupSessions } from './components/admin/AdminGroupSessions';
import { ContentLibrary } from './components/content/ContentLibrary';
import { GroupSessionsList } from './components/groups/GroupSessionsList';
import { PwaBanner } from './components/pwa/PwaBanner';
import { SupabaseStatusBanner } from './components/common/SupabaseStatusBanner';
import { LandingPage } from './components/landing/LandingPage';

interface AppData {
  users: User[];
  cases: Case[];
  profiles: Profile[];
  testAssignments: TestAssignment[];
  testResults: TestResult[];
  expertNotes: ExpertNote[];
  matchCandidates: MatchCandidate[];
  introductions: Introduction[];
  appointments: Appointment[];
  payments: Payment[];
  auditLogs: AuditLog[];
  testCatalog: TestCatalog[];
}

const EMPTY_DATA: AppData = {
  users: [], cases: [], profiles: [], testAssignments: [], testResults: [],
  expertNotes: [], matchCandidates: [], introductions: [], appointments: [],
  payments: [], auditLogs: [], testCatalog: [],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [activeTestId, setActiveTestId] = useState<string>('test-neo');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);

  // Loads (or reloads) everything the current session is allowed to see.
  // RLS scopes each query automatically — a CLIENT gets back only their own
  // rows, staff gets everything — so this same call works for every role.
  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const me = await StorageService.getCurrentUser();
    setCurrentUser(me);

    if (!me) {
      setData(EMPTY_DATA);
      setLoading(false);
      return;
    }

    const [
      users, cases, profiles, testAssignments, testResults, expertNotes,
      matchCandidates, introductions, appointments, payments, auditLogs, testCatalog,
    ] = await Promise.all([
      StorageService.getUsers(),
      StorageService.getCases(),
      StorageService.getProfiles(),
      StorageService.getTestAssignments(),
      StorageService.getTestResults(),
      StorageService.getExpertNotes(),
      StorageService.getMatchCandidates(),
      StorageService.getIntroductions(),
      StorageService.getAppointments(),
      StorageService.getPayments(),
      me.role === 'CLIENT' ? Promise.resolve([]) : StorageService.getAuditLogs(),
      StorageService.getTestCatalog(),
    ]);

    setData({
      users, cases, profiles, testAssignments, testResults, expertNotes,
      matchCandidates, introductions, appointments, payments, auditLogs, testCatalog,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  // Handle return from ZarinPal's hosted payment page. ZarinPal redirects
  // back to callback_url with ?Authority=...&Status=OK|NOK — we exchange
  // that Authority for a verified transaction. The Worker itself writes the
  // SUCCESS payment row (with the service-role key, after independently
  // confirming with ZarinPal) — RLS wouldn't let the client do that even if
  // we tried, so all that's left here is to verify and refresh.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authority = params.get('Authority');
    const status = params.get('Status');
    if (!authority) return;

    const cleanUrl = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('Authority');
      url.searchParams.delete('Status');
      window.history.replaceState({}, '', url.toString());
    };

    if (status !== 'OK') {
      alert('پرداخت لغو شد یا ناموفق بود.');
      cleanUrl();
      return;
    }

    fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authority }),
    })
      .then((res) => res.json())
      .then(async (verData) => {
        if (verData.success) {
          await refresh();
          alert('پرداخت با موفقیت تأیید شد.');
        } else {
          alert(verData.error || 'تأیید تراکنش با درگاه بانکی ناموفق بود.');
        }
      })
      .catch((err) => {
        console.error('Payment verification failed:', err);
        alert('خطا در تأیید تراکنش. در صورت کسر وجه، با پشتیبانی تماس بگیرید.');
      })
      .finally(cleanUrl);
    // Runs once on mount — this only fires when ZarinPal has redirected back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { users, cases, profiles, testAssignments, testResults, expertNotes,
    matchCandidates, introductions, appointments, auditLogs, testCatalog } = data;

  const activeCase = currentUser ? cases.find((c) => c.userId === currentUser.id) : undefined;
  const activeProfile = currentUser ? profiles.find((p) => p.userId === currentUser.id) : undefined;

  // Test Engine Completion
  const handleCompleteTest = async (testId: string, answers: Record<string, number>) => {
    if (!activeCase || !currentUser) return;
    const questions = StorageService.getQuestionsForTest(testId);
    const result = ScoringEngine.scoreTest(activeCase.id, testId, questions, answers);
    await StorageService.saveTestResult(result);
    await StorageService.addAuditLog(currentUser.id, currentUser.role, 'TEST_COMPLETED', 'TestResult', result.id);
    setActiveTab('client-dashboard');
    await refresh();
  };

  // Expert Actions
  const handleSaveExpertNote = async (caseId: string, content: string, type: 'INTERNAL' | 'SHAREABLE') => {
    if (!currentUser) return;
    const note: ExpertNote = {
      id: `en-${Date.now()}`,
      caseId,
      expertId: currentUser.id,
      expertName: currentUser.fullName,
      content,
      type,
      createdAt: new Date().toISOString(),
    };
    await StorageService.saveExpertNote(note);
    await StorageService.addAuditLog(currentUser.id, currentUser.role, 'EXPERT_NOTE_ADDED', 'ExpertNote', note.id);
    await refresh();
  };

  // Matching Desk Actions
  const handleApproveMatch = async (matchId: string) => {
    if (!currentUser) return;
    const match = matchCandidates.find((m) => m.id === matchId);
    if (!match) return;

    await StorageService.updateMatchCandidateStatus(matchId, 'APPROVED');

    const newIntro: Introduction = {
      id: `intro-${Date.now()}`,
      matchCandidateId: matchId,
      caseAId: match.caseAId,
      caseBId: match.caseBId,
      status: 'ACTIVE',
      aConsentAt: new Date().toISOString(),
      bConsentAt: new Date().toISOString(),
      anonymousPreviewA: {
        firstName: 'سارا',
        age: 28,
        city: 'تهران',
        educationLevel: 'کارشناسی ارشد',
        occupationCategory: 'مهندسی نرم‌افزار',
        shortBio: 'علاقه‌مند به مطالعه، زندگی برنامه‌ریزی‌شده و ارزش‌های خانواده‌محور.',
        keyValues: ['صداقت', 'رشد متقابل', 'فرزندآوری'],
      },
      anonymousPreviewB: {
        firstName: 'علی',
        age: 31,
        city: 'تهران',
        educationLevel: 'کارشناسی ارشد',
        occupationCategory: 'مدیریت کسب‌وکار',
        shortBio: 'اهل ورزش و طبیعت‌گردی، با اولویت ایجاد آرامش و تشکیل خانواده پایدار.',
        keyValues: ['اصالت خانوادگی', 'پشتکار', 'فرزندآوری'],
      },
      createdAt: new Date().toISOString(),
    };

    await StorageService.saveIntroduction(newIntro);
    await StorageService.updateCaseStatus(match.caseAId, 'INTRODUCED');
    await StorageService.updateCaseStatus(match.caseBId, 'INTRODUCED');
    await StorageService.addAuditLog(currentUser.id, currentUser.role, 'MATCH_APPROVED_LEVEL3', 'MatchCandidate', matchId);
    await refresh();
  };

  const handleDeclineMatch = async (matchId: string) => {
    if (!currentUser) return;
    await StorageService.updateMatchCandidateStatus(matchId, 'DECLINED');
    await StorageService.addAuditLog(currentUser.id, currentUser.role, 'MATCH_DECLINED', 'MatchCandidate', matchId);
    await refresh();
  };

  const handleGenerateNewMatches = async () => {
    if (!currentUser) return;
    // Evaluate every opposite-gender case pair that doesn't already have a
    // candidate on file yet — not just the first two cases in the list.
    const existingPairKeys = new Set(
      matchCandidates.map((m) => [m.caseAId, m.caseBId].sort().join('::'))
    );

    let generatedCount = 0;

    for (let i = 0; i < cases.length; i++) {
      for (let j = i + 1; j < cases.length; j++) {
        const caseA = cases[i];
        const caseB = cases[j];

        const pairKey = [caseA.id, caseB.id].sort().join('::');
        if (existingPairKeys.has(pairKey)) continue;

        const profileA = profiles.find((p) => p.caseId === caseA.id);
        const profileB = profiles.find((p) => p.caseId === caseB.id);
        if (!profileA || !profileB) continue;

        const userA = users.find((u) => u.id === caseA.userId);
        const userB = users.find((u) => u.id === caseB.userId);
        if (!userA || !userB) continue;
        // Only opposite-gender pairs are valid matches for this service.
        if (userA.gender === userB.gender) continue;

        const candidate = MatchingEngine.evaluatePair(
          caseA.id,
          caseB.id,
          profileA,
          profileB,
          testResults.filter((r) => r.caseId === caseA.id),
          testResults.filter((r) => r.caseId === caseB.id),
          userA.gender,
          userB.gender
        );
        await StorageService.saveMatchCandidate(candidate);
        await StorageService.addAuditLog(currentUser.id, currentUser.role, 'ALGORITHMIC_MATCH_RUN', 'MatchCandidate', candidate.id);
        existingPairKeys.add(pairKey);
        generatedCount++;
      }
    }

    if (generatedCount === 0) {
      alert('کاندید جدیدی برای تطبیق یافت نشد (همه زوج‌های ممکن قبلاً بررسی شده‌اند).');
    }
    await refresh();
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-100 text-sm text-slate-500">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 text-right font-sans flex flex-col md:flex-row-reverse select-none overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser || undefined}
        activeCase={activeCase}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingIntroductionsCount={
          activeCase
            ? introductions.filter(
                (i) => (i.caseAId === activeCase.id || i.caseBId === activeCase.id) && i.status === 'ACTIVE'
              ).length
            : 0
        }
        pendingMatchReviewCount={matchCandidates.filter((m) => m.expertDecision === 'GENERATED').length}
      />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-hidden">
        {/* Supabase PostgreSQL Integration Banner */}
        <SupabaseStatusBanner />

        {/* Top Header */}
        <Header
          currentUser={currentUser || undefined}
          activeCase={activeCase}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenOtpModal={() => setIsOtpModalOpen(true)}
          onOpenConsentModal={() => setIsConsentModalOpen(true)}
          onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
        />

        {/* PWA Installation Banner */}
        <PwaBanner />

        {/* View Switcher Routing */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {activeTab === 'landing' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <LandingPage
                onOpenOtpModal={() => setIsOtpModalOpen(true)}
                onNavigateTab={setActiveTab}
                onOpenConsentModal={() => setIsConsentModalOpen(true)}
                onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
                onStartTest={(testId) => {
                  setActiveTestId(testId);
                  setActiveTab('client-tests');
                }}
              />
            </div>
          )}

          {/* CLIENT VIEWS */}
          {currentUser && activeTab === 'client-dashboard' && (
            <ClientDashboard
              currentUser={currentUser}
              activeCase={activeCase}
              profile={activeProfile}
              testAssignments={testAssignments}
              testResults={testResults}
              expertNotes={expertNotes}
              introductions={introductions}
              matchCandidates={matchCandidates}
              testCatalog={testCatalog}
              onOpenProfileForm={() => setIsProfileFormOpen(true)}
              onOpenTestEngine={(tId) => {
                setActiveTestId(tId);
                setActiveTab('client-tests');
              }}
              onOpenConsentModal={() => setIsConsentModalOpen(true)}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              onNavigateToIntroductions={() => setActiveTab('client-introductions')}
            />
          )}

          {currentUser && activeTab === 'client-tests' && (
            <TestEngine
              testId={activeTestId}
              caseId={activeCase?.id}
              assignment={testAssignments.find((ta) => ta?.caseId === activeCase?.id && ta?.testId === activeTestId)}
              testCatalog={testCatalog}
              questions={StorageService.getQuestionsForTest(activeTestId)}
              onCompleteTest={handleCompleteTest}
              onBack={() => setActiveTab('client-dashboard')}
            />
          )}

          {currentUser && activeTab === 'client-introductions' && (
            <IntroductionsView
              currentUser={currentUser}
              activeCase={activeCase}
              introductions={introductions}
              onConsentIntroduction={async (introId) => {
                await StorageService.updateIntroductionStatus(introId, 'ACTIVE');
                await refresh();
              }}
              onSendMessage={async (introId, text) => {
                await StorageService.addMessage(introId, currentUser.id, currentUser.fullName, text);
                await refresh();
              }}
            />
          )}

          {currentUser && activeTab === 'client-appointment' && (
            <AppointmentBooking
              activeCase={activeCase}
              currentUser={currentUser}
              appointments={appointments}
              onBookAppointment={async (apt) => {
                await StorageService.saveAppointment({
                  id: `apt-${Date.now()}`,
                  caseId: activeCase?.id || 'CASE-2026-00128',
                  clientName: currentUser.fullName,
                  expertId: 'user-mahnaz',
                  expertName: 'خانم مهناز خوینی',
                  type: apt.type || 'ONLINE',
                  scheduledAt: apt.scheduledAt || new Date().toISOString(),
                  durationMinutes: 60,
                  status: 'BOOKED',
                  meetingUrl: `https://meet.peyvandamn.ir/room-${activeCase?.id}`,
                  notes: apt.notes,
                });
                await refresh();
              }}
            />
          )}

          {currentUser && activeTab === 'client-groups' && (
            <GroupSessionsList currentUser={currentUser} />
          )}

          {activeTab === 'content-library' && <ContentLibrary />}

          {/* EXPERT VIEWS */}
          {currentUser && activeTab === 'expert-dashboard' && (
            <ExpertDashboard
              cases={cases}
              profiles={profiles}
              testResults={testResults}
              expertNotes={expertNotes}
              matchCandidates={matchCandidates}
              introductions={introductions}
              users={users}
              onSelectCaseForMatching={() => setActiveTab('expert-matching')}
              onSaveExpertNote={handleSaveExpertNote}
              onUpdateCaseStatus={async (cId, st) => {
                await StorageService.updateCaseStatus(cId, st);
                await refresh();
              }}
            />
          )}

          {currentUser && activeTab === 'expert-matching' && (
            <ExpertMatchingTable
              matchCandidates={matchCandidates}
              cases={cases}
              profiles={profiles}
              users={users}
              onApproveMatch={handleApproveMatch}
              onDeclineMatch={handleDeclineMatch}
              onGenerateNewMatches={handleGenerateNewMatches}
            />
          )}

          {currentUser && activeTab === 'expert-appointments' && (
            <ExpertAppointmentList
              appointments={appointments}
              cases={cases}
              onAddAppointment={async (apt) => {
                await StorageService.saveAppointment(apt as Appointment);
                await refresh();
              }}
            />
          )}

          {/* ADMIN VIEWS */}
          {currentUser && activeTab === 'admin-success' && <AdminSuccessDashboard />}

          {currentUser && activeTab === 'admin-tests' && (
            <AdminTestCatalog
              testCatalog={testCatalog}
              onToggleMatching={async (tId) => {
                await StorageService.toggleTestMatching(tId);
                await refresh();
              }}
            />
          )}

          {currentUser && activeTab === 'admin-payments' && (
            <AdminPaymentSettings />
          )}

          {currentUser && activeTab === 'admin-sms' && (
            <AdminSmsSettings />
          )}

          {currentUser && activeTab === 'admin-content' && <AdminContentManager />}

          {currentUser && activeTab === 'admin-groups' && (
            <AdminGroupSessions currentUser={currentUser} />
          )}

          {currentUser && activeTab === 'admin-audit' && (
            <AdminAuditLog auditLogs={auditLogs} />
          )}
        </main>
      </div>

      {/* OVERLAY MODALS */}
      {isOtpModalOpen && (
        <OtpAuthModal
          isOpen={isOtpModalOpen}
          onClose={async () => {
            setIsOtpModalOpen(false);
            await refresh();
          }}
        />
      )}

      {isConsentModalOpen && activeCase && currentUser && (
        <CaseConsentModal
          activeCase={activeCase}
          currentUser={currentUser}
          onClose={() => setIsConsentModalOpen(false)}
          onAcceptConsent={async (type) => {
            await StorageService.addConsentWithDetails(
              activeCase.id,
              currentUser.id,
              type,
              '',
              navigator.userAgent
            );
            setIsConsentModalOpen(false);
            await refresh();
          }}
        />
      )}

      {isPaymentModalOpen && activeCase && currentUser && (
        <PaymentGatewayModal
          activeCase={activeCase}
          currentUser={currentUser}
          onClose={async () => {
            setIsPaymentModalOpen(false);
            await refresh();
          }}
        />
      )}

      {isProfileFormOpen && activeCase && currentUser && (
        <ProfileForm
          caseId={activeCase.id}
          userId={currentUser.id}
          existingProfile={activeProfile}
          onSaved={async () => {
            setIsProfileFormOpen(false);
            await refresh();
          }}
        />
      )}
    </div>
  );
}
