import { Share2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SmartLinkTool() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-3 pb-20">
            <div className="max-w-md mx-auto space-y-4 pt-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Smart Link</h1>
                </div>

                <Card className="bg-card border-border shadow-soft rounded-xl">
                    <CardContent className="p-6 text-center space-y-3">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                            <Share2 className="h-7 w-7 text-blue-500" />
                        </div>
                        <h2 className="text-lg font-bold">Create Smart Links</h2>
                        <p className="text-sm text-muted-foreground">
                            Generate a single link for all your music platforms to share with fans.
                        </p>
                        <div className="pt-2">
                            <Button disabled className="w-full h-10 text-sm">Coming Soon</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
