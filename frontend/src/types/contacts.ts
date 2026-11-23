export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  total_donated: number;
  donation_count: number;
  created_at: string;
}

export interface ContactDetail extends Contact {
  donations: ContactDonation[];
  recurring_donations: ContactRecurringDonation[];
}

/** A monthly commitment; created_at is when it was set up. */
export interface ContactRecurringDonation {
  id: number;
  form_id: number;
  amount: number;
  created_at: string;
  form_title: string;
}

export interface ContactDonation {
  id: number;
  form_id: number;
  amount: number;
  created_at: string;
  form_title: string;
}

export interface CreateContactInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
}
