import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Campaign } from '@/types/campaign';

interface MetadataWarningsProps {
  campaign: Campaign;
}

export const MetadataWarnings = ({ campaign }: MetadataWarningsProps) => {
  const warnings: string[] = [];
  const checks: string[] = [];

  // Check for missing or incomplete data
  if (!campaign.campaignAssets || campaign.campaignAssets.length === 0) {
    warnings.push('No campaign assets uploaded');
  } else {
    checks.push(`${campaign.campaignAssets.length} asset(s) uploaded`);
  }

  if (!campaign.campaignBrief || campaign.campaignBrief.trim().length < 50) {
    warnings.push('Campaign brief is too short (minimum 50 characters)');
  } else {
    checks.push('Campaign brief provided');
  }

  if (!campaign.targetAudience || Object.keys(campaign.targetAudience).length === 0) {
    warnings.push('No target audience defined');
  } else {
    checks.push('Target audience defined');
  }

  if (!campaign.socialLinks || Object.keys(campaign.socialLinks).length === 0) {
    warnings.push('No social media links provided');
  } else {
    const linkCount = Object.values(campaign.socialLinks).filter(v => v).length;
    checks.push(`${linkCount} social link(s) provided`);
  }

  if (parseFloat(campaign.budget) < 50000) {
    warnings.push('Budget is below recommended minimum (₦50,000)');
  }

  const today = new Date();
  const startDate = new Date(campaign.startDate);
  if (startDate < today) {
    warnings.push('Start date is in the past');
  } else {
    checks.push('Valid start date');
  }

  if (campaign.endDate) {
    const endDate = new Date(campaign.endDate);
    if (endDate <= startDate) {
      warnings.push('End date must be after start date');
    }
  }

  return (
    <div className="space-y-3">
      {warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Campaign Issues:</div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {checks.length > 0 && warnings.length === 0 && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="font-semibold mb-2 text-green-600">All Checks Passed:</div>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-700 dark:text-green-300">
              {checks.map((check, index) => (
                <li key={index}>{check}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
