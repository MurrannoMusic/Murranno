import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/integrations/supabase/client';

export type Currency = 'NGN' | 'USD';

interface CurrencyContextValue {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    usdToNgnRate: number;
    formatAmount: (ngn: number, decimals?: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
    currency: 'NGN',
    setCurrency: () => {},
    usdToNgnRate: 1600,
    formatAmount: (n) => `₦${n.toLocaleString('en-NG')}`,
});

const STORAGE_KEY = 'preferred_currency';
const DEFAULT_RATE = 1600;

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrencyState] = useState<Currency>('NGN');
    const [usdToNgnRate, setUsdToNgnRate] = useState(DEFAULT_RATE);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((val) => {
            if (val === 'USD' || val === 'NGN') setCurrencyState(val);
        });

        supabase.functions.invoke('get-platform-settings').then(({ data }) => {
            const rate = data?.settings?.usd_to_ngn_rate;
            if (rate && Number(rate) > 0) setUsdToNgnRate(Number(rate));
        });
    }, []);

    const setCurrency = useCallback((c: Currency) => {
        setCurrencyState(c);
        AsyncStorage.setItem(STORAGE_KEY, c);
    }, []);

    const formatAmount = useCallback((ngn: number, decimals = 2): string => {
        if (currency === 'USD') {
            const usd = ngn / usdToNgnRate;
            return `$${usd.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
        }
        return `₦${ngn.toLocaleString('en-NG', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    }, [currency, usdToNgnRate]);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, usdToNgnRate, formatAmount }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => useContext(CurrencyContext);
