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
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Seeding sample data for user:', user.id);

    // Get user's artist profile
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!artist) {
      return new Response(
        JSON.stringify({ error: 'Artist profile not found. Please create an artist profile first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has releases
    const { data: existingReleases } = await supabase
      .from('releases')
      .select('id')
      .eq('artist_id', artist.id);

    if (existingReleases && existingReleases.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Sample data already exists. Delete existing releases first to reseed.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create sample releases
    const sampleReleases = [
      {
        artist_id: artist.id,
        title: 'Summer Vibes',
        release_type: 'Single',
        release_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Live',
        genre: 'Afrobeats',
        language: 'English',
      },
      {
        artist_id: artist.id,
        title: 'Midnight Stories',
        release_type: 'EP',
        release_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Live',
        genre: 'R&B',
        language: 'English',
      },
    ];

    const { data: createdReleases, error: releaseError } = await supabase
      .from('releases')
      .insert(sampleReleases)
      .select();

    if (releaseError) throw releaseError;

    // Create sample tracks for each release
    const sampleTracks = [];
    for (let i = 0; i < createdReleases.length; i++) {
      const release = createdReleases[i];
      const trackCount = release.release_type === 'EP' ? 3 : 1;
      
      for (let j = 0; j < trackCount; j++) {
        sampleTracks.push({
          release_id: release.id,
          title: `${release.title} - Track ${j + 1}`,
          track_number: j + 1,
          duration: 180 + Math.floor(Math.random() * 120),
        });
      }
    }

    const { data: createdTracks, error: trackError } = await supabase
      .from('tracks')
      .insert(sampleTracks)
      .select();

    if (trackError) throw trackError;

    // Generate streaming data for the past 30 days
    const streamingData = [];
    const platforms = ['Spotify', 'Apple Music', 'YouTube Music', 'Audiomack'];
    
    for (const track of createdTracks) {
      for (let day = 0; day < 30; day++) {
        const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
        
        for (const platform of platforms) {
          const streams = Math.floor(Math.random() * 500) + 100;
          streamingData.push({
            track_id: track.id,
            platform,
            streams,
            date: date.toISOString().split('T')[0],
            country: 'NG',
          });
        }
      }
    }

    const { error: streamError } = await supabase
      .from('streaming_data')
      .insert(streamingData);

    if (streamError) throw streamError;

    // Calculate and create earnings
    const earnings = [];
    for (const release of createdReleases) {
      // Calculate total streams for this release
      const releaseTracks = createdTracks.filter(t => t.release_id === release.id);
      const releaseTrackIds = releaseTracks.map(t => t.id);
      const releaseStreams = streamingData.filter(s => releaseTrackIds.includes(s.track_id));
      const totalStreams = releaseStreams.reduce((sum, s) => sum + s.streams, 0);
      
      // Rough calculation: ₦0.001 per stream
      const amount = totalStreams * 0.001;
      
      earnings.push({
        artist_id: artist.id,
        release_id: release.id,
        amount,
        source: 'streaming',
        platform: 'Multiple',
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        status: 'paid',
        currency: 'NGN',
      });
    }

    const { error: earningsError } = await supabase
      .from('earnings')
      .insert(earnings);

    if (earningsError) throw earningsError;

    // Update wallet balance
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    
    const { error: walletError } = await supabase
      .from('wallet_balance')
      .upsert({
        user_id: user.id,
        available_balance: totalEarnings * 0.8, // 80% available
        pending_balance: totalEarnings * 0.2, // 20% pending
        total_earnings: totalEarnings,
      });

    if (walletError) throw walletError;

    console.log('Sample data seeded successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Created ${createdReleases.length} releases, ${createdTracks.length} tracks, and ${streamingData.length} streaming records`,
        data: {
          releases: createdReleases.length,
          tracks: createdTracks.length,
          streamingRecords: streamingData.length,
          totalEarnings: totalEarnings.toFixed(2),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Seed sample data error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
