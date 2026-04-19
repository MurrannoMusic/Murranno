
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTrackAccess() {
    // Get a recent release
    const { data: releases, error } = await supabase
        .from('releases')
        .select('id, title', { count: 'exact' })
        .limit(5)

    if (error) {
        console.error('Error fetching releases:', error)
        return
    }

    console.log(`Found ${releases?.length} releases.`)

    if (!releases || releases.length === 0) {
        console.log('No releases found in DB.')
        return
    }

    const releaseId = releases[0].id
    console.log(`Checking tracks for release: ${releases[0].title} (${releaseId})`)

    const { data: tracks, error: tracksError } = await supabase // Renamed error to tracksError to avoid conflict
        .from('tracks')
        .select('id, title, audio_file_url')
        .eq('release_id', releaseId)

    if (error) {
        console.error('Error fetching tracks:', error)
    } else {
        console.log('Tracks found:', tracks)
        tracks.forEach(t => {
            console.log(`- ${t.title}: ${t.audio_file_url ? 'URL Present' : 'URL Missing'}`)
        })
    }
}

checkTrackAccess()
