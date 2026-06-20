'use client';

import React, { useState } from 'react';
import { RequestItem, api } from '../utils/api';
import { RequestStatus, ApprovalStatus, Role, RequestType } from '../types_local';

interface RequestModalProps {
  request: RequestItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentRole: Role;
}

export default function RequestModal({ request, isOpen, onClose, onUpdate, currentRole }: RequestModalProps) {
  const [actualCostInput, setActualCostInput] = useState(request.actualCost?.toString() || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: RequestStatus) => {
    setIsUpdating(true);
    try {
      const updates: any = { status: newStatus };
      
      if (newStatus === RequestStatus.Completed && !request.actualCost) {
        updates.actualCost = parseFloat(actualCostInput) || request.estimatedCost || 0;
      }
      
      await api.updateRequest(request.id, updates);
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      alert('خطأ أثناء تحديث حالة البلاغ');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSimulateCompletionUpload = async () => {
    setIsUpdating(true);
    try {
      const updates: any = {
        status: RequestStatus.Awaiting_Confirmation,
        afterImageUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1794ed9?auto=format&fit=crop&q=80&w=800'
      };
      await api.updateRequest(request.id, updates);
      onUpdate();
      onClose();
    } catch (e) {
      console.error(e);
      alert('خطأ أثناء رفع صورة الإنجاز');
    } finally {
      setIsUpdating(false);
    }
  };

  const translateRequestType = (type: RequestType) => {
    switch (type) {
      case RequestType.Maintenance: return 'صيانة';
      case RequestType.Procurement: return 'مشتريات';
      case RequestType.Warehouse: return 'مستودع';
      default: return type;
    }
  };

  const translateStatus = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.Pending: return 'قيد الانتظار';
      case RequestStatus.In_Progress: return 'قيد العمل';
      case RequestStatus.Awaiting_Confirmation: return 'بانتظار التأكيد';
      case RequestStatus.Completed: return 'مكتمل';
      case RequestStatus.Rejected: return 'مرفوض الميزانية';
      case RequestStatus.Reopened: return 'إعادة عمل (مفتوح)';
      default: return status;
    }
  };

  const translateApprovalStatus = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.Pending_CEO: return 'بانتظار الرئيس التنفيذي';
      case ApprovalStatus.Pending_Finance: return 'بانتظار المدير المالي';
      case ApprovalStatus.Approved: return 'معتمد وموافق عليه';
      case ApprovalStatus.Rejected: return 'مرفوض الميزانية';
      default: return status;
    }
  };

  const isTechnician = currentRole === Role.Technician || currentRole === Role.Admin;
  const isManager = [Role.Admin, Role.CEO, Role.FinanceManager].includes(currentRole);

  return (
    <div className="fixed inset-0 bg-brand-teal-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Card */}
      <div className="bg-white rounded-xl shadow-2xl border border-brand-secondary/35 w-full max-w-4xl overflow-hidden relative animate-in fade-in zoom-in duration-200 text-right">
        
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary"></div>
        
        {/* Top bar */}
        <div className="p-6 border-b border-brand-secondary/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold tracking-widest text-brand-secondary bg-brand-teal-dark px-2.5 py-1 rounded uppercase">
              رقم البلاغ #{request.id.slice(-6).toUpperCase()}
            </span>
            <h3 className="text-base font-bold text-brand-teal-dark mt-2">
              تفاصيل طلب {translateRequestType(request.requestType)}
            </h3>
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

        {/* Modal Content - Scrollable */}
        <div className="p-8 max-h-[75vh] overflow-y-auto space-y-8">
          
          {/* Main Info Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-cream/50 p-4 rounded-lg border border-brand-secondary/20">
              <div className="text-[10px] text-muted font-bold uppercase tracking-wider">الفرع / الموقع</div>
              <div className="text-xs font-bold text-brand-teal-dark mt-1">
                {request.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 
                 request.branch?.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : (request.branch?.name || 'جاري التحميل...')}
              </div>
              <div className="text-[9px] text-muted">{request.branch?.location || '--'}</div>
            </div>
            <div className="bg-brand-cream/50 p-4 rounded-lg border border-brand-secondary/20">
              <div className="text-[10px] text-muted font-bold uppercase tracking-wider">اسم موظف البلاغ</div>
              <div className="text-xs font-bold text-brand-teal-dark mt-1">{request.reporter?.name || 'موظف ميداني'}</div>
              <div className="text-[9px] text-muted">رقم الجوال: {request.reporter?.phoneNumber}</div>
            </div>
            <div className="bg-brand-cream/50 p-4 rounded-lg border border-brand-secondary/20">
              <div className="text-[10px] text-muted font-bold uppercase tracking-wider">الفني المسؤول</div>
              <div className="text-xs font-bold text-brand-teal-dark mt-1">{request.assignedTo?.name || 'غير معين'}</div>
              <div className="text-[9px] text-muted">{request.assignedTo?.phoneNumber || '--'}</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-brand-teal-dark/70 uppercase tracking-widest">الوصف والتفاصيل الميدانية</h4>
            <p className="text-xs text-brand-teal-dark bg-brand-cream-dark/30 p-4 rounded-lg border border-brand-secondary/15 whitespace-pre-wrap leading-relaxed">
              {request.description}
            </p>
          </div>

          {/* Rejection Note */}
          {request.rejectionReason && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">ملاحظات رفض تأكيد العمل وإعادة الفتح</h4>
              <p className="text-xs text-rose-800 bg-rose-50 p-4 rounded-lg border border-rose-200 whitespace-pre-wrap leading-relaxed font-bold">
                ⚠️ {request.rejectionReason}
              </p>
            </div>
          )}

          {/* Financials & Status Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-brand-secondary/20 py-6">
            <div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">حالة البلاغ التشغيلية</span>
              <div className="mt-1 flex items-center gap-2 justify-start">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  request.status === RequestStatus.Completed ? 'bg-emerald-500' :
                  request.status === RequestStatus.In_Progress ? 'bg-blue-500' :
                  request.status === RequestStatus.Awaiting_Confirmation ? 'bg-amber-500' :
                  request.status === RequestStatus.Reopened ? 'bg-rose-500 animate-pulse' :
                  request.status === RequestStatus.Rejected ? 'bg-red-500' : 'bg-gray-400'
                }`}></span>
                <span className="text-xs font-bold text-brand-teal-dark">{translateStatus(request.status)}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">التكلفة التقديرية</span>
              <div className="text-xs font-extrabold text-brand-teal-dark mt-1">
                {request.estimatedCost ? `$${request.estimatedCost.toLocaleString()}` : 'لم تحدد'}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">قرار اعتماد الميزانية</span>
              <div className="mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  request.approvalStatus === ApprovalStatus.Approved ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                  request.approvalStatus === ApprovalStatus.Rejected ? 'bg-red-50 text-red-700 border-red-300' :
                  request.approvalStatus === ApprovalStatus.Pending_CEO ? 'bg-purple-50 text-purple-700 border-purple-300' :
                  'bg-amber-50 text-amber-700 border-amber-300'
                }`}>
                  {translateApprovalStatus(request.approvalStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* Before & After Images Side-by-Side */}
          {request.requestType === RequestType.Maintenance && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-brand-teal-dark/70 uppercase tracking-widest">التحقق من الصور والوسائط</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Before Image */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-muted flex items-center gap-1.5 justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> صورة العطل (قبل العمل)
                  </div>
                  <div className="h-64 relative bg-gray-100 rounded-lg overflow-hidden border border-brand-secondary/20 flex items-center justify-center">
                    {request.beforeImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={request.beforeImageUrl} alt="Before work" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs text-muted italic">لا توجد صورة عطل مرفقة.</div>
                    )}
                  </div>
                </div>

                {/* After Image */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-muted flex items-center gap-1.5 justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> صورة الإنجاز (بعد العمل)
                  </div>
                  <div className="h-64 relative bg-gray-100 rounded-lg overflow-hidden border border-brand-secondary/20 flex items-center justify-center">
                    {request.afterImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={request.afterImageUrl} alt="After work" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <div className="text-xs text-muted italic">لم يرفع الفني صورة بعد العمل حتى الآن.</div>
                        {isTechnician && request.status === RequestStatus.In_Progress && (
                          <button
                            onClick={handleSimulateCompletionUpload}
                            disabled={isUpdating}
                            className="text-xs font-bold bg-brand-secondary hover:bg-brand-secondary-hover text-brand-teal-dark px-3 py-1.5 rounded border border-brand-secondary flex items-center gap-1.5 mx-auto transition-colors disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            محاكاة رفع صورة إنجاز العمل (واتساب)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Timeline History */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-brand-teal-dark/70 uppercase tracking-widest">سجل البلاغ التشغيلي</h4>
            <div className="space-y-3 pr-2">
              <div className="flex gap-4 text-xs">
                <div className="text-muted w-24 shrink-0">{new Date(request.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</div>
                <div className="relative pr-4 border-r border-brand-secondary/40 text-right w-full">
                  <div className="absolute -right-1 top-1.5 w-2 h-2 rounded-full bg-brand-secondary"></div>
                  <span className="font-bold text-brand-teal-dark">تم إنشاء البلاغ</span> تلقائياً عبر رسالة واتساب مستلمة من الموظف {request.reporter?.name || 'ميداني'}.
                </div>
              </div>
              
              {request.status !== RequestStatus.Pending && (
                <div className="flex gap-4 text-xs">
                  <div className="text-muted w-24 shrink-0">{new Date(request.updatedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</div>
                  <div className="relative pr-4 border-r border-brand-secondary/40 text-right w-full">
                    <div className="absolute -right-1 top-1.5 w-2 h-2 rounded-full bg-brand-primary"></div>
                    <span className="font-bold text-brand-teal-dark">بدء العمل الميداني</span>. تم استلام المهمة وتحديث الحالة إلى <span className="italic text-brand-primary font-bold">قيد التنفيذ</span>.
                  </div>
                </div>
              )}

              {request.status === RequestStatus.Awaiting_Confirmation && (
                <div className="flex gap-4 text-xs">
                  <div className="text-muted w-24 shrink-0">{new Date(request.updatedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</div>
                  <div className="relative pr-4 border-r border-brand-secondary/40 text-right w-full">
                    <div className="absolute -right-1 top-1.5 w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="font-bold text-brand-teal-dark">تم إرسال صورة التحقق</span> عبر جوال الفني. بانتظار فحص المدير وإصدار قرار الإغلاق.
                  </div>
                </div>
              )}

              {request.status === RequestStatus.Completed && (
                <div className="flex gap-4 text-xs">
                  <div className="text-muted w-24 shrink-0">{new Date(request.updatedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</div>
                  <div className="relative pr-4 text-right w-full">
                    <div className="absolute -right-1 top-1.5 w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="font-bold text-brand-teal-dark">تم إغلاق البلاغ نهائياً</span>. اعتماد جودة الإنجاز وإدراج التكاليف الفعلية.
                  </div>
                </div>
              )}

              {request.rejectionReason && (
                <div className="flex gap-4 text-xs">
                  <div className="text-muted w-24 shrink-0">{new Date(request.updatedAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</div>
                  <div className="relative pr-4 border-r border-brand-secondary/40 text-right w-full text-rose-600">
                    <div className="absolute -right-1 top-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="font-bold">تم رفض إغلاق البلاغ وإعادة فتحه</span>. سبب الرفض: "{request.rejectionReason}". البلاغ بانتظار إعادة العمل من الفني.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-6 bg-brand-cream-dark/30 border-t border-brand-secondary/20 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="text-xs font-bold px-4 py-2 border border-brand-secondary/35 text-brand-teal-dark hover:bg-brand-cream transition-colors rounded"
          >
            إغلاق
          </button>
          
          {/* Action buttons depending on state */}
          {(request.status === RequestStatus.Pending || request.status === RequestStatus.Reopened) && isTechnician && (
            <button
              onClick={() => handleStatusChange(RequestStatus.In_Progress)}
              disabled={isUpdating}
              className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2 rounded shadow-md transition-colors disabled:opacity-50"
            >
              {request.status === RequestStatus.Reopened ? 'إعادة بدء العمل الميداني' : 'استلام التذكرة وبدء العمل'}
            </button>
          )}

          {request.status === RequestStatus.Awaiting_Confirmation && isManager && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white border border-brand-secondary/35 rounded px-2.5 py-1">
                <span className="text-[10px] font-bold text-brand-teal-dark/60">التكلفة الفعلية:</span>
                <input
                  type="number"
                  value={actualCostInput}
                  onChange={(e) => setActualCostInput(e.target.value)}
                  placeholder={request.estimatedCost?.toString() || '0'}
                  className="w-16 border-0 p-0 text-xs font-bold text-brand-teal-dark focus:ring-0 text-center"
                />
              </div>
              <button
                onClick={() => handleStatusChange(RequestStatus.Completed)}
                disabled={isUpdating}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded shadow-md transition-colors disabled:opacity-50"
              >
                اعتماد جودة العمل وإغلاق البلاغ
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
