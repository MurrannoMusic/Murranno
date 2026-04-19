import React from 'react';

export const StatusBar = () => {
  return (
    <div className="status-bar">
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold">9:41</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5">
          <div className="w-1 h-1 bg-foreground/60 rounded-full"></div>
          <div className="w-1 h-1 bg-foreground/60 rounded-full"></div>
          <div className="w-1 h-1 bg-foreground/40 rounded-full"></div>
          <div className="w-1 h-1 bg-foreground/20 rounded-full"></div>
        </div>
        <svg className="w-4 h-2 ml-1" viewBox="0 0 24 12" fill="currentColor">
          <rect x="1" y="3" width="18" height="6" rx="2" className="fill-foreground/40" />
          <rect x="2" y="4" width="16" height="4" rx="1" className="fill-foreground/60" />
          <rect x="20" y="5" width="2" height="2" rx="0.5" className="fill-foreground/60" />
        </svg>
      </div>
    </div>
  );
};