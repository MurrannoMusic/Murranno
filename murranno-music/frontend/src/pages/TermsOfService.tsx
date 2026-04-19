import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto py-4 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 h-8 px-2"
        >
          <ArrowLeft className="mr-2 h-3.5 w-3.5" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>

        <div className="prose prose-sm prose-gray dark:prose-invert max-w-none space-y-4">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              By accessing and using Murranno Music's services, you accept and agree to be bound by
              these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Account Registration</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              You must create an account to use our services. You are responsible for maintaining the
              confidentiality of your account credentials and for all activities under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Music Distribution</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We distribute your music to major streaming platforms and digital stores. You retain all
              ownership rights to your content. We only receive distribution rights necessary to
              provide our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Payment Terms</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Earnings are calculated based on streams and sales reported by streaming platforms.
              Payments are processed monthly with a minimum payout threshold of ₦5,000. Payment
              processing may take 3-5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Content Requirements</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              All uploaded content must be original or properly licensed. You warrant that you have
              all necessary rights to distribute the content. Content must not violate any laws or
              third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Prohibited Activities</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              You may not use our services to upload infringing content, engage in fraudulent activities,
              manipulate streaming numbers, or violate any applicable laws. Violations may result in
              account termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Service Fees</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We charge a platform fee as specified in your subscription plan. Additional services
              such as promotional campaigns have separate fees clearly displayed at purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Termination</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Either party may terminate this agreement at any time. Upon termination, your content
              will be removed from distribution within 30 days. Outstanding payments will be processed
              according to normal schedules.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Limitation of Liability</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Murranno Music is not liable for any indirect, incidental, or consequential damages
              arising from your use of our services. Our total liability is limited to the amount
              paid by you in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">10. Changes to Terms</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We may modify these terms at any time. Continued use of our services after changes
              constitutes acceptance of the new terms. We will notify you of significant changes
              via email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">11. Governing Law</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              These terms are governed by Nigerian law. Any disputes will be resolved in Nigerian
              courts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">12. Contact Information</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              For questions about these terms, contact us at legal@murrannomusic.com
            </p>
          </section>

          <p className="text-[10px] text-muted-foreground mt-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </PageContainer>
  );
};
