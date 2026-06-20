'use client';

import React, { useEffect, useState } from 'react';
import { api, RequestItem } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { RequestStatus, RequestType, Role, ApprovalStatus } from '../../types_local';
import RequestModal from '../../components/RequestModal';

export default function KanbanPage() {
  const { role } = useRole();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [activeTab, setActiveTab] = useState<RequestType>(RequestType.Maintenance);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests({ requestType: activeTab });
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  // Translated Columns specification
  const columns = [
    { title: 'قيد الانتظار', status: RequestStatus.Pending, color: 'border-t-gray-400 bg-gray-55/10' },
    { title: 'قيد العمل', status: RequestStatus.In_Progress, color: 'border-t-blue-500 bg-blue-50/15' },
    { title: 'بانتظار التأكيد', status: RequestStatus.Awaiting_Confirmation, color: 'border-t-amber-500 bg-amber-50/15' },
    { title: 'مكتمل', status: RequestStatus.Completed, color: 'border-t-emerald-500 bg-emerald-50/15' }
  ];

  // Helper to calculate Arabic time elapsed
  const getElapsedStr = (dateStr: string) => {
    const elapsedMs = Date.now() - new Date(dateStr).getTime();
    const hrs = Math.floor(elapsedMs / 3600000);
    if (hrs === 0) {
      const mins = Math.floor(elapsedMs / 60000);
      return `منذ ${mins} دقيقة`;
    }
    if (hrs < 24) return `منذ ${hrs} ساعة`;
    return `منذ ${Math.floor(hrs / 24)} يوم`;
  };

  // Filter requests by search query
  const filteredRequests = requests.filter(r => {
    const desc = r.description.toLowerCase();
    const branch = r.branch?.name.toLowerCase() || '';
    const reporter = r.reporter?.name.toLowerCase() || '';
    const tech = r.assignedTo?.name.toLowerCase() || '';
    const id = r.id.toLowerCase();
    const query = searchQuery.toLowerCase();
    return desc.includes(query) || branch.includes(query) || reporter.includes(query) || tech.includes(query) || id.includes(query);
  });

  const handleAdvanceStatus = async (e: React.MouseEvent, req: RequestItem) => {
    e.stopPropagation(); // Avoid triggering open modal
    let nextStatus: RequestStatus | null = null;
    const updates: any = {};

    if (req.status === RequestStatus.Pending) {
      nextStatus = RequestStatus.In_Progress;
      updates.assignedToId = 'u-4'; // Assign Thomas Miller
    } else if (req.status === RequestStatus.In_Progress) {
      nextStatus = RequestStatus.Awaiting_Confirmation;
      updates.afterImageUrl = 'https://images.unsplash.com/photo-1581092162384-8987c1794ed9?auto=format&fit=crop&q=80&w=800';
    } else if (req.status === RequestStatus.Awaiting_Confirmation) {
      nextStatus = RequestStatus.Completed;
      updates.actualCost = req.estimatedCost || 0;
      updates.approvalStatus = ApprovalStatus.Approved;
    }

    if (nextStatus) {
      updates.status = nextStatus;
      try {
        await api.updateRequest(req.id, updates);
        fetchRequests();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-brand-secondary/20 shadow-sm">
        
        {/* Toggle tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab(RequestType.Maintenance)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
              activeTab === RequestType.Maintenance
                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                : 'bg-brand-cream border-brand-secondary/35 text-brand-teal-dark hover:bg-brand-cream-dark'
            }`}
          >
            🔧 أعمال الصيانة
          </button>
          <button
            onClick={() => setActiveTab(RequestType.Warehouse)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
              activeTab === RequestType.Warehouse
                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                : 'bg-brand-cream border-brand-secondary/35 text-brand-teal-dark hover:bg-brand-cream-dark'
            }`}
          >
            📦 طلبات المستودع
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="ابحث عن بلاغ، فرع، فني..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pr-9 pl-4 py-2 bg-brand-cream-dark/30 border border-brand-secondary/35 rounded-lg focus:outline-none focus:border-brand-secondary text-brand-teal-dark font-medium"
          />
          <svg className="w-4 h-4 text-muted absolute right-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

      </div>

      {/* Kanban Board Columns Grid */}
      {loading ? (
        <div className="text-center py-20 text-xs text-muted italic">جاري تحميل بطاقات الصيانة...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start h-[70vh] overflow-y-hidden">
          
          {columns.map((col) => {
            const columnRequests = filteredRequests.filter(r => r.status === col.status);
            
            return (
              <div 
                key={col.title} 
                className="flex flex-col h-full bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden"
              >
                
                {/* Column Header */}
                <div className={`p-4 border-t-4 border-b border-brand-secondary/15 ${col.color} flex items-center justify-between`}>
                  <h4 className="text-xs font-bold text-brand-teal-dark uppercase tracking-widest">{col.title}</h4>
                  <span className="bg-brand-cream text-brand-teal-dark border border-brand-secondary/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {columnRequests.length}
                  </span>
                </div>

                {/* Column Body - Scrollable Cards container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[60vh]">
                  {columnRequests.length === 0 ? (
                    <div className="text-center py-12 text-[10px] text-muted italic">لا توجد بلاغات في هذه المرحلة.</div>
                  ) : (
                    columnRequests.map((req) => (
                      <div
                        key={req.id}
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsModalOpen(true);
                        }}
                        className="bg-white p-4 rounded-lg border border-brand-secondary/15 hover:border-brand-secondary shadow-sm hover:shadow transition-all duration-200 cursor-pointer space-y-3 group text-right"
                      >
                        
                        {/* Card Top */}
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-extrabold text-brand-secondary bg-brand-teal-dark/5 px-2 py-0.5 rounded uppercase">
                            #{req.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[9px] font-bold text-muted uppercase">
                            {getElapsedStr(req.createdAt)}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs font-semibold text-brand-teal-dark line-clamp-2 leading-relaxed">
                          {req.description}
                        </p>

                        {/* Branch info */}
                        <div className="text-[10px] text-muted flex items-center gap-1.5 justify-start">
                          <svg className="w-3.5 h-3.5 text-brand-secondary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium text-brand-teal-dark/70">
                            {req.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 'فرع منتجع الشاطئ'}
                          </span>
                        </div>

                        {/* Reporter/Tech and Cost Footer */}
                        <div className="pt-2 border-t border-brand-cream-dark flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5 text-muted justify-start">
                            <div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-[8px] font-extrabold uppercase shrink-0">
                              {(req.assignedTo?.name || req.reporter?.name || 'US').slice(0, 2)}
                            </div>
                            <span className="font-semibold text-brand-teal-dark/70 truncate max-w-[80px]">
                              {req.assignedTo?.name || `المبلغ: ${req.reporter?.name}`}
                            </span>
                          </div>

                          {/* Cost */}
                          {req.estimatedCost ? (
                            <span className="font-extrabold text-brand-teal-dark">
                              ${req.estimatedCost}
                            </span>
                          ) : (
                            <span className="text-white/0 font-medium">--</span>
                          )}
                        </div>

                        {/* Advance Action Buttons */}
                        {col.status !== RequestStatus.Completed && (
                          <div className="pt-1">
                            {col.status === RequestStatus.Pending && (role === Role.Technician || role === Role.Admin) && (
                              <button
                                onClick={(e) => handleAdvanceStatus(e, req)}
                                className="w-full text-center text-[10px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover py-1.5 rounded transition-colors"
                              >
                                قبول التذكرة وبدء العمل
                              </button>
                            )}

                            {col.status === RequestStatus.In_Progress && (role === Role.Technician || role === Role.Admin) && (
                              <button
                                onClick={(e) => handleAdvanceStatus(e, req)}
                                className="w-full text-center text-[10px] font-bold bg-brand-secondary text-brand-teal-dark hover:bg-brand-secondary-hover py-1.5 rounded border border-brand-secondary transition-colors"
                              >
                                رفع صورة تأكيد الإنجاز
                              </button>
                            )}

                            {col.status === RequestStatus.Awaiting_Confirmation && [Role.Admin, Role.CEO, Role.FinanceManager].includes(role) && (
                              <button
                                onClick={(e) => handleAdvanceStatus(e, req)}
                                className="w-full text-center text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded transition-colors"
                              >
                                اعتماد الإغلاق بنجاح
                              </button>
                            )}
                          </div>
                        )}

                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* Details Modal */}
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
