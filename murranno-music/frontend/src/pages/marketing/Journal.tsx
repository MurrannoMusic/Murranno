import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Newspaper } from 'lucide-react';
import { CtaBand, MarketingLayout, PageHero } from '@/components/marketing/MarketingLayout';
import { canonicalUrl } from '@/components/marketing/seo';
import { formatDate, JOURNAL, JOURNAL_CATEGORIES, type JournalPost } from '@/content/journal';

const JOURNAL_LIST = [{ '@type': 'ItemList', name: 'The Music Journal', itemListElement: JOURNAL.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: canonicalUrl(`/journal/${p.slug}`), name: p.title })) }];

function PostCard({ post }: { post: JournalPost }) {
  return <article className="mm-post mm-rise">
    <Link to={`/journal/${post.slug}`} className="mm-post-image" tabIndex={-1} aria-hidden>{post.image && <img src={post.image} alt="" loading="lazy" />}</Link>
    <p className="mm-eyebrow">{post.category}</p>
    <h3><Link to={`/journal/${post.slug}`}>{post.title}</Link></h3>
    <p>{post.excerpt}</p>
    <div className="mm-post-meta"><span>{formatDate(post.published)}</span><span>{post.minutes} min read</span></div>
  </article>;
}

export default function Journal() {
  const [category, setCategory] = useState<string | null>(null);
  const [featured, ...rest] = JOURNAL;
  const list = category ? JOURNAL.filter((p) => p.category === category) : rest;

  return <MarketingLayout title="The Music Journal, Murranno Music" jsonLd={JOURNAL_LIST}>
    <PageHero
      tone="lilac"
      kicker={<><span><BookOpen size={15} /><Newspaper size={15} /></span> FROM THE MUSIC JOURNAL</>}
      title={<>STORIES FOR THE ARTISTS<br />MAKING THEIR NEXT MOVE.</>}
      lead="Songwriting craft, fan-building ideas, culture and news from the African music industry, written for artists who are building something."
    />

    <section className="mm-section mm-container" aria-labelledby="mm-featured">
      <h2 id="mm-featured" className="mm-sr-only">Featured story</h2>
      <article className="mm-featured-post mm-rise">
        <Link to={`/journal/${featured.slug}`} tabIndex={-1} aria-hidden>{featured.image && <img src={featured.image} alt="" />}</Link>
        <div>
          <p className="mm-eyebrow">LATEST · {featured.category}</p>
          <h2><Link to={`/journal/${featured.slug}`}>{featured.title}</Link></h2>
          <p className="mm-body">{featured.excerpt}</p>
          <div className="mm-post-meta" style={{ margin: '18px 0 24px' }}><span>{featured.author}</span><span>{formatDate(featured.published)}</span><span>{featured.minutes} min read</span></div>
          <Link to={`/journal/${featured.slug}`} className="mm-read">Read the story <ArrowUpRight size={16} /></Link>
        </div>
      </article>
    </section>

    <section className="mm-section mm-section-tight mm-container" aria-labelledby="mm-all">
      <div className="mm-heading"><p className="mm-eyebrow">ALL STORIES</p><h2 id="mm-all">READ, LEARN,<br /><span className="mm-purple-text">GO FURTHER.</span></h2></div>
      <div className="mm-filter" role="group" aria-label="Filter stories by topic">
        <button type="button" aria-pressed={category === null} onClick={() => setCategory(null)}>All topics</button>
        {JOURNAL_CATEGORIES.map((c) => <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}>{c}</button>)}
      </div>
      <div className="mm-posts">{list.map((p) => <PostCard key={p.slug} post={p} />)}</div>
    </section>

    <CtaBand eyebrow="WRITE THE NEXT CHAPTER" title={<>READ IT.<br />THEN RELEASE IT.</>} body="Put what you learn to work. Distribute your next song to 150+ stores with Murranno Music." to="/signup" label="START YOUR RELEASE" />
  </MarketingLayout>;
}

export { PostCard };
