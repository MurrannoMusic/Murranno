import { Link } from 'react-router-dom';
import { Building2, Globe2, Headphones, HeartHandshake, Music2, Palette, PanelsTopLeft, Rocket, Users } from 'lucide-react';
import { Arrow, CtaBand, Deco, MarketingLayout, PageHero } from '@/components/marketing/MarketingLayout';
import { StoreNetwork } from '@/components/marketing/StoreNetwork';

const BELIEFS = [
  { Icon: Globe2, title: 'Every song deserves to be heard', body: 'Without limits, whether the artist is independent or signed, a first-timer or a veteran.' },
  { Icon: HeartHandshake, title: 'Artists own their work', body: 'Distribution should open doors, not take your masters. You keep 100% of what you create.' },
  { Icon: PanelsTopLeft, title: 'Technology should feel simple', body: 'Release, promote and get paid from one app, with no spreadsheets, no guesswork and no waiting in the dark.' },
];

const PEOPLE = [
  { Icon: Music2, tone: 'mm-pink', color: 'var(--mm-pink-arc)', title: 'Independent artists', body: 'Release on your own terms, keep your rights, and grow with distribution, promotion and creative support around you.' },
  { Icon: Building2, tone: 'mm-blue', color: 'var(--mm-violet-arc)', title: 'Labels', body: 'Manage a roster of artists, their releases and their revenue shares from a single label dashboard.' },
  { Icon: Users, tone: 'mm-lilac', color: '#dec7f5', title: 'Agencies & managers', body: 'Run promotion campaigns for your clients and track every result in one place.' },
];

const WORK = [
  { Icon: Rocket, title: 'Distribution', body: 'Your music on 150+ stores and platforms worldwide, with free UPC and ISRC codes.', to: '/distribution' },
  { Icon: Headphones, title: 'Promotion', body: 'Playlists, social, press and radio campaigns that put your release in front of new listeners.', to: '/promotions' },
  { Icon: Palette, title: 'Creative services', body: 'Cover artwork and visualizers that carry your sound into pictures.', to: '/promotions' },
  { Icon: Users, title: 'Artist profiles', body: 'Verified profiles on Spotify, Apple Music, Boomplay, Deezer and YouTube.', to: '/artist-profiles' },
];

export default function About() {
  return <MarketingLayout title="About, Murranno Music">
    <PageHero
      kicker={<><span><Music2 size={15} /><Globe2 size={15} /></span> WHO WE ARE</>}
      title={<>BUILT IN LAGOS.<br />MADE FOR THE WORLD.</>}
      lead="Murranno Music is a distribution and promotion company for artists who are ready for a bigger stage and who refuse to give up their music to get there."
    />

    <section className="mm-section mm-container" aria-labelledby="mm-mission">
      <div className="mm-split">
        <div>
          <div className="mm-heading"><p className="mm-eyebrow">OUR MISSION</p><h2 id="mm-mission">OPPORTUNITY<br />SHOULD NOT DEPEND<br />ON <span className="mm-pink-text">WHO YOU KNOW.</span></h2></div>
        </div>
        <div>
          <p className="mm-lead">Our core mission is to democratise distribution and promotion for artists across the spectrum.</p>
          <p className="mm-body">We believe every musical creation deserves to be heard without limitations, whether an artist works independently or with a label. So we are building a global platform that helps artists grow audiences and careers, combining technology with services that span distribution, branding and promotion.</p>
          <p className="mm-body">The goal is simple: make it as easy to reach the world from Ojota as it is from anywhere else, and keep spreading the brilliance that lives in music.</p>
        </div>
      </div>
    </section>

    <section className="mm-section mm-section-tight mm-container" aria-labelledby="mm-beliefs">
      <div className="mm-heading mm-center"><p className="mm-eyebrow">WHAT WE BELIEVE</p><h2 id="mm-beliefs">THREE THINGS WE<br />WON’T <span className="mm-purple-text">COMPROMISE ON.</span></h2></div>
      <div className="mm-principles">{BELIEFS.map(({ Icon, title, body }, index) => <article key={title} className="mm-principle mm-rise"><div className="mm-principle-top"><Icon strokeWidth={1.3} aria-hidden="true" /><span aria-hidden="true">0{index + 1}</span></div><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>

    <section className="mm-section mm-container" aria-labelledby="mm-people">
      <div className="mm-heading"><p className="mm-eyebrow">WHO WE BUILD FOR</p><h2 id="mm-people">ONE PLATFORM,<br />EVERY KIND OF <span className="mm-blue-text">MUSIC CAREER.</span></h2></div>
      <div className="mm-steps" style={{ counterReset: 'none' }}>
        {PEOPLE.map(({ Icon, tone, title, body }) => <article key={title} className={`mm-step mm-step-plain ${tone} mm-rise`}><Icon className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" /><h3>{title}</h3><p>{body}</p></article>)}
      </div>
    </section>

    <section className="mm-section mm-section-tight mm-container" aria-labelledby="mm-work">
      <div className="mm-split">
        <div>
          <div className="mm-heading"><p className="mm-eyebrow">WHAT WE DO</p><h2 id="mm-work">FROM THE FIRST<br />UPLOAD TO THE<br /><span className="mm-pink-text">NEXT CHAPTER.</span></h2></div>
          <p className="mm-body">An artist’s career is more than a release date. We cover the parts that come after the studio: getting the music out, getting it heard, making it look as good as it sounds, and making sure the artist behind it is visible everywhere.</p>
        </div>
        <div className="mm-editorial-list">
          {WORK.map(({ Icon, title, body, to }) => <Link key={title} to={to} className="mm-editorial-item mm-editorial-link mm-rise"><Icon className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" /><div><h3>{title}</h3><p>{body}</p></div><Arrow /></Link>)}
        </div>
      </div>
    </section>

    <section className="mm-section mm-container" aria-labelledby="mm-network">
      <div className="mm-heading mm-center"><p className="mm-eyebrow">OUR NETWORK</p><h2 id="mm-network">THE STORES WE<br />DELIVER <span className="mm-purple-text">YOUR MUSIC TO.</span></h2></div>
      <StoreNetwork />
    </section>

    <section className="mm-section mm-section-tight mm-container" aria-labelledby="mm-home">
      <div className="mm-split mm-split-reverse">
        <div>
          <div className="mm-heading"><p className="mm-eyebrow">WHERE WE ARE</p><h2 id="mm-home">LAGOS IS<br /><span className="mm-blue-text">HOME.</span></h2></div>
          <p className="mm-body">We work out of Ojota, Lagos, close to the studios, the shows and the artists shaping the sound the rest of the world is now listening to. Come say hello, or reach us online from anywhere.</p>
          <Link to="/contact" className="mm-button mm-button-muted" style={{ marginTop: 24 }}><Arrow /><span>CONTACT US</span></Link>
        </div>
        <div className="mm-panel mm-yellow mm-rise">
          <Deco color="#f5e86b" />
          <span className="mm-panel-big">LAGOS</span>
          <h3>100 KUJORE STREET,<br />OJOTA</h3>
          <p>Lagos 105102, Nigeria</p>
        </div>
      </div>
    </section>

    <CtaBand eyebrow="JOIN US" title={<>YOUR MUSIC,<br />TO THE WORLD.</>} body="Create your Murranno account and release your next song to 150+ stores and platforms." to="/signup" label="GET STARTED" />
  </MarketingLayout>;
}
