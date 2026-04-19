import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'NGN' | 'USD';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    formatCurrency: (amount: string | number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrency] = useState<Currency>(() => {
        const saved = localStorage.getItem('mm_currency');
        return (saved as Currency) || 'NGN';
    });

    useEffect(() => {
        localStorage.setItem('mm_currency', currency);
    }, [currency]);

    const formatCurrency = (amount: string | number) => {
        // Simple mock conversion for UI demo
        // In a real app, this might use real-time rates
        let val: number;

        if (typeof amount === 'string') {
            // Remove currency symbols and commas to parse
            val = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
        } else {
            val = amount;
        }

        if (isNaN(val)) return typeof amount === 'string' ? amount : '0';

        if (currency === 'NGN') {
            return `₦${val.toLocaleString()}`;
        } else {
            // Mock rate: 1 USD = 1500 NGN
            return `$${(val / 1500).toFixed(2)}`;
        }
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
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
