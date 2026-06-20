'use client';

import React, { useState, useEffect } from 'react';
import { api, User, Branch } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Role } from '@/types_local';
import { Plus, Pencil, UserX, UserCheck, X, RotateCw, Mail, Phone, Shield } from 'lucide-react';

export default function SystemUsersPage() {
  const { role: currentRole } = useRole();
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('Technician');
  const [branchId, setBranchId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [botEnabled, setBotEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, bData] = await Promise.all([
        api.getUsers(),
        api.getBranches()
      ]);
      setUsers(uData);
      setBranches(bData);
      if (bData.length > 0) {
        setBranchId(bData[0].id);
      }
    } catch (e) {
      console.error(e);
      showToast('حدث خطأ أثناء تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole !== Role.Admin) return;
    loadData();
  }, [currentRole]);

  if (currentRole !== Role.Admin) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl text-center font-bold" dir="rtl">
        ⚠️ عذراً، هذه الصفحة مخصصة لمدير النظام فقط.
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
      default: return roleStr;
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) {
      setError('الاسم ورقم الهاتف حقول مطلوبة');
      return;
    }
    if (!phoneNumber.startsWith('+')) {
      setError('رقم الهاتف يجب أن يبدأ بـ + ومقدمة الدولة (مثال: +966500000000)');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const newUser = await api.createUser({
        name: name.trim(),
        role,
        phoneNumber: phoneNumber.trim(),
        branchId,
        email: email.trim() || null,
        botEnabled
      });
      const matchedBranch = branches.find(b => b.id === branchId);
      const hydratedUser = {
        ...newUser,
        branch: matchedBranch,
        isActive: true
      };
      setUsers([hydratedUser, ...users]);
      setIsAddOpen(false);
      showToast(`تمت إضافة المستخدم "${name}" بنجاح.`);
      setName('');
      setPhoneNumber('');
      setEmail('');
      setBotEnabled(true);
    } catch (err: any) {
      setError(err?.message || 'فشل إضافة المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (user: any) => {
    setEditingUser(user);
    setName(user.name);
    setRole(user.role);
    setBranchId(user.branchId);
    setPhoneNumber(user.phoneNumber);
    setEmail(user.email || '');
    setBotEnabled(user.botEnabled !== false);
    setError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) {
      setError('الاسم ورقم الهاتف حقول مطلوبة');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const updatedUser = await api.updateUser(editingUser.id, {
        name: name.trim(),
        role,
        phoneNumber: phoneNumber.trim(),
        branchId,
        email: email.trim() || null,
        botEnabled
      });
      const matchedBranch = branches.find(b => b.id === branchId);
      const hydratedUser = {
        ...editingUser,
        ...updatedUser,
        branch: matchedBranch
      };
      setUsers(users.map(u => u.id === editingUser.id ? hydratedUser : u));
      setEditingUser(null);
      showToast(`تم تحديث بيانات المستخدم "${name}" بنجاح.`);
    } catch (err: any) {
      setError(err?.message || 'فشل تحديث المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    const actionText = currentStatus ? 'تعطيل' : 'تفعيل';
    if (!confirm(`هل أنت متأكد من ${actionText} حساب المستخدم "${userName}"؟`)) return;

    try {
      await api.toggleUserStatus(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
      showToast(`تم ${actionText} حساب المستخدم بنجاح.`);
    } catch (e) {
      showToast('فشل تعديل حالة الحساب', 'error');
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
            <Shield className="w-6 h-6 text-brand-primary" />
            <span>إدارة مستخدمي النظام</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            إضافة وتعديل بيانات الموظفين، تحديد الأدوار الوظيفية، وتفعيل أو تعطيل صلاحيات دخول النظام.
          </p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsAddOpen(true);
          }}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold text-xs px-4.5 py-2.5 rounded-lg flex items-center gap-2 transition shadow shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Users List Grid */}
      <div className="bg-white rounded-2xl border border-brand-secondary/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <RotateCw className="w-8 h-8 text-brand-primary animate-spin" />
            <span>جاري تحميل قائمة المستخدمين...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لا يوجد مستخدمون مسجلون في النظام حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                  <th className="p-4">الموظف</th>
                  <th className="p-4">الدور الصلاحيات</th>
                  <th className="p-4">الفرع</th>
                  <th className="p-4">معلومات الاتصال</th>
                  <th className="p-4">الربط بالبوت</th>
                  <th className="p-4">حالة الحساب</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">ID: #{user.id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-brand-cream text-brand-teal-dark px-2.5 py-1 rounded border border-brand-secondary/20 text-[10px] font-extrabold">
                        {translateRole(user.role)}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' :
                       user.branch?.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' :
                       user.branch?.name || '--'}
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.phoneNumber}</span>
                      </div>
                      {user.email && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        user.botEnabled !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {user.botEnabled !== false ? 'مفعل للبوت' : 'معطل للبوت'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        user.isActive !== false ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {user.isActive !== false ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleStartEdit(user)}
                        className="p-1.5 bg-slate-100 hover:bg-brand-primary/10 text-slate-600 hover:text-brand-primary rounded transition"
                        title="تعديل البيانات"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive !== false, user.name)}
                        className={`p-1.5 rounded transition ${
                          user.isActive !== false ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                        }`}
                        title={user.isActive !== false ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                      >
                        {user.isActive !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-2xl max-w-md w-full border border-brand-secondary/25 overflow-hidden animate-in zoom-in duration-200 text-right p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-brand-teal-dark">إضافة مستخدم جديد للنظام</h2>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">الاسم الكامل للموظف:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">الدور / الصلاحيات:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
                >
                  <option value="Admin">مدير النظام (Admin)</option>
                  <option value="CEO">الرئيس التنفيذي (CEO)</option>
                  <option value="FinanceManager">المدير المالي (FinanceManager)</option>
                  <option value="BranchManager">مدير الفرع (BranchManager)</option>
                  <option value="Receptionist">موظف استقبال (Receptionist)</option>
                  <option value="Accountant">محاسب (Accountant)</option>
                  <option value="MaintenanceSupervisor">مشرف الصيانة (Supervisor)</option>
                  <option value="WarehouseManager">أمين المستودع (Storekeeper)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">الفرع الرئيسي:</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name === 'Sail Road Branch' ? 'طريق السيل (مكة)' : b.name === 'Beachside Resort Branch' ? 'منتجع الشاطئ (جدة)' : b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">رقم الهاتف (مع رمز الدولة بالبلس):</label>
              <input
                type="text"
                placeholder="+966500000000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">البريد الإلكتروني للعمل (اختياري):</label>
              <input
                type="email"
                placeholder="employee@rahtihotels.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="botEnabled"
                checked={botEnabled}
                onChange={(e) => setBotEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="botEnabled" className="text-xs font-bold text-slate-600 cursor-pointer">
                تمكين الرد التلقائي عبر بوت الواتساب للرقم
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ الموظف الجديد'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl max-w-md w-full border border-brand-secondary/25 overflow-hidden animate-in zoom-in duration-200 text-right p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-brand-teal-dark">تعديل بيانات المستخدم: {editingUser.name}</h2>
              <button type="button" onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">الاسم الكامل للموظف:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">الدور / الصلاحيات:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
                >
                  <option value="Admin">مدير النظام (Admin)</option>
                  <option value="CEO">الرئيس التنفيذي (CEO)</option>
                  <option value="FinanceManager">المدير المالي (FinanceManager)</option>
                  <option value="BranchManager">مدير الفرع (BranchManager)</option>
                  <option value="Receptionist">موظف استقبال (Receptionist)</option>
                  <option value="Accountant">محاسب (Accountant)</option>
                  <option value="MaintenanceSupervisor">مشرف الصيانة (Supervisor)</option>
                  <option value="WarehouseManager">أمين المستودع (Storekeeper)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">الفرع الرئيسي:</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name === 'Sail Road Branch' ? 'طريق السيل (مكة)' : b.name === 'Beachside Resort Branch' ? 'منتجع الشاطئ (جدة)' : b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">رقم الهاتف:</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">البريد الإلكتروني للعمل:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="editBotEnabled"
                checked={botEnabled}
                onChange={(e) => setBotEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="editBotEnabled" className="text-xs font-bold text-slate-600 cursor-pointer">
                تمكين الرد التلقائي عبر بوت الواتساب للرقم
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting ? 'جاري التحديث...' : 'تحديث البيانات'}
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
