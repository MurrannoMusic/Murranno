import type { Env } from '../env';
import { esc } from './http';

/** Plain-text alternative: some clients only show text, and it helps spam scores. */
const toText = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, '$2: $1')
    .replace(/<(br|\/p|\/h\d|\/li|\/div)[^>]*>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();

export async function sendEmail(env: Env, to: string | string[], subject: string, html: string): Promise<void> {
  const recipients = Array.isArray(to) ? to : [to];
  // EMAIL_FROM is "Name <address>"
  const from = env.EMAIL_FROM || 'Murranno Music <hello@murrannomusic.co>';
  const text = toText(html);

  // 1. Resend (sending domain verified there)
  if (env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: recipients, subject, html, text }),
    });
    if (!res.ok) throw new Error(`Email send failed (${res.status}): ${await res.text()}`);
    return;
  }

  // 2. Local development: print instead of sending
  if (env.ENVIRONMENT !== 'production') {
    const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    console.log(`[email] to=${recipients.join(',')} subject=${subject} links=${links.join(' ')} body=${text.replace(/\s+/g, ' ')}`);
    return;
  }

  // 3. Cloudflare Email Sending binding (the from domain must be onboarded to Email Sending)
  if (env.SEND_EMAIL) {
    const m = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(from);
    const sender = m ? { name: m[1], email: m[2] } : from;
    for (const recipient of recipients) await env.SEND_EMAIL.send({ from: sender, to: recipient, subject, html, text });
    return;
  }
  throw new Error('Neither RESEND_API_KEY nor the SEND_EMAIL binding is configured');
}

/** Same message to many recipients. */
export async function sendBroadcast(env: Env, recipients: string[], subject: string, html: string): Promise<number> {
  let sent = 0;
  for (const to of recipients) {
    try {
      await sendEmail(env, to, subject, html);
      sent++;
    } catch (e) {
      console.error(`Failed to send broadcast to ${to}`, e);
    }
  }
  return sent;
}

/** Fire-and-forget variant: email problems must never fail the request that triggered them. */
export function sendEmailSafe(env: Env, to: string | string[], subject: string, html: string) {
  return sendEmail(env, to, subject, html).catch((e) => console.error('email error', e));
}

const header = 'color:#1a1a1a;font-size:28px;font-weight:700;margin-bottom:20px;';
const text = 'color:#4a4a4a;font-size:16px;line-height:1.6;margin-bottom:16px;';
const button =
  'display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white !important;text-decoration:none;border-radius:8px;font-weight:600;margin:24px 0;';
const box = (bg: string) => `background-color:${bg};padding:20px;border-radius:8px;margin:24px 0;`;

const wrap = (content: string) => `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<div style="background-color:white;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
<div style="text-align:center;margin-bottom:30px;"><h1 style="color:#667eea;font-size:32px;margin:0;">Murranno Music</h1></div>
${content}
<div style="color:#888;font-size:12px;margin-top:40px;padding-top:20px;border-top:1px solid #eee;">
<p>© ${new Date().getFullYear()} Murranno Music. All rights reserved.</p>
<p>Manage your email preferences in your account settings.</p></div></div></div></body></html>`;

const cta = (href: string, label: string) => `<div style="text-align:center;"><a href="${esc(href)}" style="${button}">${esc(label)}</a></div>`;

const fmtMoney = (currency: string, amount: number) =>
  `${esc(currency)} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const templates = {
  confirmSignup: (email: string, code: string, link: string) =>
    wrap(`<h1 style="${header}">Welcome to Murranno Music! 🎵</h1>
