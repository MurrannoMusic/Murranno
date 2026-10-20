import { Link } from 'react-router-dom';
import mmLogo from "@/assets/mm_logo.png";
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';

export const UnifiedTopBar = () => {
    const { currency, setCurrency } = useCurrency();

    return (
        <header className="bg-background/95 backdrop-blur text-foreground mobile-safe-top lg:pt-4 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-3 px-6 pb-4 max-w-3xl mx-auto">
                <Link to="/app" className="flex items-center lg:invisible">
                    <img src={mmLogo} alt="Murranno Music" className="h-9" />
                </Link>

                <div className="flex items-center gap-3">
                    <div role="group" aria-label="Currency" className="flex rounded-lg border border-border p-0.5">
                        {(['NGN', 'USD'] as const).map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={currency === value}
                                onClick={() => setCurrency(value)}
                                className={cn(
                                    'px-2.5 h-9 rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    currency === value ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                    <AvatarDropdown />
                </div>
            </div>
        </header>
    );
};
