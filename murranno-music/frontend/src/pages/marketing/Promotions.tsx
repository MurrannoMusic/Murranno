import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, ListMusic, Megaphone, Palette, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Arrow, CtaBand, Deco, MarketingLayout, PageHero } from '@/components/marketing/MarketingLayout';

interface Service { id: string; name: string; category: string; description: string | null; price: number; duration: string | null; features: string[] | null }
interface Bundle { id: string; name: string; description: string | null; price: number; tier_level: number; target_description: string | null; bundle_services: { service_id: string }[] }

const naira = (n: number) => `₦${Math.round(n).toLocaleString('en-NG')}`;
const BUNDLE_TONES = [['mm-pink', 'var(--mm-pink-arc)'], ['mm-blue', 'var(--mm-violet-arc)'], ['mm-lilac', '#e4d1f4'], ['mm-yellow', '#f5e86b']];
const CATEGORY_ORDER = ['Streaming & Playlist Promotion', 'Digital & Social Media Marketing', 'Press & Media Promotions', 'Radio Promotions'];

const STORY = [
  { Icon: ListMusic, title: 'Playlists that move numbers', body: 'Curated and editorial playlists are still where most listeners meet new music. We pitch your song to the ones that fit your sound.' },
  { Icon: TrendingUp, title: 'Moments people share', body: 'TikTok challenges, Instagram creators and YouTube campaigns that give fans a reason to use your song, not just hear it.' },
  { Icon: Megaphone, title: 'Press that builds a story', body: 'Blog features, magazine interviews and press releases that give journalists, curators and fans something to write about.' },
];

function useCatalogue() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [bundles, setBundles] = useState<Bundle[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    Promise.all([
      supabase.from('promotion_services' as any).select('id,name,category,description,price,duration,features').eq('is_active', true).order('sort_order'),
      supabase.from('promotion_bundles' as any).select('id,name,description,price,tier_level,target_description,bundle_services(service_id)').eq('is_active', true).order('tier_level'),
    ]).then(([s, b]) => {
      if (s.error || b.error) throw s.error || b.error;
      setServices(s.data as unknown as Service[]);
      setBundles(b.data as unknown as Bundle[]);
    }).catch(() => setError(true));
  }, []);
  return { services, bundles, error };
}

