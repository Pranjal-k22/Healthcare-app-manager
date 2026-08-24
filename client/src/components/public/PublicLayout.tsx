import React from 'react';
import { HeaderNav } from './HeaderNav';
import { PublicFooter } from './PublicFooter';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F9FF] font-sans antialiased">
      <HeaderNav />
      <main className="flex-grow">{children}</main>
      <PublicFooter />
    </div>
  );
};
