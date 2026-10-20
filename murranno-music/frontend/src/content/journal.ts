import posts from './journal.json';

export interface JournalBlock { type: 'p' | 'h2' | 'h3' | 'li' | 'blockquote'; text: string }
export interface JournalPost {
  slug: string;
  title: string;
  excerpt: string;
  published: string;
  author: string;
  category: string;
  image: string | null;
  minutes: number;
  source: string | null;
  blocks: JournalBlock[];
}

/** Articles migrated from the WordPress blog at murrannomusic.co/read-music, newest first. */
export const JOURNAL = posts as JournalPost[];
export const JOURNAL_CATEGORIES = [...new Set(JOURNAL.map((p) => p.category))];
export const formatDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