export default function Promotions() {
  const { services, bundles, error } = useCatalogue();
  // Live prices as structured data, so search engines and AI answers quote what artists actually pay.
  const catalogue = useMemo(() => services && bundles ? [{
    '@type': 'OfferCatalog',
    name: 'Murranno Music promotion services',
    itemListElement: [...bundles.map((b) => ({ name: b.name, description: b.description, price: b.price })), ...services.map((s) => ({ name: s.name, description: s.description, price: s.price, duration: s.duration }))]
      .map((o) => ({ '@type': 'Offer', priceCurrency: 'NGN', price: o.price, areaServed: 'NG', itemOffered: { '@type': 'Service', name: o.name, description: o.description ?? undefined, serviceType: 'Music promotion' } })),
  }] : undefined, [services, bundles]);
  const groups = CATEGORY_ORDER.map((category) => ({ category, items: (services ?? []).filter((s) => s.category === category) }))
    .concat([{ category: 'More', items: (services ?? []).filter((s) => !CATEGORY_ORDER.includes(s.category)) }])
    .filter((g) => g.items.length);

  return <MarketingLayout title="Music Promotion, Murranno Music" jsonLd={catalogue}>
    <PageHero
      tone="blue"
      kicker={<><span><Megaphone size={15} /><TrendingUp size={15} /></span> REACH NEW AUDIENCES.</>}
      title={<>RELEASE DAY IS<br />ONLY THE BEGINNING.</>}
      lead="Music promotion from Lagos, Nigeria: strategic campaigns across playlists, social media, press and radio, so the people who would love your music actually get to hear it."
    >
      <a href="#bundles" className="mm-button"><Arrow /><span>SEE PROMOTION BUNDLES</span></a>
      <Link to="/contact" className="mm-button mm-button-muted"><Arrow /><span>I HAVE A PROMO BUDGET</span></Link>
    </PageHero>

    <section className="mm-section mm-container" aria-labelledby="mm-story">
      <div className="mm-split">
        <div>
          <div className="mm-heading"><p className="mm-eyebrow">THE HARD PART</p><h2 id="mm-story">GREAT MUSIC<br />STILL NEEDS <span className="mm-blue-text">A PUSH.</span></h2></div>
          <p className="mm-lead">Tens of thousands of songs land on streaming every day. Being good is the price of entry; being found is the work.</p>
          <p className="mm-body">Murranno Promotions puts your release in front of new listeners where they already spend their time, editorial and curated playlists, social feeds, music blogs and the radio. Pick a single service for one push, or a bundle that runs a full campaign around your release.</p>
        </div>
        <div className="mm-editorial-list">
          {STORY.map(({ Icon, title, body }) => <article key={title} className="mm-editorial-item mm-rise"><Icon className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" /><div><h3>{title}</h3><p>{body}</p></div></article>)}
        </div>
      </div>
    </section>

    <section className="mm-section mm-section-tight mm-container" id="bundles" aria-labelledby="mm-bundles">
      <div className="mm-heading mm-center"><p className="mm-eyebrow">PROMOTION BUNDLES</p><h2 id="mm-bundles">A CAMPAIGN FOR<br />EVERY <span className="mm-pink-text">STAGE.</span></h2></div>
      {error ? <p className="mm-body" style={{ textAlign: 'center' }}>Bundles could not be loaded right now. <Link to="/signup" className="mm-read">See them in the app</Link></p> : (
        <div className="mm-bundles">
          {(bundles ?? [null, null, null, null]).map((b: Bundle | null, i) => {
            const [tone] = BUNDLE_TONES[i % BUNDLE_TONES.length];
            return b ? <Link key={b.id} to="/signup" className={`mm-bundle ${tone} mm-rise`}>
              <span className="mm-bundle-number" aria-hidden="true">0{i + 1}</span>
              <small>{b.target_description}</small>
              <h3>{b.name}</h3>
              <p>{b.description}</p>
              <div className="mm-bundle-price">{naira(b.price)}<small>{b.bundle_services?.length || 0} promotion services included</small></div>
              <span className="mm-bundle-action">EXPLORE BUNDLE <Arrow /></span>
            </Link> : <div key={i} className={`mm-bundle ${tone}`} aria-hidden><div className="mm-skeleton" style={{ width: '60%' }} /><div className="mm-skeleton" style={{ width: '80%' }} /></div>;
          })}
        </div>
      )}
    </section>

    <section className="mm-section mm-container" aria-labelledby="mm-services">
      <div className="mm-heading"><p className="mm-eyebrow">SERVICES</p><h2 id="mm-services">OR BUILD YOUR<br />OWN <span className="mm-purple-text">CAMPAIGN.</span></h2></div>
      {error ? <p className="mm-body">The service list could not be loaded right now. Every service is available in the Murranno app.</p> : !services ? (
        <div className="mm-catalogue" aria-hidden>{[0, 1, 2].map((i) => <div key={i} className="mm-skeleton" style={{ height: 60 }} />)}</div>
      ) : (
        <div className="mm-catalogue">
          {groups.map((g) => <div key={g.category} className="mm-catalogue-group mm-rise">
            <h3>{g.category}</h3>
            {g.items.map((s) => <div key={s.id} className="mm-service-row">
              <strong>{s.name}</strong>
              <div><p>{s.description}</p>{!!s.features?.length && <ul>{s.features.map((f) => <li key={f}>{f}</li>)}</ul>}</div>
              <span className="mm-price">{naira(s.price)}{s.duration && <small>{s.duration}</small>}</span>
            </div>)}
          </div>)}
        </div>
      )}
    </section>

    <section className="mm-section mm-section-tight mm-container" aria-labelledby="mm-creative">
      <div className="mm-split mm-split-reverse">
        <div>
          <div className="mm-heading"><p className="mm-eyebrow">CREATIVE SERVICES</p><h2 id="mm-creative">LOOK AS GOOD<br />AS YOU <span className="mm-pink-text">SOUND.</span></h2></div>
          <p className="mm-lead">Before anyone presses play, they see your cover. Make it count.</p>
          <p className="mm-body">Our creative team designs cover artwork and visualizers that carry your sound into pictures, the square on a streaming app, the loop behind your song on YouTube, the clip fans share on their stories. Let your visuals tell a story as powerful as your music.</p>
          <Link to="/contact" className="mm-button" style={{ marginTop: 24 }}><Arrow /><span>START A CREATIVE BRIEF</span></Link>
        </div>
        <div className="mm-panel mm-yellow mm-rise">
          <Deco color="#f5e86b" />
          <div style={{ display: 'flex', gap: 24 }}><Palette className="mm-standalone-icon" strokeWidth={1.3} color="#8a7500" /><Clapperboard className="mm-standalone-icon" strokeWidth={1.3} color="#8a7500" /></div>
          <h3>COVER ART<br />&amp; VISUALIZERS</h3>
          <p>Designed for streaming apps, YouTube and social, in every size each platform needs.</p>
        </div>
      </div>
    </section>

    <section className="mm-section mm-container" aria-labelledby="mm-playlist">
      <div className="mm-split">
        <div className="mm-panel mm-lilac mm-rise">
          <Deco color="#dec7f5" />
          <ListMusic className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" />
          <h3>LOVE PLAYLISTS?</h3>
          <p>So do we. We curate our own, and we pitch artists to the playlists that help new music travel.</p>
        </div>
        <div>
          <div className="mm-heading"><p className="mm-eyebrow">PLAYLIST PITCHING</p><h2 id="mm-playlist">GET YOUR SONG<br />INTO THE <span className="mm-purple-text">RIGHT ROTATION.</span></h2></div>
          <p className="mm-body">A good playlist placement keeps working long after release week. When you distribute with Murranno you can pitch upcoming releases to Spotify editorial from the app, and our promotion team can take your track to curated playlists across Spotify, Apple Music and Audiomack.</p>
          <p className="mm-body">Tell us about the song, the mood and the listeners you want to reach; we will match it to playlists where it belongs.</p>
          <Link to="/app/tools/pitch" className="mm-button mm-button-muted" style={{ marginTop: 24 }}><Arrow /><span>PITCH TO PLAYLISTS</span></Link>
        </div>
      </div>
    </section>

    <CtaBand eyebrow="GROW YOUR AUDIENCE" title={<>YOUR MUSIC.<br />NEW LISTENERS.</>} body="Book promotion services from the Murranno app and track every campaign from your dashboard." to="/signup" label="START A CAMPAIGN" />
  </MarketingLayout>;
}
