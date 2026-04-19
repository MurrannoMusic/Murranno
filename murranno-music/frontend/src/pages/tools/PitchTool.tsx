import { Megaphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PitchTool() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background p-3 pb-20">
            <div className="max-w-md mx-auto space-y-4 pt-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Pitch Tool</h1>
                </div>

                <Card className="bg-card border-border shadow-soft rounded-xl">
                    <CardContent className="p-6 text-center space-y-3">
                        <div className="w-14 h-14 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                            <Megaphone className="h-7 w-7 text-purple-500" />
                        </div>
                        <h2 className="text-lg font-bold">Pitch Your Music</h2>
                        <p className="text-sm text-muted-foreground">
                            Submit your tracks to curators, playlists, and blogs directly from your dashboard.
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
