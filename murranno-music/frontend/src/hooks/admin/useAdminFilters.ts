import { useState, useCallback } from 'react';

export function useAdminFilters<T extends Record<string, any>>(initialFilters: T) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<T>(initialFilters);

    const handleFilterChange = useCallback((key: keyof T, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page on filter change
    }, []);

    const resetFilters = useCallback(() => {
        setSearch('');
        setFilters(initialFilters);
        setPage(1);
    }, [initialFilters]);

    return {
        page,
        setPage,
        search,
        setSearch,
        filters,
        handleFilterChange,
        resetFilters,
    };
}
