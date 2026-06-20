'use client';

import React, { useState, useEffect } from 'react';
import { api, AttendanceLog, Branch, User } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import { MapPin, Search, ShieldAlert, CheckCircle, XCircle, Settings, Save, RefreshCw } from 'lucide-react';

export default function AttendancePage() {
  const { role: currentRole } = useRole();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [summary, setSummary] = useState<any>({
    presentCount: 0,
    absentCount: 0,
    outOfRangeCount: 0,
    totalEmployees: 0,
    branchSummaries: []
  });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filterBranchId, setFilterBranchId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'valid' | 'invalid'

  // Geofence Config State
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editLat, setEditLat] = useState<string>('');
  const [editLng, setEditLng] = useState<string>('');
  const [editRadius, setEditRadius] = useState<string>('200');
  const [isSavingGeofence, setIsSavingGeofence] = useState(false);
  const [geofenceError, setGeofenceError] = useState('');

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
      const [branchesData, summaryData, logsData] = await Promise.all([
        api.getBranches(),
        api.getAttendanceSummary(),
        api.getTodayAttendance()
      ]);
      setBranches(branchesData);
      setSummary(summaryData);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
      showToast('خطأ أثناء تحميل البيانات من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditGeofence = (branch: Branch) => {
    if (!canManage) return;
    setEditingBranch(branch);
    setEditLat(branch.lat !== null && branch.lat !== undefined ? branch.lat.toString() : '');
    setEditLng(branch.lng !== null && branch.lng !== undefined ? branch.lng.toString() : '');
    setEditRadius(branch.radiusMeters ? branch.radiusMeters.toString() : '200');
    setGeofenceError('');
  };

  const handleSaveGeofence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !canManage) return;

    const latVal = editLat.trim() === '' ? null : parseFloat(editLat);
    const lngVal = editLng.trim() === '' ? null : parseFloat(editLng);
    const radiusVal = parseInt(editRadius, 10);

    if (latVal !== null && isNaN(latVal)) {
      setGeofenceError('الرجاء إدخال خط عرض صحيح (أو اتركه فارغاً)');
      return;
    }
    if (lngVal !== null && isNaN(lngVal)) {
      setGeofenceError('الرجاء إدخال خط طول صحيح (أو اتركه فارغاً)');
      return;
    }
    if (isNaN(radiusVal) || radiusVal <= 0) {
      setGeofenceError('الرجاء تحديد نصف قطر نطاق جغرافي صحيح بالبريد');
      return;
    }

    setIsSavingGeofence(true);
    setGeofenceError('');

    try {
      const updatedBranch = await api.updateBranch(editingBranch.id, {
        lat: latVal,
        lng: lngVal,
        radiusMeters: radiusVal
      });

      // Update local state
      setBranches(branches.map(b => b.id === editingBranch.id ? updatedBranch : b));
      setEditingBranch(null);
      showToast(`تم تحديث الإعدادات الجغرافية للفرع "${updatedBranch.name}" بنجاح.`);
      
      // Reload summary to reflect any updates
      const summaryData = await api.getAttendanceSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to update branch coordinates:', err);
      setGeofenceError('حدث خطأ أثناء الاتصال بالخادم لحفظ الإعدادات.');
    } finally {
      setIsSavingGeofence(false);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchBranch = filterBranchId === 'all' || log.branchId === filterBranchId;
    const matchStatus = filterStatus === 'all' || 
                        (filterStatus === 'valid' && log.isValid) || 
                        (filterStatus === 'invalid' && !log.isValid);
    return matchBranch && matchStatus;
  });

  const getBranchArabicName = (name?: string) => {
    if (!name) return 'غير محدد';
    return name === 'Sail Road Branch' ? 'فرع طريق السيل' :
           name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' :
           name;
  };

  const getRoleArabicName = (role?: string) => {
    if (!role) return '';
    switch (role) {
      case 'Admin': return 'مسؤول';
      case 'Receptionist': return 'موظف استقبال';
      case 'Technician': return 'فني';
      case 'WarehouseManager': return 'مدير مستودع';
      case 'BranchManager': return 'مدير فرع';
      default: return role;
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
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">نظام البصمة الجغرافية (الحضور والانصراف)</h1>
          <p className="text-xs text-white/70 mt-1">
            متابعة عملية الحضور والانصراف بناءً على إرسال موقع الموظف الفعلي عبر الواتساب ومطابقته للنطاق الجغرافي المحدد لكل فرع.
          </p>
        </div>

        <button
          onClick={loadData}
          className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          تحديث البيانات
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm text-right relative overflow-hidden">
          <div className="text-[10px] font-bold text-slate-400 uppercase">إجمالي الموظفين</div>
          <div className="text-2xl font-black text-brand-teal-dark mt-1">{summary.totalEmployees}</div>
          <div className="text-[10px] text-slate-500 mt-2">موظف مسجل بالنظام</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary/10 text-5xl">👥</div>
        </div>

        {/* Present Today */}
        <div className="bg-emerald-50/25 p-5 rounded-xl border border-emerald-100 shadow-sm text-right relative overflow-hidden">
          <div className="text-[10px] font-bold text-emerald-600 uppercase">الحضور اليوم</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{summary.presentCount}</div>
          <div className="text-[10px] text-emerald-600/80 mt-2">مكتمل في نطاق الفروع</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/10 text-5xl">✅</div>
        </div>

        {/* Absent Today */}
        <div className="bg-amber-50/25 p-5 rounded-xl border border-amber-100 shadow-sm text-right relative overflow-hidden">
          <div className="text-[10px] font-bold text-amber-600 uppercase">الغياب اليوم</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{summary.absentCount}</div>
          <div className="text-[10px] text-amber-600/80 mt-2">لم يسجلوا بصمة حضور بعد</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/10 text-5xl">💤</div>
        </div>

        {/* Out of Range Today */}
        <div className="bg-rose-50/25 p-5 rounded-xl border border-rose-100 shadow-sm text-right relative overflow-hidden">
          <div className="text-[10px] font-bold text-rose-600 uppercase">محاولات خارج النطاق</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{summary.outOfRangeCount}</div>
          <div className="text-[10px] text-rose-600/80 mt-2">محاولات تسجيل مرفوضة</div>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/10 text-5xl">⚠️</div>
        </div>

      </div>

      {/* Geofence Configuration Card */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden text-right">
        <div className="p-5 border-b border-brand-secondary/15 bg-brand-cream-dark/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-teal-dark" />
            <h2 className="text-sm font-bold text-brand-teal-dark">إعدادات النطاق الجغرافي للفروع</h2>
          </div>
          <span className="text-[11px] text-slate-500">تستخدم للتحقق من تطابق بصمة حضور الموظف مع إحداثيات الفرع</span>
        </div>
        
        <div className="p-5 divide-y divide-brand-cream-dark">
          {branches.map((branch) => {
            const hasCoords = branch.lat !== null && branch.lng !== null && branch.lat !== undefined && branch.lng !== undefined;
            const isEditingThis = editingBranch?.id === branch.id;

            return (
              <div key={branch.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="font-bold text-sm text-brand-teal-dark flex items-center gap-2">
                    <span>{getBranchArabicName(branch.name)}</span>
                    {!hasCoords && (
                      <span className="bg-rose-100 border border-rose-200 text-rose-800 px-2 py-0.5 rounded text-[9px] font-bold">
                        ⚠️ الإحداثيات مفقودة (مرفوض الحضور)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>خط العرض: <strong className="font-mono text-slate-700">{branch.lat ?? 'غير محدد'}</strong></span>
                    <span>خط الطول: <strong className="font-mono text-slate-700">{branch.lng ?? 'غير محدد'}</strong></span>
                    <span>نصف القطر المسموح: <strong className="font-mono text-slate-700">{branch.radiusMeters ?? 200} متر</strong></span>
                  </div>
                </div>

                {canManage && (
                  <div>
                    {isEditingThis ? (
                      <form onSubmit={handleSaveGeofence} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 w-full md:w-80">
                        <div className="text-xs font-bold text-brand-teal-dark mb-1">تحديث الإحداثيات للفرع</div>
                        {geofenceError && (
                          <div className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 p-2 rounded">
                            {geofenceError}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">خط العرض</label>
                            <input
                              type="text"
                              value={editLat}
                              onChange={(e) => setEditLat(e.target.value)}
                              placeholder="مثال: 21.4858"
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-left font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-0.5">خط الطول</label>
                            <input
                              type="text"
                              value={editLng}
                              onChange={(e) => setEditLng(e.target.value)}
                              placeholder="مثال: 39.1925"
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-left font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-0.5">المسافة المسموحة (بالمتر)</label>
                          <input
                            type="number"
                            value={editRadius}
                            onChange={(e) => setEditRadius(e.target.value)}
                            placeholder="مثال: 200"
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-left font-mono"
                            required
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingBranch(null)}
                            className="px-2.5 py-1 text-[11px] border border-slate-200 text-slate-600 rounded bg-white font-semibold hover:bg-slate-100 transition"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            disabled={isSavingGeofence}
                            className="px-2.5 py-1 text-[11px] bg-brand-secondary text-brand-teal-dark border border-brand-secondary rounded font-bold hover:bg-brand-secondary-hover transition flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {isSavingGeofence ? 'جاري الحفظ...' : 'حفظ'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => handleEditGeofence(branch)}
                        className="text-[11px] font-bold text-brand-teal-dark hover:text-brand-primary border border-slate-200 hover:border-brand-primary/50 px-3 py-1.5 rounded transition cursor-pointer"
                      >
                        تعديل إعدادات النطاق
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Logs List */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden text-right">
        <div className="p-5 border-b border-brand-secondary/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-bold text-brand-teal-dark">سجل البصمات اليومية</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">قائمة بمحاولات تسجيل الحضور والانصراف الواردة اليوم</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Branch Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs">
              <span className="text-slate-400">الفرع:</span>
              <select
                value={filterBranchId}
                onChange={(e) => setFilterBranchId(e.target.value)}
                className="bg-transparent focus:outline-none font-bold text-brand-teal-dark cursor-pointer text-right"
              >
                <option value="all">كل الفروع</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{getBranchArabicName(b.name)}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs">
              <span className="text-slate-400">الحالة:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent focus:outline-none font-bold text-brand-teal-dark cursor-pointer text-right"
              >
                <option value="all">كل المحاولات</option>
                <option value="valid">مقبول (داخل النطاق)</option>
                <option value="invalid">مرفوض (خارج النطاق)</option>
              </select>
            </div>
            
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-xs text-muted italic">لا توجد محاولات بصمة تطابق الفلاتر المحددة اليوم.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                  <th className="px-6 py-4">الموظف</th>
                  <th className="px-6 py-4">الفرع المستهدف</th>
                  <th className="px-6 py-4">المحاولة</th>
                  <th className="px-6 py-4">وقت التسجيل</th>
                  <th className="px-6 py-4">موقع الموظف المرسل</th>
                  <th className="px-6 py-4">المسافة الفعلية</th>
                  <th className="px-6 py-4 text-center">حالة البصمة</th>
                  <th className="px-6 py-4">السبب في حال الرفض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                {filteredLogs.map((log) => {
                  const timeStr = new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  return (
                    <tr key={log.id} className={`hover:bg-brand-cream/10 transition-colors ${!log.isValid ? 'bg-rose-50/20' : ''}`}>
                      
                      {/* User details */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm">{log.user?.name || log.userId}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {getRoleArabicName(log.user?.role)} 
                          {log.user?.employeeType === 'Mobile' && (
                            <span className="mr-1 bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.5 rounded text-[8px]">طاقم متنقل</span>
                          )}
                        </div>
                      </td>

                      {/* Branch target */}
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {getBranchArabicName(log.branch?.name)}
                      </td>

                      {/* CheckIn/CheckOut */}
                      <td className="px-6 py-4">
                        {log.type === 'CheckIn' ? (
                          <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
                            حضور
                          </span>
                        ) : (
                          <span className="bg-teal-50 border border-teal-200 text-teal-800 font-extrabold px-2.5 py-0.5 rounded text-[10px]">
                            انصراف
                          </span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-700">
                        {timeStr}
                      </td>

                      {/* User Coordinates */}
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {log.lat.toFixed(5)}, {log.lng.toFixed(5)}
                      </td>

                      {/* Distance */}
                      <td className="px-6 py-4 font-bold text-slate-700">
                        <span className={log.distanceMeters > (log.branch?.radiusMeters || 200) ? 'text-rose-600' : 'text-emerald-600'}>
                          {Math.round(log.distanceMeters)} متر
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                          (الحد: {log.branch?.radiusMeters || 200}م)
                        </span>
                      </td>

                      {/* Status Check */}
                      <td className="px-6 py-4 text-center">
                        {log.isValid ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            مقبول
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            مرفوض
                          </span>
                        )}
                      </td>

                      {/* Rejection Reason */}
                      <td className="px-6 py-4 font-semibold text-rose-700/80">
                        {log.rejectionReason || '-'}
                      </td>

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
