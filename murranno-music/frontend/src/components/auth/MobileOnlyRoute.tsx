import { ReactNode } from 'react';

// The app is responsive on every screen size now; kept as a pass-through so routes don't change.
export const MobileOnlyRoute = ({ children }: { children: ReactNode }) => <>{children}</>;
