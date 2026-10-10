'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from './RoleContext';

interface SidebarProps {
  currentRole: string;
}

export default function Sidebar({ currentRole }: SidebarProps) {
  const { user } = useRole();
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({});

  const translateRole = (roleStr: string) => {
    switch (roleStr) {
      case 'Admin': return 'مدير النظام';
      case 'CEO': return 'الرئيس التنفيذي';
      case 'FinanceManager': return 'المدير المالي';
      case 'Technician': return 'فني صيانة';
      case 'WarehouseManager': return 'أمين المستودع';
      case 'Receptionist': return 'موظف استقبال';
      case 'Accountant': return 'محاسب';
      case 'BranchManager': return 'مدير الفرع';
      case 'MaintenanceSupervisor': return 'مشرف الصيانة';
      case 'ProcurementOfficer': return 'مسؤول المشتريات';
      case 'HousekeepingSupervisor': return 'مشرف هاوسكيبنج';
      case 'HousekeepingStaff': return 'عامل نظافة';
      default: return roleStr;
    }
  };

  const getUserName = (roleStr: string) => {
    if (user?.name) return user.name;
    return translateRole(roleStr);
  };

  const getUserBranch = (roleStr: string) => {
    switch (roleStr) {
      case 'Admin':
      case 'CEO':
      case 'FinanceManager':
      case 'Accountant':
      case 'ProcurementOfficer':
        return 'الإدارة العامة';
      case 'WarehouseManager':
        return 'المستودع الرئيسي';
      default:
        return 'فرع طريق السيل';
    }
  };

  const groups = [
    {
      id: 'g-dashboard',
      name: 'لوحة المعلومات',
      roles: ['Admin', 'CEO', 'FinanceManager', 'Accountant', 'BranchManager', 'Receptionist', 'Technician', 'WarehouseManager', 'MaintenanceSupervisor', 'ProcurementOfficer', 'HousekeepingSupervisor'],
      items: [
        {
          name: 'الرئيسية',
          path: '/',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'g-hr',
      name: 'الموارد البشرية',
      roles: ['Admin', 'CEO', 'BranchManager'],
      items: [
        {
          name: 'الموظفون',
          path: '/employees',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        },
        {
          name: 'الورديات',
          path: '/shifts',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          name: 'الحضور والانصراف',
          path: '/hr/attendance',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        },
        {
          name: 'طلبات الإجازات',
          path: '/leaves',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          name: 'طلبات السلف',
          path: '/hr/loans',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          name: 'البلاغات والتعاميم',
          path: '/hr/announcements',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'g-branch-management',
      name: 'إدارة الفرع والإشراف الداخلي',
      roles: ['Admin', 'CEO', 'BranchManager', 'HousekeepingSupervisor'],
      items: [
        {
          name: 'المفقودات والتلفيات',
          path: '/branch-management/lost-found',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )
        },
        {
          name: 'وثائق الفرع',
          path: '/branch-management/documents',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H8z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M16 13H8m8 4H8m2-8H8" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'g-finance',
      name: 'الإدارة المالية',
      roles: ['Admin', 'CEO', 'FinanceManager', 'Accountant', 'BranchManager'],
      items: [
        {
          name: 'تقفيلات الورديات',
          path: '/shift-reports',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
        {
          name: 'أداء الاستقبال',
          path: '/receptionist-stats',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          name: 'مراجعة السلف',
          path: '/finance/loans',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          name: 'اعتماد طلبات الشراء',
          path: '/finance/purchase-approvals',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          )
        },
        {
          name: 'حاسبة العمولات',
          path: '/finance/commissions',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'g-maintenance',
      name: 'إدارة الصيانة',
      roles: ['Admin', 'CEO', 'MaintenanceSupervisor', 'HousekeepingSupervisor'],
      items: [
        {
          name: 'بلاغات الصيانة',
          path: '/maintenance',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        },
        {
          name: 'الصيانة الوقائية',
          path: '/maintenance/preventive',
          disabled: true,
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'g-warehouse',
      name: 'إدارة المخازن',
      roles: ['Admin', 'CEO', 'WarehouseManager', 'ProcurementOfficer'],
      items: [
        {
          name: 'المخزون والأصناف',
          path: '/warehouse',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )
        },
        {
          name: 'حركة المواد',
          path: '/warehouse/movements',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4-4m-4 4l4 4" />
            </svg>
          )
        },
        {
          name: 'وحدات القياس',
          path: '/warehouse/units',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          )
        },
        {
          name: 'طلبات الشراء للمستودع',
          path: '/warehouse/purchase-requests',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'g-procurement',
      name: 'إدارة المشتريات',
      roles: ['Admin', 'CEO', 'ProcurementOfficer', 'WarehouseManager'],
      items: [
        {
          name: 'طلبات الشراء',
          path: '/procurement',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'g-reports',
      name: 'التقارير',
      roles: ['Admin', 'CEO', 'FinanceManager', 'Accountant', 'BranchManager'],
      items: [
        {
          name: 'التقارير العامة',
          path: '/reports',
          disabled: false,
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'g-system',
      name: 'إدارة النظام',
      roles: ['Admin'],
      items: [
        {
          name: 'إدارة المستخدمين',
          path: '/system/users',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        },
        {
          name: 'الصلاحيات والأدوار',
          path: '/system/roles',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          )
        },
        {
          name: 'إعدادات الربط',
          path: '/system/integrations',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          )
        },
        {
          name: 'سجل النشاط',
          path: '/system/activity-log',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          name: 'الفروع',
          path: '/branches',
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )
        }
      ]
    }
  ];

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const visibleGroups = groups.filter(g => g.roles.includes(currentRole));

  return (
    <aside className="w-72 bg-brand-teal-dark border-l border-brand-secondary/20 text-white flex flex-col min-h-screen sticky top-0">
      {/* Top Brand Logo Panel */}
      <div className="p-6 border-b border-brand-secondary/20 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative Golden Corner Frames */}
        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-brand-secondary/40"></div>
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-brand-secondary/40"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-brand-secondary/40"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-brand-secondary/40"></div>
        
        <div className="w-24 h-24 relative bg-white/5 rounded-lg p-2 border border-brand-secondary/30 flex items-center justify-center mb-3 group hover:border-brand-secondary transition-colors duration-300">
          <img 
            src="/rahti-logo.png" 
            alt="شعار فنادق راحتي" 
            className="max-w-full max-h-full object-contain filter drop-shadow-lg"
          />
        </div>
        <h1 className="text-base font-bold tracking-widest text-brand-secondary uppercase">فنادق راحتي</h1>
        <p className="text-[10px] text-white/50 tracking-wider mt-0.5 uppercase">لوحة تحكم العمليات</p>
      </div>

      {/* User Session Info */}
      <div className="px-6 py-4 bg-brand-primary/25 border-b border-brand-secondary/10 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-secondary/25 border border-brand-secondary/50 flex items-center justify-center text-brand-secondary font-bold text-xs shrink-0 select-none">
            {getUserName(currentRole).split(' ').slice(0, 2).map(n => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-brand-cream truncate" title={getUserName(currentRole)}>{getUserName(currentRole)}</div>
            <div className="text-[9px] text-white/40 font-semibold truncate">{getUserBranch(currentRole)}</div>
          </div>
        </div>
        <div className="flex mt-1">
          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-brand-secondary text-brand-teal-dark border border-brand-secondary">
            {translateRole(currentRole)}
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {visibleGroups.map((group) => {
          const isCollapsed = collapsedGroups[group.id] || false;
          return (
            <div key={group.id} className="space-y-1">
              {/* Group Header */}
              <div
                onClick={() => toggleGroup(group.id)}
                className="flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold text-white/50 tracking-wider uppercase cursor-pointer hover:text-white transition-colors duration-150 select-none"
              >
                <span className="font-bold">{group.name}</span>
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Group Items */}
              {!isCollapsed && (
                <div className="space-y-0.5 pr-1">
                  {group.items.map((item) => {
                    const isActive = item.path === '/' 
                      ? pathname === '/' 
                      : pathname.startsWith(item.path || '$_disabled_$');

                    if (item.disabled) {
                      return (
                        <div
                          key={item.name}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-white/40 cursor-not-allowed select-none bg-transparent"
                        >
                          <div className="flex items-center gap-3.5">
                            <span className="text-white/30 shrink-0">{item.icon}</span>
                            <span className="truncate">{item.name}</span>
                          </div>
                          <span className="bg-orange-500/10 text-orange-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-orange-500/20 shrink-0">
                            قريباً
                          </span>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        href={item.path || '#'}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 group ${
                          isActive
                            ? 'bg-brand-primary text-white border-r-4 border-brand-secondary pr-2 pl-3'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className={`${isActive ? 'text-brand-secondary' : 'text-white/40 group-hover:text-white/70'} transition-colors duration-200 shrink-0`}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {/* Footer Branding */}
      <div className="p-4 text-center border-t border-brand-secondary/15 bg-brand-teal-dark/50 font-medium">
        <p className="text-[8px] text-white/30 tracking-widest uppercase">نظام إدارة فنادق راحتي v1.1</p>
      </div>
    </aside>
  );
}
