import { Wallet, Share2, Music, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActionBar = () => {
    const actions = [
        {
            icon: Wallet,
            label: 'Withdraw',
            path: '/app/earnings',
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10'
        },
        {
            icon: Share2,
            label: 'Smart Link',
            path: '/app/tools/smart-link',
            color: 'text-blue-400',
            bg: 'bg-blue-400/10'
        },
        {
            icon: Music,
            label: 'Pitch',
            path: '/app/tools/pitch',
            color: 'text-purple-400',
            bg: 'bg-purple-400/10'
        },
        {
            icon: Zap,
            label: 'Promote',
            path: '/app/promotions',
            color: 'text-amber-400',
            bg: 'bg-amber-400/10'
        }
    ];

    return (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {actions.map((action, index) => (
                <Link key={index} to={action.path} className="flex flex-col items-center min-w-[72px]">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${action.bg} border border-white/5`}>
                        <action.icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{action.label}</span>
                </Link>
            ))}
        </div>
    );
};
