import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 h-9 px-4 hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to previous page
        </Button>

        <div className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Effective Date: April 22, 2026 | Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none space-y-10">
          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">1. Introduction</h2>
            <p className="leading-relaxed">
              Murranno Music ("we," "us," or "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy describes how we collect, use, and share information in connection with your use of our music distribution platform, website, and mobile applications (collectively, the "Services").
            </p>
            <p className="mt-2 leading-relaxed">
              By using our Services, you consent to the data practices described in this policy. If you do not agree with these practices, please do not access or use our Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">A. Information You Provide</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Account Information:</strong> Name, email address, password, phone number, and profile picture.</li>
                  <li><strong>Artist & Label Data:</strong> Stage names, artist biographies, social media handles, and label names.</li>
                  <li><strong>Music & Content:</strong> Audio files, artwork, lyrics, and metadata (titles, credits, ISRC/UPC codes) you upload for distribution.</li>
                  <li><strong>Financial Information:</strong> Bank account details, Tax ID, and payout preferences required to process your earnings.</li>
                  <li><strong>Identity Verification:</strong> We may collect government-issued ID or other documentation for KYC (Know Your Customer) compliance.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">B. Automatically Collected Information</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform, and interaction with emails.</li>
                  <li><strong>Technical Data:</strong> IP address, device type, operating system, browser version, and unique device identifiers.</li>
                  <li><strong>Location Data:</strong> General location based on your IP address.</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">3. How We Use Your Information</h2>
            <p>We use the collected data for the following purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Service Delivery:</strong> To distribute your music to Digital Service Providers (DSPs) like Spotify, Apple Music, and others.</li>
              <li><strong>Analytics & Reporting:</strong> To provide you with streaming data, sales reports, and audience insights.</li>
              <li><strong>Payouts:</strong> To calculate and process your earnings and royalties.</li>
              <li><strong>Communication:</strong> To send release status updates, earnings alerts, security notices, and platform announcements.</li>
              <li><strong>Compliance & Safety:</strong> To prevent fraud, copyright infringement, and ensure compliance with our Terms of Service and applicable laws.</li>
              <li><strong>Improvement:</strong> To analyze platform performance and develop new features for our users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">4. Legal Basis for Processing</h2>
            <p>We process your data under the following legal frameworks (including NDPA, GDPR, and other local laws):</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Contractual Necessity:</strong> To fulfill our agreement to distribute your music and pay royalties.</li>
              <li><strong>Legitimate Interests:</strong> For fraud prevention, platform security, and business analytics.</li>
              <li><strong>Consent:</strong> Where you have specifically agreed to certain data uses (e.g., marketing).</li>
              <li><strong>Legal Obligation:</strong> To comply with tax reporting and anti-money laundering regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">5. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Digital Service Providers (DSPs):</strong> We share music, metadata, and artist info with platforms like Spotify, Apple Music, Amazon Music, etc., to make your content available to listeners.</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist with cloud hosting (Supabase/AWS), email delivery, and identity verification.</li>
              <li><strong>Financial Institutions:</strong> Payment processors to facilitate your royalty payouts.</li>
              <li><strong>Legal Authorities:</strong> If required by law, subpoena, or to protect our rights and the safety of our users.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">6. Data Security and Retention</h2>
            <p>
              We implement industry-standard security measures, including SSL encryption and secure database protocols, to protect your data. We retain your personal information for as long as your account is active or as needed to provide you Services. We also retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">7. Your Privacy Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Update or fix inaccurate information in your profile.</li>
              <li><strong>Deletion:</strong> Request that we delete your account and associated personal data (subject to legal retention requirements).</li>
              <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
              <li><strong>Objection:</strong> Object to the processing of your data for specific purposes like direct marketing.</li>
            </ul>
            <p className="mt-4">To exercise these rights, please contact us at <a href="mailto:privacy@murrannomusic.co" className="text-primary hover:underline">privacy@murrannomusic.co</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">8. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to remember your preferences, keep you logged in, and analyze platform traffic. You can manage your cookie preferences through your browser settings. Note that disabling cookies may affect the functionality of certain platform features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">9. Children's Privacy</h2>
            <p>
              Murranno Music is not intended for individuals under the age of 18 (or the age of majority in your jurisdiction). We do not knowingly collect personal data from children. If we become aware that a child has provided us with personal data, we will take steps to delete such information and terminate the account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and maintained on computers located outside of your state, province, or country where data protection laws may differ. By using Murranno Music, you consent to the transfer of your data to countries where our servers and service providers are located.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of any material changes by posting the new policy on this page and sending an email notification or displaying a notice within the app.
            </p>
          </section>

          <section className="bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">12. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact our Data Protection Officer at:</p>
            <div className="mt-4 space-y-1">
              <p><strong>Email:</strong> privacy@murrannomusic.co</p>
              <p><strong>Address:</strong> Murranno Music Headquarters, Lagos, Nigeria</p>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
};

