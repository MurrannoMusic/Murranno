import { Link } from 'react-router-dom';
import { ChartNoAxesCombined, Clock3, Music2, Smartphone, Wallet } from 'lucide-react';
import { Arrow, MarketingLayout, PageHero } from '@/components/marketing/MarketingLayout';
import { AppDownloadOptions, AppPreview } from '@/components/marketing/AppDownloads';

const features = [
  { Icon: Music2, title: 'Release your music', body: 'Add your tracks, artwork and release details from your phone.', image: 'new-release.png', alt: 'New release screen with artwork and release details' },
  { Icon: ChartNoAxesCombined, title: 'Follow your streams', body: 'Keep an eye on your music with streams and audience insights.', image: 'analytics.png', alt: 'Analytics screen showing stream trends' },
  { Icon: Wallet, title: 'Stay on top of earnings', body: 'See your royalties and manage payouts from your artist account.', image: 'earnings.png', alt: 'Earnings screen showing balances and payout controls' },
];

export default function Download() {
  return <MarketingLayout title="Get the App, Murranno Music">
    <PageHero tone="lilac" kicker={<><span><Smartphone size={15} /></span> THE MURRANNO MUSIC APP</>}
      title={<>YOUR MUSIC.<br />IN YOUR POCKET.</>}
      lead="Your releases, campaigns and earnings, together in the Murranno Music app. Coming soon for Android and iPhone.">
      <a href="#download-options" className="mm-button"><Arrow /><span>VIEW DOWNLOAD OPTIONS</span></a>
    </PageHero>

    <section className="mm-section mm-section-tight mm-container mm-download-intro" aria-labelledby="mm-app-preview-title">
      <div className="mm-download-intro-copy"><p className="mm-eyebrow">BUILT AROUND YOUR NEXT MOVE</p><h2 id="mm-app-preview-title">THE ARTIST LIFE.<br /><span className="mm-pink-text">ALL TOGETHER.</span></h2><p className="mm-lead">From the studio to wherever life takes you.</p><p className="mm-body">We’re getting the mobile app ready. When downloads open, this page will have the Google Play and App Store links, plus a direct Android APK download.</p><p className="mm-app-coming"><Clock3 size={17} aria-hidden="true" /> App downloads are not available yet.</p></div>
      <AppPreview />
    </section>

    <section className="mm-section mm-container" id="download-options" aria-labelledby="mm-download-options-title">
      <div className="mm-heading"><p className="mm-eyebrow">CHOOSE YOUR DEVICE</p><h2 id="mm-download-options-title">THREE WAYS IN.<br /><span className="mm-purple-text">COMING SOON.</span></h2><p className="mm-body mm-download-explanation">All download options are currently unavailable while we prepare the app for launch.</p></div>
      <AppDownloadOptions />
    </section>

    <section className="mm-section mm-section-tight mm-container" aria-labelledby="mm-app-features-title">
      <div className="mm-heading"><p className="mm-eyebrow">ONE APP. YOUR ARTIST WORLD.</p><h2 id="mm-app-features-title">MAKE MUSIC.<br /><span className="mm-blue-text">KEEP MOVING.</span></h2></div>
      <div className="mm-app-screens">{features.map(({ Icon, title, body, image, alt }) => <article className="mm-app-screen-feature mm-rise" key={title}><Icon className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" /><h3>{title}</h3><p>{body}</p><figure><img src={`/landing/app/${image}`} alt={alt} loading="lazy" width={390} height={844} /><figcaption>App preview · Sample data</figcaption></figure></article>)}</div>
      <p className="mm-download-back">Looking for help with your music? <Link to="/contact" className="mm-read">Talk to the team <Arrow /></Link></p>
    </section>
  </MarketingLayout>;
}
