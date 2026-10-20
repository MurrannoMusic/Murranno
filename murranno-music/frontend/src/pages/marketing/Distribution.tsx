import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, Barcode, Crown, FileText, Globe2, Headphones, Link2, Mic2, Music2, Radio, ShieldCheck, Wallet } from 'lucide-react';
import { Arrow, CtaBand, Deco, MarketingLayout, PageHero } from '@/components/marketing/MarketingLayout';
import { StoreNetwork } from '@/components/marketing/StoreNetwork';
import { AppDownloadSection } from '@/components/marketing/AppDownloads';

const STEPS = [
  { tone: 'mm-pink', color: 'var(--mm-pink-arc)', title: 'Upload your release', body: 'Add your tracks, cover art and release details in the Murranno app. For a single, EP or album, set a release date or go out as soon as it clears review.' },
  { tone: 'mm-blue', color: 'var(--mm-violet-arc)', title: 'We deliver it worldwide', body: 'Our team checks your release against store guidelines, then sends it to Spotify, Apple Music, YouTube, TikTok, Boomplay and 150+ more stores and platforms.' },
  { tone: 'mm-lilac', color: '#dec7f5', title: 'You get paid', body: 'Every stream and download is reported back to your dashboard. Watch your earnings grow and withdraw straight to your Nigerian bank account.' },
];

const INCLUDED = [
  { Icon: Globe2, title: '150+ stores and platforms', body: 'From global streaming services to the African, Asian and social platforms where new fans find music.' },
  { Icon: Barcode, title: 'Free UPC & ISRC codes', body: 'Every release and track gets the industry codes stores need. No extra fees, no separate registrations.' },
  { Icon: Crown, title: '100% master ownership', body: 'Your recordings stay yours. Distributing with Murranno never changes who owns your music.' },
  { Icon: Link2, title: 'Smart links & pre-saves', body: 'One link that sends fans to their favourite store, ready before release day so the hype starts early.' },
  { Icon: Mic2, title: 'Synchronised lyrics', body: 'Lyrics that scroll in time with your song on supported platforms, so listeners can sing every word.' },
  { Icon: Radio, title: 'Editorial pitching', body: 'We help you pitch upcoming releases to Spotify editorial so the right playlists hear them first.' },
  { Icon: Wallet, title: 'Royalties you can track', body: 'Streams and earnings reported store by store, with withdrawals to your bank when you are ready.' },
  { Icon: ShieldCheck, title: 'Verified and secure', body: 'Identity verification, a transaction PIN and encrypted data keep your catalogue and your money safe.' },
  { Icon: Headphones, title: 'Real people on support', body: 'Artist support from a team that understands releases, rejections, takedowns and everything between.' },
];

const FAQ = [
  { q: 'Can I distribute my music from Nigeria to Spotify, Apple Music and Boomplay?', a: 'Yes. Murranno Music is a Lagos-based distributor built for Nigerian and African artists. Upload once in the Murranno app and your release goes to Spotify, Apple Music, Boomplay, Audiomack, YouTube Music, TikTok and 150+ other stores worldwide.' },
  { q: 'How do Nigerian artists get paid for streams?', a: 'Stores report your streams and downloads to Murranno, your earnings appear in your dashboard, and you withdraw in naira to a verified Nigerian bank account once you reach the minimum payout.' },
  { q: 'How long does it take for my music to go live?', a: 'Once your release passes review it is sent to stores straight away. Most stores publish within a few days; some take longer. Give yourself at least two weeks before release day if you want pre-saves and editorial pitching.' },
  { q: 'Do I keep the rights to my music?', a: 'Yes. You keep 100% ownership of your masters. Distribution gives us permission to deliver your music to stores on your behalf, nothing more.' },
  { q: 'What do I need before I upload?', a: 'Finished audio files for every track, square cover artwork, the release title and artist names, songwriter credits, and a release date. You will also verify your identity once, before your first release.' },
  { q: 'How do I get paid?', a: 'Stores report streams and sales back to us and your earnings appear in your Murranno dashboard. When your available balance reaches the minimum payout, you can withdraw to a verified Nigerian bank account.' },
  { q: 'Can I distribute music I have released before?', a: 'Yes. If a release already has a UPC from a previous distributor, add it during upload so stores keep your existing streams and history together.' },
  { q: 'Which stores will my release go to?', a: 'All of them by default, global streaming, African platforms, Asian services and social apps like TikTok and Instagram. You can see the full network further up this page.' },
];

