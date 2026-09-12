/**
 * Vercel Serverless Function: /api/rsvp
 * 
 * Multi-Target Storage Engine:
 * 1. Telegram Bot notification (Real-time alert)
 * 2. Google Sheets Webhook (Organized spreadsheet for hosts & venue)
 * 3. Vercel KV / Database / Webhook backup
 * 
 * Environment variables configured in Vercel Project Settings:
 * - TELEGRAM_BOT_TOKEN: BotFather token (e.g. 123456789:AAH...)
 * - TELEGRAM_CHAT_ID: Chat or Group ID (e.g. -100123456789 or 987654321)
 * - GOOGLE_SHEETS_WEBHOOK_URL: Google Apps Script Web App URL
 * - VERCEL_BACKUP_WEBHOOK_URL: (Optional) custom webhook or DB hook
 */

interface RsvpRequestBody {
  lastName: string;
  firstName: string;
  attendance: string;
  partnerName?: string;
  language?: string;
  submittedAt?: string;
}

export default async function handler(req: any, res: any) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { lastName, firstName, attendance, partnerName, language, submittedAt } = req.body as RsvpRequestBody;

  if (!lastName || !firstName || !attendance) {
    return res.status(400).json({ error: 'Фамилия, имя и вариант ответа обязательны' });
  }

  const now = submittedAt || new Date().toISOString();
  const timeFormatted = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' });

  const guestData = {
    lastName: lastName.trim(),
    firstName: firstName.trim(),
    attendance: attendance.trim(),
    partnerName: partnerName ? partnerName.trim() : '—',
    language: language || 'kg',
    timestamp: timeFormatted,
  };

  const results: Record<string, any> = {};

  // 1. Send to Telegram (Immediate notification)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      const attendanceIcon = guestData.attendance.toLowerCase().includes('кел') && !guestData.attendance.toLowerCase().includes('албайм') && !guestData.attendance.toLowerCase().includes('алмаймын') 
        ? '🎉' 
        : '❌';
      
      const message = [
        `👰🤵 <b>ЖАҢЫ ЖООП (ТОЙГО ЧАКЫРУУ)</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        `👤 <b>Конок:</b> ${guestData.lastName} ${guestData.firstName}`,
        `💬 <b>Жообу:</b> ${attendanceIcon} ${guestData.attendance}`,
        guestData.partnerName !== '—' ? `👥 <b>Жубайы / Спутник:</b> ${guestData.partnerName}` : '',
        `🌐 <b>Тили:</b> ${guestData.language.toUpperCase()}`,
        `⏰ <b>Убактысы:</b> ${guestData.timestamp}`,
        `━━━━━━━━━━━━━━━━━━`,
      ].filter(Boolean).join('\n');

      const tgUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const tgRes = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      });
      results.telegram = tgRes.ok;
    } catch (err: any) {
      console.error('Telegram sync error:', err.message);
      results.telegram = false;
    }
  }

  // 2. Send to Google Sheets (Apps Script Webhook)
  const googleSheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbyYFpuHoGuubVC1X10_lGLQcvJt2kKV6QsNJFJxEY_GY1KbxdT8lCYVFp1-LgA6s7N0zw/exec';
  if (googleSheetsUrl) {
    try {
      const sheetsRes = await fetch(googleSheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData),
      });
      results.googleSheets = sheetsRes.ok;
    } catch (err: any) {
      console.error('Google Sheets sync error:', err.message);
      results.googleSheets = false;
    }
  }

  // 3. Send to Supabase Database (PostgreSQL)
  const supabaseUrl = process.env.SUPABASE_URL || 'https://pzkyyhxdqcfojrvyvqdv.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6a3l5aHhkcWNmb2pydnl2cWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTY0MTksImV4cCI6MjEwNDA3MjQxOX0.vX9GZcTi-ez_c_GdDKDK9TqhucEXEEawhTbPVyVt1bU';
  if (supabaseUrl && supabaseKey) {
    try {
      const supaRes = await fetch(`${supabaseUrl}/rest/v1/wedding_guests`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
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
      results.supabase = supaRes.ok;
    } catch (err: any) {
      console.error('Supabase sync error:', err.message);
      results.supabase = false;
    }
  }

  // 4. Vercel KV / Storage Backup (if KV is bound)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const kvKey = `rsvp:${Date.now()}:${guestData.lastName}_${guestData.firstName}`;
      const kvUrl = `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(kvKey)}`;
      const kvRes = await fetch(kvUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });
      results.vercelKV = kvRes.ok;
    } catch (err: any) {
      console.error('Vercel KV sync error:', err.message);
      results.vercelKV = false;
    }
  }

  // 4. Optional Webhook Backup
  if (process.env.VERCEL_BACKUP_WEBHOOK_URL) {
    try {
      await fetch(process.env.VERCEL_BACKUP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData),
      });
      results.backupWebhook = true;
    } catch (err: any) {
      results.backupWebhook = false;
    }
  }

  return res.status(200).json({
    success: true,
    data: guestData,
    syncResults: results,
  });
}
