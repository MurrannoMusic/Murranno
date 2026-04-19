export interface NewsItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  publishedAt: Date;
  image?: string;
  link?: string;
}
