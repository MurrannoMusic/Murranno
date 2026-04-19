import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

export default function AdminEmailer() {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [audience, setAudience] = useState('all');

    const sendEmailMutation = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.functions.invoke('send-batch-email', {
                body: { subject, body, audience }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success('Batch email queued successfully');
            setSubject('');
            setBody('');
        },
        onError: (err: any) => {
            // Since we don't have the edge function deployed yet, this will likely fail locally 
            // or on prod if not set up. We'll handle it gracefully.
            toast.error(`Failed to send: ${err.message}`);
            console.error(err);
        }
    });

    return (
        <AdminLayout>
            <div className="p-6 space-y-6 max-w-4xl mx-auto">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Batch Emailer</h2>
                    <p className="text-muted-foreground">Send updates or newsletters to users</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Compose Email</CardTitle>
                        <CardDescription>Emails are sent via Resend.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Audience</Label>
                            <Select value={audience} onValueChange={setAudience}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select audience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="artists">Artists Only</SelectItem>
                                    <SelectItem value="labels">Labels Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Subject Line</Label>
                            <Input
                                placeholder="e.g., Important Update: Payouts Processed"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Email Body</Label>
                            <Textarea
                                placeholder="Write your message here..."
                                rows={8}
                                value={body}
                                onChange={e => setBody(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full"
                            onClick={() => sendEmailMutation.mutate()}
                            disabled={sendEmailMutation.isPending || !subject || !body}
                        >
                            {sendEmailMutation.isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                            ) : (
                                <><Send className="mr-2 h-4 w-4" /> Send Broadcast</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
