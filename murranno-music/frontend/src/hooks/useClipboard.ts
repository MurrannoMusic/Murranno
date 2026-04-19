import { Clipboard } from '@capacitor/clipboard';
import { isNativeApp } from '@/utils/platformDetection';
import { toast } from 'sonner';

export const useClipboard = () => {
  const writeText = async (text: string, successMessage?: string): Promise<void> => {
    try {
      if (isNativeApp()) {
        await Clipboard.write({
          string: text
        });
      } else {
        // Fallback to web Clipboard API
        await navigator.clipboard.writeText(text);
      }
      toast.success(successMessage || 'Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const readText = async (): Promise<string | null> => {
    if (!isNativeApp()) {
      try {
        return await navigator.clipboard.readText();
      } catch (error) {
        console.error('Failed to read from clipboard:', error);
        return null;
      }
    }

    try {
      const result = await Clipboard.read();
      return result.value;
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      return null;
    }
  };

  const copyTrackLink = async (title: string, smartlink: string): Promise<void> => {
    const text = `Check out "${title}" - ${smartlink}`;
    await writeText(text, 'Track link copied!');
  };

  const copyPromoCode = async (code: string): Promise<void> => {
    await writeText(code, 'Promo code copied!');
  };

  const copyPaymentReference = async (reference: string): Promise<void> => {
    await writeText(reference, 'Payment reference copied!');
  };

  const copySmartlink = async (smartlink: string): Promise<void> => {
    await writeText(smartlink, 'Smartlink copied!');
  };

  const copyAccountNumber = async (accountNumber: string): Promise<void> => {
    await writeText(accountNumber, 'Account number copied!');
  };

  return {
    writeText,
    readText,
    copyTrackLink,
    copyPromoCode,
    copyPaymentReference,
    copySmartlink,
    copyAccountNumber,
  };
};
