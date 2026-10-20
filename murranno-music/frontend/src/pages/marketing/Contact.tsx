import { Link } from 'react-router-dom';
import { Mail, MapPin, Megaphone, MessageCircle, Phone } from 'lucide-react';
import { Arrow, CONTACT, MarketingLayout, PageHero } from '@/components/marketing/MarketingLayout';

const FAQ = [
  { q: 'I already have an account. Where do I get help with a release?', a: 'Log in to the Murranno app and open Support from the menu. Tickets sent from inside the app come with your account details, so we can look into releases, payouts and profile issues faster.' },
  { q: 'How do I plan a promotion campaign?', a: 'Browse services and bundles on the Promotions page, or tell us your budget and goals and we will put a plan together around your release date.' },
  { q: 'Can labels and agencies work with Murranno?', a: 'Yes. Labels can manage a roster of artists and their revenue shares, and agencies can run campaigns for their clients, each from their own dashboard.' },
];

export default function Contact() {
  const promoSubject = encodeURIComponent('Promotion enquiry, I have a promo budget');
  const enquirySubject = encodeURIComponent('General enquiry');
  return <MarketingLayout title="Contact, Murranno Music" contactLink={false} faq={FAQ}>
    <PageHero
      tone="yellow"
      kicker={<><span><MessageCircle size={15} /><Mail size={15} /></span> WE’RE LISTENING.</>}
      title={<>TELL US ABOUT<br />YOUR NEXT MOVE.</>}
      lead="Whether you have a release on the way, a campaign to plan or a question about your account, reach the Murranno team the way that suits you."
    />

    <section className="mm-section mm-container" aria-labelledby="mm-paths">
      <h2 id="mm-paths" className="mm-sr-only">Ways to reach us</h2>
      <div className="mm-paths">
        <article className="mm-path mm-pink mm-rise">
          <Megaphone className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" />
          <p className="mm-eyebrow">I HAVE A PROMO BUDGET</p>
          <h3>LET’S PLAN<br />YOUR CAMPAIGN.</h3>
          <p>Share your release, timeline and budget. We will come back with a promotion plan across playlists, social, press and radio.</p>
          <a className="mm-button" href={`mailto:${CONTACT.email}?subject=${promoSubject}`}><Arrow /><span>LET’S TALK</span></a>
        </article>
        <article className="mm-path mm-lilac mm-rise">
          <MessageCircle className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" />
          <p className="mm-eyebrow">GOT AN ENQUIRY?</p>
          <h3>ASK US<br />ANYTHING.</h3>
          <p>For distribution, artist profiles, partnerships or press, send it our way and the right person will reply.</p>
          <a className="mm-button" href={`mailto:${CONTACT.email}?subject=${enquirySubject}`}><Arrow /><span>GET IN TOUCH</span></a>
        </article>
      </div>
    </section>

    <section className="mm-section mm-section-tight mm-container" aria-labelledby="mm-details">
      <div className="mm-heading"><p className="mm-eyebrow">CONTACT DETAILS</p><h2 id="mm-details">FIND US<br /><span className="mm-purple-text">HERE.</span></h2></div>
      <div className="mm-details">
        <div className="mm-detail mm-rise"><Mail className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" /><small>Email</small><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></div>
        <div className="mm-detail mm-rise"><Phone className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" /><small>Phone &amp; WhatsApp</small><a href={CONTACT.phoneHref}>{CONTACT.phone}</a><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="mm-read" style={{ fontSize: 15 }}>Chat on WhatsApp</a></div>
        <div className="mm-detail mm-rise"><MapPin className="mm-standalone-icon" strokeWidth={1.3} aria-hidden="true" /><small>Office</small><span>{CONTACT.address}</span><a href={CONTACT.mapHref} target="_blank" rel="noopener noreferrer" className="mm-read" style={{ fontSize: 15 }}>Open in Maps</a></div>
      </div>
    </section>

    <section className="mm-section mm-container" aria-labelledby="mm-contact-faq">
      <div className="mm-heading mm-center"><p className="mm-eyebrow">BEFORE YOU WRITE</p><h2 id="mm-contact-faq">QUICK <span className="mm-blue-text">ANSWERS.</span></h2></div>
      <div className="mm-faq">{FAQ.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
      <p className="mm-body" style={{ textAlign: 'center', marginTop: 32 }}>Already releasing with us? <Link to="/login" className="mm-read">Log in for in-app support</Link></p>
    </section>
  </MarketingLayout>;
}
