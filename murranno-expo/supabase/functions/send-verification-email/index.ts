import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { VerificationEmail } from '../_shared/email-templates.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
const hookSecret = Deno.env.get('VERIFICATION_EMAIL_HOOK_SECRET') as string;

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  try {
    // If webhook secret is configured, verify the webhook
    if (hookSecret) {
      const wh = new Webhook(hookSecret);
      const verification = wh.verify(payload, headers) as {
        user: { email: string };
        email_data: {
          token: string;
          token_hash: string;
          redirect_to: string;
          email_action_type: string;
        };
      };

      const { user, email_data } = verification;

      // Only send verification emails, not other types
      if (email_data.email_action_type !== 'signup') {
        console.log('Not a signup email, skipping');
        return new Response(JSON.stringify({ skipped: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const verificationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;

      const html = await renderAsync(
        React.createElement(VerificationEmail, {
          verificationUrl,
          email: user.email,
        })
      );

      const { error } = await resend.emails.send({
        from: 'Murranno Music <hello@murrannomusic.site>',
        to: [user.email],
        subject: 'Verify your Murranno Music account',
        html,
      });

      if (error) {
        console.error('Resend error:', error);
        throw error;
      }

      console.log('Verification email sent successfully to:', user.email);
    } else {
      // Fallback: direct call without webhook verification
      const body = JSON.parse(payload);
      const { email, token_hash, redirect_to } = body;

      if (!email || !token_hash) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const verificationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${redirect_to || window.location.origin}`;

      const html = await renderAsync(
        React.createElement(VerificationEmail, {
          verificationUrl,
          email,
        })
      );

      const { error } = await resend.emails.send({
        from: 'Murranno Music <hello@murrannomusic.site>',
        to: [email],
        subject: 'Verify your Murranno Music account',
        html,
      });

      if (error) {
        console.error('Resend error:', error);
        throw error;
      }

      console.log('Verification email sent successfully to:', email);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-verification-email function:', error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
