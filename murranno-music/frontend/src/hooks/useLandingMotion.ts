import { useEffect, type RefObject } from 'react';

const easeOut = 'cubic-bezier(.215,.61,.355,1)';
const backOut = 'cubic-bezier(.175,.885,.32,1.275)';
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Layered load sequence and scroll-scrubbed card fans, following the reference. */
export function useLandingMotion(root: RefObject<HTMLDivElement>) {
  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 992px)');
    const animations: Animation[] = [];
    let frame = 0;
    let previousTime = 0;
    let fan = 0;
    let stories = 0;
    let drift = 0;
    let active = true;
    const animate = (element: Element, frames: Keyframe[], duration = 700, delay = 0, easing = easeOut) => {
      if (reduced.matches) return;
      animations.push(element.animate(frames, { duration, delay, easing, fill: 'backwards' }));
    };
    const entrance = (selector: string, delay: number, distance = 24, duration = 600, scale = 1) => {
      page.querySelectorAll(selector).forEach(element => animate(element, [
        { opacity: 0, transform: `translateY(${distance}px) scale(${scale})` },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ], duration, delay, scale < 1 ? backOut : easeOut));
    };
    entrance('.mm-header', 200, -75, 700);
    entrance('.mm-hero-kicker', 250, 14);
    entrance('.mm-hero h1', 350, 30, 600, .94);
    entrance('.mm-hero-lead', 600, 18);
    entrance('.mm-hero .mm-button', 680, 18);
    entrance('.mm-hand', 700, 120, 750);
    entrance('.mm-device', 780, -26, 420);
    entrance('.mm-thumb', 1120, 30, 450);
    page.querySelectorAll('.mm-hero-ring path').forEach((path, index) => animate(path, [
      { strokeDasharray: '0 1', strokeDashoffset: -.5, opacity: 0 },
      { strokeDasharray: '1 1', strokeDashoffset: 0, opacity: 1 },
    ], 1200, 1350 + index * 130));
    page.querySelectorAll('.mm-float-inner').forEach((card, index) => animate(card, [
      { opacity: 0, transform: `translate(${index ? 80 : -30}px,${index ? -150 : 40}px) rotate(${index ? 14 : -12}deg) scale(.42)` },
      { opacity: 1, transform: `translate(0,0) rotate(${index ? 13 : 11}deg) scale(1)` },
    ], 1000, 1450 + index * 50, backOut));

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const block = entry.target;
        if (block.matches('.mm-feature')) {
          block.querySelectorAll('.mm-feature-art').forEach(element => animate(element, [
            { opacity: 0, transform: 'scale(.88)' }, { opacity: 1, transform: 'scale(1)' },
          ], 800, 250, backOut));
          block.querySelectorAll('.mm-feature-copy').forEach(element => animate(element, [
            { opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' },
          ], 600, 400));
          block.querySelectorAll('.mm-deco path').forEach(element => animate(element, [
            { strokeDashoffset: 1 }, { strokeDashoffset: 0 },
          ], 1900, 560));
        } else if (block.matches('.mm-heading')) {
          const label = block.querySelector('.mm-eyebrow');
          const title = block.querySelector('h2');
          if (label) animate(label, [{ opacity: 0, transform: 'translateY(100%)' }, { opacity: 1, transform: 'translateY(0)' }]);
          if (title) animate(title, [{ opacity: 0, transform: 'translateY(30px) scale(.96)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], 600, 150, backOut);
        } else {
          animate(block, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }], 700);
        }
        observer.unobserve(block);
      });
    }, { rootMargin: '0px 0px -16% 0px', threshold: 0 });
    page.querySelectorAll('.mm-heading, .mm-feature, .mm-rise').forEach(element => observer.observe(element));

    const services = page.querySelector<HTMLElement>('.mm-services');
    const storySection = page.querySelector<HTMLElement>('.mm-stories');
    const hero = page.querySelector<HTMLElement>('.mm-hero');
    const cards = [...page.querySelectorAll<HTMLElement>('.mm-service')];
    const storyCards = [...page.querySelectorAll<HTMLElement>('.mm-story')];
    const floats = [...page.querySelectorAll<HTMLElement>('.mm-float')];
    const progress = (element: HTMLElement | null) => element ? clamp(-element.getBoundingClientRect().top / Math.max(1, element.offsetHeight - innerHeight)) : 0;
    const update = (time: number) => {
      frame = 0;
      if (!active) return;
      const smooth = 1 - Math.exp(-Math.min(time - previousTime || 16, 50) / 120);
      previousTime = time;
      const shouldFan = desktop.matches && !reduced.matches;
      page.classList.toggle('mm-animate-scroll', shouldFan);
      const fanTarget = shouldFan ? progress(services) : 1;
      const storyTarget = shouldFan ? progress(storySection) : 1;
      const driftTarget = hero && !reduced.matches ? clamp(-hero.getBoundingClientRect().top / hero.offsetHeight) : 0;
      fan += (fanTarget - fan) * smooth;
      stories += (storyTarget - stories) * smooth;
      drift += (driftTarget - drift) * smooth;
      cards.forEach((card, index) => {
        if (!shouldFan) { card.style.removeProperty('transform'); return; }
        const t = clamp(fan * 2.2 - index * .45);
        const endRotation = [0, 3.89, 7.23][index];
        const startRotation = [-30, -12.11, 1.23][index];
        card.style.transform = `translate(${-61.46 * (1 - t * t)}%,${[187.45, 160.75, 134.34][index] * (1 - t) ** 2}%) rotate(${startRotation + (endRotation - startRotation) * t}deg)`;
      });
      storyCards.forEach((card, index) => {
        if (!shouldFan) { card.style.removeProperty('transform'); return; }
        const t = clamp((stories - .05) / .65);
        const e = 1 - (1 - t) ** 3;
        // Open both side cards together; hold a readable spread for the final 30%.
        const x = [-50 - 105 * e, -50 + 105 * e, -50][index];
        const y = [-58 + 8 * e, -58 + 8 * e, -50][index];
        card.style.transform = `translate(${x}%,${y}%) rotate(${[-5, 5, 0][index] * e}deg) scale(${.94 + .06 * e})`;
      });
      floats.forEach((card, index) => {
        card.style.transform = `translate(${drift * (index ? -12.94 : 3.91)}%,${drift * (index ? -29.47 : -33.75)}%) rotate(${drift * (index ? -2 : 1.6)}deg)`;
      });
      if (Math.abs(fan - fanTarget) + Math.abs(stories - storyTarget) + Math.abs(drift - driftTarget) > .0001) frame = requestAnimationFrame(update);
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    const preferenceChanged = () => {
      if (reduced.matches) animations.forEach(animation => animation.cancel());
      requestUpdate();
    };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    reduced.addEventListener('change', preferenceChanged);
    desktop.addEventListener('change', requestUpdate);
    requestUpdate();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      animations.forEach(animation => animation.cancel());
      observer.disconnect();
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      reduced.removeEventListener('change', preferenceChanged);
      desktop.removeEventListener('change', requestUpdate);
    };
  }, [root]);
}
