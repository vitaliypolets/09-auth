import type { ReactNode } from 'react';

interface PrivateLayoutProps {
  children: ReactNode;
}

function PrivateLayout({ children }: PrivateLayoutProps) {
  return children;
}

export default PrivateLayout;