import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { ShieldCheck, Upload, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function KYCVerification() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, profile, refreshUserData } = useAuth();
    const { uploadImage, uploading } = useCloudinaryUpload();

    const [ninNumber, setNinNumber] = useState('');
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [documentPreview, setDocumentPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setDocumentFile(file);
            const previewUrl = URL.createObjectURL(file);
            setDocumentPreview(previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;
        if (!ninNumber) {
            toast({
                title: "Missing Information",
                description: "Please enter your NIN Number.",
                variant: "destructive"
            });
            return;
        }
        if (!documentFile) {
            toast({
                title: "Missing Document",
                description: "Please upload your ID document.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Upload ID Document
            const { url: documentUrl } = await uploadImage(documentFile, 'kyc-documents');

            // 2. Update Profile with KYC Data
            const { error } = await supabase
                .from('profiles')
                .update({
                    nin_number: ninNumber,
                    id_document_url: documentUrl,
                    id_document_type: 'national_id', // You can expand this dropdown later
                    kyc_status: 'pending',
                    kyc_tier: 1 // Remains 1 until admin approves, or 2 if auto-verified
                })
                .eq('id', user.id);

            if (error) throw error;

            await refreshUserData();

            toast({
                title: "Verification Submitted",
                description: "Your documents are being reviewed. You will be notified once approved.",
            });

            // Navigate back or to success state
            navigate('/app/settings');

        } catch (error: any) {
            console.error('KYC Submission error:', error);
            toast({
                title: "Submission Failed",
                description: error.message || "Could not submit verification. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!profile) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const isPending = profile.kyc_status === 'pending';
    const isVerified = profile.kyc_status === 'verified';

    if (isPending) {
        return (
            <div className="p-4 max-w-xl mx-auto space-y-4">
                <Card className="p-6 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h2 className="text-lg font-bold">Verification In Progress</h2>
                    <p className="text-sm text-muted-foreground">
                        Your documents have been submitted and are under review. This usually takes 24-48 hours.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate('/app/dashboard')}>
                        Return to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    if (isVerified) {
        return (
            <div className="p-4 max-w-xl mx-auto space-y-4">
                <Card className="p-6 text-center space-y-3">
                    <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <h2 className="text-lg font-bold">You are Verified!</h2>
                    <p className="text-sm text-muted-foreground">
                        Your identity has been verified. You have full access to all features.
                    </p>
                    <Button size="sm" onClick={() => navigate('/app/dashboard')}>
                        Go to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-xl mx-auto space-y-4">
            <div className="space-y-1">
                <h1 className="text-xl font-bold">Identity Verification</h1>
                <p className="text-sm text-muted-foreground">
                    We need to verify your identity before you can upload music or withdraw funds.
                </p>
            </div>

            <Card className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-1.5">
                        <Label htmlFor="nin" className="text-xs">NIN Number (National Identification Number)</Label>
                        <Input
                            id="nin"
                            placeholder="Enter your 11-digit NIN"
                            value={ninNumber}
                            onChange={(e) => setNinNumber(e.target.value)}
                            required
                            className="h-9 text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Your info is encrypted securely.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs">ID Document Upload</Label>
                        <div
                            className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {documentPreview ? (
                                <div className="relative">
                                    <img
                                        src={documentPreview}
                                        alt="ID Preview"
                                        className="max-h-32 mx-auto rounded-md object-contain"
                                    />
                                    <p className="mt-2 text-xs text-muted-foreground">Click to change</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                                    <Upload className="w-6 h-6" />
                                    <p className="text-sm font-medium">Upload NIN Card or Passport</p>
                                    <p className="text-[10px]">JPG, PNG or PDF up to 5MB</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={handleFileSelect}
                            />
                        </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 flex gap-2 text-xs text-yellow-500">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>
                            Ensure your document is clear and matches your profile name to avoid rejection.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <Button type="submit" size="sm" className="w-full text-sm" disabled={isSubmitting || uploading}>
                            {isSubmitting || uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit for Verification"
                            )}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="w-full text-sm" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
