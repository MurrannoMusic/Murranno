import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
} else if (rootElement.hasAttribute('data-prerendered')) {
  // Marketing pages ship as pre-rendered HTML (scripts/prerender.mjs) for crawlers. Keep it on screen while the
  // live app renders off-screen, then swap — visitors never see the loading spinner.
  const live = document.createElement('div');
  live.style.cssText = 'position:absolute;top:0;left:0;width:100%;visibility:hidden;pointer-events:none';
  document.body.appendChild(live);
  createRoot(live).render(<App />);
  const started = performance.now();
  const ready = () => live.querySelector('h1') && !live.querySelector('.animate-spin.rounded-full');
  const swap = () => { live.removeAttribute('style'); rootElement.replaceWith(live); live.id = 'root'; };
  const check = () => (ready() || performance.now() - started > 8000 ? swap() : requestAnimationFrame(check));
  requestAnimationFrame(check);
} else {
  createRoot(rootElement).render(<App />);
}
