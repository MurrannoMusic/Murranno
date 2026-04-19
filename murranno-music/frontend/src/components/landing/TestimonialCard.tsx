import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
}

export const TestimonialCard = ({ quote, author }: TestimonialCardProps) => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <Quote className="h-8 w-8 text-primary mb-4" />
        <p className="text-muted-foreground mb-4 line-clamp-4">
          {quote}
        </p>
        <p className="font-semibold text-foreground">{author}</p>
      </CardContent>
    </Card>
  );
};
