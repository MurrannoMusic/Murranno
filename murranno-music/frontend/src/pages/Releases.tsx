
import { AvatarDropdown } from '@/components/layout/AvatarDropdown';
import { useReleases } from '@/hooks/useReleases';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ReleaseStatus } from '@/types/release';
import mmLogo from "@/assets/mm_logo.png";

const statusColors: Record<ReleaseStatus, string> = {
  Live: 'bg-green-500 text-white',
  Repair: 'bg-yellow-500 text-white',
  Takedown: 'bg-red-500 text-white'
};

const Releases = () => {
  const { releases, searchQuery, setSearchQuery, statusFilter, setStatusFilter, getStatusCount } = useReleases();

  return (
    <div className="smooth-scroll">
      {/* Top Bar removed - using UnifiedTopBar */}

      <div className="mobile-container space-y-3 mt-1 pb-16">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search releases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/20 rounded-xl border border-border pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-smooth ${statusFilter === 'All'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/20 text-foreground hover:bg-secondary/30'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('Live')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-smooth ${statusFilter === 'Live'
              ? 'bg-green-500 text-white'
              : 'bg-secondary/20 text-foreground hover:bg-secondary/30'
              }`}
          >
            Live ({getStatusCount('Live')})
          </button>
          <button
            onClick={() => setStatusFilter('Repair')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-smooth ${statusFilter === 'Repair'
              ? 'bg-yellow-500 text-white'
              : 'bg-secondary/20 text-foreground hover:bg-secondary/30'
              }`}
          >
            Repair ({getStatusCount('Repair')})
          </button>
          <button
            onClick={() => setStatusFilter('Takedown')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-smooth ${statusFilter === 'Takedown'
              ? 'bg-red-500 text-white'
              : 'bg-secondary/20 text-foreground hover:bg-secondary/30'
              }`}
          >
            Takedown ({getStatusCount('Takedown')})
          </button>
        </div>

        {/* Page Title */}
        <div className="px-1">
          <h1 className="text-xl font-bold text-foreground">Your Releases</h1>
        </div>

        {/* Releases Grid */}
        {releases.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-muted-foreground">No releases found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {releases.map((release) => (
              <Link
                key={release.id}
                to={`/app/releases/${release.id}`}
                className="group"
              >
                <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden transition-smooth hover:shadow-primary hover:scale-[1.01]">
                  {/* Cover Art */}
                  <div className="relative aspect-square">
                    <img
                      src={release.coverArt}
                      alt={release.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Status Badge */}
                    <Badge
                      className={`absolute top-1.5 right-1.5 px-1.5 py-0 text-[9px] ${statusColors[release.status]} border-0`}
                    >
                      {release.status}
                    </Badge>
                  </div>

                  {/* Release Info */}
                  <div className="p-2 pt-1.5">
                    <h3 className="font-bold text-foreground text-xs mb-0.5 truncate">
                      {release.title}
                    </h3>
                    <p className="text-[10px] text-primary mb-0.5 truncate uppercase tracking-widest font-semibold">
                      {release.artist}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {release.year} • {release.type}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Releases;
