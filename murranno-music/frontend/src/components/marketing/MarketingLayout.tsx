import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, Globe2, Megaphone, Menu, Radio, UserRound, X } from 'lucide-react';
import { SocialIcon } from './SocialIcon';
import { CONTACT_DETAILS, SOCIAL } from './contactDetails';
import { applySeo, pageSeo, type Faq, type SeoMeta } from './seo';
import logo from '@/assets/mm_logo.png';
import { useLandingMotion } from '@/hooks/useLandingMotion';
// Self-hosted (no request to Google at load time): a slow fonts.googleapis.com used to hold back the whole page.
import '@fontsource/boldonse/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@/pages/landing.css';
import '@/pages/marketing.css';

export const SERVICES_LINKS = [
  {
    to: '/distribution',
    label: 'Distribution',
    description: 'Deliver to Spotify, Apple, TikTok & 150+ stores',
    icon: Radio,
  },
  {
    to: '/promotions',
    label: 'Promotion',
    description: 'Pitch to playlists, reach fans & grow your audience',
    icon: Megaphone,
  },
  {
    to: '/artist-profiles',
    label: 'Artist Profiles',
    description: 'Spotify for Artists & YouTube Official Artist Channel',
    icon: UserRound,
  },
];

export const NAV = [
  { to: '/journal', label: 'Journal' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/download', label: 'Get the app' },
];

export const CONTACT = CONTACT_DETAILS;

export function Arrow() {
  return <span className="mm-arrow"><ArrowUpRight size={19} aria-hidden="true" /></span>;
}

export function Arcs({ className = '', color = '#ae7fd8', id }: { className?: string; color?: string; id: string }) {
  return <svg className={className} viewBox="0 0 1440 720" fill="none" aria-hidden="true" preserveAspectRatio="none">
    <defs><linearGradient id={id} x1="720" y1="720" x2="720" y2="65" gradientUnits="userSpaceOnUse"><stop stopColor="white" stopOpacity="0" /><stop offset="1" stopColor={color} /></linearGradient></defs>
    <path d="M65 720 A655 655 0 0 1 1375 720" pathLength="1" stroke={`url(#${id})`} strokeWidth="130" />
    <path d="M65 720 A655 655 0 0 1 1375 720" pathLength="1" stroke="#fff" strokeWidth="8" />
  </svg>;
}

export function Deco({ color }: { color: string }) {
  return <svg className="mm-deco" viewBox="0 0 600 600" fill="none" aria-hidden="true"><path d="M70 600 A230 230 0 1 1 530 600" pathLength="1" stroke={color} strokeWidth="70" /></svg>;
}

/** `title` is the fallback; per-page title, description and keywords live in src/content/seo.json. */
export function MarketingLayout({ title, children, contactLink = true, seo, faq, jsonLd }: {
  title: string; children: ReactNode; contactLink?: boolean; seo?: SeoMeta; faq?: Faq[]; jsonLd?: object[];
}) {
  const { pathname } = useLocation();
  const meta = seo ?? pageSeo(pathname) ?? { title, description: pageSeo('/')!.description };
  useEffect(() => { applySeo(pathname, meta, { faq, jsonLd }); }, [pathname, meta.title, meta.description, faq, jsonLd]); // eslint-disable-line react-hooks/exhaustive-deps
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useLandingMotion(root);

  const isServicesActive = SERVICES_LINKS.some((link) => pathname === link.to);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setServicesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 140);
  };

  useEffect(() => {
    setServicesOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('mm-marketing-page');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setServicesOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.classList.remove('mm-marketing-page');
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return <div className="mm-landing" ref={root}>
    <a className="mm-skip" href="#main">Skip to content</a>
    <header className="mm-header">
      <Link className="mm-brand" to="/" aria-label="Murranno Music home"><img src={logo} alt="Murranno Music" /></Link>
      <nav id="mm-navigation" aria-label="Main navigation" className={menuOpen ? 'mm-nav mm-nav-open' : 'mm-nav'}>
        {/* Desktop Services Dropdown */}
        <div
          ref={dropdownRef}
          className="mm-nav-dropdown-wrapper"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            type="button"
            className={`mm-nav-dropdown-trigger ${isServicesActive ? 'mm-nav-active' : ''} ${servicesOpen ? 'mm-dropdown-open' : ''}`}
            onClick={() => setServicesOpen((prev) => !prev)}
            aria-expanded={servicesOpen}
            aria-haspopup="true"
          >
            <span>Services</span>
            <ChevronDown size={13} className={`mm-chevron ${servicesOpen ? 'mm-chevron-rotated' : ''}`} aria-hidden="true" />
          </button>

          <div
            className={`mm-nav-dropdown-menu ${servicesOpen ? 'mm-menu-visible' : ''}`}
            role="menu"
            aria-label="Services menu"
          >
            {SERVICES_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  onClick={() => {
                    setServicesOpen(false);
                    setMenuOpen(false);
                  }}
                  className={({ isActive }) => `mm-dropdown-item ${isActive ? 'mm-dropdown-item-active' : ''}`}
                >
                  <span className="mm-dropdown-icon">
                    <Icon size={16} />
                  </span>
                  <div className="mm-dropdown-item-text">
                    <span className="mm-dropdown-item-title">{item.label}</span>
                    <span className="mm-dropdown-item-desc">{item.description}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Mobile Services Accordion */}
        <div className="mm-mobile-services">
          <button
            type="button"
            className={`mm-mobile-services-btn ${isServicesActive ? 'mm-nav-active' : ''}`}
            onClick={() => setMobileServicesOpen((prev) => !prev)}
            aria-expanded={mobileServicesOpen}
          >
            <span>Services</span>
            <ChevronDown size={16} className={`mm-chevron ${mobileServicesOpen ? 'mm-chevron-rotated' : ''}`} />
          </button>
          {mobileServicesOpen && (
            <div className="mm-mobile-services-list">
              {SERVICES_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => (isActive ? 'mm-nav-active' : undefined)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* Top-level navigation items */}
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => (isActive ? 'mm-nav-active' : undefined)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button className="mm-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mm-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>
    <main id="main">
      {children}
      <section className="mm-contact" id="contact" aria-labelledby="mm-contact-title"><div className="mm-contact-panel">
        <div className="mm-heading mm-contact-heading">
          <h2 id="mm-contact-title">GET IN TOUCH, LET US<br />KNOW HOW WE CAN HELP</h2>
          {contactLink
            ? <Link className="mm-contact-link" to="/contact"><span>LET’S TALK ABOUT YOUR NEXT RELEASE</span><Arrow /></Link>
            : <a className="mm-contact-link" href={`mailto:${CONTACT.email}`}><span>{CONTACT.email.toUpperCase()}</span><Arrow /></a>}
        </div>
        <footer className="mm-footer mm-rise">
          <div className="mm-footer-top">
            <div className="mm-footer-brand"><Link to="/" aria-label="Murranno Music home"><img src={logo} alt="Murranno Music" /></Link><p>Your music.<br />To the world.</p></div>
            <div><h3>Explore</h3><Link to="/distribution">Distribution</Link><Link to="/promotions">Promotions</Link><Link to="/artist-profiles">Artist profiles</Link><Link to="/journal">Music journal</Link><Link to="/download">Get the app <small className="mm-footer-soon">Coming soon</small></Link></div>
            <div><h3>Company</h3><Link to="/about">About us</Link><Link to="/contact">Contact</Link><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms & conditions</Link><Link to="/login">Artist login</Link></div>
          </div>
          <div className="mm-footer-bottom">
            <span><Globe2 size={17} /> Made for artists, everywhere.</span>
            <span>© {new Date().getFullYear()} Murranno Music. All rights reserved.</span>
            <nav className="mm-footer-socials" aria-label="Social media">
              {SOCIAL.map((s) => <a key={s.href} href={s.href} aria-label={s.label} title={s.label} target="_blank" rel="noopener noreferrer"><SocialIcon platform={s.platform} /></a>)}
            </nav>
          </div>
        </footer>
      </div></section>
    </main>
  </div>;
}

/** Inner-page hero: the landing's rounded gradient panel, kicker chip, Boldonse title and arcs. */
export function PageHero({ kicker, title, lead, children, tone = 'pink' }: { kicker: ReactNode; title: ReactNode; lead: ReactNode; children?: ReactNode; tone?: 'pink' | 'lilac' | 'blue' | 'yellow' }) {
  return <section className={`mm-page-hero mm-page-hero-${tone}`} aria-labelledby="mm-page-title">
    <div className="mm-page-hero-panel">
      <Arcs className="mm-page-hero-arc" color={tone === 'blue' ? 'var(--mm-violet-arc)' : tone === 'yellow' ? '#f5e86b' : 'var(--mm-pink-arc)'} id={`mm-page-arc-${tone}`} />
      <div className="mm-page-hero-copy">
        <div className="mm-hero-kicker">{kicker}</div>
        <h1 id="mm-page-title">{title}</h1>
        <p className="mm-hero-lead">{lead}</p>
        {children && <div className="mm-page-hero-actions">{children}</div>}
      </div>
    </div>
  </section>;
}

export function CtaBand({ eyebrow, title, body, to, label }: { eyebrow: string; title: ReactNode; body: string; to: string; label: string }) {
  return <section className="mm-cta-band mm-container mm-rise">
    <Deco color="#dec7f5" />
    <div className="mm-heading"><p className="mm-eyebrow">{eyebrow}</p><h2>{title}</h2></div>
    <p>{body}</p>
    {to.startsWith('http') || to.startsWith('mailto:')
      ? <a className="mm-button" href={to}><Arrow /><span>{label}</span></a>
      : <Link className="mm-button" to={to}><Arrow /><span>{label}</span></Link>}
  </section>;
}
