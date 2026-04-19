import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
        const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');

        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error('Cloudinary credentials not configured');
        }

        const { folder, ...otherParams } = await req.json();

        if (!folder) {
            throw new Error('Folder is required');
        }

        const timestamp = Math.floor(Date.now() / 1000);

        // Construct string to sign (alphabetical order)
        // We strictly support folder and timestamp for now to keep it simple and consistent
        const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

        const encoder = new TextEncoder();
        const signatureBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(paramsToSign + apiSecret));
        const signatureArray = Array.from(new Uint8Array(signatureBuffer));
        const signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return new Response(
            JSON.stringify({
                signature,
                timestamp,
                cloudName,
                apiKey,
                folder
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error: any) {
        console.error('Error generating signature:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
