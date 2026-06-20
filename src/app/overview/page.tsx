'use client';

import React, { useEffect, useState } from 'react';
import { api, RequestItem } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { RequestStatus, RequestType, Role } from '../../types_local';
import RequestModal from '../../components/RequestModal';

export default function OverviewPage() {
  const { role } = useRole();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const translateRole = (roleStr: Role) => {
    switch (roleStr) {
      case Role.Admin: return 'مسؤول النظام';
      case Role.CEO: return 'الرئيس التنفيذي';
      case Role.FinanceManager: return 'المدير المالي';
      case Role.Technician: return 'فني صيانة';
      case Role.WarehouseManager: return 'مدير المستودع';
      case Role.Receptionist: return 'موظف استقبال';
      default: return roleStr;
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Compute metrics
  const activeCount = requests.filter(r => r.status !== RequestStatus.Completed && r.status !== RequestStatus.Rejected).length;
  const completedCount = requests.filter(r => r.status === RequestStatus.Completed).length;
  const awaitingCount = requests.filter(r => r.status === RequestStatus.Awaiting_Confirmation).length;
  
  const totalBudget = requests
    .filter(r => r.status !== RequestStatus.Rejected)
    .reduce((acc, r) => acc + (r.estimatedCost || 0), 0);

  // Group by branch
  const branchCounts = requests.reduce((acc: Record<string, number>, r) => {
    const name = r.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 
                 r.branch?.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : 
                 (r.branch?.name || 'فرع غير معروف');
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  // Group by type
  const typeCounts = requests.reduce((acc: Record<string, number>, r) => {
    acc[r.requestType] = (acc[r.requestType] || 0) + 1;
    return acc;
  }, { Maintenance: 0, Warehouse: 0, Procurement: 0 });

  const recentRequests = [...requests].slice(0, 4);

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
      case RequestStatus.Rejected: return 'مرفوض';
      default: return status;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-brand-teal-dark text-white p-6 rounded-xl border border-brand-secondary/35 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Decorative background vectors */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-secondary/10 blur-2xl"></div>
        <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-brand-secondary/40"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-brand-secondary/40"></div>

        <div>
          <h1 className="text-base font-bold tracking-wide uppercase">مرحباً بك مجدداً، {translateRole(role)}!</h1>
          <p className="text-xs text-white/70 mt-1">
            متابعة البلاغات والعمليات التشغيلية عبر فروع فنادق راحتي. ربط بوابة الواتساب نشط وتلقائي.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="text-xs font-bold bg-brand-secondary hover:bg-brand-secondary-hover text-brand-teal-dark px-4 py-2 rounded border border-brand-secondary transition-all flex items-center gap-1.5"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
          </svg>
          تحديث بيانات النظام
        </button>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stats card 1 */}
        <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden group hover:border-brand-secondary/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">العمليات التشغيلية النشطة</p>
              <h3 className="text-3xl font-extrabold text-brand-teal-dark mt-2">{activeCount}</h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-[10px] text-muted mt-4 font-semibold">تذاكر قيد المعالجة الميدانية</div>
        </div>

        {/* Stats card 2 */}
        <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden group hover:border-brand-secondary/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">بانتظار تأكيد المدير</p>
              <h3 className="text-3xl font-extrabold text-brand-teal-dark mt-2">{awaitingCount}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="text-[10px] text-muted mt-4 font-semibold">تتطلب فحص الصورة وإغلاقها</div>
        </div>

        {/* Stats card 3 */}
        <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden group hover:border-brand-secondary/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">المهام المنجزة بنجاح</p>
              <h3 className="text-3xl font-extrabold text-brand-teal-dark mt-2">{completedCount}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-[10px] text-muted mt-4 font-semibold">تذاكر تم إغلاقها نهائياً</div>
        </div>

        {/* Stats card 4 */}
        <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden group hover:border-brand-secondary/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">إجمالي الميزانية النشطة</p>
              <h3 className="text-2xl font-extrabold text-brand-teal-dark mt-2">
                ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="p-3 bg-brand-secondary/10 text-brand-secondary rounded-lg shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 14a2 2 0 110-4h4a2 2 0 110 4h-4z" />
              </svg>
            </div>
          </div>
          <div className="text-[10px] text-muted mt-4 font-semibold">الصيانة التقديرية والمشتريات الجارية</div>
        </div>

      </div>

      {/* Visual Charts & Status Rings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Requests by Branch */}
        <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-brand-teal-dark uppercase tracking-wider">توزيع البلاغات على الفروع</h3>
            <p className="text-xs text-muted">مقارنة حجم العمل البلاغات التشغيلية بين الفروع</p>
          </div>
          
          <div className="space-y-4 pt-2">
            {Object.entries(branchCounts).map(([branch, count]) => {
              const percentage = (count / requests.length) * 100 || 0;
              return (
                <div key={branch} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-brand-teal-dark">{branch}</span>
                    <span className="text-brand-secondary">{count} بلاغات ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-brand-cream-dark h-3.5 rounded-full overflow-hidden border border-brand-secondary/10">
                    <div 
                      className="bg-brand-primary h-full rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Request Type Ring */}
        <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-bold text-brand-teal-dark uppercase tracking-wider">تحليل أنواع البلاغات</h3>
            <p className="text-xs text-muted">توزع التذاكر المستلمة حسب نوع العملية</p>
          </div>

          <div className="flex justify-center py-2 relative">
            <svg className="w-36 h-36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f4f1eb" strokeWidth="3" />
              
              {/* Maintenance Ring */}
              <circle 
                cx="18" cy="18" r="15.915" 
                fill="none" 
                stroke="#004554" 
                strokeWidth="3.2" 
                strokeDasharray={`${((typeCounts.Maintenance / requests.length) * 100) || 0} ${100 - (((typeCounts.Maintenance / requests.length) * 100) || 0)}`}
                strokeDashoffset="25" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-brand-teal-dark">{requests.length}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold">إجمالي التذاكر</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center border-t border-brand-cream-dark pt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-primary"></span>
                <span className="font-semibold text-brand-teal-dark">صيانة الأعطال</span>
              </div>
              <span className="font-bold">{typeCounts.Maintenance}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-brand-secondary"></span>
                <span className="font-semibold text-brand-teal-dark">طلبات المشتريات</span>
              </div>
              <span className="font-bold">{typeCounts.Procurement}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="font-semibold text-brand-teal-dark">طلبات المستودع</span>
              </div>
              <span className="font-bold">{typeCounts.Warehouse}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity Inbox Feed */}
      <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-brand-cream-dark pb-4">
          <div>
            <h3 className="text-sm font-bold text-brand-teal-dark uppercase tracking-wider">نشاط قنوات الواتساب الأخير</h3>
            <p className="text-xs text-muted">أحدث البلاغات التشغيلية المستلمة من الموظفين الميدانيين</p>
          </div>
          <span className="bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-green-300">
            بوابة الواتساب نشطة
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-muted italic">جاري مزامنة سجلات الواتساب...</div>
        ) : recentRequests.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted italic">لا توجد بلاغات مسجلة حالياً.</div>
        ) : (
          <div className="divide-y divide-brand-cream-dark">
            {recentRequests.map((req) => (
              <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 first:pt-0 last:pb-0 hover:bg-brand-cream/10 transition-colors rounded px-2">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-sm font-bold border ${
                    req.requestType === RequestType.Maintenance ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/25' :
                    req.requestType === RequestType.Procurement ? 'bg-brand-secondary/15 text-brand-secondary border-brand-secondary/30' :
                    'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {translateRequestType(req.requestType).slice(0, 1)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-brand-teal-dark">#{req.id.slice(-6).toUpperCase()}</span>
                      <span className="text-[10px] font-bold text-muted tracking-wider uppercase">
                        • {req.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 'فرع منتجع الشاطئ'}
                      </span>
                      <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                        req.status === RequestStatus.Completed ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        req.status === RequestStatus.In_Progress ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        req.status === RequestStatus.Awaiting_Confirmation ? 'bg-amber-50 text-amber-800 border border-brand-secondary/35' :
                        'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}>
                        {translateStatus(req.status)}
                      </span>
                    </div>
                    <p className="text-sm text-brand-teal-dark/90 mt-1 line-clamp-1">{req.description}</p>
                    <span className="text-[10px] text-muted block mt-1">بواسطة {req.reporter?.name} • {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="shrink-0 flex items-center gap-2 justify-end">
                  {req.estimatedCost && (
                    <span className="text-xs font-extrabold text-brand-teal-dark pr-2">
                      ${req.estimatedCost.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedRequest(req);
                      setIsModalOpen(true);
                    }}
                    className="text-xs font-bold bg-brand-cream border border-brand-secondary/35 hover:bg-brand-cream-dark text-brand-teal-dark px-3.5 py-1.5 rounded transition-colors"
                  >
                    فحص التذكرة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <RequestModal
          request={selectedRequest}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
          }}
          onUpdate={fetchRequests}
          currentRole={role}
        />
      )}

    </div>
  );
}
