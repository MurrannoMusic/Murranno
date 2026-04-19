import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CampaignActionsProps {
  onExportToPDF: () => void;
}

export const CampaignActions = ({ onExportToPDF }: CampaignActionsProps) => {
  return (
    <Card className="bg-card border border-border rounded-[20px] shadow-soft">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-card-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/app/promotions" className="w-full">
            <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-[16px] transition-all duration-200 shadow-primary hover:shadow-glow transform hover:scale-[1.02] active:scale-[0.98] text-xs">
              Create Campaign
            </button>
          </Link>
          
          <button 
            className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-4 rounded-[16px] transition-all duration-200 text-xs"
            onClick={onExportToPDF}
          >
            Export Results
          </button>
          
          <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-4 rounded-[16px] transition-all duration-200 text-xs">
            Schedule Reports
          </button>
          
          <button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-4 rounded-[16px] transition-all duration-200 text-xs">
            Templates
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
