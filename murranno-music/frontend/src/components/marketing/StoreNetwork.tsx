import { Globe2 } from 'lucide-react';
import { STORE_REGIONS } from '@/content/stores';
import { Deco } from './MarketingLayout';
import { PlatformMark, type PlatformName } from './PlatformMark';

const platforms: PlatformName[] = ['spotify', 'apple', 'youtube', 'boomplay', 'audiomack', 'deezer', 'amazon', 'tidal'];

export function StoreNetwork() {
  return <div className="mm-network">
    <aside className="mm-network-reach mm-rise" aria-label="Our distribution network">
      <Deco color="var(--mm-pink-arc)" />
      <div className="mm-network-reach-copy">
        <Globe2 size={40} strokeWidth={1.3} aria-hidden="true" />
        <span className="mm-network-number">150+</span>
        <h3>STORES.<br />ONE UPLOAD.</h3>
        <p>Your music travels further.<br />Your masters stay yours.</p>
      </div>
      <ul className="mm-network-logos" aria-label="Selected music platforms">{platforms.map(platform => <li key={platform}><PlatformMark platform={platform} /></li>)}</ul>
      <span className="mm-network-footnote">Streaming · Downloads · Social video</span>
    </aside>
    <div className="mm-network-directory">{STORE_REGIONS.map((region, index) => <article key={region.region} className={`mm-network-region mm-rise ${region.tone}`}>
      <div className="mm-network-region-heading"><span className="mm-network-index" aria-hidden="true">0{index + 1}</span><h3>{region.region}</h3><p>{region.note}</p></div>
      <ul>{region.stores.map(store => <li key={store}>{store}</li>)}</ul>
    </article>)}</div>
  </div>;
}
