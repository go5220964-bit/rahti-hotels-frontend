'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role } from '../types_local';
import { User } from '../utils/api';
import api from '../utils/api';
import { useRouter, usePathname } from 'next/navigation';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>(Role.Admin); // default
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  useEffect(() => {
    async function loadUser() {
      // Don't enforce check on login page itself to prevent loop
      if (pathname === '/login') {
        setLoading(false);
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('rahti_token') : null;
      if (!token) {
        setLoading(false);
        router.push('/login');
        return;
      }

      try {
        const profile = await api.getCurrentUser();
        setUser(profile);
        setRoleState(profile.role);
      } catch (err) {
        console.error('Error fetching current user:', err);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rahti_token');
          document.cookie = 'rahti_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [pathname, router]);

  return (
    <RoleContext.Provider value={{ role, setRole, user, setUser, loading }}>
      {(!loading || pathname === '/login') ? children : (
        <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#1C2D42] font-medium text-lg">جاري تحميل البيانات...</p>
          </div>
        </div>
      )}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
