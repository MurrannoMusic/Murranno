import type { CSSProperties } from 'react';
import { ServiceDrawing } from '@/components/brand/ServiceDrawing';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Globe2, Headphones, Music2, Palette, Play, Radio, SkipBack, SkipForward } from 'lucide-react';
import studio from '@/assets/musician-background.jpg';
import spotify from '@/assets/platforms/spotify.svg';
import apple from '@/assets/platforms/apple-music.svg';
import youtube from '@/assets/platforms/youtube-music.svg';
import { PlatformMark, type PlatformName } from '@/components/marketing/PlatformMark';
import { Arcs, Arrow, Deco, MarketingLayout } from '@/components/marketing/MarketingLayout';
import { AppDownloadSection } from '@/components/marketing/AppDownloads';

function MusicPhone({ small = false }: { small?: boolean }) {
  return <div className={`mm-device ${small ? 'mm-device-small' : ''}`} aria-hidden="true">
    <img className="mm-phone-shell" src="/landing/phone-frame.avif" alt="" />
    <div className="mm-phone-screen">
      <div className="mm-phone-status"><span>9:41</span><span>▂▄▆ ▰</span></div>
      <div className="mm-phone-camera" />
      <div className="mm-phone-brand"><Music2 size={13} /><span>murranno music</span></div>
      <p>YOUR SOUND. EVERYWHERE.</p>
      <div className="mm-album"><img src={studio} alt="" /><span>THE NEXT<br />CHAPTER.</span></div>
      <strong>Your next release</strong><small>Made by you. Heard worldwide.</small>
      <div className="mm-phone-progress"><i /></div>
      <div className="mm-player"><SkipBack /><span><Play fill="currentColor" /></span><SkipForward /></div>
      <div className="mm-phone-stores">{(['spotify', 'apple', 'youtube', 'boomplay'] satisfies PlatformName[]).map(platform => <PlatformMark key={platform} platform={platform} decorative />)}</div>
      <div className="mm-phone-home" />
    </div>
  </div>;
}

const serviceData = [
  { title: 'MUSIC DISTRIBUTION', body: 'Your music on the platforms your listeners love.', color: 'pink', accent: 'var(--mm-pink)', href: '/distribution' },
  { title: 'MUSIC PROMOTION', body: 'Reach new audiences. Build your next chapter.', color: 'blue', accent: 'var(--mm-violet)', href: '/promotions' },
  { title: 'CREATIVE SERVICES', body: 'Cover artwork and visualizers that tell your story.', color: 'lilac', accent: '#ae7fd8', href: '/promotions' },
];
// Quote cards (left, right, centre, the centre card renders on top). Real lines from journal articles, credited to their authors.
const stories = [
  { quote: 'Remember, music is first a business before a talent showcase.', author: 'Babatunde Ashiru', role: 'Culture & Fashion, The Music Journal', slug: 'nigerian-music-meets-global-fashion', image: '/landing/journal/nigerian-music-meets-global-fashion.jpeg', color: 'lilac' },
  { quote: 'Curiosity is by far one of the most important traits to possess as a songwriter.', author: 'Muraina Lateef', role: 'Songwriting, The Music Journal', slug: '3-ways-to-embrace-a-curious-musical-mindset-for-songwriting', image: '/landing/journal/3-ways-to-embrace-a-curious-musical-mindset-for-songwriting.jpg', color: 'yellow' },
  { quote: 'The only way to get better at songwriting is to write loads and loads of music.', author: 'Muraina Lateef', role: 'Artist Growth, The Music Journal', slug: '5-ways-to-develop-your-skills-as-a-songwriter', image: '/landing/journal/5-ways-to-develop-your-skills-as-a-songwriter.jpg', color: 'blue' },
];

