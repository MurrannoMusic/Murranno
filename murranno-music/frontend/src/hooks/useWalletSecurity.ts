import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useWalletSecurity = () => {
    const [hasPin, setHasPin] = useState<boolean | null>(null);
    const [isLocked, setIsLocked] = useState<boolean>(false);
    const [lockExpiresAt, setLockExpiresAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const checkSecurityStatus = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.functions.invoke('get-profile');

            if (error) throw error;

            if (data?.success && data.profile) {
                setHasPin(!!data.profile.transaction_pin_hash);

                const lockUntil = data.profile.payout_lock_until;
                if (lockUntil) {
                    const lockDate = new Date(lockUntil);
                    const now = new Date();
                    const active = lockDate > now;
                    setIsLocked(active);
                    setLockExpiresAt(active ? lockUntil : null);
                } else {
                    setIsLocked(false);
                    setLockExpiresAt(null);
                }
            }
        } catch (error: any) {
            console.error('Error checking security status:', error);
        } finally {
            setLoading(false);
        }
    };

    const setupPin = async (pin: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('setup-transaction-pin', {
                body: { pin }
            });

            if (error) throw error;

            if (data?.success) {
                setHasPin(true);
                toast({
                    title: "PIN Set Successfully",
                    description: "Your transaction PIN has been established.",
                });
                return true;
            }
            return false;
        } catch (error: any) {
            console.error('Error setting up PIN:', error);
            toast({
                title: "Setup Failed",
                description: error.message || "Failed to set up PIN",
                variant: "destructive",
            });
            return false;
        }
    };

    const verifyPin = async (pin: string) => {
        try {
            const { data, error } = await supabase.functions.invoke('verify-transaction-pin', {
                body: { pin }
            });

            if (error) throw error;

            return data?.success || false;
        } catch (error: any) {
            console.error('Error verifying PIN:', error);
            return false;
        }
    };

    useEffect(() => {
        checkSecurityStatus();
    }, []);

    return {
        hasPin,
        isLocked,
        lockExpiresAt,
        loading,
        setupPin,
        verifyPin,
        refetch: checkSecurityStatus
    };
};
