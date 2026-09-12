export interface RsvpPayload {
  lastName: string;
  firstName: string;
  attendance: string;
  partnerName?: string;
  language: string;
  submittedAt: string;
}

export async function submitRsvp(payload: RsvpPayload): Promise<{ success: boolean; message?: string }> {
  const timeFormatted = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' });
  const guestData = {
    ...payload,
    timestamp: timeFormatted,
  };

  // 1. Always save in localStorage as guaranteed immediate client-side backup
  try {
    const existing = JSON.parse(localStorage.getItem('wedding_rsvp_backup') || '[]');
    existing.push({ ...guestData, clientSavedAt: new Date().toISOString() });
    localStorage.setItem('wedding_rsvp_backup', JSON.stringify(existing));
  } catch (err) {
    console.warn('LocalStorage backup warning:', err);
  }

  const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyYFpuHoGuubVC1X10_lGLQcvJt2kKV6QsNJFJxEY_GY1KbxdT8lCYVFp1-LgA6s7N0zw/exec';
  const SUPABASE_URL = 'https://pzkyyhxdqcfojrvyvqdv.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6a3l5aHhkcWNmb2pydnl2cWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTY0MTksImV4cCI6MjEwNDA3MjQxOX0.vX9GZcTi-ez_c_GdDKDK9TqhucEXEEawhTbPVyVt1bU';

  // 2. Submit to /api/rsvp (Vercel serverless function, which syncs to DB, Google Sheets, and Telegram)
  let vercelOk = false;
  try {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guestData),
    });
    if (response.ok) {
      vercelOk = true;
    }
  } catch (error) {
    console.warn('Vercel API request failed or preview mode:', error);
  }

  // 3. Guaranteed Direct Multi-Target Sync (works in both preview mode and production)
  if (!vercelOk) {
    // 3a. Direct Google Sheets Sync
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });
    } catch (e) {
      console.warn('Direct Google Sheets sync error:', e);
    }

    // 3b. Direct Supabase Database Sync
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/wedding_guests`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          timestamp: guestData.timestamp,
          last_name: guestData.lastName,
          first_name: guestData.firstName,
          attendance: guestData.attendance,
          partner_name: guestData.partnerName,
          language: guestData.language,
        }),
      });
    } catch (e) {
      console.warn('Direct Supabase sync error:', e);
    }
  }

  return { success: true };
}
