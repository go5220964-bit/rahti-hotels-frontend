'use client';

import React, { useState, useEffect } from 'react';
import { api, Branch } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Role } from '@/types_local';
import { ClipboardList, RotateCw, Calendar, Building, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

export default function HRAttendanceGridPage() {
  const { role: currentRole, user } = useRole();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const isBranchManager = currentRole === Role.BranchManager;

  const loadBranches = async () => {
    try {
      const data = await api.getBranches();
      setBranches(data);
      if (data.length > 0) {
        // Default to user's branch if branch manager, else first branch
        const defaultBranch = isBranchManager ? (user?.branchId || data[0].id) : data[0].id;
        setSelectedBranch(defaultBranch);
      }
    } catch (e) {
      console.error(e);
      showToast('خطأ أثناء تحميل بيانات الفروع', 'error');
    }
  };

  const loadGridData = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    try {
      // Call endpoint api.getGrid or fetch directly
      const token = localStorage.getItem('rahti_token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';
      const res = await fetch(`${apiBase}/attendance/grid?branchId=${selectedBranch}&date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const payload = await res.json();
        setRecords(payload.data || []);
      } else {
        throw new Error();
      }
    } catch (e) {
      console.error(e);
      showToast('فشل تحميل شبكة الحضور اليومية', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      loadGridData();
    }
  }, [selectedBranch, selectedDate]);

  if (currentRole !== Role.Admin && currentRole !== Role.CEO && currentRole !== Role.BranchManager) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl text-center font-bold" dir="rtl">
        ⚠️ عذراً، هذه الصفحة مخصصة لمدير النظام والرئيس التنفيذي ومدير الفرع فقط.
      </div>
    );
  }

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

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <ClipboardList className="w-6 h-6 text-brand-primary" />
            <span>شبكة حضور وانصراف الفروع</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            متابعة حالة الحضور والانصراف اليومية لكل وردية ومطابقة الحركات جغرافياً وضمن فترات السماح للورديات.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch filter (disabled/hidden for BranchManager) */}
          {!isBranchManager ? (
            <div className="flex items-center gap-1 bg-slate-50 border border-brand-secondary/20 rounded-xl px-3 py-1.5">
              <Building className="w-4 h-4 text-brand-primary shrink-0" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name === 'Sail Road Branch' ? 'فرع طريق السيل (مكة)' : b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ (جدة)' : b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-brand-cream/50 px-3 py-2 rounded-xl border border-brand-secondary/20">
              <Building className="w-4 h-4 text-brand-primary" />
              <span>فرعك الحالي: {branches.find(b => b.id === selectedBranch)?.name === 'Sail Road Branch' ? 'طريق السيل' : 'منتجع الشاطئ'}</span>
            </div>
          )}

          {/* Date Picker */}
          <div className="flex items-center gap-1 bg-slate-50 border border-brand-secondary/20 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none font-sans"
            />
          </div>

          <button
            onClick={loadGridData}
            className="p-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition shadow shrink-0"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Grid Panel */}
      <div className="bg-white rounded-2xl border border-brand-secondary/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <RotateCw className="w-8 h-8 text-brand-primary animate-spin" />
            <span>جاري تحميل كشف الحضور...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لا توجد تسجيلات حضور أو انصراف لهذا اليوم والفرع المحددين.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                  <th className="p-4">الموظف</th>
                  <th className="p-4">الوظيفة / الدور</th>
                  <th className="p-4">الوردية المحددة</th>
                  <th className="p-4 text-center">وقت الدخول</th>
                  <th className="p-4 text-center">وقت الخروج</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">ملاحظات البصمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => {
                  const statusText = rec.status || '';
                  const isLate = statusText.includes('Late') || statusText.includes('Departure');
                  const isOnTime = statusText.includes('On time') || statusText.includes('Completed');

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                      <td className="p-4 font-extrabold text-slate-900">{rec.employee?.name}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold">
                          {translateRole(rec.employee?.role)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-800">{rec.shift?.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5 font-sans">
                          {rec.shift?.startTime} - {rec.shift?.endTime}
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-slate-850 bg-slate-50/20">{formatTime(rec.checkIn)}</td>
                      <td className="p-4 text-center font-mono font-bold text-slate-850 bg-slate-50/20">{formatTime(rec.checkOut)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold ${
                          isOnTime ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          isLate ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {isOnTime ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>{statusText.replace('✅ ', '').replace('⚠️ ', '')}</span>
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{rec.notes || '--'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
