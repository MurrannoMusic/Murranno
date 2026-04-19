import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { useClipboard } from "@/hooks/useClipboard";

export default function CampaignPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [campaignName, setCampaignName] = useState('');
  const reference = searchParams.get('reference');
  const { copyPaymentReference } = useClipboard();

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      return;
    }

    verifyPayment();
  }, [reference]);

  const verifyPayment = async () => {
    try {
      // Poll campaign status from database (webhook will update it)
      let attempts = 0;
      const maxAttempts = 20; // 60 seconds total (20 attempts * 3 seconds)
      
      const pollInterval = setInterval(async () => {
        attempts++;
        
        try {
          // Get campaign ID from reference by querying campaigns
          const { data: campaigns, error: searchError } = await supabase
            .from('campaigns')
            .select('id, name, status, payment_status')
            .eq('payment_reference', reference)
            .maybeSingle();

          if (searchError) {
            console.error('Error fetching campaign:', searchError);
            return;
          }

          if (!campaigns) {
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval);
              setStatus('failed');
              toast.error('Payment verification timed out. Please contact support if payment was deducted.');
            }
            return;
          }

          // Check if payment was successful
          if (campaigns.payment_status === 'paid') {
            clearInterval(pollInterval);
            setCampaignName(campaigns.name);
            setStatus('success');
            toast.success('Payment successful! Your campaign is now under review.');
          } else if (campaigns.payment_status === 'failed') {
            clearInterval(pollInterval);
            setStatus('failed');
            toast.error('Payment failed. Please try again.');
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setStatus('failed');
            toast.error('Payment verification timed out. Please contact support if payment was deducted.');
          }
        } catch (pollError) {
          console.error('Error polling campaign status:', pollError);
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setStatus('failed');
            toast.error('Error verifying payment. Please contact support.');
          }
        }
      }, 3000); // Poll every 3 seconds
      
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      toast.error('Failed to verify payment. Please contact support.');
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Campaign Payment" />

      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full p-8">
          {status === 'verifying' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
              <h2 className="text-2xl font-semibold">Verifying Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-6">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Payment Successful!</h2>
                <p className="text-muted-foreground">
                  Your campaign "{campaignName}" has been paid and is now under review by our team.
                </p>
                {reference && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <p className="text-xs text-muted-foreground font-mono">
                      Ref: {reference.slice(0, 16)}...
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPaymentReference(reference)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => navigate('/app/campaign-manager')}
                  className="w-full"
                >
                  View My Campaigns
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/app/promotions')}
                  className="w-full"
                >
                  Create Another Campaign
                </Button>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center space-y-6">
              <XCircle className="h-16 w-16 mx-auto text-destructive" />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Payment Failed</h2>
                <p className="text-muted-foreground">
                  We couldn't verify your payment. Please try again or contact support if the issue persists.
                </p>
              </div>
              <div className="space-y-3 pt-4">
                <Button
                  onClick={() => navigate('/app/promotions')}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/app/campaign-manager')}
                  className="w-full"
                >
                  View My Campaigns
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
