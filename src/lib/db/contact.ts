import { sql } from './client';

export interface ContactSubmission {
  id?: string;
  created_at?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status?: 'new' | 'read' | 'replied';
  replied_at?: string;
  notes?: string;
}

export async function createContactSubmission(submission: ContactSubmission) {
  const result = await sql`
    INSERT INTO contact_submissions (name, email, phone, subject, message)
    VALUES (${submission.name}, ${submission.email}, ${submission.phone}, ${submission.subject}, ${submission.message})
    RETURNING *
  `;

  return result[0];
}

export async function subscribeToNewsletter(email: string, name?: string) {
  try {
    const result = await sql`
      INSERT INTO newsletter_subscribers (email, name, status)
      VALUES (${email}, ${name}, 'active')
      RETURNING *
    `;

    return { success: true, data: result[0] };
  } catch (error: any) {
    // Handle duplicate email
    if (error.code === '23505') {
      return { success: false, message: 'Email already subscribed' };
    }
    throw error;
  }
}
