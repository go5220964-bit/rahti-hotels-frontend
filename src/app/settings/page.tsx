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
  const [botMenuSettings, setBotMenuSettings] = useState({
    bot_menu_maintenance: true,
    bot_menu_cleaning: true,
    bot_menu_warehouse: true,
    bot_menu_procurement: true,
    bot_menu_techsupport: true,
    bot_menu_lostfound: true,
    bot_menu_damage: true,
    bot_menu_loan: true,
    bot_menu_leave: true,
    bot_menu_other: true,
  });

  const loadData = async () => {
    try {
      const [bData, uData, sData] = await Promise.all([
        api.getBranches(),
        api.getUsers(),
        api.getSystemSettings()
      ]);
      setBranches(bData);
      setUsers(uData);

      if (sData) {
        if (sData.procurementApprovalThreshold) {
          setThreshold(parseInt(sData.procurementApprovalThreshold, 10) || 5000);
        }
        setBotMenuSettings({
          bot_menu_maintenance: sData.bot_menu_maintenance !== 'false',
          bot_menu_cleaning: sData.bot_menu_cleaning !== 'false',
          bot_menu_warehouse: sData.bot_menu_warehouse !== 'false',
          bot_menu_procurement: sData.bot_menu_procurement !== 'false',
          bot_menu_techsupport: sData.bot_menu_techsupport !== 'false',
          bot_menu_lostfound: sData.bot_menu_lostfound !== 'false',
          bot_menu_damage: sData.bot_menu_damage !== 'false',
          bot_menu_loan: sData.bot_menu_loan !== 'false',
          bot_menu_leave: sData.bot_menu_leave !== 'false',
          bot_menu_other: sData.bot_menu_other !== 'false',
        });
      }
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== Role.Admin) return;
    setIsSaving(true);
    try {
      await api.updateSystemSettings({
        procurementApprovalThreshold: String(threshold),
        bot_menu_maintenance: String(botMenuSettings.bot_menu_maintenance),
        bot_menu_cleaning: String(botMenuSettings.bot_menu_cleaning),
        bot_menu_warehouse: String(botMenuSettings.bot_menu_warehouse),
        bot_menu_procurement: String(botMenuSettings.bot_menu_procurement),
        bot_menu_techsupport: String(botMenuSettings.bot_menu_techsupport),
        bot_menu_lostfound: String(botMenuSettings.bot_menu_lostfound),
        bot_menu_damage: String(botMenuSettings.bot_menu_damage),
        bot_menu_loan: String(botMenuSettings.bot_menu_loan),
        bot_menu_leave: String(botMenuSettings.bot_menu_leave),
        bot_menu_other: String(botMenuSettings.bot_menu_other),
      });
      alert('تم حفظ إعدادات النظام وتخصيص قائمة البوت بنجاح!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ الإعدادات.');
    } finally {
      setIsSaving(false);
    }
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
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Threshold Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-brand-teal-dark uppercase tracking-wider">السقوف المالية والحدود</h3>
              <p className="text-xs text-muted">تحديد الضوابط المالية لأتمتة تحويل وتوجيه الموافقات في الفندق.</p>
            </div>
            <div className="space-y-1.5 max-w-md">
              <label htmlFor="threshold-input" className="block text-xs font-bold text-brand-teal-dark/70 uppercase">حد الموافقة التلقائي للمشتريات ($)</label>
              <input
                id="threshold-input"
                type="number"
                disabled={!isSettingsAdmin}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                className="w-full text-xs p-2.5 bg-brand-cream-dark/20 border border-brand-secondary/35 rounded focus:outline-none focus:border-brand-secondary font-bold text-brand-teal-dark disabled:opacity-60 text-right"
              />
            </div>
          </div>

          {/* WhatsApp Bot Menu Customization Section */}
          <div className="border-t border-brand-cream-dark pt-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#1C2D42] uppercase tracking-wider">تخصيص قائمة خيارات بوت الواتساب</h3>
              <p className="text-xs text-slate-400">حدد الخدمات التي تود إتاحتها أو إيقافها مؤقتاً في قائمة خيارات البوت المتاحة للموظفين.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'bot_menu_maintenance', label: '🛠️ طلب صيانة عامة' },
                { key: 'bot_menu_cleaning', label: '🧹 نظافة وتجهيز الغرف' },
                { key: 'bot_menu_warehouse', label: '📦 طلب صرف من المستودع' },
                { key: 'bot_menu_procurement', label: '🛒 طلب شراء خارجي' },
                { key: 'bot_menu_techsupport', label: '💻 بلاغ دعم فني وتقني' },
                { key: 'bot_menu_lostfound', label: '🛎️ تسجيل مفقودات' },
                { key: 'bot_menu_damage', label: '💥 تسجيل تلفيات وعوارض' },
                { key: 'bot_menu_loan', label: '💰 تقديم طلب سلفة مالية' },
                { key: 'bot_menu_leave', label: '🏖️ تقديم طلب إجازة عمل' },
                { key: 'bot_menu_other', label: '📋 طلبات أخرى وإدارية' },
              ].map(item => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-150 hover:bg-slate-50 transition cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    disabled={!isSettingsAdmin}
                    checked={(botMenuSettings as any)[item.key]}
                    onChange={(e) => setBotMenuSettings({
                      ...botMenuSettings,
                      [item.key]: e.target.checked
                    })}
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer"
                  />
                  <span className="text-xs font-bold text-brand-teal-dark">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {isSettingsAdmin ? (
            <div className="pt-4 border-t border-brand-cream-dark flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-8 py-3 rounded-lg shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'جاري حفظ الإعدادات...' : 'حفظ وتحديث الإعدادات'}
              </button>
            </div>
          ) : (
            <p className="text-[10px] text-red-650 font-bold italic pt-2">
              ⚠️ يمتلك مسؤولو النظام فقط الصلاحيات لتحديث إعدادات البوت والحدود المالية.
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
