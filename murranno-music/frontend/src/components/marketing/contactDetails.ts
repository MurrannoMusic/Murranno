// Shared by the marketing layout and the SEO structured data (kept separate to avoid an import cycle).
export const CONTACT_DETAILS = {
  email: 'support@murrannomusic.co',
  phone: '+234 818 939 1868',
  phoneHref: 'tel:+2348189391868',
  whatsapp: 'https://wa.link/h06t3i',
  address: '100 Kujore Street, Ojota, Lagos 105102, Nigeria',
  mapHref: 'https://www.google.com/maps/search/?api=1&query=100+Kujore+Street+Ojota+Lagos',
};

export const SOCIAL = [
  { href: 'https://instagram.com/murranno.music', label: 'Instagram', platform: 'instagram' },
  { href: 'https://x.com/murrannomusic', label: 'X / Twitter', platform: 'x' },
  { href: 'https://www.linkedin.com/company/murranno-music/', label: 'LinkedIn', platform: 'linkedin' },
  { href: 'https://web.facebook.com/profile.php?id=61567055573825', label: 'Facebook', platform: 'facebook' },
  { href: 'https://www.youtube.com/@murrannomusic', label: 'YouTube', platform: 'youtube' },
] as const;

export const SOCIAL_LINKS = SOCIAL.map((s) => s.href);
