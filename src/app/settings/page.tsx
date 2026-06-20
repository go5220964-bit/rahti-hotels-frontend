'use client';

import React, { useEffect, useState } from 'react';
import { api, Branch, User } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';

export default function SettingsPage() {
  const { role } = useRole();
  const [threshold, setThreshold] = useState(5000);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchLoc, setNewBranchLoc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      const bData = await api.getBranches();
      const uData = await api.getUsers();
      setBranches(bData);
      setUsers(uData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const translateRole = (roleStr: string) => {
    switch (roleStr) {
      case 'Admin': return 'مسؤول النظام';
      case 'CEO': return 'الرئيس التنفيذي';
      case 'FinanceManager': return 'المدير المالي';
      case 'Technician': return 'فني صيانة';
      case 'WarehouseManager': return 'مدير المستودع';
      case 'Receptionist': return 'موظف استقبال';
      default: return roleStr;
    }
  };

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('تم تحديث السقف المالي للمشتريات بنجاح!');
    }, 800);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;

    const newB: Branch = {
      id: `b-${branches.length + 1}`,
      name: newBranchName,
      location: newBranchLoc || 'المملكة العربية السعودية'
    };

    setBranches([...branches, newB]);
    setNewBranchName('');
    setNewBranchLoc('');
    alert(`تمت إضافة الفرع "${newBranchName}" بنجاح.`);
  };

  const isSettingsAdmin = role === Role.Admin;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* System Settings Form */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-brand-teal-dark uppercase tracking-wider">السقوف المالية والحدود</h3>
          <p className="text-xs text-muted">تحديد الضوابط المالية لأتمتة تحويل وتوجيه الموافقات في الفندق.</p>
        </div>

        <form onSubmit={handleSaveThreshold} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label htmlFor="threshold-input" className="block text-xs font-bold text-brand-teal-dark/70 uppercase">حد الموافقة التلقائي للمشتريات ($)</label>
            <div className="flex gap-2">
              <input
                id="threshold-input"
                type="number"
                disabled={!isSettingsAdmin}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                className="w-full text-xs p-2.5 bg-brand-cream-dark/20 border border-brand-secondary/35 rounded focus:outline-none focus:border-brand-secondary font-bold text-brand-teal-dark disabled:opacity-60 text-right"
              />
              {isSettingsAdmin && (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded shadow-md transition-all shrink-0"
                >
                  {isSaving ? 'جاري الحفظ...' : 'تحديث الحد'}
                </button>
              )}
            </div>
          </div>
          {!isSettingsAdmin && (
            <p className="text-[10px] text-red-650 font-bold italic">
              ⚠️ يمتلك مسؤولو النظام فقط الصلاحيات لتحديث حدود موافقات المشتريات.
            </p>
          )}
        </form>
      </div>

      {/* Branches management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Branch listing */}
        <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-brand-teal-dark uppercase tracking-wider">فروع الفنادق النشطة</h3>
            <p className="text-xs text-muted">الفنادق والخصائص المفعلة في النظام حالياً</p>
          </div>

          <div className="divide-y divide-brand-cream-dark max-h-60 overflow-y-auto">
            {branches.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-brand-teal-dark">
                    {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 
                     b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : b.name}
                  </div>
                  <div className="text-[10px] text-muted">{b.location}</div>
                </div>
                <span className="text-[9px] font-extrabold bg-brand-cream-dark px-2 py-0.5 rounded border border-brand-secondary/20 shrink-0">
                  {b.id.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {isSettingsAdmin && (
            <form onSubmit={handleAddBranch} className="pt-4 border-t border-brand-cream-dark space-y-3">
              <div className="text-xs font-bold text-brand-teal-dark/70 uppercase">تسجيل فرع فندق جديد</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="اسم الفرع"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="text-xs p-2.5 bg-brand-cream-dark/20 border border-brand-secondary/35 rounded focus:outline-none focus:border-brand-secondary font-semibold text-brand-teal-dark text-right"
                />
                <input
                  type="text"
                  placeholder="الموقع الجغرافي"
                  value={newBranchLoc}
                  onChange={(e) => setNewBranchLoc(e.target.value)}
                  className="text-xs p-2.5 bg-brand-cream-dark/20 border border-brand-secondary/35 rounded focus:outline-none focus:border-brand-secondary font-semibold text-brand-teal-dark text-right"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-cream border border-brand-secondary/35 hover:bg-brand-cream-dark text-brand-teal-dark font-bold text-xs py-2 rounded transition-colors"
              >
                حفظ وتسجيل العقار
              </button>
            </form>
          )}
        </div>

        {/* WhatsApp Staff Directory */}
        <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-brand-teal-dark uppercase tracking-wider">سجل توجيه بوابة الواتساب</h3>
            <p className="text-xs text-muted">الأرقام المفعلة لاستلام البلاغات التشغيلية التلقائية.</p>
          </div>

          <div className="divide-y divide-brand-cream-dark max-h-96 overflow-y-auto space-y-1">
            {users.map((u) => (
              <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-brand-teal-dark">{u.name}</div>
                  <div className="text-[10px] text-muted font-semibold">صلاحية الجلسة: {translateRole(u.role)}</div>
                </div>
                <div className="text-left">
                  <span className="font-bold text-brand-secondary block dir-ltr">{u.phoneNumber}</span>
                  <span className="text-[9px] text-muted italic">
                    الفرع: {u.branchId === 'b-1' ? 'فرع طريق السيل' : 'منتجع الشاطئ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