<p style="${text}">Thank you for signing up with ${esc(email)}. Enter this code in the app to verify your email:</p>
<div style="${box('#f8f9fa')}text-align:center;font-size:32px;letter-spacing:8px;font-weight:700;">${esc(code)}</div>
<p style="${text}">Or verify with one tap:</p>${cta(link, 'Verify Email Address')}
<p style="${text}color:#ababab;">If you didn't create an account with Murranno Music, you can safely ignore this email.</p>`),

  recovery: (code: string, link: string) =>
    wrap(`<h1 style="${header}">Reset your password</h1>
<p style="${text}">We received a request to reset your Murranno Music password.</p>${cta(link, 'Reset Password')}
<p style="${text}">Or use this code: <strong>${esc(code)}</strong></p>
<p style="${text}color:#ababab;">If you didn't ask for this, you can ignore this email. The link expires in 1 hour.</p>`),

  emailChange: (code: string, link: string) =>
    wrap(`<h1 style="${header}">Confirm your new email</h1>
<p style="${text}">Confirm this address for your Murranno Music account.</p>${cta(link, 'Confirm Email')}
<p style="${text}">Or use this code: <strong>${esc(code)}</strong></p>`),

  welcome: (appUrl: string, userName: string, userType: string) =>
    wrap(`<h1 style="${header}">Welcome to Murranno Music! 🎵</h1>
<p style="${text}">Hi ${esc(userName)},</p>
<p style="${text}">Thank you for joining Murranno Music as ${userType === 'artist' || userType === 'agency' ? 'an' : 'a'} <strong>${esc(userType)}</strong>. We're excited to help you grow your music career!</p>
<ul style="${text}">${
      userType === 'label'
        ? '<li>Set up your label profile</li><li>Invite artists to your roster</li><li>Monitor your artists\' performance</li><li>Manage revenue sharing</li>'
        : userType === 'agency'
          ? '<li>Complete your agency profile</li><li>Add your first client</li><li>Create campaigns for your clients</li><li>Track campaign performance</li>'
          : '<li>Complete your artist profile</li><li>Upload your first release</li><li>Create your first promotion campaign</li><li>Connect your streaming platforms</li>'
    }</ul>${cta(`${appUrl}/app/dashboard`, 'Get Started')}`),

  labelInvitation: (acceptUrl: string, artistName: string, labelName: string, share: number, start?: string, end?: string) =>
    wrap(`<h1 style="${header}">You're Invited to Join a Label! 🎉</h1>
<p style="${text}">Hi ${esc(artistName)},</p>
<p style="${text}"><strong>${esc(labelName)}</strong> has invited you to join their roster.</p>
<div style="${box('#f8f9fa')}"><h3 style="margin-top:0;">Contract Details</h3>
<p><strong>Revenue Share:</strong> ${esc(share)}%</p>
${start ? `<p><strong>Contract Start:</strong> ${esc(new Date(start).toLocaleDateString())}</p>` : ''}
${end ? `<p><strong>Contract End:</strong> ${esc(new Date(end).toLocaleDateString())}</p>` : ''}</div>
<p style="${text}">Accept to let them manage your releases and see your performance. The link expires in 7 days.</p>${cta(acceptUrl, 'Accept Invitation')}`),

  agencyInvitation: (acceptUrl: string, artistName: string, agencyName: string, commission: number) =>
    wrap(`<h1 style="${header}">You're Invited to Join an Agency! 🎯</h1>
<p style="${text}">Hi ${esc(artistName)},</p>
<p style="${text}"><strong>${esc(agencyName)}</strong> has invited you to become a client so they can manage promotion campaigns on your behalf.</p>
<div style="${box('#f8f9fa')}"><p><strong>Commission Rate:</strong> ${esc(commission)}%</p></div>
<p style="${text}">Accept to let them run promotion campaigns for you. The link expires in 7 days.</p>${cta(acceptUrl, 'Accept Invitation')}`),

  campaignStatus: (appUrl: string, userName: string, campaignName: string, oldStatus: string, newStatus: string, reason?: string) =>
    wrap(`<h1 style="${header}">Campaign Status Update</h1>
<p style="${text}">Hi ${esc(userName)},</p>
<p style="${text}">Your campaign <strong>${esc(campaignName)}</strong> status has been updated from
<span style="color:#888;text-decoration:line-through;">${esc(oldStatus)}</span> to <strong>${esc(newStatus)}</strong>.</p>
${reason ? `<div style="${box('#fee2e2')}border-left:4px solid #ef4444;"><h3 style="margin-top:0;">Rejection Reason</h3><p>${esc(reason)}</p></div>` : ''}
${cta(`${appUrl}/app/campaigns`, 'View Campaign')}`),

  earningsAlert: (appUrl: string, artistName: string, amount: number, currency: string, period: string, platform?: string) =>
    wrap(`<h1 style="${header}">New Earnings Posted! 💰</h1>
<p style="${text}">Hi ${esc(artistName)},</p>
<p style="${text}">You've received new earnings for the period <strong>${esc(period)}</strong>.</p>
<div style="${box('#dcfce7')}border-left:4px solid #10b981;"><h2 style="margin:0;font-size:36px;">${fmtMoney(currency, amount)}</h2>
${platform ? `<p style="margin:8px 0 0 0;">From ${esc(platform)}</p>` : ''}</div>
${cta(`${appUrl}/app/earnings`, 'View Earnings')}`),

  releaseStatus: (appUrl: string, artistName: string, title: string, status: string, releaseDate?: string, reason?: string) =>
    wrap(`<h1 style="${header}">Release Update</h1>
<p style="${text}">Hi ${esc(artistName)},</p>
<p style="${text}">Your release <strong>${esc(title)}</strong> is now <strong>${esc(status)}</strong>.</p>
${status === 'Published' && releaseDate ? `<div style="${box('#dcfce7')}"><h3 style="margin-top:0;">Release Date</h3><p style="font-size:18px;font-weight:600;">${esc(new Date(releaseDate).toDateString())}</p></div>` : ''}
${reason ? `<p style="${text}"><strong>Reason:</strong> ${esc(reason)}</p>` : ''}
${cta(`${appUrl}/app/releases`, 'View Release')}`),

  withdrawalStatus: (userName: string, subject: string, message: string, reference: string, adminNotes?: string | null) =>
    wrap(`<h1 style="${header}">${esc(subject)}</h1>
<p style="${text}">Hello ${esc(userName)},</p><p style="${text}">${esc(message)}</p>
${adminNotes ? `<p style="${text}"><strong>Admin Note:</strong> ${esc(adminNotes)}</p>` : ''}
<p style="${text}">Reference: ${esc(reference)}</p>`),

  subscriptionStatus: (userName: string, subject: string, message: string, adminNotes?: string | null) =>
    wrap(`<h1 style="${header}">${esc(subject)}</h1>
<p style="${text}">Hello ${esc(userName)},</p><p style="${text}">${esc(message)}</p>
${adminNotes ? `<p style="${text}"><strong>Admin Note:</strong> ${esc(adminNotes)}</p>` : ''}`),

  broadcast: (title: string, message: string) =>
    wrap(`<h1 style="${header}">${esc(title)}</h1><p style="${text}">${esc(message)}</p>`),
};
