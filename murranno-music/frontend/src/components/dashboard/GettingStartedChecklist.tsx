import { CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useReleases } from '@/hooks/useReleases';

export const GettingStartedChecklist = () => {
    const { profile } = useAuth();
    const { releases } = useReleases();

    const isProfileComplete = !!(profile?.full_name && profile?.phone_number);
    // Rough check for "Link Social Accounts" - assuming if key fields are there, they might have done some settings. 
    // Ideally we check a specific table, but checking if profile updated_at is different from created_at is a weak proxy, 
    // or just checking if they have verified email. Let's stick to a placeholder "false" or check something else if possible.
    // For now, let's assume if they have an ID document url, they are more verified.
    const isSocialsLinked = false; // TODO: Implement social account linking check
    const hasUploadedTrack = releases.length > 0;

    const steps = [
        { label: "Complete Profile", done: isProfileComplete, path: "/app/profile" },
        { label: "Link Social Accounts", done: isSocialsLinked, path: "/app/settings" },
        { label: "Upload First Track", done: hasUploadedTrack, path: "/app/upload" },
    ];

    // If all done, hide? Or just show completed state.
    // Let's show it until all are done, then maybe replace with "All Set!" or hide.
    if (steps.every(s => s.done)) return null;

    return (
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <h3 className="text-sm font-semibold mb-3">Getting Started</h3>
            <div className="space-y-3">
                {steps.map((step, index) => (
                    <Link key={index} to={step.path} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            {step.done ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                            <span className={`text-sm ${step.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {step.label}
                            </span>
                        </div>
                        {!step.done && (
                            <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                Start
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
};