export const DesktopLanding = () => {
  return <MarketingLayout title="Murranno Music, Your Music to the World">
      <section className="mm-hero" id="home" aria-labelledby="mm-title">
        <div className="mm-hero-panel" />
        <div className="mm-hero-copy">
          <div className="mm-hero-kicker"><span><Headphones size={15} /><Music2 size={15} /><Radio size={15} /></span> INDEPENDENT SPIRIT. WORLDWIDE REACH.</div>
          <h1 id="mm-title"><span>YOUR MUSIC,</span><span>TO THE WORLD.</span></h1>
          <p className="mm-hero-lead">Empowering artists worldwide with digital music distribution, promotion, and creative support.</p>
          <Link to="/signup" className="mm-button"><Arrow /><span>GET STARTED</span></Link>
          <Link to="/download" className="mm-hero-app-link">Get the app <span>Coming soon</span><ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="mm-hero-scene" aria-hidden="true">
          <Arcs className="mm-hero-ring mm-ring-top" color="var(--mm-pink-arc)" id="mm-hero-pink" />
          <Arcs className="mm-hero-ring mm-ring-bottom" id="mm-hero-purple" />
          <img className="mm-hand" src="/landing/phone-hand.avif" alt="" />
          <MusicPhone />
          <img className="mm-thumb" src="/landing/phone-thumb.avif" alt="" />
          <div className="mm-float mm-float-release"><div className="mm-float-inner"><span className="mm-release-symbol"><Music2 /></span><div><small>YOUR NEXT RELEASE</small><strong>Ready for the world.</strong><span className="mm-float-platforms">{[spotify, apple, youtube].map((image, index) => <img key={index} src={image} alt="" />)}<span>+ more platforms</span></span></div><span className="mm-release-check"><Check size={22} /></span></div></div>
          <div className="mm-float mm-float-lyrics"><div className="mm-float-inner"><small>YOUR WORDS.</small><strong>ON REPEAT.</strong><span className="mm-wave">{[25, 48, 65, 38, 72, 51, 29].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</span></div></div>
        </div>
        <div className="mm-hero-fade" />
      </section>

      <section className="mm-services" id="services" aria-labelledby="mm-services-title">
        <div className="mm-pin"><div className="mm-benefits-stage">
          <div className="mm-heading mm-benefits-intro"><p className="mm-eyebrow">SERVICES</p><h2 id="mm-services-title">MAKE MUSIC.<br />MAKE MOVES.<br /><span className="mm-blue-text">GO WORLDWIDE.</span></h2></div>
          <div className="mm-service-fan">{serviceData.map((service, index) => <Link key={service.title} className={`mm-service mm-${service.color}`} to={service.href} style={{ '--drawing-accent': service.accent } as CSSProperties}>
            <Deco color={service.accent} /><div className="mm-service-copy"><h3>{service.title}</h3><p>{service.body}</p></div><ServiceDrawing kind={index} />
          </Link>)}</div>
        </div></div>
      </section>

      <section className="mm-features mm-container" id="features" aria-labelledby="mm-features-title">
        <Arcs className="mm-feature-backdrop" color="#f2c9ef" id="mm-feature-pink" />
        <div className="mm-heading mm-feature-heading"><p className="mm-eyebrow">FEATURES</p><h2 id="mm-features-title">EMPOWERING AND<br /><span className="mm-pink-text">AMPLIFYING</span> YOUR<br />MUSICAL <span className="mm-purple-text">JOURNEY.</span></h2></div>
        <div className="mm-feature-grid">
          <article className="mm-feature mm-feature-release mm-pink"><Deco color="var(--mm-pink-arc)" /><div className="mm-feature-copy"><h3>ONE RELEASE.<br />GLOBAL REACH.</h3><p>Upload your music and artwork. We deliver it to platforms worldwide.</p></div><div className="mm-feature-art"><MusicPhone small /><span className="mm-feature-badge"><Globe2 /></span></div></article>
          <article className="mm-feature mm-feature-identity mm-lilac"><Deco color="#dec7f5" /><div className="mm-feature-copy"><h3>YOUR ARTIST IDENTITY</h3><p>Support for Spotify for Artists<br />and your YouTube Artist Channel.</p></div><div className="mm-feature-art"><div className="mm-profile-illustration"><Headphones /><span><Check /></span><Music2 /></div></div></article>
          <article className="mm-feature mm-feature-lyrics mm-blue"><Deco color="var(--mm-violet)" /><div className="mm-feature-copy"><h3>EVERY WORD,<br />IN SYNC.</h3><p>Bring listeners closer with synchronised lyrics.</p></div><div className="mm-feature-art mm-lyrics-widget"><small>SYNCHRONISED LYRICS</small><span>Your sound is a story</span><strong>Let the world sing along</strong><span>One word at a time</span></div></article>
          <article className="mm-feature mm-feature-creative mm-yellow"><Deco color="#f5d900" /><div className="mm-feature-copy"><h3>LOOK AS GOOD<br />AS YOU SOUND.</h3><p>Cover art and visualizers<br />made for your next release.</p></div><div className="mm-feature-art mm-cover-widget"><span>THE<br />NEXT<br />WAVE.</span><Palette /></div></article>
        </div>
      </section>

      <section className="mm-offers mm-container" id="offers" aria-labelledby="mm-offers-title">
        <p className="mm-eyebrow">YOUR NEXT MOVE</p><p className="mm-offers-lead">Whether you’re ready to release, reach more listeners, or build your visual world, there’s a place to start.</p>
        <div className="mm-heading mm-offers-heading"><h2 id="mm-offers-title">BIG PLANS.<br />SIMPLE<br />NEXT STEPS.</h2><a className="mm-button mm-button-muted" href="#contact"><Arrow /><span>TALK TO US</span></a></div>
        <div className="mm-offer-list">{serviceData.map((service, index) => <Link className={`mm-offer mm-${service.color} mm-rise`} to={index === 0 ? '/signup' : service.href} key={service.title}><Deco color={index === 0 ? 'var(--mm-pink-arc)' : index === 1 ? 'var(--mm-violet-arc)' : '#e4d1f4'} /><span>{['RELEASE YOUR MUSIC', 'GROW YOUR AUDIENCE', 'BUILD YOUR WORLD'][index]}</span><Arrow /><div><h3>{['DISTRIBUTE', 'PROMOTE', 'CREATE'][index]}</h3><p>{['Your tracks. More platforms.', 'Your music. New listeners.', 'Your sound. A visual story.'][index]}</p></div></Link>)}</div>
      </section>

      <section className="mm-stories" id="journal" aria-labelledby="mm-stories-title"><div className="mm-pin"><div className="mm-stories-stage"><div className="mm-heading mm-stories-intro"><p className="mm-eyebrow">FROM THE MUSIC JOURNAL</p><h2 id="mm-stories-title">FOR THE <span className="mm-yellow-text">ARTISTS</span><br />MAKING THEIR NEXT MOVE.</h2><Link to="/journal" className="mm-stories-all">Explore the journal <ArrowUpRight size={17} aria-hidden="true" /></Link></div><div className="mm-story-fan">{stories.map((story) => <figure className={`mm-story mm-${story.color}`} key={story.slug}>
          <span className="mm-story-mark" aria-hidden="true">“</span>
          <blockquote>“{story.quote}”</blockquote>
          <Link to={`/journal/${story.slug}`} className="mm-story-link" aria-label={`Read ${story.author}’s story about ${story.role.split(',')[0].toLowerCase()}`}>Read story <ArrowUpRight size={15} aria-hidden="true" /></Link>
          <figcaption className="mm-story-author"><span className="mm-story-initials" aria-hidden="true">{story.author.split(' ').map(name => name[0]).join('')}</span><span><strong>{story.author}</strong><small>{story.role}</small></span></figcaption>
        </figure>)}</div></div></div></section>

      <AppDownloadSection />
  </MarketingLayout>;
};
