import { StreamingPlatformCard } from './StreamingPlatformCard';

interface SocialLinkCardProps {
  name: string;
  icon: React.ReactNode;
  url: string | null;
  onUpdate: (url: string | null) => void;
  isEditing: boolean;
  placeholder: string;
}

export const SocialLinkCard = (props: SocialLinkCardProps) => {
  return <StreamingPlatformCard {...props} type="social" />;
};
