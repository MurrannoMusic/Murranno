import { Clock3, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Arrow, Deco } from './MarketingLayout';

const channels = [
  { id: 'google-play', name: 'Google Play', device: 'For Android', description: 'Install Murranno Music from Google Play on your Android phone.' },
  { id: 'app-store', name: 'App Store', device: 'For iPhone', description: 'Get Murranno Music on your iPhone from the App Store.' },
  { id: 'apk', name: 'Android APK', device: 'Direct download', description: 'Download the Android installer directly from Murranno Music.' },
] as const;

function StoreMark({ channel }: { channel: typeof channels[number]['id'] }) {
  if (channel === 'apk') return <FileDown strokeWidth={1.3} aria-hidden="true" />;
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">{channel === 'app-store'
    ? <path d="M17.05 12.54c.03 3.02 2.65 4.03 2.68 4.04-.02.07-.42 1.44-1.38 2.85-.83 1.22-1.7 2.44-3.06 2.47-1.34.03-1.77-.8-3.3-.8-1.52 0-2 .78-3.26.83-1.31.05-2.3-1.32-3.14-2.53-1.71-2.48-3.02-7.01-1.26-10.07a4.87 4.87 0 0 1 4.12-2.5c1.28-.02 2.49.88 3.27.88.79 0 2.26-1.09 3.8-.93.65.03 2.48.26 3.65 1.98-.09.06-2.18 1.27-2.15 3.78zM14.55 5.17c.7-.85 1.17-2.02 1.04-3.2-1.01.04-2.24.67-2.96 1.52-.65.75-1.22 1.95-1.06 3.1 1.13.09 2.28-.57 2.98-1.42z" />
    : <><path d="M3.6 2.2 14 12 3.6 21.8a2 2 0 0 1-.6-1.5V3.7c0-.6.2-1.1.6-1.5Zm1.2-.7 12.5 7.2-2.6 2.5L4.8 1.5Zm13.5 7.8 3 1.7c1.1.6 1.1 1.4 0 2l-3 1.7-2.8-2.7 2.8-2.7Zm-1 6L4.8 22.5l9.9-9.7 2.6 2.5Z" /></>}</svg>;
}

export function AppDownloadOptions() {
  return <div className="mm-download-options">{channels.map(channel => <article className="mm-download-option mm-rise" key={channel.id}>
    <div className="mm-download-option-top"><StoreMark channel={channel.id} /><span>{channel.device}</span></div>
    <h3>{channel.name}</h3><p>{channel.description}</p>
    <button className="mm-download-unavailable" type="button" disabled aria-label={`${channel.name}, coming soon`}><Clock3 size={17} aria-hidden="true" /><span>COMING SOON</span></button>
  </article>)}</div>;
}

export function AppPreview() {
  return <figure className="mm-app-art">
    <Deco color="var(--mm-violet-arc)" />
    <div className="mm-app-phone mm-app-phone-back" aria-hidden="true"><img src="/landing/app/overview-dark.png" alt="" loading="lazy" width={390} height={844} /></div>
    <div className="mm-app-phone mm-app-phone-front"><img src="/landing/app/overview-light.png" alt="Murranno Music app overview showing releases, streams and earnings" loading="lazy" width={390} height={844} /></div>
    <figcaption className="mm-app-art-note">APP PREVIEW · SAMPLE DATA</figcaption>
  </figure>;
}

export function AppDownloadSection({ compact = false }: { compact?: boolean }) {
  return <section className={`mm-app-section mm-container${compact ? ' mm-app-section-compact' : ''}`} aria-labelledby="mm-app-section-title">
    <div className="mm-app-teaser mm-rise">
      <div className="mm-app-teaser-copy">
        <p className="mm-eyebrow">THE MURRANNO MUSIC APP</p>
        <h2 id="mm-app-section-title">YOUR NEXT MOVE.<br /><span>IN YOUR POCKET.</span></h2>
        <p>Release music, follow your campaigns and keep track of your earnings. Your artist world, wherever you go.</p>
        <div className="mm-app-teaser-actions"><p className="mm-app-coming"><Clock3 size={16} aria-hidden="true" /> Coming soon for Android &amp; iPhone</p>
        <Link to="/download" className="mm-button"><Arrow /><span>EXPLORE THE APP</span></Link>
        <span className="mm-app-platform-labels">Google Play · App Store · Android APK</span></div>
      </div>
      {!compact && <AppPreview />}
    </div>
  </section>;
}
