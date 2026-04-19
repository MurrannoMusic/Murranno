import { useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewsItem } from '@/types/news';
import { format } from 'date-fns';
import { TwoTierHeader } from '@/components/layout/TwoTierHeader';
import { useShare } from '@/hooks/useShare';

export default function NewsDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const news = location.state?.news as NewsItem | null;
  const { shareUrl } = useShare();

  const handleShare = () => {
    if (news) {
      shareUrl(
        window.location.href,
        news.title,
        news.subtitle || news.description.slice(0, 100)
      );
    }
  };

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-dark mobile-safe-bottom">
        <TwoTierHeader title="NEWS ARTICLE" backTo="/app/dashboard" />
        <div className="mobile-container pt-[120px] pb-6 text-center">
          <p className="text-muted-foreground">News article not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-dark mobile-safe-bottom">
      <TwoTierHeader 
        title="NEWS ARTICLE" 
        backTo="/app/dashboard"
        actionIcon={<Share2 className="w-4 h-4" />}
        onAction={handleShare}
      />

      <div className="mobile-container pt-[120px] pb-6 space-y-6">
        <article className="space-y-6">
          {news.image && (
            <div className="w-full aspect-video rounded-[20px] overflow-hidden border border-border">
              <img 
                src={news.image} 
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">Industry News</Badge>
              <span>•</span>
              <span>{format(news.publishedAt, 'PPP')}</span>
            </div>

            <h1 className="text-4xl font-bold text-card-foreground">{news.title}</h1>
            
            {news.subtitle && (
              <p className="text-xl font-semibold text-muted-foreground">{news.subtitle}</p>
            )}
          </div>

          <Card className="bg-card border border-border rounded-[20px] shadow-soft">
            <CardContent className="p-6">
              <div className="text-card-foreground whitespace-pre-line leading-relaxed space-y-4">
                {news.description.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              
              {news.link && (
                <div className="mt-6 pt-6 border-t border-border">
                  <a
                    href={news.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    Read Full Article
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
}
