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
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FieldError } from '@/components/forms/FieldError';
import { SuccessState, friendlyError } from '@/components/states/StateViews';
import { email, fieldA11y, minLength, required, validate } from '@/lib/validation';
import { UserTicketsList } from '@/components/support/UserTicketsList';

export const Support = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("submit");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData | 'form', string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const set = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found = validate(formData, {
      name: [required('your name')],
      email: [email],
      category: [(v) => (v ? '' : 'Choose a category')],
      subject: [required('a subject'), minLength(4, 'Subject')],
      message: [required('your message'), minLength(20, 'Message')],
    });
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('support_tickets' as never).insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        category: formData.category,
      } as never);

      if (error) throw error;

      setFormData({ name: '', email: '', category: '', subject: '', message: '' });
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
    } catch (error) {
      console.error('Support error:', error);
      setErrors({ form: friendlyError(error).message });
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
                  <CardDescription className="text-xs">support@murrannomusic.co</CardDescription>
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

            {submitted ? (
              <Card className="shadow-none border-border/50">
                <SuccessState
                  title="Request sent"
                  body="Thanks for reaching out. Our team replies within 24 hours, by email and under My Tickets."
                  action={{ label: 'View my tickets', onClick: () => { setSubmitted(false); setActiveTab('tickets'); } }}
                  secondary={{ label: 'Send another', onClick: () => setSubmitted(false) }}
                />
              </Card>
            ) : (
            <Card className="shadow-none border-border/50">
              <CardHeader className="p-4">
                <CardTitle className="text-base">Submit a Support Request</CardTitle>
                <CardDescription className="text-xs">
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => set('name', e.target.value)}
                        {...fieldA11y('name', errors.name)}
                        disabled={loading}
                        className="h-9 text-sm"
                      />
                      <FieldError id="name" error={errors.name} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => set('email', e.target.value)}
                        {...fieldA11y('email', errors.email)}
                        disabled={loading}
                        className="h-9 text-sm"
                      />
                      <FieldError id="email" error={errors.email} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => set('category', value)}
                      disabled={loading}
                    >
                      <SelectTrigger id="category" className="h-9 text-sm" {...fieldA11y('category', errors.category)}>
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
                    <FieldError id="category" error={errors.category} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => set('subject', e.target.value)}
                        {...fieldA11y('subject', errors.subject)}
                      disabled={loading}
                      className="h-9 text-sm"
                    />
                    <FieldError id="subject" error={errors.subject} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-xs">Message</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => set('message', e.target.value)}
                      {...fieldA11y('message', errors.message)}
                      disabled={loading}
                      className="text-sm min-h-[100px]"
                    />
                    <FieldError id="message" error={errors.message} />
                  </div>

                  {errors.form && <p role="alert" className="text-sm text-destructive">{errors.form}</p>}

                  <Button type="submit" disabled={loading} className="w-full h-9">
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            )}
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

