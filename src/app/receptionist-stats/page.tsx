'use client';

import React, { useState, useEffect } from 'react';
import { api, ShiftReport, User, Branch } from '../../utils/api';
import { Role } from '../../types_local';
import { RotateCw, Award, ShieldAlert, Landmark, Sparkles, TrendingUp, ArrowLeftRight, BarChart3, X, Check } from 'lucide-react';

interface ReceptionistStat {
  user: User;
  totalShifts: number;
  totalApprovedRevenue: number;
  acceptanceRate: number;
  rejectionRate: number;
  lastShiftDate: string | null;
  rawReports: ShiftReport[];
}

export default function ReceptionistStatsPage() {
  const [stats, setStats] = useState<ReceptionistStat[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Branch Transfer Modal State
  const [selectedReceptionist, setSelectedReceptionist] = useState<User | null>(null);
  const [newBranchId, setNewBranchId] = useState('');
  const [preserveHistory, setPreserveHistory] = useState(true);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  // Monthly stats Modal State
  const [drillDownReceptionist, setDrillDownReceptionist] = useState<User | null>(null);
  const [drillDownReports, setDrillDownReports] = useState<ShiftReport[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      // 1. Fetch all users, shift reports, and branches
      const [usersData, reportsData, branchesData] = await Promise.all([
        api.getUsers(),
        api.getShiftReports(),
        api.getBranches()
      ]);

      setBranches(branchesData);

      // 2. Filter receptionist employees
      const receptionists = usersData.filter(u => u.role === Role.Receptionist);

      // 3. Aggregate stats per receptionist
      const aggregatedStats: ReceptionistStat[] = receptionists.map(recep => {
        // Apply history preservation logic locally
        const recepReports = reportsData.filter(r => {
          if ((recep as any).preserveHistory === false) {
            return r.reporterId === recep.id && r.branchId === recep.branchId;
          }
          return r.reporterId === recep.id;
        });
        
        const totalShifts = recepReports.length;
        const approvedReports = recepReports.filter(r => r.status === 'Approved');
        const rejectedReports = recepReports.filter(r => r.status === 'Rejected');
        
        const totalApprovedRevenue = approvedReports.reduce((sum, r) => sum + r.grandTotal, 0);
        
        const acceptanceRate = totalShifts > 0 ? (approvedReports.length / totalShifts) * 100 : 0;
        const rejectionRate = totalShifts > 0 ? (rejectedReports.length / totalShifts) * 100 : 0;
        
        const lastShiftDate = recepReports.length > 0 ? recepReports[0].createdAt : null;

        return {
          user: recep,
          totalShifts,
          totalApprovedRevenue,
          acceptanceRate,
          rejectionRate,
          lastShiftDate,
          rawReports: recepReports
        };
      });

      // 4. Sort by rejection rate ascending (lowest = best)
      aggregatedStats.sort((a, b) => a.rejectionRate - b.rejectionRate);

      setStats(aggregatedStats);
    } catch (error) {
      console.error('Failed to load receptionist stats:', error);
      showToast('خطأ أثناء تحميل أداء موظفي الاستقبال', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceptionist || submittingTransfer) return;
    
    setSubmittingTransfer(true);
    try {
      await api.transferUserBranch(selectedReceptionist.id, newBranchId, preserveHistory);
      showToast(`تم نقل الموظف ${selectedReceptionist.name} بنجاح إلى الفرع الجديد.`);
      setSelectedReceptionist(null);
      await loadStats();
    } catch (error: any) {
      console.error('Failed to transfer branch:', error);
      showToast(error?.message || 'حدث خطأ أثناء نقل الفرع.', 'error');
    } finally {
      setSubmittingTransfer(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const translateBranch = (branchName?: string) => {
    if (!branchName) return 'غير محدد';
    if (branchName === 'Sail Road Branch') return 'فرع طريق السيل';
    if (branchName === 'Beachside Resort Branch') return 'فرع منتجع الشاطئ';
    return branchName;
  };

  return (
    <div className="space-y-6 text-right">
      {/* Toast alert */}
      {toast && (
        <div className={`fixed top-6 left-6 z-50 p-4 rounded-lg shadow-lg border text-xs font-bold transition-all flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-brand-teal-dark">لوحة أداء موظفي الاستقبال</h2>
          <p className="text-[11px] text-muted mt-1">متابعة دقة البيانات المالية، نسب قبول التقفيلات، ومستويات الالتزام لموظفي الاستقبال.</p>
        </div>
        
        <button
          onClick={loadStats}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg p-2.5 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold border border-brand-primary"
        >
          <RotateCw className="w-3.5 h-3.5" />
          تحديث التقرير
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Performer Summary */}
        <div className="bg-white rounded-xl p-5 border border-brand-secondary/25 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted block">أفضل موظف استقبال التزاماً</span>
            <span className="text-sm font-extrabold text-brand-teal-dark mt-1 block">
              {stats.length > 0 && stats[0].totalShifts > 0 ? stats[0].user.name : 'لا يوجد بيانات'}
            </span>
          </div>
        </div>

        {/* Total revenue through shifts */}
        <div className="bg-white rounded-xl p-5 border border-brand-secondary/25 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted block">إجمالي مبيعات الاستقبال المعتمدة</span>
            <span className="text-sm font-extrabold text-brand-teal-dark mt-1 block">
              {stats.reduce((sum, s) => sum + s.totalApprovedRevenue, 0).toLocaleString()} ريال
            </span>
          </div>
        </div>

        {/* Average acceptance rate */}
        <div className="bg-white rounded-xl p-5 border border-brand-secondary/25 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted block">متوسط نسبة دقة التقفيل</span>
            <span className="text-sm font-extrabold text-brand-teal-dark mt-1 block">
              {stats.length > 0
                ? (stats.reduce((sum, s) => sum + s.acceptanceRate, 0) / stats.length).toFixed(1)
                : '0'}%
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Panel */}
      <div className="bg-white border border-brand-secondary/20 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center text-muted gap-2">
            <RotateCw className="w-8 h-8 animate-spin text-brand-secondary" />
            <span className="text-xs font-bold">جاري تحليل بيانات الأداء...</span>
          </div>
        ) : stats.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <Sparkles className="w-12 h-12 mx-auto text-brand-secondary/30 mb-3" />
            <p className="text-xs font-bold">لا يوجد موظفي استقبال مسجلين بالنظام حالياً.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-brand-cream-dark border-b border-brand-secondary/15 text-brand-teal-dark font-bold">
                  <th className="p-4 text-center w-16">الترتيب</th>
                  <th className="p-4">اسم الموظف</th>
                  <th className="p-4">الفرع المخصص</th>
                  <th className="p-4 text-center">عدد الورديات</th>
                  <th className="p-4">الإيرادات المعتمدة</th>
                  <th className="p-4 text-center">نسبة القبول</th>
                  <th className="p-4 text-center">نسبة الرفض</th>
                  <th className="p-4">تاريخ آخر تقفيلة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-dark">
                {stats.map((row, index) => {
                  const isTopOne = index === 0 && row.totalShifts > 0;
                  return (
                    <tr
                      key={row.user.id}
                      className="hover:bg-brand-cream/35 transition-colors duration-150"
                    >
                      <td className="p-4 text-center font-extrabold text-brand-primary">
                        {isTopOne ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shadow-sm text-[10px]">
                            🥇
                          </span>
                        ) : (
                          index + 1
                        )}
                      </td>
                      <td className="p-4 font-bold text-brand-teal-dark flex items-center gap-1.5">
                        {row.user.name}
                        {isTopOne && <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-extrabold border border-amber-200">مميز</span>}
                      </td>
                      <td className="p-4 font-medium text-muted">{translateBranch(row.user.branch?.name)}</td>
                      <td className="p-4 text-center font-bold text-brand-teal-dark">{row.totalShifts}</td>
                      <td className="p-4 font-extrabold text-brand-primary">{row.totalApprovedRevenue.toLocaleString()} ريال</td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100 text-[10px]">
                          {row.acceptanceRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-extrabold border text-[10px] ${
                          row.rejectionRate === 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : row.rejectionRate < 20
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {row.rejectionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-4 font-medium text-muted">
                        {row.lastShiftDate
                          ? new Date(row.lastShiftDate).toLocaleDateString('ar-EG', { dateStyle: 'medium' })
                          : 'لا يوجد'}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setDrillDownReceptionist(row.user);
                              setDrillDownReports(row.rawReports);
                            }}
                            className="text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5 font-bold cursor-pointer transition-colors text-[10px] border border-brand-primary/20 px-2 py-1 rounded bg-brand-cream/20"
                            title="عرض تفاصيل الأداء الشهري"
                          >
                            <BarChart3 className="w-3 h-3" />
                            الأداء الشهري
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedReceptionist(row.user);
                              setNewBranchId(row.user.branchId);
                              setPreserveHistory(true);
                            }}
                            className="text-amber-700 hover:text-amber-800 flex items-center gap-1.5 font-bold cursor-pointer transition-colors text-[10px] border border-amber-600/20 px-2 py-1 rounded bg-amber-50/20"
                            title="نقل الموظف لفرع آخر"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            نقل الفرع
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Branch Transfer Modal */}
      {selectedReceptionist && (
        <div className="fixed inset-0 z-40 bg-brand-teal-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-brand-secondary/20 flex flex-col">
            
            <div className="bg-amber-600 p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">نقل موظف الاستقبال لفرع آخر</h3>
                <p className="text-[10px] text-white/70 mt-1">الموظف: {selectedReceptionist.name} | الفرع الحالي: {translateBranch(selectedReceptionist.branch?.name)}</p>
              </div>
              <button
                onClick={() => setSelectedReceptionist(null)}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferBranch} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-teal-dark block">اختر الفرع الجديد:</label>
                <select
                  value={newBranchId}
                  onChange={(e) => setNewBranchId(e.target.value)}
                  required
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{translateBranch(b.name)}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-2 bg-brand-cream p-3.5 rounded border border-brand-secondary/15 mt-2 text-right" dir="rtl">
                <input
                  type="checkbox"
                  id="preserveHistory"
                  checked={preserveHistory}
                  onChange={(e) => setPreserveHistory(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-primary border-brand-secondary/35 focus:ring-brand-primary cursor-pointer mt-0.5 shrink-0"
                />
                <label htmlFor="preserveHistory" className="text-[10px] font-semibold text-brand-teal-dark cursor-pointer leading-relaxed">
                  حفظ سجل الورديات السابق في الفرع القديم
                  <span className="block text-[9px] text-muted font-normal mt-0.5">
                    (في حال إلغاء التحديد، سيتم تصفير وبدء أرقام ونسب أداء الموظف من الصفر بالفرع الجديد)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedReceptionist(null)}
                  className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream text-brand-teal-dark px-4 py-2 rounded transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingTransfer}
                  className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  تأكيد النقل وحفظ الإعدادات
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Monthly Performance Drill-down Modal */}
      {drillDownReceptionist && (
        <div className="fixed inset-0 z-40 bg-brand-teal-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-brand-secondary/20 max-h-[80vh] flex flex-col">
            
            <div className="bg-brand-primary p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">تحليل الأداء الشهري المفصل</h3>
                <p className="text-[10px] text-white/70 mt-1">الموظف: {drillDownReceptionist.name} | الفرع الحالي: {translateBranch(drillDownReceptionist.branch?.name)}</p>
              </div>
              <button
                onClick={() => {
                  setDrillDownReceptionist(null);
                  setDrillDownReports([]);
                }}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-xs">
              {drillDownReports.length === 0 ? (
                <div className="p-8 text-center text-muted">
                  <BarChart3 className="w-10 h-10 mx-auto text-brand-secondary/30 mb-2" />
                  <p className="font-bold">لا يوجد أي تقارير مسجلة لهذا الموظف.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-bold text-brand-teal-dark pb-1 border-b border-brand-cream-dark">سجل الأداء مقسماً بالأشهر:</h4>
                  
                  <div className="overflow-x-auto border border-brand-cream-dark rounded-lg">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-brand-cream border-b border-brand-secondary/15 text-brand-teal-dark font-bold">
                          <th className="p-3">الشهر</th>
                          <th className="p-3 text-center">عدد الورديات</th>
                          <th className="p-3">المبيعات المعتمدة</th>
                          <th className="p-3 text-center">نسبة الرفض</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-cream-dark">
                        {(() => {
                          // Compute monthly stats
                          const monthsMap: { [key: string]: ShiftReport[] } = {};
                          drillDownReports.forEach(r => {
                            const date = new Date(r.createdAt);
                            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                            if (!monthsMap[key]) monthsMap[key] = [];
                            monthsMap[key].push(r);
                          });

                          return Object.keys(monthsMap).map(key => {
                            const monthReports = monthsMap[key];
                            const approved = monthReports.filter(r => r.status === 'Approved');
                            const rejected = monthReports.filter(r => r.status === 'Rejected');
                            const totalApprovedRevenue = approved.reduce((sum, r) => sum + r.grandTotal, 0);
                            const totalShifts = monthReports.length;
                            const rejectionRate = totalShifts > 0 ? (rejected.length / totalShifts) * 100 : 0;
                            
                            const [year, monthNum] = key.split('-');
                            const date = new Date(Number(year), Number(monthNum) - 1, 1);
                            const monthLabel = date.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

                            return (
                              <tr key={key} className="hover:bg-brand-cream/20">
                                <td className="p-3 font-bold text-brand-teal-dark">{monthLabel}</td>
                                <td className="p-3 text-center font-semibold text-brand-teal-dark">{totalShifts}</td>
                                <td className="p-3 font-bold text-brand-primary">{totalApprovedRevenue.toLocaleString()} ريال</td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] border ${
                                    rejectionRate === 0
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      : rejectionRate < 20
                                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                                      : 'bg-rose-50 text-rose-700 border-rose-100'
                                  }`}>
                                    {rejectionRate.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-brand-cream-dark p-4 border-t border-brand-secondary/15 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setDrillDownReceptionist(null);
                  setDrillDownReports([]);
                }}
                className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream text-brand-teal-dark px-4 py-2 rounded transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
