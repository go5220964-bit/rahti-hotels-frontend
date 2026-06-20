'use client';

import React, { useState, useEffect } from 'react';
import { api, User, Branch } from '../../../utils/api';
import { useRole } from '../../../components/RoleContext';
import { Role } from '../../../types_local';
import { Check, X, ShieldAlert, FileSpreadsheet, Package, AlertCircle } from 'lucide-react';

export interface ProcurementRequest {
  id: string;
  ticketNumber: string;
  requestedBy: string;
  branchId: string;
  branch?: Branch;
  itemId: string;
  itemName: string;
  quantityNeeded: number;
  unit: string;
  estimatedPrice?: number | null;
  actualPrice?: number | null;
  source: string;
  status: string;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PurchaseApprovalsPage() {
  const { role: currentRole } = useRole();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Review drawer state
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('All');

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // getProcurements is defined on api
      const [procData, usersData, branchesData] = await Promise.all([
        (api as any).getProcurements(),
        api.getUsers(),
        api.getBranches()
      ]);
      setRequests(procData);
      setUsers(usersData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Failed to load purchase orders:', error);
      showToast('خطأ أثناء تحميل كشوف طلبات الشراء والمشتريات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (id: string, status: 'Approved' | 'Rejected') => {
    setIsSubmitting(true);
    try {
      const reviewerId = 'finance-manager';
      if (status === 'Approved') {
        await (api as any).financiallyApproveProcurement(id, reviewerId, reviewNote);
        showToast('تم اعتماد طلب الشراء مالياً بنجاح وتوفير ميزانية الصرف.');
      } else {
        if (!reviewNote.trim()) {
          showToast('الرجاء إدخال سبب الرفض في الملاحظات', 'error');
          setIsSubmitting(false);
          return;
        }
        await (api as any).rejectProcurement(id, reviewerId, reviewNote);
        showToast('تم رفض طلب الشراء وتوثيق السبب إدارياً.');
      }
      setReviewNote('');
      setActiveRequestId(null);
      await loadData();
    } catch (error: any) {
      showToast(error?.message || 'حدث خطأ أثناء معالجة الطلب', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFinanceOrCEO = currentRole === Role.Admin || currentRole === Role.CEO || currentRole === Role.FinanceManager || currentRole === Role.Accountant;

  if (!isFinanceOrCEO) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-rose-50/50 rounded-xl border border-rose-200">
        <ShieldAlert className="w-12 h-12 text-rose-600 mb-3" />
        <h2 className="text-sm font-bold text-rose-900">🔒 عذراً، غير مصرح بالدخول</h2>
        <p className="text-xs text-rose-700/80 mt-1 max-w-sm">صفحة مراجعة واعتماد ميزانيات طلبات الشراء مخصصة للرئيس التنفيذي والمدير المالي فقط.</p>
      </div>
    );
  }

  // Filter requests
  const filteredRequests = requests.filter(r => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Pending') return r.status === 'Pending' || r.status === 'PendingFinancialApproval';
    if (statusFilter === 'Approved') return r.status === 'FinanciallyApproved' || r.status === 'Purchased' || r.status === 'Received';
    return r.status === statusFilter;
  });

  const translateStatus = (statusStr: string) => {
    switch (statusStr) {
      case 'Pending':
      case 'PendingFinancialApproval':
        return 'معلق / بانتظار الاعتماد المالي';
      case 'FinanciallyApproved':
        return 'معتمد مالياً / بانتظار الشراء';
      case 'Purchased':
        return 'تم الشراء / قيد التوصيل للمستودع';
      case 'Received':
        return 'تم التوريد للمستودع (مكتمل)';
      case 'Rejected':
        return 'مرفوض مالياً';
      default:
        return statusStr;
    }
  };

  const translateSource = (sourceStr: string) => {
    switch (sourceStr) {
      case 'LowStock': return 'نقص بالمخزون';
      case 'MaintenanceSpareParts': return 'قطع غيار صيانة';
      case 'DirectRequest':
      case 'Manual':
        return 'طلب مباشر';
      default: return sourceStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-right" dir="rtl">
      
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
        <div>
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">اعتمادات طلبات الشراء والمشتريات</h1>
          <p className="text-xs text-white/70 mt-1">
            مراجعة طلبات الشراء المرفوعة من المستودعات والصيانة، وتخصيص الميزانية واعتماد قرارات الصرف للفرع.
          </p>
        </div>
      </div>

      {/* Requests table card */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden">
        <div className="bg-brand-cream-dark p-4 border-b border-brand-secondary/25 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xs font-bold text-brand-teal-dark flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-brand-primary" />
            طلبات الشراء الواردة للتدقيق
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted font-bold">تصفية الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-brand-secondary/30 rounded p-1.5 text-brand-teal-dark font-semibold focus:outline-none"
            >
              <option value="All">الكل</option>
              <option value="Pending">بانتظار المراجعة</option>
              <option value="Approved">تم اعتمادها</option>
              <option value="Rejected">مرفوضة</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-xs text-muted italic">جاري تحميل طلبات الشراء...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20 text-xs text-muted italic">لا توجد طلبات شراء مسجلة حالياً.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-cream-dark/60 border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                  <th className="px-6 py-4">رقم الطلب</th>
                  <th className="px-6 py-4">الفرع طالب الشراء</th>
                  <th className="px-6 py-4">الصنف والمواصفات</th>
                  <th className="px-6 py-4 text-center">الكمية المطلوبة</th>
                  <th className="px-6 py-4 text-center">التكلفة التقديرية</th>
                  <th className="px-6 py-4">المصدر</th>
                  <th className="px-6 py-4">تاريخ الطلب</th>
                  <th className="px-6 py-4 text-center">الحالة</th>
                  <th className="px-6 py-4 text-center">الاعتماد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                {filteredRequests.map((req) => {
                  const isReviewing = activeRequestId === req.id;
                  const isPending = req.status === 'Pending' || req.status === 'PendingFinancialApproval';
                  
                  return (
                    <React.Fragment key={req.id}>
                      <tr className="hover:bg-brand-cream/10 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-brand-teal-dark">{req.ticketNumber}</td>
                        <td className="px-6 py-4 font-medium text-muted">
                          {req.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : req.branch?.name || 'غير محدد'}
                        </td>
                        <td className="px-6 py-4 font-semibold">{req.itemName}</td>
                        <td className="px-6 py-4 text-center font-bold">{req.quantityNeeded} {req.unit}</td>
                        <td className="px-6 py-4 text-center font-extrabold text-brand-primary">
                          {req.estimatedPrice ? `${req.estimatedPrice} ريال` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            {translateSource(req.source)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted">{new Date(req.createdAt).toLocaleDateString('ar-SA')}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                            isPending ? 'bg-amber-50 border-amber-200 text-amber-800' :
                            req.status === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                            'bg-emerald-50 border-emerald-200 text-emerald-800'
                          }`}>
                            {translateStatus(req.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isPending ? (
                            <button
                              onClick={() => {
                                setActiveRequestId(isReviewing ? null : req.id);
                                setReviewNote('');
                              }}
                              className="bg-brand-primary text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-brand-primary-hover transition-colors cursor-pointer"
                            >
                              مراجعة القرار
                            </button>
                          ) : (
                            <span className="text-[10px] text-muted italic">مكتمل</span>
                          )}
                        </td>
                      </tr>

                      {/* Review Drawer Panel */}
                      {isReviewing && (
                        <tr className="bg-brand-cream/10">
                          <td colSpan={9} className="px-6 py-4 border-y border-brand-secondary/20">
                            <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
                              <div className="flex-1 space-y-1.5 text-right w-full">
                                <label className="text-[10px] font-bold text-brand-teal-dark block">ملاحظات الاعتماد المالي أو مبررات الرفض (إلزامي للرفض):</label>
                                <input
                                  type="text"
                                  placeholder="ملاحظات حول الميزانية أو تسعيرة الشراء..."
                                  value={reviewNote}
                                  onChange={(e) => setReviewNote(e.target.value)}
                                  className="w-full text-xs bg-white border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReview(req.id, 'Rejected')}
                                  disabled={isSubmitting}
                                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-4 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  رفض وإرجاع الطلب
                                </button>
                                <button
                                  onClick={() => handleReview(req.id, 'Approved')}
                                  disabled={isSubmitting}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-4 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  اعتماد مالي وصرف
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
