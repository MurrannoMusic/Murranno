import { Badge } from "@/components/ui/badge";

interface FeatureBadgeProps {
  text: string;
}

export const FeatureBadge = ({ text }: FeatureBadgeProps) => {
  return (
    <Badge className="px-4 py-2 text-sm bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">
      {text}
    </Badge>
  );
};
