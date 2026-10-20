import { useNavigate } from "react-router-dom";
import { Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PageTitle } from "@/components/layout/PagePrimitives";

// Same rule the API enforces for music submission and withdrawals: kyc_status must be 'verified'.
export const KYCProtected = ({ children }: { children: React.ReactNode }) => {
    const { profile, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return null;
    if (profile?.kyc_status === 'verified') return <>{children}</>;

    const status = profile?.kyc_status;
    const Icon = status === 'pending' ? Clock : ShieldAlert;
    const copy = status === 'pending'
        ? { title: 'Verification pending', body: "We're reviewing your documents. You can upload music as soon as you're verified.", cta: 'View verification' }
        : status === 'rejected'
            ? { title: 'Verification failed', body: 'Your verification was rejected. Review your details and submit again.', cta: 'Resubmit verification' }
            : { title: 'Verify your identity', body: 'Verify your ID before sending music to streaming stores or withdrawing earnings.', cta: 'Start verification' };

    return (
        <div className="px-6 pb-10 space-y-6">
            <PageTitle>New release</PageTitle>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <span className="h-12 w-12 rounded-full bg-warning/15 text-warning grid place-items-center">
                    <Icon className="h-6 w-6" />
                </span>
                <div className="space-y-1.5">
                    <h2 className="text-xl font-semibold">{copy.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{copy.body}</p>
                </div>
                <Button size="lg" className="w-full font-semibold" onClick={() => navigate('/app/kyc')}>{copy.cta}</Button>
            </div>
        </div>
    );
};
