'use client';

import React, { useState } from 'react';
import { RequestItem, api } from '../utils/api';
import { ApprovalStatus, RequestStatus, Role } from '../types_local';

interface InvoiceModalProps {
  request: RequestItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentRole: Role;
}

export default function InvoiceModal({ request, isOpen, onClose, onUpdate, currentRole }: InvoiceModalProps) {
  const [actualCost, setActualCost] = useState(request.estimatedCost?.toString() || '');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const parsedActualCost = parseFloat(actualCost) || request.estimatedCost || 0;
      await api.updateRequest(request.id, {
        approvalStatus: ApprovalStatus.Approved,
        actualCost: parsedActualCost,
        status: RequestStatus.Pending
      });
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء اعتماد طلب المشتريات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.updateRequest(request.id, {
        approvalStatus: ApprovalStatus.Rejected,
        status: RequestStatus.Rejected,
        description: `${request.description} (مرفوض: ${rejectReason || 'لم يحدد سبب'})`
      });
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء رفض الطلب');
    } finally {
      setIsSubmitting(false);
      setIsRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-teal-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl border border-brand-secondary/35 w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 text-right">
        
        {/* Top Header */}
        <div className="p-6 border-b border-brand-secondary/20 bg-brand-cream/30 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold bg-brand-secondary text-brand-teal-dark px-2 py-0.5 rounded tracking-wider uppercase">
                مراجعة وتدقيق فاتورة التوريد
              </span>
              <span className="text-xs text-muted">رمز التذكرة: {request.id.toUpperCase()}</span>
            </div>
            <h3 className="text-base font-bold text-brand-teal-dark mt-1">مراجعة المعاملة المقدمة من {request.reporter?.name}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-brand-cream-dark transition-colors text-brand-teal-dark/70 hover:text-brand-teal-dark"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Side-by-Side Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Side: Invoice Media Viewer (in RTL, it is on the right visually) */}
          <div className="w-1/2 bg-brand-cream-dark/20 p-8 border-l border-brand-secondary/20 flex flex-col justify-center items-center overflow-y-auto">
            <h4 className="text-xs font-bold text-brand-teal-dark/60 uppercase tracking-widest mb-4 w-full">صورة الفاتورة المرفقة عبر الواتساب</h4>
            
            <div className="flex-1 w-full bg-white rounded-lg border border-brand-secondary/25 overflow-hidden shadow-inner flex items-center justify-center p-4 relative min-h-[300px]">
              {request.invoiceImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={request.invoiceImageUrl} 
                  alt="فاتورة المشتريات الميدانية" 
                  className="max-w-full max-h-[50vh] object-contain rounded border border-gray-200 shadow"
                />
              ) : (
                <div className="text-center p-6">
                  <svg className="w-12 h-12 text-muted mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-muted italic">لا يوجد مستند أو فاتورة مرفقة بالبلاغ.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Request Details & Form */}
          <div className="w-1/2 p-8 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Core Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-brand-teal-dark/60 uppercase tracking-widest">تفاصيل التوريد المطلوبة</h4>
                <div className="bg-brand-cream/40 border border-brand-secondary/15 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-[10px] text-muted font-bold uppercase">بيان الطلب</span>
                    <p className="text-sm font-semibold text-brand-teal-dark">{request.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-brand-secondary/10">
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase">الفرع الطالب</span>
                      <p className="text-xs font-bold text-brand-teal-dark">
                        {request.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 'فرع منتجع الشاطئ'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted font-bold uppercase">رقم جوال الموظف</span>
                      <p className="text-xs font-bold text-brand-teal-dark dir-ltr">{request.reporter?.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial comparison */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-brand-teal-dark/60 uppercase tracking-widest">التدقيق والمقارنة المالية</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 text-center">
                    <span className="text-[10px] text-blue-700 font-bold uppercase">الميزانية المقترحة</span>
                    <p className="text-xl font-extrabold text-blue-900 mt-1">
                      ${request.estimatedCost?.toLocaleString() || '0.00'}
                    </p>
                  </div>
                  <div className="bg-amber-50/50 border border-brand-secondary/35 rounded-lg p-4 text-center">
                    <span className="text-[10px] text-brand-secondary font-bold uppercase">التكلفة الفعلية بالفاتورة</span>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-lg font-extrabold text-brand-teal-dark">$</span>
                      <input 
                        type="number"
                        value={actualCost}
                        onChange={(e) => setActualCost(e.target.value)}
                        className="bg-white border border-brand-secondary/20 rounded px-2 py-0.5 w-24 text-base font-extrabold text-brand-teal-dark focus:outline-none focus:border-brand-secondary text-center"
                      />
                    </div>
                  </div>
                </div>
                
                {request.estimatedCost && parseFloat(actualCost) > request.estimatedCost && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-center gap-2 text-right">
                    <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>تنبيه: تتجاوز القيمة الفعلية للفاتورة التقدير المعتمد بمقدار <b>${(parseFloat(actualCost) - request.estimatedCost).toLocaleString()}</b>.</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <span className="text-xs font-bold text-muted uppercase tracking-wider block">مسار الاعتماد المالي المعين</span>
                <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full border ${
                  request.approvalStatus === ApprovalStatus.Pending_CEO ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-amber-100 text-amber-800 border-brand-secondary'
                }`}>
                  {request.approvalStatus === ApprovalStatus.Pending_CEO ? 'يتطلب توقيع الرئيس التنفيذي' : 'يتطلب اعتماد المدير المالي'}
                </span>
              </div>

              {/* Rejection form */}
              {isRejecting && (
                <form onSubmit={handleRejectSubmit} className="bg-red-50 p-4 rounded-lg border border-red-200 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                  <label htmlFor="reject-reason" className="block text-xs font-bold text-red-800 uppercase">يرجى توضيح سبب رفض الفاتورة:</label>
                  <textarea
                    id="reject-reason"
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="اكتب سبب الرفض هنا..."
                    rows={2}
                    className="w-full text-xs p-2.5 bg-white border border-red-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 text-right"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="text-[10px] font-bold px-3 py-1 border border-red-300 text-red-800 rounded hover:bg-white transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      تأكيد رفض الفاتورة
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* Approve / Reject Controls */}
            {!isRejecting && (
              <div className="border-t border-brand-secondary/20 pt-6 flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsRejecting(true)}
                  disabled={isSubmitting}
                  className="bg-red-50 border border-red-300 hover:bg-red-100 text-red-700 px-5 py-2 rounded text-xs font-extrabold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  رفض المعاملة
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  اعتماد وصرف التكلفة
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
