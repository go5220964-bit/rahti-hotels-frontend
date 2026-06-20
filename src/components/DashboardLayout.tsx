'use client';

import React from 'react';
import { RoleProvider, useRole } from './RoleContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname } from 'next/navigation';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const pathname = usePathname();

  // If on login page, skip sidebar and header wrappers
  if (pathname === '/login') {
    return <div className="min-h-screen bg-brand-cream">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-brand-cream">
      {/* Sidebar */}
      <Sidebar currentRole={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header currentRole={role} onRoleChange={setRole} />

        {/* Dynamic Route Panel */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <DashboardContent>{children}</DashboardContent>
    </RoleProvider>
  );
}
