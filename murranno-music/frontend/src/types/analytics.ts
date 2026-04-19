export interface AnalyticsTab {
  id: 'streams' | 'tracks' | 'playlists' | 'stores' | 'audience';
  label: string;
}

export interface TimePeriod {
  id: 'week' | 'month' | '90days' | 'year';
  label: string;
  days: number;
}

export interface StreamData {
  date: string;
  current: number;
  previous: number;
  label: string;
}

export interface AnalyticsStats {
  currentTotal: number;
  currentDateRange: string;
  previousTotal: number;
  previousDateRange: string;
  percentageChange: number;
}

export interface AnalyticsFilters {
  label: string | null;
  artist: string | null;
  release: string | null;
  track: string | null;
  country: string | null;
  store: string | null;
}

export interface FilterOption {
  id: string;
  name: string;
  category: keyof AnalyticsFilters;
}
