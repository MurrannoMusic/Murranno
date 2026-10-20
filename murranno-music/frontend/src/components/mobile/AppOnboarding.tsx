import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ServiceDrawing } from '@/components/brand/ServiceDrawing';
import logo from '@/assets/mm_logo.png';
import './onboarding.css';

const slides = [
  { title: ['MUSIC', 'DISTRIBUTION.'], label: 'YOUR SOUND. EVERYWHERE.', body: 'Your music on the platforms your listeners love. One upload, a world of possibilities.', accent: '#a834ad' },
  { title: ['MUSIC', 'PROMOTION.'], label: 'MAKE YOUR NEXT MOVE.', body: 'Reach new listeners with promotion built around your music and the story behind it.', accent: '#7040ad' },
  { title: ['CREATIVE', 'SERVICES.'], label: 'LOOK AS GOOD AS YOU SOUND.', body: 'Cover artwork and visualizers that turn your sound into a world people can see.', accent: '#ae7fd8' },
];

export function AppOnboarding({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const slide = slides[current];
  return <main className="app-onboarding">
    <header className="app-onboarding-header"><img src={logo} alt="Murranno Music" /><button type="button" onClick={onComplete}>Skip intro</button></header>
    <section className="app-onboarding-card" style={{ '--drawing-accent': slide.accent } as React.CSSProperties}
      aria-label="Murranno app introduction" aria-roledescription="carousel"
      onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
      onTouchEnd={event => { if (!touch.current) return; const dx = touch.current.x - event.changedTouches[0].clientX; const dy = touch.current.y - event.changedTouches[0].clientY; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) setCurrent(index => Math.max(0, Math.min(2, index + (dx > 0 ? 1 : -1)))); touch.current = null; }}>
      <div className="app-onboarding-card-top"><span>0{current + 1} / 03</span></div>
      <div aria-live="polite" aria-atomic="true"><h1>{slide.title[0]}<br />{slide.title[1]}</h1><p>{slide.body}</p><ServiceDrawing key={current} kind={current} className="app-onboarding-art" /></div>
    </section>
    <footer className="app-onboarding-footer">
      <div className="app-onboarding-pagination" aria-label="Introduction screens">{slides.map((item, index) => <button type="button" key={item.label} aria-label={`Show screen ${index + 1}: ${item.title.join(' ')}`} aria-current={index === current ? 'step' : undefined} onClick={() => setCurrent(index)}><span /></button>)}</div>
      <div className="app-onboarding-actions">{current > 0 && <button type="button" className="app-onboarding-back" onClick={() => setCurrent(index => index - 1)} aria-label="Previous screen"><ArrowLeft size={20} /></button>}<button type="button" className="app-onboarding-next" onClick={() => current === 2 ? onComplete() : setCurrent(index => index + 1)}>{current === 2 ? 'GET STARTED' : 'NEXT'}<ArrowRight size={20} aria-hidden="true" /></button></div>
      <p>Already have an account? <Link to="/login">Log in</Link></p>
    </footer>
  </main>;
}
