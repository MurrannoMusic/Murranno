import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import mmLogo from '@/assets/mm_logo.png';
import { ServiceDrawing } from '@/components/brand/ServiceDrawing';
import './auth.css';

export const AuthShell = ({ back, title, children, variant }: { back: string; title: ReactNode; children: ReactNode; variant?: 'signup' }) => (
  <main className={`auth-shell${variant === 'signup' ? ' auth-shell-signup' : ''}`}>
    <aside className="auth-shell-story" aria-label="Your music, your next chapter">
      <Link to="/landing" aria-label="Murranno Music home"><img src={mmLogo} alt="Murranno Music" /></Link>
      <div><p className="auth-shell-eyebrow">INDEPENDENT SPIRIT. WORLDWIDE REACH.</p><h2>YOUR MUSIC.<br />YOUR NEXT<br />CHAPTER.</h2></div>
      <ServiceDrawing kind={0} className="auth-shell-illustration" />
      <p className="auth-shell-caption">Release your music. Reach new listeners.<br />Build something that is yours.</p>
    </aside>
    <div className="auth-shell-form-column space-y-6">
      <Link to="/landing" className="auth-shell-mobile-logo"><img src={mmLogo} alt="Murranno Music home" /></Link>
      <Link to={back} aria-label="Back" className="inline-flex h-11 w-11 -ml-3 items-center justify-center rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronLeft className="h-6 w-6" />
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <div>{children}</div>
    </div>
  </main>
);