export default function Distribution() {
  return <MarketingLayout title="Music Distribution, Murranno Music" faq={FAQ}>
    <PageHero
      kicker={<><span><Music2 size={15} /><Globe2 size={15} /></span> ONE UPLOAD. 150+ STORES.</>}
      title={<>YOUR SONG, ON EVERY<br />PLATFORM THAT MATTERS.</>}
      lead="Music distribution built in Lagos for Nigerian and African independent artists: we put your music on Spotify, Apple Music, YouTube, TikTok, Boomplay and the stores your next fans already use, and you keep every master you make."
    >
      <Link to="/signup" className="mm-button"><Arrow /><span>START YOUR RELEASE</span></Link>
      <a href="#how-it-works" className="mm-button mm-button-muted"><Arrow /><span>SEE HOW IT WORKS</span></a>
    </PageHero>

    <section className="mm-section mm-container" aria-labelledby="mm-why">
      <div className="mm-split">
        <div>
          <div className="mm-heading"><p className="mm-eyebrow">WHY IT MATTERS</p><h2 id="mm-why">A FINISHED SONG<br />DESERVES <span className="mm-pink-text">LISTENERS.</span></h2></div>
          <p className="mm-lead">You spent nights on the writing, the takes, the mix. Distribution is the moment it stops being a file on your laptop and becomes something the world can press play on.</p>
          <p className="mm-body">Murranno Music exists so that moment is the same for everyone, whether you are signed or fully independent, releasing your first single or your fifth album. One release in the app reaches listeners from Lagos to London, Seoul to São Paulo, and every stream is counted back to you.</p>
        </div>
        <div className="mm-panel mm-pink mm-rise" style={{ '--drawing-accent': 'var(--mm-pink)' } as CSSProperties}>
          <Deco color="var(--mm-pink-arc)" />
          <span className="mm-panel-big">150+</span>
          <h3>STORES &amp; PLATFORMS</h3>
          <p>Streaming, downloads, social video and in-venue music, all from a single upload.</p>
        </div>
      </div>
    </section>

    <section className="mm-section mm-section-tight mm-container" id="how-it-works" aria-labelledby="mm-how">
      <div className="mm-heading mm-center"><p className="mm-eyebrow">HOW A RELEASE TRAVELS</p><h2 id="mm-how">THREE STEPS FROM<br />STUDIO TO <span className="mm-blue-text">STREAMS.</span></h2></div>
      <div className="mm-steps">{STEPS.map((s) => <article key={s.title} className={`mm-step ${s.tone} mm-rise`}><Deco color={s.color} /><h3>{s.title}</h3><p>{s.body}</p></article>)}</div>
    </section>

    <section className="mm-section mm-container" aria-labelledby="mm-included">
      <div className="mm-heading"><p className="mm-eyebrow">WHAT’S INCLUDED</p><h2 id="mm-included">EVERYTHING A RELEASE<br />NEEDS, <span className="mm-purple-text">BUILT IN.</span></h2></div>
      <div className="mm-included-grid">{INCLUDED.map(({ Icon, title, body }, index) => {
        const tones = ['blue', 'lilac', 'pink', 'pink', 'blue', 'lilac', 'lilac', 'pink', 'blue'];
        return <article key={title} className={`mm-included-card mm-included-${tones[index]} mm-rise`}>
          <span className="mm-included-icon" aria-hidden="true"><Icon strokeWidth={1.6} /></span>
          <h3>{title}</h3><p>{body}</p>
        </article>;
      })}</div>
    </section>

    <section className="mm-section mm-section-tight mm-container" id="store-network" aria-labelledby="mm-stores">
      <div className="mm-heading mm-center"><p className="mm-eyebrow">WHERE YOUR MUSIC GOES</p><h2 id="mm-stores">FROM LAGOS TO SEOUL,<br />ONE <span className="mm-pink-text">RELEASE.</span></h2></div>
      <StoreNetwork />
    </section>

    <section className="mm-section mm-container" aria-labelledby="mm-paid">
      <div className="mm-split mm-split-reverse">
        <div>
          <div className="mm-heading"><p className="mm-eyebrow">GETTING PAID</p><h2 id="mm-paid">EVERY PLAY<br />COUNTS <span className="mm-blue-text">BACK TO YOU.</span></h2></div>
          <p className="mm-lead">Stores report your streams and sales. We turn those reports into numbers you can actually read.</p>
          <p className="mm-body">Your dashboard shows streams by release, track, store and country, and your earnings as they come in. When your balance reaches the minimum payout, withdraw to a verified Nigerian bank account, protected by your transaction PIN, with every withdrawal logged and emailed to you.</p>
          <p className="mm-body">No guessing what a stream is worth or where your money went. Just your music, your numbers and your payouts in one place.</p>
        </div>
        <div className="mm-panel mm-blue mm-rise">
          <Deco color="var(--mm-violet-arc)" />
          <BadgeCheck className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" />
          <h3>CLEAR REPORTS.<br />DIRECT PAYOUTS.</h3>
          <p>Streams, stores and countries in one dashboard, and money that lands in your own bank account.</p>
        </div>
      </div>
    </section>

    <section className="mm-section mm-section-tight mm-container" aria-labelledby="mm-faq">
      <div className="mm-heading mm-center"><p className="mm-eyebrow">QUESTIONS</p><h2 id="mm-faq">BEFORE YOU <span className="mm-purple-text">RELEASE.</span></h2></div>
      <div className="mm-faq">{FAQ.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
    </section>

    <AppDownloadSection compact />
    <CtaBand eyebrow="YOUR NEXT MOVE" title={<>READY WHEN<br />YOU ARE.</>} body="Create your free Murranno account, verify once, and upload your first release in minutes." to="/signup" label="CREATE YOUR ACCOUNT" />
    <div className="mm-container" style={{ marginTop: -40, marginBottom: 60, textAlign: 'center' }}>
      <Link to="/artist-profiles" className="mm-read"><FileText size={16} /> Already on stores? Claim your artist profiles</Link>
    </div>
  </MarketingLayout>;
}
