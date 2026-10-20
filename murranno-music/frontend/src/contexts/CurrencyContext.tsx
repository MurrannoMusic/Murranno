import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Currency = 'NGN' | 'USD';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    usdToNgnRate: number;
    /** Amounts are stored in naira; shows them in the chosen currency. */
    formatAmount: (ngn: number, decimals?: number) => string;
    /** Older callers pass strings like "₦1,200"; same conversion as formatAmount. */
    formatCurrency: (amount: string | number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
const STORAGE_KEY = 'mm_currency';
const DEFAULT_RATE = 1600; // used until platform settings load (admin sets the real rate)

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<Currency>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'USD' ? 'USD' : 'NGN';
        } catch {
            return 'NGN';
        }
    });
    const [usdToNgnRate, setUsdToNgnRate] = useState(DEFAULT_RATE);

    useEffect(() => {
        supabase.functions.invoke('get-mobile-config').then(({ data }) => {
            const rate = Number(data?.settings?.usd_to_ngn_rate);
            if (rate > 0) setUsdToNgnRate(rate);
        });
    }, []);

    const setCurrency = useCallback((c: Currency) => {
        setCurrencyState(c);
        try {
            localStorage.setItem(STORAGE_KEY, c);
        } catch {
            // private mode: preference lasts for this visit only
        }
    }, []);

    const formatAmount = useCallback((ngn: number, decimals = 2) => {
        if (currency === 'USD') {
            return `$${(ngn / usdToNgnRate).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
        }
        return `₦${ngn.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    }, [currency, usdToNgnRate]);

    const formatCurrency = useCallback((amount: string | number) => {
        const value = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : amount;
        if (isNaN(value)) return typeof amount === 'string' ? amount : '0';
        return formatAmount(value, currency === 'USD' ? 2 : 0);
    }, [formatAmount, currency]);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, usdToNgnRate, formatAmount, formatCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
