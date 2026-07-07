/**
 * Hand-written placeholder matching the shape of `supabase gen types typescript`.
 * Regenerate the real thing once local Supabase is running:
 *   pnpm db:gen-types
 * That command overwrites this file from the live schema, so keep migrations
 * (supabase/migrations/*.sql) as the source of truth, not this file.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          address_street: string | null;
          address_zip: string | null;
          address_city: string | null;
          address_country: string;
          tax_id: string | null;
          vat_id: string | null;
          iban: string | null;
          bic: string | null;
          logo_url: string | null;
          default_tax_rate: number;
          quote_number_prefix: string;
          invoice_number_prefix: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["companies"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["companies"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          role: "owner" | "admin" | "employee";
          is_active: boolean;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; company_id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          company_id: string;
          type: "private" | "business";
          name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address_street: string | null;
          address_zip: string | null;
          address_city: string | null;
          address_country: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["customers"]["Row"]> & { company_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["customers"]["Row"]>;
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string;
          project_id: string | null;
          quote_number: string;
          status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";
          issue_date: string;
          valid_until: string | null;
          subtotal: number;
          tax_total: number;
          total: number;
          notes: string | null;
          terms: string | null;
          pdf_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["quotes"]["Row"]> & {
          company_id: string;
          customer_id: string;
          quote_number: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotes"]["Row"]>;
        Relationships: [];
      };
      quote_line_items: {
        Row: {
          id: string;
          quote_id: string;
          position: number;
          description: string;
          quantity: number;
          unit: string;
          unit_price: number;
          tax_rate: number;
          line_total: number;
        };
        Insert: Partial<Database["public"]["Tables"]["quote_line_items"]["Row"]> & {
          quote_id: string;
          position: number;
          description: string;
          unit_price: number;
          line_total: number;
        };
        Update: Partial<Database["public"]["Tables"]["quote_line_items"]["Row"]>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string;
          quote_id: string | null;
          project_id: string | null;
          invoice_number: string;
          status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
          issue_date: string;
          due_date: string | null;
          paid_at: string | null;
          subtotal: number;
          tax_total: number;
          total: number;
          notes: string | null;
          pdf_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invoices"]["Row"]> & {
          company_id: string;
          customer_id: string;
          invoice_number: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Row"]>;
        Relationships: [];
      };
      invoice_line_items: {
        Row: {
          id: string;
          invoice_id: string;
          position: number;
          description: string;
          quantity: number;
          unit: string;
          unit_price: number;
          tax_rate: number;
          line_total: number;
        };
        Insert: Partial<Database["public"]["Tables"]["invoice_line_items"]["Row"]> & {
          invoice_id: string;
          position: number;
          description: string;
          unit_price: number;
          line_total: number;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_line_items"]["Row"]>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          company_id: string;
          customer_id: string;
          name: string;
          description: string | null;
          site_address_street: string | null;
          site_address_zip: string | null;
          site_address_city: string | null;
          status: "planned" | "in_progress" | "on_hold" | "completed" | "cancelled";
          start_date: string | null;
          end_date: string | null;
          estimated_hours: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & { company_id: string; customer_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      project_assignments: {
        Row: {
          id: string;
          project_id: string;
          profile_id: string;
          role_on_project: string | null;
          assigned_from: string | null;
          assigned_until: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["project_assignments"]["Row"]> & { project_id: string; profile_id: string };
        Update: Partial<Database["public"]["Tables"]["project_assignments"]["Row"]>;
        Relationships: [];
      };
      project_status_history: {
        Row: {
          id: string;
          project_id: string;
          status: string;
          changed_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["project_status_history"]["Row"]> & { project_id: string; status: string };
        Update: Partial<Database["public"]["Tables"]["project_status_history"]["Row"]>;
        Relationships: [];
      };
      equipment: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          category: string | null;
          description: string | null;
          serial_number: string | null;
          purchase_date: string | null;
          daily_rental_price: number | null;
          is_rentable_to_customers: boolean;
          status: "available" | "booked" | "in_use" | "maintenance" | "retired";
          image_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["equipment"]["Row"]> & { company_id: string; name: string };
        Update: Partial<Database["public"]["Tables"]["equipment"]["Row"]>;
        Relationships: [];
      };
      equipment_bookings: {
        Row: {
          id: string;
          company_id: string;
          equipment_id: string;
          booking_type: "customer_rental" | "internal_project";
          customer_id: string | null;
          project_id: string | null;
          assigned_to: string | null;
          start_at: string;
          end_at: string;
          actual_return_at: string | null;
          status: "reserved" | "checked_out" | "returned" | "overdue" | "cancelled";
          condition_out_notes: string | null;
          condition_in_notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["equipment_bookings"]["Row"]> & {
          company_id: string;
          equipment_id: string;
          booking_type: "customer_rental" | "internal_project";
          start_at: string;
          end_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["equipment_bookings"]["Row"]>;
        Relationships: [];
      };
      document_counters: {
        Row: {
          company_id: string;
          doc_type: "quote" | "invoice";
          year: number;
          next_number: number;
        };
        Insert: Database["public"]["Tables"]["document_counters"]["Row"];
        Update: Partial<Database["public"]["Tables"]["document_counters"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      next_document_number: {
        Args: { p_company_id: string; p_doc_type: string };
        Returns: string;
      };
      set_employee_role: {
        Args: { target_profile_id: string; new_role: string };
        Returns: void;
      };
      current_company_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}
