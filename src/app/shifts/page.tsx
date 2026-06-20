'use client';

import React, { useState, useEffect } from 'react';
import { api, Shift, Branch } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import { Plus, Pencil, Trash2, X, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

export default function ShiftsPage() {
  const { role: currentRole } = useRole();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shiftName, setShiftName] = useState('');
  const [shiftType, setShiftType] = useState<'fixed' | 'open'>('fixed'); // fixed = fixed hours, open = flexible/open shift
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('global'); // 'global' or branchId
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Edit Modal State
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [editShiftName, setEditShiftName] = useState('');
  const [editShiftType, setEditShiftType] = useState<'fixed' | 'open'>('fixed');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editBranchId, setEditBranchId] = useState<string>('global');

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
      const [shiftsData, branchesData] = await Promise.all([
        api.getShifts(),
        api.getBranches()
      ]);
      setShifts(shiftsData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Failed to load shifts/branches:', error);
      showToast('خطأ أثناء تحميل البيانات من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    if (!shiftName.trim()) {
      setModalError('الرجاء إدخال اسم الوردية');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const isShiftOpen = shiftType === 'open';
      const newShift = await api.createShift({
        name: shiftName.trim(),
        startTime: isShiftOpen ? '' : startTime,
        endTime: isShiftOpen ? '' : endTime,
        branchId: selectedBranchId === 'global' ? null : selectedBranchId,
        isOpen: isShiftOpen
      });

      setShifts([...shifts, newShift]);
      setIsModalOpen(false);
      showToast(`تمت إضافة الوردية الجديدة "${newShift.name}" بنجاح.`);
      
      // Reset form
      setShiftName('');
      setShiftType('fixed');
      setStartTime('08:00');
      setEndTime('16:00');
      setSelectedBranchId('global');
    } catch (error: any) {
      console.error('Failed to create shift:', error);
      setModalError('حدث خطأ أثناء الاتصال بالخادم لحفظ الوردية الجديدة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (shift: Shift) => {
    setEditingShift(shift);
    setEditShiftName(shift.name);
    setEditShiftType(shift.isOpen ? 'open' : 'fixed');
    setEditStartTime(shift.startTime || '08:00');
    setEditEndTime(shift.endTime || '16:00');
    setEditBranchId(shift.branchId || 'global');
    setModalError('');
  };

  const handleEditShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !editingShift) return;

    if (!editShiftName.trim()) {
      setModalError('الرجاء إدخال اسم الوردية');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const isShiftOpen = editShiftType === 'open';
      const updatedShift = await api.updateShift(editingShift.id, {
        name: editShiftName.trim(),
        startTime: isShiftOpen ? '' : editStartTime,
        endTime: isShiftOpen ? '' : editEndTime,
        branchId: editBranchId === 'global' ? null : editBranchId,
        isOpen: isShiftOpen
      });

      setShifts(shifts.map(s => s.id === editingShift.id ? updatedShift : s));
      setEditingShift(null);
      showToast(`تم تحديث الوردية "${updatedShift.name}" بنجاح.`);
    } catch (error: any) {
      console.error('Failed to update shift:', error);
      setModalError('حدث خطأ أثناء حفظ التعديلات للوردية.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShift = async (shiftId: string, shiftNameStr: string) => {
    if (!canManage) return;
    if (!window.confirm(`هل أنت متأكد من رغبتك في تعطيل الوردية "${shiftNameStr}"؟ سيؤدي ذلك لإزالتها من الاستمارات الجديدة.`)) {
      return;
    }

    try {
      await api.deleteShift(shiftId);
      setShifts(shifts.filter(s => s.id !== shiftId));
      showToast(`تم تعطيل الوردية "${shiftNameStr}" بنجاح.`);
    } catch (error) {
      console.error('Failed to delete shift:', error);
      showToast('فشل إلغاء تنشيط الوردية من قاعدة البيانات', 'error');
    }
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return 'عام (كافة الفروع)';
    const branch = branches.find(b => b.id === branchId);
    if (!branch) return branchId;
    return branch.name === 'Sail Road Branch' ? 'فرع طريق السيل' :
           branch.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' :
           branch.name;
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
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">إدارة ورديات الموظفين</h1>
          <p className="text-xs text-white/70 mt-1">
            قم بإنشاء وتحديد فترات العمل اليومية (الورديات الثابتة والمفتوحة) وربطها بالفروع لتنظيم تقارير التقفيلة اليومية.
          </p>
        </div>
        
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold bg-brand-secondary hover:bg-brand-secondary-hover text-brand-teal-dark px-4 py-2.5 rounded border border-brand-secondary transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            إضافة وردية جديدة
          </button>
        )}
      </div>

      {/* Shifts Table Card */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-xs text-muted italic">جاري تحميل قائمة الورديات...</div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-20 text-xs text-muted italic">لا توجد ورديات نشطة مسجلة حالياً.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                  <th className="px-6 py-4">اسم الوردية</th>
                  <th className="px-6 py-4">الفرع المرتبط</th>
                  <th className="px-6 py-4">نوع الفترة</th>
                  <th className="px-6 py-4">موعد البدء</th>
                  <th className="px-6 py-4">موعد الانتهاء</th>
                  <th className="px-6 py-4 text-center">الحالة</th>
                  {canManage && <th className="px-6 py-4 text-center">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-brand-cream/10 transition-colors">
                    {/* Shift name & icon */}
                    <td className="px-6 py-4 flex items-center gap-3 font-bold text-sm">
                      <div className="w-8 h-8 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary text-xs shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span>{shift.name}</span>
                    </td>
                    
                    {/* Branch */}
                    <td className="px-6 py-4 font-semibold text-muted">
                      {getBranchName(shift.branchId)}
                    </td>

                    {/* Shift Type */}
                    <td className="px-6 py-4">
                      {shift.isOpen ? (
                        <span className="bg-purple-50 border border-purple-200 text-purple-800 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
                          وردية مفتوحة (مرنة)
                        </span>
                      ) : (
                        <span className="bg-blue-50 border border-blue-200 text-blue-800 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
                          وردية ثابتة الوقت
                        </span>
                      )}
                    </td>

                    {/* Start Time */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                      {shift.isOpen ? 'مرن' : shift.startTime}
                    </td>

                    {/* End Time */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                      {shift.isOpen ? 'مرن' : shift.endTime}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                        نشطة
                      </span>
                    </td>

                    {/* Actions Column (Edit/Delete) */}
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleStartEdit(shift)}
                            title="تعديل الوردية"
                            className="p-1.5 border border-brand-secondary/30 rounded text-brand-teal-dark hover:bg-brand-cream transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteShift(shift.id, shift.name)}
                            title="حذف الوردية"
                            className="p-1.5 border border-rose-300 rounded text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-brand-secondary/30 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-right">
            <div className="bg-brand-teal-dark text-white p-5 flex items-center justify-between border-b border-brand-secondary/30">
              <h3 className="font-bold text-sm">إضافة وردية عمل جديدة</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setModalError('');
                }}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddShift} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs font-bold">
                  {modalError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-teal-dark">اسم الوردية <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="مثال: الوردية الصباحية، وردية الليل..."
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-secondary text-right"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-teal-dark">الفرع المتاح فيه الوردية</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-secondary text-right"
                >
                  <option value="global">عام (متاحة في كافة الفروع والمنشآت)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 
                       b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : 
                       b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-teal-dark">نوع الوردية</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShiftType('fixed')}
                    className={`py-2 px-3 border rounded text-xs font-bold transition-all cursor-pointer ${
                      shiftType === 'fixed' 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    وردية ثابتة (ساعات محددة)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShiftType('open')}
                    className={`py-2 px-3 border rounded text-xs font-bold transition-all cursor-pointer ${
                      shiftType === 'open' 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    وردية مفتوحة (يسجل الموظف وقته)
                  </button>
                </div>
              </div>

              {shiftType === 'fixed' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-teal-dark">وقت البدء</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-secondary text-right"
                      required={shiftType === 'fixed'}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-teal-dark">وقت الانتهاء</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-secondary text-right"
                      required={shiftType === 'fixed'}
                    />
                  </div>
                </div>
              )}

              {shiftType === 'open' && (
                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded text-[11px] text-purple-900 font-semibold leading-relaxed">
                  💡 الوردية المفتوحة تسمح لموظفي الاستقبال بتسجيل الحضور وتحديد أوقات بداية ونهاية فترتهم يدوياً عند إعداد تقفيلة الوردية اليومية على البوت.
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalError('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-secondary text-brand-teal-dark rounded text-xs font-bold hover:bg-brand-secondary-hover border border-brand-secondary transition-colors cursor-pointer shadow"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'إضافة الوردية'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingShift && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-brand-secondary/30 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-right">
            <div className="bg-brand-teal-dark text-white p-5 flex items-center justify-between border-b border-brand-secondary/30">
              <h3 className="font-bold text-sm">تعديل بيانات الوردية</h3>
              <button 
                onClick={() => setEditingShift(null)}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditShiftSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs font-bold">
                  {modalError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-teal-dark">اسم الوردية <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  placeholder="مثال: الوردية الصباحية..."
                  value={editShiftName}
                  onChange={(e) => setEditShiftName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-secondary text-right"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-teal-dark">الفرع المرتبط</label>
                <select
                  value={editBranchId}
                  onChange={(e) => setEditBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-secondary text-right"
                >
                  <option value="global">عام (متاحة في كافة الفروع والمنشآت)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 
                       b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : 
                       b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-brand-teal-dark">نوع الوردية</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditShiftType('fixed')}
                    className={`py-2 px-3 border rounded text-xs font-bold transition-all cursor-pointer ${
                      editShiftType === 'fixed' 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    وردية ثابتة (ساعات محددة)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditShiftType('open')}
                    className={`py-2 px-3 border rounded text-xs font-bold transition-all cursor-pointer ${
                      editShiftType === 'open' 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    وردية مفتوحة (مرنة)
                  </button>
                </div>
              </div>

              {editShiftType === 'fixed' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-teal-dark">وقت البدء</label>
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-secondary text-right"
                      required={editShiftType === 'fixed'}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-teal-dark">وقت الانتهاء</label>
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:border-brand-secondary text-right"
                      required={editShiftType === 'fixed'}
                    />
                  </div>
                </div>
              )}

              {editShiftType === 'open' && (
                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded text-[11px] text-purple-900 font-semibold leading-relaxed">
                  💡 الوردية المفتوحة تسمح لموظفي الاستقبال بتسجيل الحضور وتحديد أوقات بداية ونهاية فترتهم يدوياً عند إعداد تقفيلة الوردية اليومية على البوت.
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingShift(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-secondary text-brand-teal-dark rounded text-xs font-bold hover:bg-brand-secondary-hover border border-brand-secondary transition-colors cursor-pointer shadow"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
