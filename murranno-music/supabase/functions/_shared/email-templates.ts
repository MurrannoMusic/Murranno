// Reusable email templates for Murranno Music

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
`;

const headerStyles = `
  color: #1a1a1a;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
`;

const textStyles = `
  color: #4a4a4a;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const buttonStyles = `
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  margin: 24px 0;
`;

const footerStyles = `
  color: #888;
  font-size: 12px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

export const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="${baseStyles}">
    <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #667eea; font-size: 32px; margin: 0;">Murranno Music</h1>
      </div>
      ${content}
      <div style="${footerStyles}">
        <p>© ${new Date().getFullYear()} Murranno Music. All rights reserved.</p>
        <p>You received this email because you're a valued member of our community.</p>
        <p>Manage your email preferences in your account settings.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const welcomeEmail = (userName: string, userType: string) => emailWrapper(`
  <h1 style="${headerStyles}">Welcome to Murranno Music! 🎵</h1>
  <p style="${textStyles}">Hi ${userName},</p>
  <p style="${textStyles}">
    Thank you for joining Murranno Music as ${userType === 'artist' ? 'an' : 'a'} <strong>${userType}</strong>. 
    We're excited to help you grow your music career!
  </p>
  <p style="${textStyles}">Here's what you can do next:</p>
  <ul style="${textStyles}">
    ${userType === 'artist' ? `
      <li>Complete your artist profile</li>
      <li>Upload your first release</li>
      <li>Create your first promotion campaign</li>
      <li>Connect your streaming platforms</li>
    ` : userType === 'label' ? `
      <li>Set up your label profile</li>
      <li>Invite artists to your roster</li>
      <li>Monitor your artists' performance</li>
      <li>Manage revenue sharing</li>
    ` : `
      <li>Complete your agency profile</li>
      <li>Add your first client</li>
      <li>Create campaigns for your clients</li>
      <li>Track campaign performance</li>
    `}
  </ul>
  <div style="text-align: center;">
    <a href="${Deno.env.get('VITE_SUPABASE_URL')}/dashboard" style="${buttonStyles}">
      Get Started
    </a>
  </div>
`);

export const labelInvitationEmail = (
  artistName: string,
  labelName: string,
  revenueShare: number,
  contractStart?: string,
  contractEnd?: string
) => emailWrapper(`
  <h1 style="${headerStyles}">You've Been Added to a Label! 🎉</h1>
  <p style="${textStyles}">Hi ${artistName},</p>
  <p style="${textStyles}">
    Great news! You have been added to <strong>${labelName}</strong>'s roster.
  </p>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
    <h3 style="color: #1a1a1a; margin-top: 0;">Contract Details</h3>
    <p style="margin: 8px 0;"><strong>Revenue Share:</strong> ${revenueShare}%</p>
    ${contractStart ? `<p style="margin: 8px 0;"><strong>Contract Start:</strong> ${new Date(contractStart).toLocaleDateString()}</p>` : ''}
    ${contractEnd ? `<p style="margin: 8px 0;"><strong>Contract End:</strong> ${new Date(contractEnd).toLocaleDateString()}</p>` : ''}
  </div>
  <p style="${textStyles}">
    Your label will now be able to help manage your releases and track your performance.
  </p>
  <div style="text-align: center;">
    <a href="${Deno.env.get('VITE_SUPABASE_URL')}/app/profile" style="${buttonStyles}">
      View Your Profile
    </a>
  </div>
`);

export const agencyInvitationEmail = (
  artistName: string,
  agencyName: string,
  commissionRate: number
) => emailWrapper(`
  <h1 style="${headerStyles}">You've Been Added as a Client! 🎯</h1>
  <p style="${textStyles}">Hi ${artistName},</p>
  <p style="${textStyles}">
    <strong>${agencyName}</strong> has added you as a client and can now create and manage promotion campaigns on your behalf.
  </p>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0;">
    <h3 style="color: #1a1a1a; margin-top: 0;">Partnership Details</h3>
    <p style="margin: 8px 0;"><strong>Commission Rate:</strong> ${commissionRate}%</p>
  </div>
  <p style="${textStyles}">
    Your agency will help you reach a wider audience and maximize your promotional efforts.
  </p>
  <div style="text-align: center;">
    <a href="${Deno.env.get('VITE_SUPABASE_URL')}/app/campaigns" style="${buttonStyles}">
      View Campaigns
    </a>
  </div>
`);

