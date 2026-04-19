import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, MessageSquare, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserTicketsList } from '@/components/support/UserTicketsList';

export const Support = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("submit");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const { error } = await import('@/integrations/supabase/client').then(m => m.supabase)
        .from('support_tickets')
        .insert({
          subject: formData.subject,
          message: formData.message,
          category: formData.category,
          status: 'open'
        });

      if (error) throw error;

      toast.success('Support request submitted! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', category: '', subject: '', message: '' });
      setActiveTab("tickets"); // Switch to tickets tab after submission
    } catch (error: any) {
      console.error('Support error:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold mb-2">Contact Support</h1>
          <p className="text-sm text-muted-foreground">
            Have a question or need help? We're here to assist you.
          </p>
        </div>

        <Tabs defaultValue="submit" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="submit">Submit Request</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <Card className="shadow-none border-border/50">
                <CardHeader className="p-4">
                  <Mail className="h-5 w-5 mb-1 text-primary" />
                  <CardTitle className="text-sm">Email Support</CardTitle>
                  <CardDescription className="text-xs">support@murrannomusic.com</CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-none border-border/50">
                <CardHeader className="p-4">
                  <MessageSquare className="h-5 w-5 mb-1 text-primary" />
                  <CardTitle className="text-sm">Response Time</CardTitle>
                  <CardDescription className="text-xs">Within 24 hours</CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-none border-border/50">
                <CardHeader className="p-4">
                  <MessageSquare className="h-5 w-5 mb-1 text-primary" />
                  <CardTitle className="text-sm">Live Chat</CardTitle>
                  <CardDescription className="text-xs">Coming Soon</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="shadow-none border-border/50">
              <CardHeader className="p-4">
                <CardTitle className="text-base">Submit a Support Request</CardTitle>
                <CardDescription className="text-xs">
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={loading}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={loading}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing & Payments</SelectItem>
                        <SelectItem value="distribution">Distribution</SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                        <SelectItem value="account">Account Management</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      disabled={loading}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      disabled={loading}
                      className="text-sm min-h-[100px]"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-9">
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  My Support Tickets
                </h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('submit')}>
                  New Ticket
                </Button>
              </div>
              <UserTicketsList />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

