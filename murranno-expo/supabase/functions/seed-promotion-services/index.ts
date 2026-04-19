import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('tier')
      .eq('user_id', user.id)
      .single();

    if (roleData?.tier !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting promotion services seed...');

    // Define all services
    const services = [
      // Streaming & Playlist Promotion
      { name: 'Apple Music Playlist Pitching', category: 'Streaming & Playlist Promotion', price: 50000, sortOrder: 1 },
      { name: 'Spotify Playlist Pitching', category: 'Streaming & Playlist Promotion', price: 30000, sortOrder: 2 },
      { name: 'Curator Playlist Placement', category: 'Streaming & Playlist Promotion', price: 40000, sortOrder: 3 },
      { name: 'Spotify Canvas Activation', category: 'Streaming & Playlist Promotion', price: 40000, sortOrder: 4 },
      { name: 'Audiomack Playlist', category: 'Streaming & Playlist Promotion', price: 50000, sortOrder: 5 },
      { name: 'Spotify Playlist', category: 'Streaming & Playlist Promotion', price: 50000, sortOrder: 6 },
      { name: 'Apple Music Playlist', category: 'Streaming & Playlist Promotion', price: 100000, sortOrder: 7 },
      { name: 'Boomplay Playlist', category: 'Streaming & Playlist Promotion', price: 20000, sortOrder: 8 },
      { name: 'Lyrics Video', category: 'Streaming & Playlist Promotion', price: 100000, sortOrder: 9 },
      
      // Digital & Social Media Marketing
      { name: 'Influencer Marketing Activation / Consultation', category: 'Digital & Social Media Marketing', price: 50000, sortOrder: 10 },
      { name: 'TikTok Challenge Setup', category: 'Digital & Social Media Marketing', price: 1000000, sortOrder: 11 },
      { name: 'Behind-The-Scenes Content Shoot', category: 'Digital & Social Media Marketing', price: 200000, sortOrder: 12 },
      
      // Press & Media Promotions
      { name: 'Press Releases', category: 'Press & Media Promotions', price: 150000, sortOrder: 13 },
      { name: 'Blog Features', category: 'Press & Media Promotions', price: 150000, sortOrder: 14 },
      { name: 'Magazine Interviews', category: 'Press & Media Promotions', price: 300000, sortOrder: 15 },
      { name: 'TV Features', category: 'Press & Media Promotions', price: 300000, sortOrder: 16 },
      { name: 'Press Run', category: 'Press & Media Promotions', price: 2000000, sortOrder: 17 },
      { name: 'Wikipedia Setup', category: 'Press & Media Promotions', price: 250000, sortOrder: 18 },
      
      // Radio Promotions
      { name: 'Radio Airplay', category: 'Radio Promotions', price: 300000, sortOrder: 19 },
      { name: 'Radio Spin Campaign', category: 'Radio Promotions', price: 1000000, sortOrder: 20 },
      { name: 'Radio Interviews', category: 'Radio Promotions', price: 300000, sortOrder: 21 },
      
      // Interviews & Appearances
      { name: 'Podcast Features', category: 'Interviews & Appearances', price: 200000, sortOrder: 22 },
      { name: 'YouTube Talk Shows', category: 'Interviews & Appearances', price: 300000, sortOrder: 23 },
      { name: 'Twitter Spaces', category: 'Interviews & Appearances', price: 200000, sortOrder: 24 },
      
      // Events & Experiences
      { name: 'Listening Party Setup', category: 'Events & Experiences', price: 3000000, sortOrder: 25 },
      { name: 'Club Performances', category: 'Events & Experiences', price: 3000000, sortOrder: 26 },
      
      // Direct Marketing
      { name: 'Email Marketing', category: 'Direct Marketing', price: 50000, sortOrder: 27 },
    ];

    // Insert services
    const { data: insertedServices, error: servicesError } = await supabase
      .from('promotion_services')
      .upsert(services, { onConflict: 'name' })
      .select();

    if (servicesError) throw servicesError;

    console.log(`Inserted ${insertedServices.length} services`);

    // Create service lookup map
    const serviceMap = new Map(insertedServices.map(s => [s.name, s.id]));

    // Define bundles with their included services
    const bundles = [
      {
        name: 'Starter Junket',
        slug: 'starter-junket',
        description: 'Entry-level digital visibility for emerging artists',
        price: 500000,
        tier_level: 1,
        target_description: 'Entry-level digital visibility for emerging artists',
        services: [
          'Apple Music Playlist Pitching',
          'Spotify Playlist Pitching',
          'Curator Playlist Placement',
          'Lyrics Video',
        ]
      },
      {
        name: 'Growth Junket',
        slug: 'growth-junket',
        description: 'Balanced media exposure and streaming growth',
        price: 1000000,
        tier_level: 2,
        target_description: 'Balanced media exposure and streaming growth',
        services: [
          'Apple Music Playlist Pitching',
          'Spotify Playlist Pitching',
          'Curator Playlist Placement',
          'Lyrics Video',
          'Press Releases',
          'Radio Interviews',
          'Twitter Spaces',
        ]
      },
      {
        name: 'Momentum Junket',
        slug: 'momentum-junket',
        description: 'Multi-platform growth and strong media penetration',
        price: 3000000,
        tier_level: 3,
        target_description: 'Multi-platform growth and strong media penetration',
        services: [
          'Apple Music Playlist Pitching',
          'Spotify Playlist Pitching',
          'Curator Playlist Placement',
          'Lyrics Video',
          'Press Releases',
          'Radio Interviews',
          'Twitter Spaces',
          'Blog Features',
          'Magazine Interviews',
          'TV Features',
          'Influencer Marketing Activation / Consultation',
          'Behind-The-Scenes Content Shoot',
          'Audiomack Playlist',
          'Spotify Playlist',
          'Apple Music Playlist',
          'Boomplay Playlist',
        ]
      },
      {
        name: 'Supernova Junket',
        slug: 'supernova-junket',
        description: 'Comprehensive industry domination campaign for high-tier artists',
        price: 5000000,
        tier_level: 4,
        target_description: 'Comprehensive industry domination campaign for high-tier artists',
        services: [
          'Apple Music Playlist Pitching',
          'Spotify Playlist Pitching',
          'Curator Playlist Placement',
          'Lyrics Video',
          'Press Releases',
          'Radio Interviews',
          'Twitter Spaces',
          'Blog Features',
          'Magazine Interviews',
          'TV Features',
          'Influencer Marketing Activation / Consultation',
          'Behind-The-Scenes Content Shoot',
          'Audiomack Playlist',
          'Spotify Playlist',
          'Apple Music Playlist',
          'Boomplay Playlist',
          'Press Run',
          'Radio Airplay',
          'Radio Spin Campaign',
          'Podcast Features',
          'YouTube Talk Shows',
          'Listening Party Setup',
          'Club Performances',
          'Wikipedia Setup',
          'Email Marketing',
        ]
      }
    ];

    // Insert bundles
    for (const bundle of bundles) {
      const { services: bundleServices, ...bundleData } = bundle;
      
      const { data: insertedBundle, error: bundleError } = await supabase
        .from('promotion_bundles')
        .upsert(bundleData, { onConflict: 'slug' })
        .select()
        .single();

      if (bundleError) throw bundleError;

      // Create bundle_services associations
      const bundleServiceRecords = bundleServices
        .map(serviceName => ({
          bundle_id: insertedBundle.id,
          service_id: serviceMap.get(serviceName)
        }))
        .filter(record => record.service_id);

      if (bundleServiceRecords.length > 0) {
        const { error: junctionError } = await supabase
          .from('bundle_services')
          .upsert(bundleServiceRecords, { onConflict: 'bundle_id,service_id' });

        if (junctionError) throw junctionError;
      }

      console.log(`Inserted bundle: ${bundle.name} with ${bundleServiceRecords.length} services`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Seeded ${insertedServices.length} services and ${bundles.length} bundles`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
