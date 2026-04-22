import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2, Mail, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const DeleteAccount = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 h-9 px-4 hover:bg-muted"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Account Deletion Request</h1>
          <p className="text-muted-foreground">
            We're sorry to see you go. Below are the ways you can request to have your Murranno Music account and all associated data deleted.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Option 1: In-App */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Delete via App / Website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The fastest way to delete your account is through your account settings while logged in.
              </p>
              <ol className="text-sm space-y-2 list-decimal pl-5">
                <li>Log into your Murranno Music account.</li>
                <li>Go to <strong>Settings</strong>.</li>
                <li>Scroll down to the <strong>Danger Zone</strong>.</li>
                <li>Click on <strong>Delete Account</strong> and confirm.</li>
              </ol>
              <Link to="/login">
                <Button className="w-full mt-4">Log In to Delete Account</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Option 2: Email Request */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Request via Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you cannot access your account, you can send a deletion request to our support team.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Send an email to:</p>
                <p className="text-primary font-bold">support@murrannomusic.co</p>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Note: The request must be sent from the email address associated with the account you wish to delete.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Information */}
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                What happens to my data?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-destructive/80">
              <p>When your account is deleted:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your profile and login credentials are permanently removed.</li>
                <li>All uploaded music files and metadata are deleted from our servers.</li>
                <li>Distribution of your music to DSPs will be halted and takedown requests will be sent.</li>
                <li>Financial history and earnings data will be archived for 7 years as required by Nigerian tax law, then permanently destroyed.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Murranno Music. All rights reserved.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default DeleteAccount;
