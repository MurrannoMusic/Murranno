import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const UserTicketsList = () => {
    const { data: tickets, isLoading } = useQuery({
        queryKey: ['user-tickets'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'in_progress':
                return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
            case 'resolved':
                return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'closed':
                return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open':
                return <AlertCircle className="w-3 h-3 mr-1" />;
            case 'in_progress':
                return <Clock className="w-3 h-3 mr-1" />;
            case 'resolved':
            case 'closed':
                return <CheckCircle2 className="w-3 h-3 mr-1" />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-card/50 border-border/50">
                        <CardHeader className="p-4">
                            <Skeleton className="h-5 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-1/4" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!tickets || tickets.length === 0) {
        return (
            <div className="text-center py-12 bg-secondary/10 rounded-xl border border-dashed border-border">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-1">No tickets found</h3>
                <p className="text-sm text-muted-foreground">
                    You haven't submitted any support requests yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <Card key={ticket.id} className="bg-card border-border/50 transition-all hover:bg-accent/5">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-semibold line-clamp-1">
                                    {ticket.subject}
                                </CardTitle>
                                <CardDescription className="text-xs flex items-center gap-2">
                                    <span>Ticket #{ticket.id.slice(0, 8)}</span>
                                    <span>•</span>
                                    <span>{format(new Date(ticket.created_at), 'MMM d, yyyy')}</span>
                                    <span>•</span>
                                    <span className="capitalize">{ticket.category}</span>
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className={`${getStatusColor(ticket.status)} border-0 flex items-center shrink-0`}>
                                {getStatusIcon(ticket.status)}
                                <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 space-y-3">
                        <div className="bg-secondary/20 rounded-lg p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                            {ticket.message}
                        </div>

                        {ticket.admin_notes && (
                            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                                <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    Support Response
                                </p>
                                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                                    {ticket.admin_notes}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
