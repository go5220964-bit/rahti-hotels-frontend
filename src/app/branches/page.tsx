'use client';

import React, { useState, useEffect } from 'react';
import { api, Branch } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import { Plus, Pencil, Trash2, X, RotateCw } from 'lucide-react';

export default function BranchesPage() {
  const { role: currentRole } = useRole();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchLocation, setBranchLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Edit Modal State
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editBranchName, setEditBranchName] = useState('');
  const [editBranchLocation, setEditBranchLocation] = useState('');

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
      const branchesData = await api.getBranches();
      setBranches(branchesData);
    } catch (error) {
      console.error('Failed to load branch data:', error);
      showToast('خطأ أثناء تحميل الفروع من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    if (!branchName.trim()) {
      setModalError('الرجاء إدخال اسم الفرع');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const newBranch = await api.createBranch({
        name: branchName.trim(),
        location: branchLocation.trim()
      });

      setBranches([newBranch, ...branches]);
      setIsModalOpen(false);
      showToast(`تمت إضافة الفرع الجديد "${newBranch.name}" بنجاح في قاعدة البيانات.`);
      
      // Reset form
      setBranchName('');
      setBranchLocation('');
    } catch (error: any) {
      console.error('Failed to create branch:', error);
      setModalError('حدث خطأ أثناء الاتصال بالخادم لحفظ الفرع الجديد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setEditBranchName(branch.name);
    setEditBranchLocation(branch.location || '');
    setModalError('');
  };

  const handleEditBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !editingBranch) return;

    if (!editBranchName.trim()) {
      setModalError('الرجاء إدخال اسم الفرع');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const updatedBranch = await api.updateBranch(editingBranch.id, {
        name: editBranchName.trim(),
        location: editBranchLocation.trim()
      });

      setBranches(branches.map(b => b.id === editingBranch.id ? updatedBranch : b));
      setEditingBranch(null);
      showToast(`تم تحديث بيانات الفرع "${updatedBranch.name}" بنجاح.`);
    } catch (error: any) {
      console.error('Failed to update branch:', error);
      setModalError('حدث خطأ أثناء حفظ التعديلات للفرع.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBranch = async (branchId: string, branchNameStr: string) => {
    if (!canManage) return;
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف الفرع "${branchNameStr}" نهائياً؟ سيؤدي ذلك لإزالته بالكامل من قوائم اختيار بوت الواتساب.`)) {
      return;
    }

    const previousBranches = [...branches];
    setBranches(branches.filter(b => b.id !== branchId));

    try {
      await api.deleteBranch(branchId);
      showToast(`تم حذف الفرع "${branchNameStr}" بنجاح.`);
    } catch (error) {
      console.error('Failed to delete branch:', error);
      setBranches(previousBranches);
      showToast('فشل حذف الفرع من قاعدة البيانات', 'error');
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
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">إدارة فروع الفنادق والمنشآت</h1>
          <p className="text-xs text-white/70 mt-1">
            أنشئ وراقب الفروع النشطة لسلسلة فنادق راحتي. ترتبط الفروع الجديدة تلقائياً بقوائم البوت لتوجيه العمليات.
          </p>
        </div>
        
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold bg-brand-secondary hover:bg-brand-secondary-hover text-brand-teal-dark px-4 py-2.5 rounded border border-brand-secondary transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            إضافة فرع جديد
          </button>
        )}
      </div>

      {/* Branches Table Card */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-xs text-muted italic">جاري تحميل قائمة الفروع...</div>
        ) : branches.length === 0 ? (
          <div className="text-center py-20 text-xs text-muted italic">لا توجد فروع مسجلة حالياً.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                  <th className="px-6 py-4">اسم الفرع</th>
                  <th className="px-6 py-4">الموقع الجغرافي</th>
                  <th className="px-6 py-4 text-center">بوابة الواتساب</th>
                  <th className="px-6 py-4 text-center">الحالة التشغيلية</th>
                  {canManage && <th className="px-6 py-4 text-center">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                {branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-brand-cream/10 transition-colors">
                    {/* Branch name & icon */}
                    <td className="px-6 py-4 flex items-center gap-3 font-bold text-sm">
                      <div className="w-8 h-8 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary text-xs font-extrabold shrink-0">
                        🏢
                      </div>
                      <span>
                        {branch.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 
                         branch.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : 
                         branch.name}
                      </span>
                    </td>
                    
                    {/* Location */}
                    <td className="px-6 py-4 font-semibold text-muted">
                      {branch.location || 'غير محدد'}
                    </td>

                    {/* WhatsApp sync status */}
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-50 border border-green-200 text-green-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                        مربوط وتلقائي
                      </span>
                    </td>

                    {/* Operational Status */}
                    <td className="px-6 py-4 text-center">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                        نشط ومفعل
                      </span>
                    </td>

                    {/* Actions Column (Edit/Delete) */}
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleStartEdit(branch)}
                            title="تعديل الفرع"
                            className="p-1.5 border border-brand-secondary/30 rounded text-brand-teal-dark hover:bg-brand-cream transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteBranch(branch.id, branch.name)}
                            title="حذف الفرع نهائياً"
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

      {/* Add Branch Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">إنشاء فرع جديد</h3>
                <p className="text-[10px] text-white/60 mt-1">تعبئة البيانات لتسجيل الفرع وربطه بالمنظومة وبوت العمليات.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddBranch} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded">
                  ⚠️ {modalError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">اسم الفرع (باللغة العربية أو الإنجليزية):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فرع الهدا بالطائف أو Sail Road Branch"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">الموقع الجغرافي / العنوان:</label>
                <input
                  type="text"
                  placeholder="مثال: مكة المكرمة، المملكة العربية السعودية"
                  value={branchLocation}
                  onChange={(e) => setBranchLocation(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
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
                  إنشاء وتفعيل الفرع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Modal Dialog */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">تعديل بيانات الفرع</h3>
                <p className="text-[10px] text-white/60 mt-1">تحديث اسم الفرع أو موقعه الجغرافي المسجل.</p>
              </div>
              <button
                onClick={() => setEditingBranch(null)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditBranchSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded">
                  ⚠️ {modalError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">اسم الفرع:</label>
                <input
                  type="text"
                  required
                  value={editBranchName}
                  onChange={(e) => setEditBranchName(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">الموقع الجغرافي / العنوان:</label>
                <input
                  type="text"
                  value={editBranchLocation}
                  onChange={(e) => setEditBranchLocation(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
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
