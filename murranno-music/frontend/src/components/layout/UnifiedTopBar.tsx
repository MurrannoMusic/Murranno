import { Link } from 'react-router-dom';
import mmLogo from "@/assets/mm_logo.png";
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { useCurrency } from '@/contexts/CurrencyContext';

export const UnifiedTopBar = () => {
    const { currency, setCurrency } = useCurrency();

    return (
        <div className="bg-gradient-dark backdrop-blur-xl p-4 text-foreground mobile-safe-top sticky top-0 z-50">
            <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center">
                    <img src={mmLogo} alt="Murranno Music" className="h-8" />
                </Link>

                <div className="flex-1 flex justify-center">
                    <div className="bg-secondary/30 rounded-full p-1 flex items-center border border-white/10">
                        <button
                            onClick={() => setCurrency('NGN')}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${currency === 'NGN' ? 'bg-primary text-black shadow-glow' : 'text-muted-foreground'}`}
                        >
                            NGN
                        </button>
                        <button
                            onClick={() => setCurrency('USD')}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${currency === 'USD' ? 'bg-primary text-black shadow-glow' : 'text-muted-foreground'}`}
                        >
                            USD
                        </button>
                    </div>
                </div>

                <AvatarDropdown />
            </div>
        </div>
    );
};
