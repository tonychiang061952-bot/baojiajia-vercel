export interface NotificationData {
  type: 'questionnaire_submitted' | 'pdf_downloaded' | 'admin_pdf_downloaded' | 'contact_form_submitted' | 'review_submitted';
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  memberCity?: string;
  planType?: 'adult' | 'child';
  timestamp: Date;
  adminUser?: string;
  questionnaireData?: Record<string, unknown>;
  contactFormData?: Record<string, string>;
  reviewData?: { rating: number; content: string; role?: string };
}

export async function sendTelegramNotification(data: NotificationData): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/telegram', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return response.ok;
  } catch (error) {
    console.error('Telegram notification error:', error);
    return false;
  }
}
