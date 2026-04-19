import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { subject, body, audience } = await req.json()

        // 1. Log the request
        console.log(`Sending email to ${audience}: ${subject}`)

        // 2. Fetch users based on audience
        // const supabase = createClient(
        //   Deno.env.get('SUPABASE_URL') ?? '',
        //   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        // )
        // const { data: users } = await supabase.from('profiles').select('email')...

        // 3. Send email via Resend (Mocked for now)
        // await resend.emails.send(...)

        return new Response(
            JSON.stringify({ success: true, message: `Queued ${subject} for ${audience}` }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
