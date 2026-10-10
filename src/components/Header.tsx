'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Role } from '../types_local';
import api from '../utils/api';
import { useRole } from './RoleContext';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
}

export default function Header({ currentRole, onRoleChange }: HeaderProps) {
  const { user } = useRole();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  // Translated Page Titles
  const getTitle = () => {
    if (pathname.startsWith('/overview')) return 'نظرة عامة على العمليات';
    if (pathname.startsWith('/kanban')) return 'لوحة الصيانة والمستودع (Kanban)';
    if (pathname.startsWith('/procurement')) return 'اعتمادات المشتريات المعلقة';
    if (pathname.startsWith('/reports')) return 'التقارير والتحليلات الإدارية';
    if (pathname.startsWith('/settings')) return 'إعدادات النظام العامة';
    if (pathname.startsWith('/employees')) return 'إدارة شؤون الموظفين';
    if (pathname.startsWith('/shifts')) return 'إدارة ورديات الموظفين';
    if (pathname.startsWith('/attendance')) return 'سجل الحضور والانصراف الجغرافي';
    if (pathname.startsWith('/leaves')) return 'طلبات إجازات الموظفين';
    if (pathname.startsWith('/loans')) return 'طلبات السلف المالية';
    if (pathname.startsWith('/shift-reports')) return 'تقارير تقفيلات الورديات';
    if (pathname.startsWith('/receptionist-stats')) return 'أداء موظفي الاستقبال المالي';
    if (pathname.startsWith('/branches')) return 'إدارة فروع الفندق';
    return 'لوحة التحكم الرئيسية';
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.Admin: return 'bg-purple-100 text-purple-800 border-purple-300';
      case Role.CEO: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case Role.FinanceManager: return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case Role.Technician: return 'bg-blue-100 text-blue-800 border-blue-300';
      case Role.WarehouseManager: return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case Role.Receptionist: return 'bg-teal-100 text-teal-800 border-teal-300';
      case Role.Accountant: return 'bg-pink-100 text-pink-800 border-pink-300';
      case Role.BranchManager: return 'bg-orange-100 text-orange-800 border-orange-300';
      case Role.MaintenanceSupervisor: return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case Role.ProcurementOfficer: return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const translateRole = (roleStr: Role) => {
    switch (roleStr) {
      case Role.Admin: return 'مدير النظام';
      case Role.CEO: return 'الرئيس التنفيذي';
      case Role.FinanceManager: return 'المدير المالي';
      case Role.Technician: return 'فني صيانة';
      case Role.WarehouseManager: return 'أمين المستودع';
      case Role.Receptionist: return 'موظف استقبال';
      case Role.Accountant: return 'محاسب';
      case Role.BranchManager: return 'مدير الفرع';
      case Role.MaintenanceSupervisor: return 'مشرف الصيانة';
      case Role.ProcurementOfficer: return 'مسؤول المشتريات';
      default: return roleStr;
    }
  };

  const getUserName = (roleStr: string) => {
    if (user?.name) return user.name;
    return translateRole(roleStr as Role);
  };

  return (
    <header className="h-20 bg-white border-b border-brand-secondary/15 flex items-center justify-between px-8 shadow-sm">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-brand-teal-dark tracking-wide uppercase">{getTitle()}</h2>
        <p className="text-[10px] text-muted font-bold">نظام إدارة عمليات فنادق راحتي</p>
      </div>

      {/* Actions / Role Selector */}
      <div className="flex items-center gap-6">
        {/* Quick Role Switcher - dev only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex items-center gap-2 bg-brand-cream-dark/60 p-1.5 rounded-lg border border-brand-secondary/20">
            <label htmlFor="role-select" className="text-[10px] font-bold text-brand-teal-dark/70 px-2 uppercase">محاكاة الجلسة:</label>
            <select
              id="role-select"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as Role)}
              className="text-[11px] font-bold text-brand-teal-dark bg-white border border-brand-secondary/35 rounded px-2.5 py-1 focus:outline-none focus:border-brand-secondary cursor-pointer"
            >
              <option value={Role.Admin}>مدير النظام (أمان السعيد)</option>
              <option value={Role.CEO}>الرئيس التنفيذي (إيلينا بتروفا)</option>
              <option value={Role.FinanceManager}>المدير المالي (سارة كونرز)</option>
              <option value={Role.Technician}>فني صيانة (توماس ميلر)</option>
              <option value={Role.WarehouseManager}>أمين المستودع (ماركوس فانس)</option>
              <option value={Role.Receptionist}>موظف استقبال (لارا كروفت)</option>
              <option value={Role.Accountant}>المحاسب (محاسب الفندق)</option>
              <option value={Role.BranchManager}>مدير الفرع (مدير فرع طريق السيل)</option>
              <option value={Role.MaintenanceSupervisor}>مشرف الصيانة (مشرف الصيانة)</option>
              <option value={Role.ProcurementOfficer}>مسؤول المشتريات (مسؤول المشتريات)</option>
            </select>
          </div>
        )}

        {/* User Info Badge */}
        <div className="flex items-center gap-3 border-s border-brand-secondary/25 ps-6">
          <div className="text-right select-none">
            <div className="text-xs font-bold text-brand-teal-dark">{getUserName(currentRole)}</div>
            <span className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeColor(currentRole)}`}>
              {translateRole(currentRole)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold shadow-md border border-brand-secondary/20 shrink-0">
            {getUserName(currentRole).split(' ').slice(0, 2).map(n => n[0]).join('')}
          </div>
          
          {/* Logout Action Button */}
          <button
            onClick={handleLogout}
            title="تسجيل الخروج"
            className="w-10 h-10 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center font-bold shadow-sm border border-red-200 transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
