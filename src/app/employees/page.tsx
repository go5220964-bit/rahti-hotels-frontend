'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, User, Branch } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import { Plus, Pencil, Trash2, X, RotateCw } from 'lucide-react';

export default function EmployeesPage() {
  const { role: currentRole } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Technician');
  const [empBranchId, setEmpBranchId] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmployeeType, setEmpEmployeeType] = useState<'Fixed' | 'Mobile'>('Fixed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('Technician');
  const [editBranchId, setEditBranchId] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmployeeType, setEditEmployeeType] = useState<'Fixed' | 'Mobile'>('Fixed');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const canManage = currentRole === Role.Admin || currentRole === Role.CEO;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, branchesData] = await Promise.all([
        api.getUsers(),
        api.getBranches()
      ]);
      setUsers(usersData);
      setBranches(branchesData);
      
      if (branchesData.length > 0) {
        setEmpBranchId(branchesData[0].id);
      }
    } catch (error) {
      console.error('Failed to load employee data:', error);
      showToast('خطأ أثناء تحميل الموظفين والفروع', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    if (!empName.trim()) {
      setModalError('الرجاء إدخال اسم الموظف');
      return;
    }

    if (!empPhone.trim()) {
      setModalError('الرجاء إدخال رقم الهاتف');
      return;
    }

    // Basic phone number format check (+123...)
    if (!empPhone.startsWith('+')) {
      setModalError('رقم الهاتف يجب أن يبدأ بـ + ومقدمة الدولة (مثال: +1234567890)');
      return;
    }

    const isGlobalRole = ['Admin', 'CEO', 'FinanceManager', 'Accountant', 'MaintenanceSupervisor', 'ProcurementOfficer'].includes(empRole);
    if (!empBranchId && !isGlobalRole) {
      setModalError('الرجاء تحديد الفرع');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const newUser = await api.createUser({
        name: empName.trim(),
        role: empRole,
        phoneNumber: empPhone.trim(),
        branchId: empBranchId || null,
        employeeType: empEmployeeType
      });

      // Hydrate with branch details for local list
      const matchedBranch = branches.find(b => b.id === empBranchId);
      const hydratedUser = {
        ...newUser,
        branch: matchedBranch
      };

      setUsers([hydratedUser, ...users]);
      setIsModalOpen(false);
      showToast(`تمت إضافة الموظف "${hydratedUser.name}" بنجاح وتفعيل حسابه.`);
      
      // Reset form
      setEmpName('');
      setEmpRole('Technician');
      setEmpPhone('');
      setEmpEmployeeType('Fixed');
      if (branches.length > 0) {
        setEmpBranchId(branches[0].id);
      }
    } catch (error: any) {
      console.error('Failed to create user:', error);
      setModalError(error?.message || 'حدث خطأ أثناء حفظ بيانات الموظف الجديد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditBranchId(user.branchId || '');
    setEditPhone(user.phoneNumber);
    setEditEmployeeType(user.employeeType || 'Fixed');
    setModalError('');
  };

  const handleEditEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !editingUser) return;

    if (!editName.trim()) {
      setModalError('الرجاء إدخال اسم الموظف');
      return;
    }

    if (!editPhone.trim()) {
      setModalError('الرجاء إدخال رقم الهاتف');
      return;
    }

    if (!editPhone.startsWith('+')) {
      setModalError('رقم الهاتف يجب أن يبدأ بـ + ومقدمة الدولة (مثال: +1234567890)');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const updatedUser = await api.updateUser(editingUser.id, {
        name: editName.trim(),
        role: editRole,
        phoneNumber: editPhone.trim(),
        branchId: editBranchId || null,
        employeeType: editEmployeeType
      });

      const matchedBranch = branches.find(b => b.id === editBranchId);
      const hydratedUser = {
        ...updatedUser,
        branch: matchedBranch
      };

      setUsers(users.map(u => u.id === editingUser.id ? hydratedUser : u));
      setEditingUser(null);
      showToast(`تم تحديث بيانات الموظف "${hydratedUser.name}" بنجاح.`);
    } catch (error: any) {
      console.error('Failed to update user:', error);
      setModalError(error?.message || 'حدث خطأ أثناء حفظ التعديلات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (userId: string, userNameStr: string) => {
    if (!canManage) return;
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف الموظف "${userNameStr}" نهائياً؟ سيتم إلغاء تفعيل ربطه مع بوت الواتساب.`)) {
      return;
    }

    const previousUsers = [...users];
    setUsers(users.filter(u => u.id !== userId));

    try {
      await api.deleteUser(userId);
      showToast(`تم حذف الموظف "${userNameStr}" بنجاح.`);
    } catch (error) {
      console.error('Failed to delete user:', error);
      setUsers(previousUsers);
      showToast('فشل حذف الموظف من قاعدة البيانات', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-5 left-5 z-50 px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 text-xs font-bold transition-all transform duration-300 translate-y-0 border ${
            toast.type === 'error' 
              ? 'bg-rose-50 border-rose-300 text-rose-800' 
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-brand-teal-dark text-white p-6 rounded-xl border border-brand-secondary/35 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-secondary/10 blur-2xl"></div>
        <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-brand-secondary/40"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-brand-secondary/40"></div>

        <div>
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">إدارة الموظفين والفرقاء الميدانيين</h1>
          <p className="text-xs text-white/70 mt-1">
            سجل موظفي الفندق وحدد أدوارهم وفروعهم لتفعيل ربط قنوات الاتصال ببوابة الواتساب الذكية.
          </p>
        </div>
        
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold bg-brand-secondary hover:bg-brand-secondary-hover text-brand-teal-dark px-4 py-2.5 rounded border border-brand-secondary transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            إضافة موظف جديد
          </button>
        )}
      </div>

      {/* Employees Table Card */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-xs text-muted italic">جاري تحميل سجلات الموظفين...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-xs text-muted italic">لا يوجد موظفون مسجلون حالياً.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                  <th className="px-6 py-4">اسم الموظف</th>
                  <th className="px-6 py-4">الدور / الصلاحية</th>
                  <th className="px-6 py-4">الفرع المخصص</th>
                  <th className="px-6 py-4 font-semibold text-right">طبيعة العمل</th>
                  <th className="px-6 py-4">رقم الواتساب للربط</th>
                  <th className="px-6 py-4 text-center">الحالة</th>
                  {canManage && <th className="px-6 py-4 text-center">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-cream/10 transition-colors">
                    {/* User name & icon */}
                    <td className="px-6 py-4 flex items-center gap-3 font-bold text-sm">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-extrabold shrink-0">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <Link href={`/employees/${user.id}`} className="hover:underline text-brand-primary">
                        {user.name}
                      </Link>
                    </td>
                    
                    {/* Role */}
                    <td className="px-6 py-4 font-semibold text-brand-teal-dark">
                      {translateRole(user.role)}
                    </td>

                    {/* Branch */}
                    <td className="px-6 py-4 font-medium text-muted">
                      {user.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 
                       user.branch?.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : 
                       (user.branch?.name || 'عام (جميع الفروع)')}
                    </td>

                    {/* Employee Type */}
                    <td className="px-6 py-4">
                      {user.employeeType === 'Mobile' ? (
                        <span className="bg-purple-50 border border-purple-200 text-purple-800 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
                          طاقم متنقل (Mobile)
                        </span>
                      ) : (
                        <span className="bg-blue-50 border border-blue-200 text-blue-800 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
                          ثابت بالفرع (Fixed)
                        </span>
                      )}
                    </td>

                    {/* WhatsApp */}
                    <td className="px-6 py-4 font-mono font-medium text-muted dir-ltr text-right">
                      {user.phoneNumber}
                    </td>

                    {/* Status indicator */}
                    <td className="px-6 py-4 text-center">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                        نشط بالواتساب
                      </span>
                    </td>

                    {/* Actions Column (Edit/Delete) */}
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleStartEdit(user)}
                            title="تعديل الموظف"
                            className="p-1.5 border border-brand-secondary/30 rounded text-brand-teal-dark hover:bg-brand-cream transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteEmployee(user.id, user.name)}
                            title="حذف الموظف نهائياً"
                            className="p-1.5 border border-rose-200 rounded text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">تسجيل موظف جديد</h3>
                <p className="text-[10px] text-white/60 mt-1">تعبئة البيانات لإنشاء ملف الموظف وربط حسابه مع البوت.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded">
                  ⚠️ {modalError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">اسم الموظف بالكامل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مراد عبد الرحمن"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Phone number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">رقم الهاتف (الواتساب):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: +1234567899"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary text-left font-mono"
                  dir="ltr"
                />
                <span className="text-[10px] text-muted block mt-0.5">يجب إدراج مقدمة الدولة وبداية الرمز + (بدون مسافات).</span>
              </div>

              {/* Role & Branch Selection Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">دور الموظف والصلاحية:</label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                  >
                    <option value="Admin">مدير النظام (Admin)</option>
                    <option value="CEO">الرئيس التنفيذي (CEO)</option>
                    <option value="FinanceManager">المدير المالي (FinanceManager)</option>
                    <option value="BranchManager">مدير الفرع (BranchManager)</option>
                    <option value="Accountant">محاسب (Accountant)</option>
                    <option value="Receptionist">موظف استقبال (Receptionist)</option>
                    <option value="Technician">فني صيانة (Technician)</option>
                    <option value="MaintenanceSupervisor">مشرف الصيانة (MaintenanceSupervisor)</option>
                    <option value="HousekeepingSupervisor">مشرف هاوسكيبنج (HousekeepingSupervisor)</option>
                    <option value="WarehouseManager">أمين المستودع (WarehouseManager)</option>
                    <option value="ProcurementOfficer">مسؤول المشتريات (ProcurementOfficer)</option>
                    <option value="HousekeepingStaff">عامل نظافة (HousekeepingStaff)</option>
                  </select>
                </div>

                {/* Branch selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">الفرع المخصص:</label>
                  <select
                    value={empBranchId}
                    onChange={(e) => setEmpBranchId(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                  >
                    <option value="">عام (جميع الفروع)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' : b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employee Type selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">نوع التكليف / الدوام (البصمة الجغرافية):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmpEmployeeType('Fixed')}
                    className={`py-2 px-3 border rounded text-xs font-bold transition-all cursor-pointer ${
                      empEmployeeType === 'Fixed' 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ثابت بالفرع (Fixed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmpEmployeeType('Mobile')}
                    className={`py-2 px-3 border rounded text-xs font-bold transition-all cursor-pointer ${
                      empEmployeeType === 'Mobile' 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    طاقم متنقل (Mobile - مطابقة أقرب فرع)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream-dark text-brand-teal-dark px-4 py-2.5 rounded transition-all cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded border border-brand-primary transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && (
                    <RotateCw className="animate-spin w-3.5 h-3.5" />
                  )}
                  إضافة وحفظ الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal Dialog */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">تعديل بيانات الموظف</h3>
                <p className="text-[10px] text-white/60 mt-1">تعديل الصلاحيات أو الفرع أو رقم الهاتف المربوط بالواتساب.</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditEmployeeSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded">
                  ⚠️ {modalError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">اسم الموظف بالكامل:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Phone number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">رقم الهاتف (الواتساب):</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary text-left font-mono"
                  dir="ltr"
                />
                <span className="text-[10px] text-muted block mt-0.5">يجب إدراج مقدمة الدولة وبداية الرمز + (بدون مسافات).</span>
              </div>

              {/* Role & Branch Selection Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">دور الموظف والصلاحية:</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                  >
                    <option value="Admin">مدير النظام (Admin)</option>
                    <option value="CEO">الرئيس التنفيذي (CEO)</option>
                    <option value="FinanceManager">المدير المالي (FinanceManager)</option>
                    <option value="BranchManager">مدير الفرع (BranchManager)</option>
                    <option value="Accountant">محاسب (Accountant)</option>
                    <option value="Receptionist">موظف استقبال (Receptionist)</option>
                    <option value="Technician">فني صيانة (Technician)</option>
                    <option value="MaintenanceSupervisor">مشرف الصيانة (MaintenanceSupervisor)</option>
                    <option value="HousekeepingSupervisor">مشرف هاوسكيبنج (HousekeepingSupervisor)</option>
                    <option value="WarehouseManager">أمين المستودع (WarehouseManager)</option>
                    <option value="ProcurementOfficer">مسؤول المشتريات (ProcurementOfficer)</option>
                    <option value="HousekeepingStaff">عامل نظافة (HousekeepingStaff)</option>
                  </select>
                </div>

                {/* Branch selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">الفرع المخصص:</label>
                  <select
                    value={editBranchId}
                    onChange={(e) => setEditBranchId(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                  >
                    <option value="">عام (جميع الفروع)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' : b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employee Type selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">نوع التكليف / الدوام (البصمة الجغرافية):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditEmployeeType('Fixed')}
                    className={`py-2 px-3 border rounded text-xs font-bold transition-all cursor-pointer ${
                      editEmployeeType === 'Fixed' 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ثابت بالفرع (Fixed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditEmployeeType('Mobile')}
                    className={`py-2 px-3 border rounded text-xs font-bold transition-all cursor-pointer ${
                      editEmployeeType === 'Mobile' 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    طاقم متنقل (Mobile - مطابقة أقرب فرع)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream-dark text-brand-teal-dark px-4 py-2.5 rounded transition-all cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded border border-brand-primary transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && (
                    <RotateCw className="animate-spin w-3.5 h-3.5" />
                  )}
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
