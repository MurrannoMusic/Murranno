import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { NewsItem } from '@/types/news';
import { format } from 'date-fns';

interface NewsDialogProps {
  news: NewsItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewsDialog = ({ news, open, onOpenChange }: NewsDialogProps) => {
  if (!news) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{news.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {format(news.publishedAt, 'PPP')}
          </DialogDescription>
        </DialogHeader>
        
        {news.image && (
          <div className="w-full h-64 rounded-lg overflow-hidden my-4">
            <img 
              src={news.image} 
              alt={news.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="space-y-4">
          <p className="text-lg font-semibold text-foreground">{news.subtitle}</p>
          <div className="text-muted-foreground whitespace-pre-line">
            {news.description}
          </div>
          
          {news.link && (
            <a
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:underline font-medium"
            >
              Learn More →
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
