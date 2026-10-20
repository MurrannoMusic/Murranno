import { Link } from 'react-router-dom';
import { BadgeCheck, Check, LogIn, UserRound } from 'lucide-react';
import { Arrow, CtaBand, Deco, MarketingLayout, PageHero } from '@/components/marketing/MarketingLayout';
import { PlatformMark, type PlatformName } from '@/components/marketing/PlatformMark';
import { AppDownloadSection } from '@/components/marketing/AppDownloads';

const PLATFORMS = [
  {
    name: 'Spotify for Artists', platform: 'spotify', tone: 'mm-pink',
    body: 'Unlock your music’s full potential on the world’s leading streaming platform. See who is listening in real time, understand your audience and shape how you appear to them.',
    perks: ['Real-time streams and listener insights', 'Your own bio, photos and artist pick', 'Pitch unreleased music to Spotify editorial'],
  },
  {
    name: 'Apple Music for Artists', platform: 'apple', tone: 'mm-lilac',
    body: 'Connect with fans across Apple Music and iTunes, track your performance and put yourself in line for playlists that match your sound.',
    perks: ['Plays, Shazams and audience data', 'Verified artist page and artwork', 'Eligibility for editorial playlists'],
  },
  {
    name: 'Boomplay for Artists', platform: 'boomplay', tone: 'mm-yellow',
    body: 'Amplify your reach on Africa’s fastest-growing music community. Real-time analytics and direct engagement with fans across the continent and the diaspora.',
    perks: ['Streams by country and city', 'Direct engagement with your fanbase', 'A verified home on Boomplay'],
  },
  {
    name: 'Deezer for Artists', platform: 'deezer', tone: 'mm-blue',
    body: 'Your gateway to listeners in more countries than almost any other service. Dive into insights, connect with fans and grow your presence on a global stage.',
    perks: ['Audience insights and trends', 'Artist profile and photo management', 'Reach in 180+ countries'],
  },
  {
    name: 'YouTube Official Artist Channel', platform: 'youtube', tone: 'mm-pink',
    body: 'Bring your topic channel, uploads and subscribers together into one verified Official Artist Channel, marked with a music note and built around your catalogue.',
    perks: ['One channel for every video and release', 'Verified music-note badge', 'Your releases featured in one place'],
  },
] satisfies { name: string; platform: PlatformName; tone: string; body: string; perks: string[] }[];

export default function ArtistProfiles() {
  return <MarketingLayout title="Artist Profiles, Murranno Music">
    <PageHero
      tone="lilac"
      kicker={<><span><UserRound size={15} /><BadgeCheck size={15} /></span> CLAIM YOUR SPACE.</>}
      title={<>BE MORE THAN<br />A NAME ON A TRACK.</>}
      lead="Activate your verified artist profiles on Spotify, Apple Music, Boomplay, Deezer and YouTube, and see who is listening, wherever they are."
    >
      <Link to="/signup" className="mm-button"><Arrow /><span>ACTIVATE MY PROFILES</span></Link>
      <Link to="/login" className="mm-button mm-button-muted"><Arrow /><span>I’M ALREADY AN ARTIST</span></Link>
    </PageHero>

    <section className="mm-section mm-container" aria-labelledby="mm-identity">
      <div className="mm-split">
        <div>
          <div className="mm-heading"><p className="mm-eyebrow">YOUR ARTIST IDENTITY</p><h2 id="mm-identity">FANS SHOULD FIND<br /><span className="mm-purple-text">YOU,</span> NOT A STRANGER.</h2></div>
          <p className="mm-lead">When someone searches your name, they should land on your face, your story and your newest release.</p>
          <p className="mm-body">A verified artist profile turns a list of songs into a home. Your photo and bio sit beside your music, your latest release takes the spotlight, and you can read the data behind every stream, including which songs travel, which cities are listening and which playlists are driving new fans.</p>
          <p className="mm-body">Once your music is live through Murranno, we help you claim and set up each profile so it is linked to the right releases from day one.</p>
        </div>
        <div className="mm-panel mm-lilac mm-rise">
          <Deco color="#dec7f5" />
          <div className="mm-profile-mark-row">{PLATFORMS.map(({ platform }) => <PlatformMark key={platform} platform={platform} />)}</div>
          <h3>FIVE PROFILES.<br />ONE ARTIST.</h3>
          <p>Every profile connected to the same releases, so your story stays consistent everywhere.</p>
        </div>
      </div>
    </section>

    <section className="mm-section mm-section-tight mm-container" aria-labelledby="mm-platforms">
      <div className="mm-heading mm-center"><p className="mm-eyebrow">PLATFORMS</p><h2 id="mm-platforms">ACTIVATE WHERE<br />YOUR <span className="mm-pink-text">LISTENERS</span> ARE.</h2></div>
      <div className="mm-profile-directory">
        {PLATFORMS.map((p, index) => <article key={p.name} className={`mm-profile-platform ${p.tone} mm-rise`}>
          <div className="mm-profile-platform-main">
            <div className="mm-profile-platform-top"><PlatformMark platform={p.platform} decorative /><span aria-hidden="true">0{index + 1}</span></div>
            <h3>{p.name}</h3>
            <p>{p.body}</p>
          </div>
          <div className="mm-profile-platform-details">
            <p className="mm-eyebrow">MAKE IT YOURS</p>
            <ul>{p.perks.map((perk) => <li key={perk}><Check size={19} strokeWidth={1.6} aria-hidden="true" /><span>{perk}</span></li>)}</ul>
            <Link to="/signup" className="mm-button" aria-label={`Activate ${p.name}`}><Arrow /><span>ACTIVATE YOUR PROFILE</span></Link>
          </div>
        </article>)}
        <article className="mm-profile-returning mm-rise">
          <LogIn strokeWidth={1.3} aria-hidden="true" />
          <div><h3>Released with us before?</h3>
          <p>Log in to manage your profiles, releases and earnings in one place.</p></div>
          <Link to="/login" className="mm-button"><Arrow /><span>LOG IN</span></Link>
        </article>
      </div>
    </section>

    <section className="mm-section mm-container" aria-labelledby="mm-lyrics">
      <div className="mm-split mm-split-reverse">
        <div>
          <div className="mm-heading"><p className="mm-eyebrow">SYNCHRONISED LYRICS</p><h2 id="mm-lyrics">EVERY WORD,<br /><span className="mm-blue-text">IN SYNC.</span></h2></div>
          <p className="mm-body">Lyrics that scroll in time with your song give fans another way into your music; they read along, learn the hook and sing it back at your shows. Add your lyrics to a release and we deliver them, timed, to platforms that support them.</p>
        </div>
        <div className="mm-panel mm-blue mm-rise">
          <Deco color="var(--mm-violet-arc)" />
          <p style={{ color: 'var(--mm-violet-muted)', fontWeight: 600 }}>Your sound is a story</p>
          <h3 style={{ color: 'var(--mm-violet-deep)' }}>LET THE WORLD<br />SING ALONG.</h3>
          <p style={{ color: 'var(--mm-violet-muted)', fontWeight: 600 }}>One word at a time</p>
        </div>
      </div>
    </section>

    <AppDownloadSection compact />
    <CtaBand eyebrow="START HERE" title={<>YOUR NAME.<br />YOUR PAGE.</>} body="Distribute with Murranno and we will help you activate every artist profile linked to your releases." to="/signup" label="GET STARTED" />
  </MarketingLayout>;
}
