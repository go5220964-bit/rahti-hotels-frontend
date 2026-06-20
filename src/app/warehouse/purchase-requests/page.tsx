'use client';

import React, { useState, useEffect } from 'react';
import { api, User, Branch } from '../../../utils/api';
import { useRole } from '../../../components/RoleContext';
import { Role } from '../../../types_local';
import { FileSpreadsheet, Clock, CheckCircle2, ShoppingCart, Archive, AlertTriangle } from 'lucide-react';
import { ProcurementRequest } from '../../finance/purchase-approvals/page';

export default function PurchaseRequestsDashboard() {
  const { role: currentRole } = useRole();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await (api as any).getProcurements();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load purchase requests:', error);
      showToast('خطأ أثناء تحميل طلبات الشراء والمخازن', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReceive = async (requestId: string) => {
    if (!window.confirm('هل تود تأكيد استلام الشحنة وتحديث كميات المخزن تلقائياً؟')) return;
    try {
      const receiverId = 'warehouse-staff';
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Call API mark received
      // In api.ts, does receiveInWarehouse or markReceived exist? Let's check api.ts search output
      // In search output we had:
      // api.ts:3766:  receiveInWarehouse: async (id: string, receiverId: string, quantityReceived: number): Promise<ProcurementRequest>
      await (api as any).receiveInWarehouse(requestId, receiverId, request.quantityNeeded);
      showToast('تم إثبات استلام وتوريد الشحنة للمستودع وتحديث الرصيد بنجاح.');
      await loadData();
    } catch (error: any) {
      showToast(error?.message || 'خطأ أثناء استلام وتوريد الصنف', 'error');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending' || r.status === 'PendingFinancialApproval');
  const approvedRequests = requests.filter(r => r.status === 'FinanciallyApproved');
  const purchasedRequests = requests.filter(r => r.status === 'Purchased');
  const completedRequests = requests.filter(r => r.status === 'Received');
  const rejectedRequests = requests.filter(r => r.status === 'Rejected');

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
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">تتبع دورة حياة طلبات الشراء والمشتريات</h1>
          <p className="text-xs text-white/70 mt-1">
            متابعة حالة طلبات الشراء من لحظة تقديمها، مروراً بالاعتماد المالي والشراء، وصولاً للتوريد والاستلام في مستودعات الفروع.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-muted italic">جاري تحميل لوحة طلبات الشراء...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Column 1: Pending approvals */}
          <div className="bg-brand-cream/15 p-4 rounded-xl border border-brand-secondary/20 flex flex-col gap-4 h-fit min-h-[300px]">
            <div className="flex justify-between items-center border-b pb-2 mb-1">
              <span className="text-xs font-bold text-brand-teal-dark flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                بانتظار الاعتماد المالي
              </span>
              <span className="bg-amber-500/10 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
            </div>
            
            {pendingRequests.map(r => (
              <RequestCard key={r.id} req={r} />
            ))}
            {pendingRequests.length === 0 && <EmptyColumnText />}
          </div>

          {/* Column 2: Approved / To Purchase */}
          <div className="bg-brand-cream/15 p-4 rounded-xl border border-brand-secondary/20 flex flex-col gap-4 h-fit min-h-[300px]">
            <div className="flex justify-between items-center border-b pb-2 mb-1">
              <span className="text-xs font-bold text-brand-teal-dark flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-brand-primary" />
                معتمدة (قيد الشراء)
              </span>
              <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-extrabold px-2 py-0.5 rounded-full">{approvedRequests.length}</span>
            </div>

            {approvedRequests.map(r => (
              <RequestCard key={r.id} req={r} />
            ))}
            {approvedRequests.length === 0 && <EmptyColumnText />}
          </div>

          {/* Column 3: Purchased / Shipped */}
          <div className="bg-brand-cream/15 p-4 rounded-xl border border-brand-secondary/20 flex flex-col gap-4 h-fit min-h-[300px]">
            <div className="flex justify-between items-center border-b pb-2 mb-1">
              <span className="text-xs font-bold text-brand-teal-dark flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-purple-600" />
                تم الشراء (قيد الشحن للفرع)
              </span>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">{purchasedRequests.length}</span>
            </div>

            {purchasedRequests.map(r => (
              <RequestCard key={r.id} req={r} onReceive={handleReceive} />
            ))}
            {purchasedRequests.length === 0 && <EmptyColumnText />}
          </div>

          {/* Column 4: Received / Completed */}
          <div className="bg-brand-cream/15 p-4 rounded-xl border border-brand-secondary/20 flex flex-col gap-4 h-fit min-h-[300px]">
            <div className="flex justify-between items-center border-b pb-2 mb-1">
              <span className="text-xs font-bold text-brand-teal-dark flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                تم التوريد والاستلام
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">{completedRequests.length}</span>
            </div>

            {completedRequests.map(r => (
              <RequestCard key={r.id} req={r} />
            ))}
            {completedRequests.length === 0 && <EmptyColumnText />}
          </div>

        </div>
      )}

    </div>
  );
}

function EmptyColumnText() {
  return (
    <div className="text-center py-10 text-[10px] text-muted italic border border-dashed border-brand-secondary/25 rounded-lg bg-white/50">
      لا توجد طلبات في هذه المرحلة.
    </div>
  );
}

function RequestCard({ req, onReceive }: { req: ProcurementRequest; onReceive?: (id: string) => void }) {
  return (
    <div className="bg-white border border-brand-secondary/20 rounded-lg p-3 shadow-sm hover:border-brand-primary/45 transition-colors text-right">
      <div className="flex justify-between items-start">
        <span className="font-mono text-[10px] font-bold text-brand-teal-dark">{req.ticketNumber}</span>
        <span className="text-[9px] text-muted">{new Date(req.createdAt).toLocaleDateString('ar-SA')}</span>
      </div>

      <h4 className="text-xs font-bold text-brand-teal-dark mt-2">{req.itemName}</h4>
      <div className="flex justify-between items-center mt-2.5 text-[10px]">
        <span className="text-muted">الكمية: <span className="font-bold text-brand-teal-dark">{req.quantityNeeded} {req.unit}</span></span>
        <span className="font-extrabold text-brand-primary">{req.estimatedPrice ? `${req.estimatedPrice} ريال` : '-'}</span>
      </div>

      <div className="border-t border-brand-secondary/15 pt-2.5 mt-3 flex justify-between items-center text-[9px] text-muted">
        <span>الفرع: {req.branch?.name === 'Sail Road Branch' ? 'طريق السيل' : req.branch?.name || 'غير محدد'}</span>
        
        {onReceive && (
          <button
            onClick={() => onReceive(req.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded cursor-pointer transition-colors shadow"
          >
            تأكيد الاستلام
          </button>
        )}
      </div>
    </div>
  );
}
