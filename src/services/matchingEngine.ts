/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile, TestResult, MatchCandidate } from '../types';

export class MatchingEngine {
  /**
   * Computes compatibility and generates full MatchCandidate object.
   */
  static evaluatePair(
    caseAId: string,
    caseBId: string,
    profileA: Profile,
    profileB: Profile,
    resultsA: TestResult[],
    resultsB: TestResult[],
    genderA: 'MALE' | 'FEMALE',
    genderB: 'MALE' | 'FEMALE'
  ): MatchCandidate {
    const comp = this.calculateCompatibility(profileA, profileB, resultsA, resultsB, genderA, genderB);
    return {
      id: `match-${caseAId}-${caseBId}-${Date.now()}`,
      ...comp,
      caseAId,
      caseBId,
      expertDecision: 'GENERATED',
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Computes compatibility and flags hard conflicts between two client profiles and test results.
   */
  static calculateCompatibility(
    profileA: Profile,
    profileB: Profile,
    resultsA: TestResult[],
    resultsB: TestResult[],
    genderA: 'MALE' | 'FEMALE',
    genderB: 'MALE' | 'FEMALE'
  ): Omit<MatchCandidate, 'id' | 'expertDecision' | 'generatedAt'> {
    const hardConflicts: string[] = [];
    const softDifferences: string[] = [];

    // --- 1. Hard Criteria Filter ---
    // Rule 0: Opposite-sex requirement — same-gender pairs are never a
    // valid marriage match for this service, so this is a hard conflict
    // rather than a soft/scored difference.
    if (genderA === genderB) {
      hardConflicts.push('عدم تطابق جنسیت: تشکیل زوج بین دو کیس هم‌جنس امکان‌پذیر نیست.');
    }

    // Rule A: Desire for Children
    if (
      (profileA.criteria.desireForChildrenRequirement === 'MUST_WANT' && profileB.desireForChildren === 'DEFINITE_NO') ||
      (profileB.criteria.desireForChildrenRequirement === 'MUST_WANT' && profileA.desireForChildren === 'DEFINITE_NO')
    ) {
      hardConflicts.push('تعارض قطعی در تصمیم فرزندآوری (یکی از طرفین تمایل قطعی دارد و دیگری کاملاً مخالف است).');
    }

    // Rule B: Previous Marriage Acceptability
    if (profileA.maritalStatus !== 'SINGLE' && !profileB.criteria.acceptPreviousMarriage) {
      hardConflicts.push(`عدم پذیرش سابقه ازدواج قبلی توسط کیس ${profileB.caseId}.`);
    }
    if (profileB.maritalStatus !== 'SINGLE' && !profileA.criteria.acceptPreviousMarriage) {
      hardConflicts.push(`عدم پذیرش سابقه ازدواج قبلی توسط کیس ${profileA.caseId}.`);
    }

    // Rule C: Children from Previous Marriage
    if (profileA.hasChildren && !profileB.criteria.acceptChildren) {
      hardConflicts.push(`عدم پذیرش داشتن فرزند از ازدواج قبلی توسط کیس ${profileB.caseId}.`);
    }
    if (profileB.hasChildren && !profileA.criteria.acceptChildren) {
      hardConflicts.push(`عدم پذیرش داشتن فرزند از ازدواج قبلی توسط کیس ${profileA.caseId}.`);
    }

    // Rule D: Age Criteria
    let ageMismatchCount = 0;
    if (profileB.age < profileA.criteria.minAge || profileB.age > profileA.criteria.maxAge) {
      softDifferences.push(`سن کیس B (${profileB.age} سال) خارج از بازه مدنظر کیس A (${profileA.criteria.minAge} تا ${profileA.criteria.maxAge} سال) است.`);
      ageMismatchCount++;
    }
    if (profileA.age < profileB.criteria.minAge || profileA.age > profileB.criteria.maxAge) {
      softDifferences.push(`سن کیس A (${profileA.age} سال) خارج از بازه مدنظر کیس B (${profileB.criteria.minAge} تا ${profileB.criteria.maxAge} سال) است.`);
      ageMismatchCount++;
    }

    // Rule E: Migration Intention
    if (
      (profileA.migrationIntention === 'DEFINITE_PLAN' && profileB.migrationIntention === 'NEVER') ||
      (profileB.migrationIntention === 'DEFINITE_PLAN' && profileA.migrationIntention === 'NEVER')
    ) {
      softDifferences.push('تفاوت اساسی در برنامه‌ریزی مهاجرت به خارج از کشور.');
    }

    // --- 2. Soft Weighted Scoring Breakdown (Max 100) ---
    // A. Marriage Goals (25%)
    let marriageGoalsScore = 20;
    if (profileA.desireForChildren === profileB.desireForChildren) marriageGoalsScore += 5;

    // B. Values (20%)
    let valuesScore = 18;
    if (profileA.city === profileB.city) valuesScore += 2;
    // Age-range mismatch is a stated preference violation, not a hard
    // conflict — penalize this category instead of leaving it scoreless.
    if (ageMismatchCount > 0) valuesScore = Math.max(0, valuesScore - ageMismatchCount * 6);

    // C. Attachment Synergy (15%)
    let attachmentScore = 14;
    const ecrA = resultsA.find((r) => r.testId === 'test-ecr');
    const ecrB = resultsB.find((r) => r.testId === 'test-ecr');
    if (ecrA && ecrB) {
      // "Secure" here means low anxiety AND low avoidance for both — no
      // single 'دلبستگی ایمن' subscale exists in ECR-R, it only measures
      // anxiety and avoidance directly (Fraley et al., 2000).
      //
      // Read the 0-100 normalized standardScores (already computed correctly
      // in scoringEngine.ts from the real per-subscale item count) instead of
      // re-deriving a 1-7 average from subscaleScores with a hardcoded /18 —
      // that broke silently if the instrument's item count ever changed.
      // Missing data (`??`) defaults to the worst case (100 = maximally
      // insecure) rather than a fabricated "average" secure-leaning value.
      const SECURE_CUTOFF_PCT = ((3.5 - 1) / (7 - 1)) * 100; // ≈ 41.67, on the 0-100 scale
      const anxA = ecrA.standardScores['اضطراب دلبستگی'] ?? 100;
      const avoA = ecrA.standardScores['اجتناب دلبستگی'] ?? 100;
      const anxB = ecrB.standardScores['اضطراب دلبستگی'] ?? 100;
      const avoB = ecrB.standardScores['اجتناب دلبستگی'] ?? 100;
      const secureA = anxA < SECURE_CUTOFF_PCT && avoA < SECURE_CUTOFF_PCT;
      const secureB = anxB < SECURE_CUTOFF_PCT && avoB < SECURE_CUTOFF_PCT;
      if (secureA && secureB) attachmentScore = 15;
    }

    // D. Communication & Conflict (15%)
    let commScore = 13;

    // E. Personality Synergy (NEO) (10%)
    let personalityScore = 8;
    const neoA = resultsA.find((r) => r.testId === 'test-neo');
    const neoB = resultsB.find((r) => r.testId === 'test-neo');
    if (neoA && neoB) {
      const conA = neoA.standardScores['وظیفه‌شناسی'] || 50;
      const conB = neoB.standardScores['وظیفه‌شناسی'] || 50;
      if (conA > 60 && conB > 60) personalityScore = 10;
    }

    // F. Lifestyle (10%)
    let lifestyleScore = 8;
    if (profileA.migrationIntention === profileB.migrationIntention) lifestyleScore += 2;

    // G. Other (5%)
    let otherScore = 4;

    const totalScore = hardConflicts.length > 0
      ? Math.min(35, marriageGoalsScore + valuesScore)
      : marriageGoalsScore + valuesScore + attachmentScore + commScore + personalityScore + lifestyleScore + otherScore;

    return {
      caseAId: profileA.caseId,
      caseBId: profileB.caseId,
      compatibilityScore: totalScore,
      breakdown: {
        marriageGoals: marriageGoalsScore,
        values: valuesScore,
        attachment: attachmentScore,
        communication: commScore,
        personality: personalityScore,
        lifestyle: lifestyleScore,
        other: otherScore,
      },
      hardConflicts,
      softDifferences,
    };
  }
}
