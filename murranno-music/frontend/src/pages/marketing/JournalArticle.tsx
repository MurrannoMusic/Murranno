import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CtaBand, MarketingLayout } from '@/components/marketing/MarketingLayout';
import { formatDate, JOURNAL } from '@/content/journal';
import { PostCard } from './Journal';
import { canonicalUrl, SITE_URL } from '@/components/marketing/seo';

// Paragraph text may contain bare URLs (e.g. "visit https://www.wmg.com/fund"); link them safely.
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return <>{parts.map((part, i) => (/^https?:\/\//.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : part))}</>;
}

export default function JournalArticle() {
  const { slug } = useParams();
  const post = JOURNAL.find((p) => p.slug === slug);
  if (!post) return <Navigate to="/journal" replace />;
  const related = JOURNAL.filter((p) => p.slug !== post.slug && p.category === post.category).concat(JOURNAL.filter((p) => p.slug !== post.slug && p.category !== post.category)).slice(0, 3);

  // Consecutive list items render as one list.
  const body: JSX.Element[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) body.push(<ul key={`ul-${body.length}`}>{list.map((t, i) => <li key={i}><Linkified text={t} /></li>)}</ul>); list = []; };
  post.blocks.forEach((b, i) => {
    if (b.type === 'li') { list.push(b.text); return; }
    flush();
    if (b.type === 'h2') body.push(<h2 key={i}>{b.text}</h2>);
    else if (b.type === 'h3') body.push(<h3 key={i}>{b.text}</h3>);
    else if (b.type === 'blockquote') body.push(<blockquote key={i}><Linkified text={b.text} /></blockquote>);
    else body.push(<p key={i}><Linkified text={b.text} /></p>);
  });
  flush();

  const url = canonicalUrl(`/journal/${post.slug}`);
  const seo = { title: `${post.title} | The Music Journal, Murranno Music`, description: post.excerpt, image: post.image ?? undefined, type: 'article' as const, keywords: [post.category, 'Nigerian music', 'independent artists', 'music journal'] };
  const article = [{
    '@type': 'BlogPosting', headline: post.title, description: post.excerpt, url, mainEntityOfPage: url, inLanguage: 'en-NG',
    datePublished: post.published, dateModified: post.published, articleSection: post.category,
    image: post.image ? `${SITE_URL}${post.image}` : undefined, author: { '@type': 'Person', name: post.author },
    publisher: { '@id': `${SITE_URL}/#organization` }, ...(post.source ? { isBasedOn: post.source } : {}),
  }];
  return <MarketingLayout title={`${post.title}, Murranno Music`} seo={seo} jsonLd={article}>
    <article>
      <div className="mm-page-hero"><div className="mm-page-hero-panel" style={{ paddingBottom: 'clamp(40px,4vw,70px)' }}>
        <div className="mm-article-hero">
          <Link to="/journal" className="mm-back"><ArrowLeft size={16} /> The Music Journal</Link>
          <p className="mm-eyebrow" style={{ marginTop: 28 }}>{post.category}</p>
          <h1>{post.title}</h1>
          <div className="mm-post-meta"><span>By {post.author}</span><span>{formatDate(post.published)}</span><span>{post.minutes} min read</span></div>
        </div>
      </div></div>
      <div className="mm-container">
        {post.image && <img className="mm-article-cover" src={post.image} alt="" />}
        <div className="mm-prose">
          {body}
          {post.source && <p className="mm-source">Originally published by {post.source}.</p>}
        </div>
      </div>
    </article>

    <section className="mm-section mm-container" aria-labelledby="mm-related">
      <div className="mm-heading"><p className="mm-eyebrow">KEEP READING</p><h2 id="mm-related">MORE FROM<br /><span className="mm-purple-text">THE JOURNAL.</span></h2></div>
      <div className="mm-posts">{related.map((p) => <PostCard key={p.slug} post={p} />)}</div>
    </section>

    <CtaBand eyebrow="YOUR NEXT MOVE" title={<>MADE SOMETHING<br />WORTH HEARING?</>} body="Release it to Spotify, Apple Music, Boomplay, TikTok and 150+ more stores with Murranno Music." to="/distribution" label="DISTRIBUTE YOUR MUSIC" />
  </MarketingLayout>;
}
