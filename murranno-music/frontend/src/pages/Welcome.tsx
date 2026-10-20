import { useNavigate } from 'react-router-dom';
import { AppOnboarding } from '@/components/mobile/AppOnboarding';

export const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Default to 'artist' tier for direct signup
    navigate('/signup', { state: { tier: 'artist' } });
  };

  return <AppOnboarding onComplete={handleGetStarted} />;
};
