import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";

interface KYCProtectedProps {
    children: React.ReactNode;
    requiredTier?: number;
}

export const KYCProtected = ({ children, requiredTier = 2 }: KYCProtectedProps) => {
    const { profile, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return null; // Or a spinner
    }

    // Check if profile exists and meets tier requirements
    // Tier 1 = Basic (Signup)
    // Tier 2 = Verified ID
    const isVerified = profile?.kyc_tier && profile.kyc_tier >= requiredTier;

    // Additional check for specific status if needed, but tier should act as the gate
    // Ideally, 'verified' status sets the tier to 2.
    const isRejected = profile?.kyc_status === 'rejected';

    if (!isVerified) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-t-4 border-t-yellow-500">
                    <div className="mx-auto w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-10 h-10 text-yellow-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Verification Required</h2>
                        <p className="text-muted-foreground">
                            {isRejected
                                ? "Your verification was rejected. Please review your details and try again."
                                : "To access this feature (Uploads & Transactions), you need to verify your identity."}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            size="lg"
                            className="w-full font-semibold"
                            onClick={() => navigate('/app/kyc')}
                        >
                            {isRejected ? "Resubmit Verification" : "Complete KYC Verification"}
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
};