export const campaignStatusEmail = (
  userName: string,
  campaignName: string,
  oldStatus: string,
  newStatus: string,
  rejectionReason?: string
) => {
  const statusEmoji = newStatus === 'active' ? '✅' : newStatus === 'completed' ? '🎉' : newStatus === 'rejected' ? '❌' : '⏸️';
  
  return emailWrapper(`
    <h1 style="${headerStyles}">Campaign Status Update ${statusEmoji}</h1>
    <p style="${textStyles}">Hi ${userName},</p>
    <p style="${textStyles}">
      Your campaign <strong>${campaignName}</strong> status has been updated from 
      <span style="color: #888; text-decoration: line-through;">${oldStatus}</span> to 
      <strong style="color: ${newStatus === 'active' ? '#10b981' : newStatus === 'rejected' ? '#ef4444' : '#667eea'};">${newStatus}</strong>.
    </p>
    ${rejectionReason ? `
      <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #ef4444;">
        <h3 style="color: #991b1b; margin-top: 0;">Rejection Reason</h3>
        <p style="margin: 0; color: #7f1d1d;">${rejectionReason}</p>
      </div>
    ` : ''}
    ${newStatus === 'active' ? `
      <p style="${textStyles}">
        Your campaign is now live and actively running. You can monitor its performance in real-time.
      </p>
    ` : newStatus === 'completed' ? `
      <p style="${textStyles}">
        Your campaign has been completed! Check out the final results and insights.
      </p>
    ` : ''}
    <div style="text-align: center;">
      <a href="${Deno.env.get('VITE_SUPABASE_URL')}/app/campaigns" style="${buttonStyles}">
        View Campaign
      </a>
    </div>
  `);
};

export const earningsAlertEmail = (
  artistName: string,
  amount: number,
  currency: string,
  period: string,
  platform?: string
) => emailWrapper(`
  <h1 style="${headerStyles}">New Earnings Posted! 💰</h1>
  <p style="${textStyles}">Hi ${artistName},</p>
  <p style="${textStyles}">
    You've received new earnings for the period <strong>${period}</strong>.
  </p>
  <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #10b981;">
    <h2 style="color: #065f46; margin: 0; font-size: 36px;">
      ${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </h2>
    ${platform ? `<p style="margin: 8px 0 0 0; color: #065f46;">From ${platform}</p>` : ''}
  </div>
  <p style="${textStyles}">
    Your earnings are now available in your wallet. You can view detailed breakdowns and request withdrawals.
  </p>
  <div style="text-align: center;">
    <a href="${Deno.env.get('VITE_SUPABASE_URL')}/app/earnings" style="${buttonStyles}">
      View Earnings
    </a>
  </div>
`);

export const releaseStatusEmail = (
  artistName: string,
  releaseTitle: string,
  status: string,
  releaseDate?: string
) => {
  const statusEmoji = status === 'approved' ? '✅' : status === 'rejected' ? '❌' : '⏳';
  
  return emailWrapper(`
    <h1 style="${headerStyles}">Release Update ${statusEmoji}</h1>
    <p style="${textStyles}">Hi ${artistName},</p>
    <p style="${textStyles}">
      Your release <strong>${releaseTitle}</strong> has been <strong>${status}</strong>.
    </p>
    ${status === 'approved' && releaseDate ? `
      <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <h3 style="color: #065f46; margin-top: 0;">Release Date</h3>
        <p style="margin: 0; color: #065f46; font-size: 18px; font-weight: 600;">
          ${new Date(releaseDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <p style="${textStyles}">
        Your music will be distributed to all major streaming platforms on the release date.
      </p>
    ` : status === 'rejected' ? `
      <p style="${textStyles}">
        Please review the feedback and resubmit your release with the necessary changes.
      </p>
    ` : ''}
    <div style="text-align: center;">
      <a href="${Deno.env.get('VITE_SUPABASE_URL')}/app/releases" style="${buttonStyles}">
        View Release
      </a>
    </div>
  `);
};

export const monthlyReportEmail = (
  userName: string,
  totalStreams: number,
  totalEarnings: number,
  currency: string,
  topTrack: { title: string; streams: number },
  period: string
) => emailWrapper(`
  <h1 style="${headerStyles}">Your Monthly Report 📊</h1>
  <p style="${textStyles}">Hi ${userName},</p>
  <p style="${textStyles}">
    Here's your performance summary for <strong>${period}</strong>.
  </p>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #0369a1; font-size: 14px; font-weight: 600;">TOTAL STREAMS</p>
      <p style="margin: 8px 0 0 0; color: #0c4a6e; font-size: 32px; font-weight: 700;">
        ${totalStreams.toLocaleString()}
      </p>
    </div>
    <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">TOTAL EARNINGS</p>
      <p style="margin: 8px 0 0 0; color: #064e3b; font-size: 32px; font-weight: 700;">
        ${currency} ${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  </div>
  <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 24px 0;">
    <h3 style="color: #92400e; margin-top: 0;">🔥 Top Track</h3>
    <p style="margin: 0; color: #78350f; font-size: 18px; font-weight: 600;">${topTrack.title}</p>
    <p style="margin: 4px 0 0 0; color: #92400e;">${topTrack.streams.toLocaleString()} streams</p>
  </div>
  <div style="text-align: center;">
    <a href="${Deno.env.get('VITE_SUPABASE_URL')}/app/analytics" style="${buttonStyles}">
      View Full Analytics
    </a>
  </div>
`);
