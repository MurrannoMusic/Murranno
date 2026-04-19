import { Wallet, Upload, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const BalanceEmptyState = () => {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-card-foreground">
                Your Wallet is Ready!
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Start earning to see your balance here. Your wallet has been initialized with ₦0.00
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/app/upload">
                  <Button className="w-full sm:w-auto">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Music
                  </Button>
                </Link>
                <Link to="/app/promotions">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Run Campaign
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
