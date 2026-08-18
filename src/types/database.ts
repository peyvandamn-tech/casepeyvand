/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Row shapes matching supabaseClient.ts's SUPABASE_SQL_SCHEMA exactly.
 * Passed as the generic to createClient<Database>() so every .from('table')
 * call is checked against real column/table names at compile time, instead
 * of silently typo-ing a column name and failing only at runtime against a
 * real project.
 */

export interface Database {
  public: {
    Tables: {      users: {
        Row: {
          id: string;
          phone: string | null;
          full_name: string;
          role: 'CLIENT' | 'EXPERT' | 'COUNSELOR' | 'FINANCE' | 'ADMIN' | 'SUPER_ADMIN';
          gender: 'MALE' | 'FEMALE' | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
        Relationships: [];
      };
      cases: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          assigned_expert_id: string | null;
          close_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['cases']['Row']> & { id: string; user_id: string };
        Update: Partial<Database['public']['Tables']['cases']['Row']>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          case_id: string;
          age: number | null;
          city: string | null;
          province: string | null;
          education: string | null;
          field_of_study: string | null;
          job_title: string | null;
          marital_status: string | null;
          has_children: boolean | null;
          children_count: number | null;
          height: number | null;
          working_hours: number | null;
          data: Record<string, unknown> | null;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { user_id: string; case_id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      consents: {
        Row: {
          id: string;
          user_id: string;
          case_id: string;
          type: 'PRIVACY' | 'ASSESSMENT' | 'INTRODUCTION' | 'COUNSELING' | 'EXPERT_DISCLAIMER';
          version: string;
          content_hash: string | null;
          status: 'ACCEPTED' | 'REVOKED';
          accepted_at: string;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: Partial<Database['public']['Tables']['consents']['Row']> & {
          id: string;
          user_id: string;
          case_id: string;
          type: Database['public']['Tables']['consents']['Row']['type'];
        };
        Update: Partial<Database['public']['Tables']['consents']['Row']>;
        Relationships: [];
      };
      test_assignments: {
        Row: {
          id: string;
          case_id: string;
          test_id: string;
          status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
          assigned_at: string;
          autosaved_answers: Record<string, number>;
          completed_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['test_assignments']['Row']> & { id: string; case_id: string; test_id: string };
        Update: Partial<Database['public']['Tables']['test_assignments']['Row']>;
        Relationships: [];
      };
      test_results: {
        Row: {
          id: string;
          case_id: string;
          test_id: string;
          subscale_scores: Record<string, number> | null;
          standard_scores: Record<string, number> | null;
          interpretation: Record<string, unknown> | null;
          completed_at: string;
        };
        Insert: Partial<Database['public']['Tables']['test_results']['Row']> & { id: string; case_id: string; test_id: string };
        Update: Partial<Database['public']['Tables']['test_results']['Row']>;
        Relationships: [];
      };
      expert_notes: {
        Row: {
          id: string;
          case_id: string;
          expert_id: string;
          expert_name: string;
          content: string;
          type: 'INTERNAL' | 'SHAREABLE';
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['expert_notes']['Row']> & { id: string; case_id: string; expert_id: string };
        Update: Partial<Database['public']['Tables']['expert_notes']['Row']>;
        Relationships: [];
      };
      match_candidates: {
        Row: {
          id: string;
          case_a_id: string;
          case_b_id: string;
          compatibility_score: number | null;
          expert_decision: 'GENERATED' | 'EXPERT_REVIEW' | 'APPROVED' | 'DECLINED' | 'INTRODUCED';
          breakdown: Record<string, number> | null;
          hard_conflicts: string[] | null;
          soft_differences: string[] | null;
          expert_notes: string | null;
          generated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['match_candidates']['Row']> & { id: string; case_a_id: string; case_b_id: string };
        Update: Partial<Database['public']['Tables']['match_candidates']['Row']>;
        Relationships: [];
      };
      introductions: {
        Row: {
          id: string;
          match_candidate_id: string;
          case_a_id: string;
          case_b_id: string;
          status: 'A_PENDING' | 'A_ACCEPTED' | 'B_PENDING' | 'B_ACCEPTED' | 'ACTIVE' | 'DECLINED' | 'CLOSED';
          a_consent_at: string | null;
          b_consent_at: string | null;
          anonymous_preview_a: Record<string, unknown> | null;
          anonymous_preview_b: Record<string, unknown> | null;
          contact_exchange_requested_by_a: boolean | null;
          contact_exchange_requested_by_b: boolean | null;
          contact_exchange_approved_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['introductions']['Row']> & {
          id: string;
          match_candidate_id: string;
          case_a_id: string;
          case_b_id: string;
        };
        Update: Partial<Database['public']['Tables']['introductions']['Row']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          introduction_id: string;
          sender_user_id: string;
          sender_name: string;
          content: string;
          is_read: boolean;
          timestamp: string;
        };
        Insert: Partial<Database['public']['Tables']['messages']['Row']> & { id: string; introduction_id: string; sender_user_id: string };
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          case_id: string;
          expert_id: string;
          expert_name: string;
          type: string;
          scheduled_at: string;
          duration_minutes: number;
          status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
          meeting_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['appointments']['Row']> & { id: string; case_id: string; expert_id: string };
        Update: Partial<Database['public']['Tables']['appointments']['Row']>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          case_id: string;
          user_id: string;
          amount: number;
          gateway: 'ZarinPal' | 'CARD_TO_CARD';
          transaction_id: string;
          status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
          card_receipt_info: Record<string, unknown> | null;
          created_at: string;
          paid_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['payments']['Row']> & {
          id: string;
          case_id: string;
          user_id: string;
          amount: number;
          transaction_id: string;
          status: Database['public']['Tables']['payments']['Row']['status'];
        };
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
        Relationships: [];
      };
      introduction_feedback: {
        Row: {
          id: string;
          introduction_id: string;
          case_id: string;
          met_in_person: boolean;
          wants_to_continue: boolean | null;
          rating: number | null;
          comments: string | null;
          submitted_at: string;
        };
        Insert: Partial<Database['public']['Tables']['introduction_feedback']['Row']> & {
          id: string; introduction_id: string; case_id: string;
        };
        Update: Partial<Database['public']['Tables']['introduction_feedback']['Row']>;
        Relationships: [];
      };
      family_meetings: {
        Row: {
          id: string;
          introduction_id: string;
          status: 'PROPOSED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
          scheduled_at: string | null;
          location: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['family_meetings']['Row']> & {
          id: string; introduction_id: string; created_by: string;
        };
        Update: Partial<Database['public']['Tables']['family_meetings']['Row']>;
        Relationships: [];
      };
      video_call_invites: {
        Row: {
          id: string;
          introduction_id: string;
          requested_by_case_id: string;
          status: 'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
          room_slug: string;
          scheduled_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['video_call_invites']['Row']> & {
          id: string; introduction_id: string; requested_by_case_id: string; room_slug: string;
        };
        Update: Partial<Database['public']['Tables']['video_call_invites']['Row']>;
        Relationships: [];
      };
      group_sessions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          facilitator_id: string;
          facilitator_name: string;
          scheduled_at: string;
          duration_minutes: number;
          capacity: number;
          price: number;
          status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
          meeting_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['group_sessions']['Row']> & {
          id: string; title: string; facilitator_id: string; facilitator_name: string; scheduled_at: string;
        };
        Update: Partial<Database['public']['Tables']['group_sessions']['Row']>;
        Relationships: [];
      };
      group_session_bookings: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          user_name: string;
          status: 'BOOKED' | 'CANCELLED' | 'ATTENDED';
          payment_id: string | null;
          booked_at: string;
        };
        Insert: Partial<Database['public']['Tables']['group_session_bookings']['Row']> & {
          id: string; session_id: string; user_id: string; user_name: string;
        };
        Update: Partial<Database['public']['Tables']['group_session_bookings']['Row']>;
        Relationships: [];
      };
      content_articles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: string;
          cover_image_url: string | null;
          body: string;
          author_id: string | null;
          author_name: string | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['content_articles']['Row']> & {
          id: string; slug: string; title: string; body: string;
        };
        Update: Partial<Database['public']['Tables']['content_articles']['Row']>;
        Relationships: [];
      };
      test_catalog_settings: {
        Row: { test_id: string; matching_enabled: boolean };
        Insert: Partial<Database['public']['Tables']['test_catalog_settings']['Row']> & { test_id: string };
        Update: Partial<Database['public']['Tables']['test_catalog_settings']['Row']>;
        Relationships: [];
      };
      payment_settings: {
        Row: {
          id: number;
          zarinpal_enabled: boolean;
          zarinpal_merchant_id: string | null;
          card_to_card_enabled: boolean;
          bank_details: Record<string, unknown> | null;
        };
        Insert: Partial<Database['public']['Tables']['payment_settings']['Row']> & { id: number };
        Update: Partial<Database['public']['Tables']['payment_settings']['Row']>;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          actor_role: string;
          action: string;
          resource: string;
          resource_id: string | null;
          timestamp: string;
          ip: string | null;
          metadata: Record<string, unknown> | null;
        };
        Insert: Partial<Database['public']['Tables']['audit_logs']['Row']> & { id: string; actor_id: string; actor_role: string; action: string; resource: string };
        Update: Partial<Database['public']['Tables']['audit_logs']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
