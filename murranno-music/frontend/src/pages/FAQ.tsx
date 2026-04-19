import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FAQ = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: 'How do I distribute my music?',
      answer: 'Upload your tracks through the Releases page, fill in the required metadata, and submit for review. Once approved, your music will be distributed to major streaming platforms.'
    },
    {
      question: 'What are the payment terms?',
      answer: 'Earnings are calculated based on streams and sales. Payments are processed monthly, with a minimum payout threshold of ₦5,000. You can track your earnings in the Wallet section.'
    },
    {
      question: 'How long does distribution take?',
      answer: 'After approval, distribution to streaming platforms typically takes 3-7 business days. Some platforms may take longer during peak periods.'
    },
    {
      question: 'Can I edit my release after submission?',
      answer: 'Yes, you can edit releases that are in Draft status. Once submitted or live, major changes require creating a new release to maintain platform consistency.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'We accept WAV and FLAC files for audio (minimum 44.1kHz, 16-bit). Cover art should be JPEG or PNG format, at least 3000x3000 pixels.'
    },
    {
      question: 'How do promotion campaigns work?',
      answer: 'Browse our Promotions marketplace, select services or bundles, and checkout. Our team will review your campaign and begin execution within 24-48 hours.'
    },
    {
      question: 'What happens to my rights?',
      answer: 'You retain 100% of your rights. We only receive distribution rights to place your music on streaming platforms. You can terminate at any time.'
    },
    {
      question: 'How do I withdraw my earnings?',
      answer: 'Set up a payout method in your Wallet, then request a withdrawal once you meet the minimum threshold. Funds are typically processed within 3-5 business days.'
    },
    {
      question: 'Can labels manage multiple artists?',
      answer: 'Yes, Label accounts can add and manage multiple artists, view consolidated analytics, and manage revenue splits for each artist.'
    },
    {
      question: 'What analytics are provided?',
      answer: 'Track streams, listeners, geography, platform performance, and revenue in real-time through our Analytics dashboard. Data is updated daily.'
    }
  ];

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

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-sm text-muted-foreground">
            Find answers to common questions about using Murranno Music
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
              <AccordionTrigger className="text-left hover:no-underline py-3">
                <span className="font-semibold text-sm">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground pb-3">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold text-sm mb-1">Still have questions?</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Button size="sm" onClick={() => navigate('/support')}>
            Contact Support
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};
