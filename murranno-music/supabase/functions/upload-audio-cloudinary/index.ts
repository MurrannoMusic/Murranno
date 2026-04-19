import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'audio';

    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Uploading audio to Cloudinary:', { folder, fileName: file.name });

    // Convert file to base64 using chunking to avoid stack overflow
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const len = bytes.byteLength;
    const chunkSize = 0x8000; // 32KB chunks

    for (let i = 0; i < len; i += chunkSize) {
      binary += String.fromCharCode.apply(
        null,
        // @ts-ignore: Deno types mismatch workaround
        bytes.subarray(i, Math.min(i + chunkSize, len)) as unknown as number[]
      );
    }

    const base64 = btoa(binary);
    const dataUri = `data:${file.type};base64,${base64}`;

    // Generate signature for signed upload (SHA-1 of string_to_sign + api_secret)
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&resource_type=video&timestamp=${timestamp}`;
    const encoder = new TextEncoder();
    const signatureBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(paramsToSign + apiSecret));
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Debug logs (masked for security)
    console.log('Upload params:', {
      cloudNamePreview: cloudName.substring(0, 6) + '...',
      apiKeyPreview: apiKey.substring(0, 6) + '...',
      stringToSign: paramsToSign,
      signatureLength: signature.length,
      signaturePreview: signature.substring(0, 6) + '...'
    });

    // Prepare Cloudinary upload with signed parameters
    const uploadFormData = new FormData();
    uploadFormData.append('file', dataUri);
    uploadFormData.append('folder', folder);
    uploadFormData.append('resource_type', 'video'); // audio files use 'video' resource type
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('signature', signature);

    // Upload to Cloudinary
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Cloudinary upload error:', errorText);
      throw new Error(`Cloudinary upload failed: ${errorText}`);
    }

    const result = await uploadResponse.json();
    console.log('Audio uploaded successfully:', result.public_id);

    return new Response(
      JSON.stringify({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error uploading to Cloudinary:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
