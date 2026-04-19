import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy = () => {
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

        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>

        <div className="prose prose-sm prose-gray dark:prose-invert max-w-none space-y-4">
          <section>
            <h2 className="text-lg font-semibold mb-2">1. Information We Collect</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We collect information you provide directly to us, including your name, email address,
              payment information, and any music or content you upload to our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. How We Use Your Information</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services,
              process transactions, send you technical notices and support messages, and communicate
              with you about products, services, and events.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Information Sharing</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We do not sell your personal information. We may share your information with third-party
              service providers who perform services on our behalf, such as payment processing and
              music distribution to streaming platforms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. Data Security</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We take reasonable measures to protect your information from unauthorized access,
              alteration, disclosure, or destruction. However, no internet transmission is ever
              completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Cookies and Tracking</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We use cookies and similar tracking technologies to collect information about your
              browsing activities. You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Your Rights</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              You have the right to access, update, or delete your personal information. You can
              do this through your account settings or by contacting us directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Children's Privacy</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Changes to This Policy</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any
              changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Contact Us</h2>
            <p className="text-muted-foreground text-xs leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at
              privacy@murrannomusic.com
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
