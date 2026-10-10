'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Role } from '@/types_local';
import { ShieldAlert, RotateCw, Save, CheckSquare, Square } from 'lucide-react';

const PERMISSIONS = [
  { key: 'view_dashboard', label: 'رؤية لوحة المعلومات الرئيسية' },
  { key: 'hr_read', label: 'رؤية شؤون الموظفين والحضور' },
  { key: 'hr_write', label: 'تعديل الموظفين ونقل الفروع' },
  { key: 'finance_read', label: 'عرض تقارير الورديات والمالية' },
  { key: 'finance_write', label: 'اعتماد السلف والتقارير والمشتريات' },
  { key: 'maintenance_read', label: 'عرض بلاغات الصيانة والجدول' },
  { key: 'maintenance_write', label: 'تكليف وتعديل وإنهاء بلاغات الصيانة' },
  { key: 'warehouse_read', label: 'عرض الأصناف ومستويات المخزون' },
  { key: 'warehouse_write', label: 'صرف المواد وإضافة كميات وتعديل الوحدات' },
  { key: 'procurement_read', label: 'عرض طلبات الشراء' },
  { key: 'procurement_write', label: 'مراجعة وتعديل طلبات الشراء' },
  { key: 'lost_found_read', label: 'عرض المفقودات وبلاغات التلفيات' },
  { key: 'lost_found_write', label: 'تسوية المفقودات والتعويضات المالية' },
  { key: 'system_settings', label: 'إعدادات النظام الربط البرمجي' }
];

const ROLES = [
  { key: 'Admin', label: 'مدير النظام (Admin)' },
  { key: 'CEO', label: 'الرئيس التنفيذي (CEO)' },
  { key: 'BranchManager', label: 'مدير الفرع (BranchManager)' },
  { key: 'Receptionist', label: 'موظف الاستقبال (Receptionist)' },
  { key: 'Accountant', label: 'المحاسب (Accountant)' },
  { key: 'MaintenanceSupervisor', label: 'مشرف الصيانة (Supervisor)' },
  { key: 'WarehouseManager', label: 'أمين المستودع (Storekeeper)' },
  { key: 'HousekeepingSupervisor', label: 'مشرف هاوسكيبنج (HousekeepingSupervisor)' }
];

export default function SystemRolesPage() {
  const { role: currentRole } = useRole();
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadMatrix = async () => {
    setLoading(true);
    try {
      const data = await api.getRolePermissions();
      // Ensure each role has a record of permission key-values
      const formatted: Record<string, Record<string, boolean>> = {};
      ROLES.forEach(r => {
        formatted[r.key] = {};
        const roleData = data[r.key] || {};
        PERMISSIONS.forEach(p => {
          // If the role has "all" or specific permission key
          formatted[r.key][p.key] = roleData.all === true || roleData[p.key] === true;
        });
      });
      setMatrix(formatted);
    } catch (e) {
      console.error(e);
      showToast('خطأ أثناء تحميل مصفوفة الصلاحيات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole !== Role.Admin) return;
    loadMatrix();
  }, [currentRole]);

  if (currentRole !== Role.Admin) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl text-center font-bold" dir="rtl">
        ⚠️ عذراً، هذه الصفحة مخصصة لمدير النظام فقط.
      </div>
    );
  }

  const handleToggle = (roleKey: string, permKey: string) => {
    // Admin always has all permissions, lock it in UI
    if (roleKey === 'Admin') return;

    setMatrix(prev => ({
      ...prev,
      [roleKey]: {
        ...(prev[roleKey] || {}),
        [permKey]: !(prev[roleKey]?.[permKey])
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateRolePermissions(matrix);
      showToast('تم حفظ مصفوفة الصلاحيات والأدوار بنجاح');
    } catch (e) {
      console.error(e);
      showToast('فشل حفظ الصلاحيات', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-right" dir="rtl">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg text-white font-bold text-xs flex items-center gap-2.5 transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 border border-emerald-500' : 'bg-rose-600 border border-rose-500'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-brand-secondary/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-teal-dark flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-brand-primary" />
            <span>الصلاحيات وأدوار الموظفين</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            تعديل مصفوفة الصلاحيات وربطها بالصلاحيات الأمنية للمنظومة (RBAC) لتقييد الوصول للفروع والميزات المختلفة.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold text-xs px-5 py-3 rounded-lg flex items-center gap-2 transition shadow shrink-0 self-start sm:self-center disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
        </button>
      </div>

      {/* Role-Permission Matrix */}
      <div className="bg-white rounded-2xl border border-brand-secondary/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <RotateCw className="w-8 h-8 text-brand-primary animate-spin" />
            <span>جاري تحميل مصفوفة الصلاحيات...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                  <th className="p-4 w-72">العملية / الصلاحية المطلوبة</th>
                  {ROLES.map(r => (
                    <th key={r.key} className="p-4 text-center select-none min-w-32">{r.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSIONS.map(p => (
                  <tr key={p.key} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                    <td className="p-4 font-bold text-slate-800 border-l border-slate-100">
                      {p.label}
                      <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{p.key}</span>
                    </td>
                    {ROLES.map(r => {
                      const isChecked = matrix[r.key]?.[p.key] || false;
                      const isAdmin = r.key === 'Admin';
                      return (
                        <td
                          key={r.key}
                          onClick={() => handleToggle(r.key, p.key)}
                          className={`p-4 text-center cursor-pointer transition-colors ${
                            isAdmin ? 'bg-slate-50/50 cursor-not-allowed text-brand-primary/50' : 'hover:bg-brand-cream/20'
                          }`}
                        >
                          <div className="flex justify-center items-center">
                            {isAdmin || isChecked ? (
                              <CheckSquare className={`w-5 h-5 ${isAdmin ? 'text-slate-400' : 'text-brand-primary'}`} />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
