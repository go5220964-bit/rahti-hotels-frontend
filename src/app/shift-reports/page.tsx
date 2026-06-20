'use client';

import React, { useState, useEffect } from 'react';
import { api, ShiftReport, Branch, User, Shift } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import { RotateCw, Check, X, Calendar, Landmark, CreditCard, DollarSign, Eye, Plus, Pencil, Trash2 } from 'lucide-react';

export default function ShiftReportsPage() {
  const { role: currentRole } = useRole();
  const [reports, setReports] = useState<ShiftReport[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [branchFilter, setBranchFilter] = useState('');
  const [reporterFilter, setReporterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Selected Report for Modal
  const [selectedReport, setSelectedReport] = useState<ShiftReport | null>(null);
  
  // CRUD Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReport, setEditingReport] = useState<ShiftReport | null>(null);

  // Form Fields State
  const [formReporterId, setFormReporterId] = useState('');
  const [formBranchId, setFormBranchId] = useState('');
  const [formShiftId, setFormShiftId] = useState('');
  const [formShiftLabel, setFormShiftLabel] = useState('صباحي');
  const [formCustomStartTime, setFormCustomStartTime] = useState('');
  const [formCustomEndTime, setFormCustomEndTime] = useState('');
  const [formIsManual, setFormIsManual] = useState(false);
  const [formManualCreatedAt, setFormManualCreatedAt] = useState('');
  
  const [formCashTotal, setFormCashTotal] = useState(0);
  const [formCashExpenses, setFormCashExpenses] = useState(0);
  const [formVisa, setFormVisa] = useState(0);
  const [formMada, setFormMada] = useState(0);
  const [formMastercard, setFormMastercard] = useState(0);
  const [formGulfNet, setFormGulfNet] = useState(0);
  const [formTabby, setFormTabby] = useState(0);
  const [formBankTransfer, setFormBankTransfer] = useState(0);

  // Rejection State
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const openAddModal = () => {
    const receptionists = users.filter(u => u.role === Role.Receptionist);
    setFormReporterId(receptionists[0]?.id || (users[0]?.id || ''));
    setFormBranchId(branches[0]?.id || '');
    setFormShiftId(shifts[0]?.id || '');
    setFormShiftLabel(shifts[0]?.name || 'صباحي');
    setFormCustomStartTime('');
    setFormCustomEndTime('');
    setFormIsManual(false);
    setFormManualCreatedAt(new Date().toISOString().split('T')[0]);
    
    setFormCashTotal(0);
    setFormCashExpenses(0);
    setFormVisa(0);
    setFormMada(0);
    setFormMastercard(0);
    setFormGulfNet(0);
    setFormTabby(0);
    setFormBankTransfer(0);
    setShowAddModal(true);
  };

  const openEditModal = (report: ShiftReport) => {
    setEditingReport(report);
    setFormReporterId(report.reporterId);
    setFormBranchId(report.branchId);
    setFormShiftId(report.shiftId || '');
    setFormShiftLabel(report.shiftLabel);
    setFormCustomStartTime(report.customStartTime || '');
    setFormCustomEndTime(report.customEndTime || '');
    setFormIsManual(report.isManual || false);
    setFormManualCreatedAt(report.createdAt ? report.createdAt.split('T')[0] : '');
    
    setFormCashTotal(report.cashTotal);
    setFormCashExpenses(report.cashExpenses);
    setFormVisa(report.visa);
    setFormMada(report.mada);
    setFormMastercard(report.mastercard);
    setFormGulfNet(report.gulfNet);
    setFormTabby(report.tabby);
    setFormBankTransfer(report.bankTransfer);
    setShowEditModal(true);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {
        branchId: branchFilter,
        status: statusFilter,
        startDate: startDateFilter,
        endDate: endDateFilter,
        reporterId: reporterFilter
      };
      const [reportsData, branchesData, usersData, shiftsData] = await Promise.all([
        api.getShiftReports(filters),
        api.getBranches(),
        api.getUsers(),
        api.getShifts()
      ]);
      setReports(reportsData);
      setBranches(branchesData);
      setUsers(usersData);
      setShifts(shiftsData);
    } catch (error) {
      console.error('Failed to load shift reports:', error);
      showToast('خطأ أثناء تحميل البيانات الماليّة', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [branchFilter, reporterFilter, statusFilter, startDateFilter, endDateFilter]);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const payload = {
        reporterId: formReporterId,
        branchId: formBranchId,
        shiftLabel: formShiftLabel,
        shiftId: formShiftId || null,
        customStartTime: formCustomStartTime || null,
        customEndTime: formCustomEndTime || null,
        isManual: formIsManual,
        manualEnteredBy: formIsManual ? currentRole : null,
        createdAt: formIsManual && formManualCreatedAt ? new Date(formManualCreatedAt).toISOString() : undefined,
        cashTotal: Number(formCashTotal),
        cashExpenses: Number(formCashExpenses),
        visa: Number(formVisa),
        mada: Number(formMada),
        mastercard: Number(formMastercard),
        gulfNet: Number(formGulfNet),
        tabby: Number(formTabby),
        bankTransfer: Number(formBankTransfer)
      };
      
      const newReport = await api.createShiftReport(payload);
      setReports([newReport, ...reports]);
      setShowAddModal(false);
      showToast('تم إضافة تقرير الوردية بنجاح.');
    } catch (error: any) {
      console.error('Failed to create shift report:', error);
      showToast(error?.message || 'حدث خطأ أثناء إضافة تقرير الوردية.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleUpdateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    setSubmittingAction(true);
    try {
      const payload = {
        reporterId: formReporterId,
        branchId: formBranchId,
        shiftLabel: formShiftLabel,
        shiftId: formShiftId || null,
        customStartTime: formCustomStartTime || null,
        customEndTime: formCustomEndTime || null,
        isManual: formIsManual,
        manualEnteredBy: formIsManual ? currentRole : null,
        createdAt: formIsManual && formManualCreatedAt ? new Date(formManualCreatedAt).toISOString() : undefined,
        cashTotal: Number(formCashTotal),
        cashExpenses: Number(formCashExpenses),
        visa: Number(formVisa),
        mada: Number(formMada),
        mastercard: Number(formMastercard),
        gulfNet: Number(formGulfNet),
        tabby: Number(formTabby),
        bankTransfer: Number(formBankTransfer)
      };

      const updatedReport = await api.updateShiftReport(editingReport.id, payload);
      setReports(reports.map(r => r.id === editingReport.id ? updatedReport : r));
      setShowEditModal(false);
      setEditingReport(null);
      showToast('تم تعديل تقرير الوردية بنجاح.');
    } catch (error: any) {
      console.error('Failed to update shift report:', error);
      showToast(error?.message || 'حدث خطأ أثناء تعديل تقرير الوردية.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف تقرير الوردية هذا نهائياً؟')) {
      return;
    }
    try {
      await api.deleteShiftReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
      showToast('تم حذف تقرير الوردية بنجاح.');
    } catch (error: any) {
      console.error('Failed to delete shift report:', error);
      showToast(error?.message || 'حدث خطأ أثناء حذف تقرير الوردية.', 'error');
    }
  };

  const handleApprove = async (reportId: string) => {
    if (submittingAction) return;
    
    // Find reviewer user ID (Accountant or Admin)
    const reviewer = users.find(u => u.role === Role.Accountant) || users.find(u => u.role === Role.Admin) || { id: 'u-6' };
    
    setSubmittingAction(true);
    try {
      const updatedReport = await api.approveShiftReport(reportId, reviewer.id);
      
      // Update local state
      setReports(reports.map(r => r.id === reportId ? updatedReport : r));
      setSelectedReport(null);
      showToast('تم اعتماد تقفيلة الوردية والموافقة عليها بنجاح.');
    } catch (error: any) {
      console.error('Failed to approve shift report:', error);
      showToast(error?.message || 'حدث خطأ أثناء اعتماد التقرير.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || submittingAction) return;
    if (!rejectionReason.trim()) {
      showToast('الرجاء إدخال سبب الرفض أولاً.', 'error');
      return;
    }

    // Find reviewer user ID (Accountant or Admin)
    const reviewer = users.find(u => u.role === Role.Accountant) || users.find(u => u.role === Role.Admin) || { id: 'u-6' };

    setSubmittingAction(true);
    try {
      const updatedReport = await api.rejectShiftReport(selectedReport.id, reviewer.id, rejectionReason.trim());
      
      // Update local state
      setReports(reports.map(r => r.id === selectedReport.id ? updatedReport : r));
      setSelectedReport(null);
      setIsRejecting(false);
      setRejectionReason('');
      showToast('تم رفض تقفيلة الوردية وإشعار الموظف المسؤول.');
    } catch (error: any) {
      console.error('Failed to reject shift report:', error);
      showToast(error?.message || 'حدث خطأ أثناء رفض التقرير.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const resetFilters = () => {
    setBranchFilter('');
    setReporterFilter('');
    setStatusFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  // Helper to translate status
  const translateStatus = (status: string) => {
    switch (status) {
      case 'PendingAccountant': return 'بانتظار المراجعة';
      case 'Approved': return 'معتمدة';
      case 'Rejected': return 'مرفوضة';
      default: return status;
    }
  };

  // Helper to get status color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PendingAccountant':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Compute metrics
  const isToday = (dateStr: string) => {
    const reportDate = new Date(dateStr);
    const today = new Date();
    return reportDate.getDate() === today.getDate() &&
      reportDate.getMonth() === today.getMonth() &&
      reportDate.getFullYear() === today.getFullYear();
  };

  const todayCount = reports.filter(r => isToday(r.createdAt)).length;
  const pendingCount = reports.filter(r => r.status === 'PendingAccountant').length;
  const approvedCount = reports.filter(r => r.status === 'Approved').length;
  const rejectedCount = reports.filter(r => r.status === 'Rejected').length;

  const translateBranch = (branchName?: string) => {
    if (!branchName) return 'غير محدد';
    if (branchName === 'Sail Road Branch') return 'فرع طريق السيل';
    if (branchName === 'Beachside Resort Branch') return 'فرع منتجع الشاطئ';
    return branchName;
  };

  // Check review permission (Accountant or Admin)
  const canReview = currentRole === Role.Accountant || currentRole === Role.Admin;

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toast && (
        <div className={`fixed top-6 left-6 z-50 p-4 rounded-lg shadow-lg border text-xs font-bold transition-all flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-brand-teal-dark">تقارير تقفيل الورديات (التقفيلات)</h2>
          <p className="text-[11px] text-muted mt-1">مراجعة واعتماد المبيعات اليومية، إيرادات الشبكة، والكاش المستلم من فروع الاستقبال.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-2.5 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold border border-emerald-600"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة وردية جديدة
          </button>
          
          <button
            onClick={loadData}
            className="bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg p-2.5 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold border border-brand-primary"
          >
            <RotateCw className="w-3.5 h-3.5" />
            تحديث البيانات
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Today */}
        <div className="bg-white rounded-xl p-5 border border-brand-secondary/25 shadow-sm relative overflow-hidden flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted block">تقارير الوردية اليوم</span>
            <span className="text-2xl font-extrabold text-brand-teal-dark mt-1 block">{todayCount}</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl p-5 border border-brand-secondary/25 shadow-sm relative overflow-hidden flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted block">بانتظار المراجعة</span>
            <span className="text-2xl font-extrabold text-brand-teal-dark mt-1 block">{pendingCount}</span>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-xl p-5 border border-brand-secondary/25 shadow-sm relative overflow-hidden flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted block">التقفيلات المعتمدة</span>
            <span className="text-2xl font-extrabold text-brand-teal-dark mt-1 block">{approvedCount}</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-xl p-5 border border-brand-secondary/25 shadow-sm relative overflow-hidden flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-100">
            <X className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted block">التقفيلات المرفوضة</span>
            <span className="text-2xl font-extrabold text-brand-teal-dark mt-1 block">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Filters Form Panel */}
      <div className="bg-white border border-brand-secondary/20 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-brand-teal-dark">خيارات الفرز والبحث</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Branch Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-teal-dark block">موقع التخزين / الفرع:</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
            >
              <option value="">كل الفروع</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{translateBranch(b.name)}</option>
              ))}
            </select>
          </div>

          {/* Employee Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-teal-dark block">الموظف (الاستقبال):</label>
            <select
              value={reporterFilter}
              onChange={(e) => setReporterFilter(e.target.value)}
              className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
            >
              <option value="">كل موظفي الاستقبال</option>
              {users.filter(u => u.role === Role.Receptionist).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-teal-dark block">حالة التقفيلة:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
            >
              <option value="">كل الحالات</option>
              <option value="PendingAccountant">بانتظار المراجعة</option>
              <option value="Approved">معتمدة</option>
              <option value="Rejected">مرفوضة</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-teal-dark block">تاريخ البدء:</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-teal-dark block">تاريخ الانتهاء:</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {(branchFilter || reporterFilter || statusFilter || startDateFilter || endDateFilter) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
            >
              تصفية كل الفلاتر النشطة ×
            </button>
          </div>
        )}
      </div>

      {/* Shift Reports Table */}
      <div className="bg-white border border-brand-secondary/20 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center text-muted gap-2">
            <RotateCw className="w-8 h-8 animate-spin text-brand-secondary" />
            <span className="text-xs font-bold">جاري تحميل تقارير الورديات...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-muted">
            <Landmark className="w-12 h-12 mx-auto text-brand-secondary/30 mb-3" />
            <p className="text-xs font-bold">لا يوجد أي تقارير تقفيل مطابقة للخيارات المحددة.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-brand-cream-dark border-b border-brand-secondary/15 text-brand-teal-dark font-bold">
                  <th className="p-4">رقم التقفيلة</th>
                  <th className="p-4">الموظف</th>
                  <th className="p-4">الفرع</th>
                  <th className="p-4">الوردية</th>
                  <th className="p-4">صافي الكاش</th>
                  <th className="p-4">إجمالي الشبكة</th>
                  <th className="p-4">تحويل</th>
                  <th className="p-4">الإجمالي</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-dark">
                {reports.map((sr) => {
                  const networkTotal = sr.visa + sr.mada + sr.mastercard + sr.gulfNet + sr.tabby;
                  return (
                    <tr
                      key={sr.id}
                      onClick={() => {
                        setSelectedReport(sr);
                        setIsRejecting(false);
                        setRejectionReason('');
                      }}
                      className="hover:bg-brand-cream/40 transition-colors duration-150 cursor-pointer"
                    >
                      <td className="p-4 font-mono font-bold text-brand-primary">
                        {sr.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4 font-bold text-brand-teal-dark">{sr.reporter?.name || 'مجهول'}</td>
                      <td className="p-4 font-medium text-muted">{translateBranch(sr.branch?.name)}</td>
                      <td className="p-4 font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded bg-brand-cream-dark text-brand-primary">
                            {sr.shiftLabel}
                          </span>
                          {sr.isManual && (
                            <span className="bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded text-[9px]">
                              يدوي
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-brand-teal-dark">{sr.cashNet.toLocaleString()} ريال</td>
                      <td className="p-4 font-bold text-brand-teal-dark">{networkTotal.toLocaleString()} ريال</td>
                      <td className="p-4 font-bold text-brand-teal-dark">{sr.bankTransfer.toLocaleString()} ريال</td>
                      <td className="p-4 font-extrabold text-brand-primary">{sr.grandTotal.toLocaleString()} ريال</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold inline-block ${getStatusBadge(sr.status)}`}>
                          {translateStatus(sr.status)}
                        </span>
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedReport(sr);
                              setIsRejecting(false);
                              setRejectionReason('');
                            }}
                            className="text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 font-bold cursor-pointer transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            عرض
                          </button>
                          
                          {sr.status === 'PendingAccountant' && (
                            <>
                              <button
                                onClick={() => openEditModal(sr)}
                                className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-bold cursor-pointer transition-colors"
                                title="تعديل الوردية"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                تعديل
                              </button>
                              
                              <button
                                onClick={() => handleDeleteReport(sr.id)}
                                className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold cursor-pointer transition-colors"
                                title="حذف الوردية"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                حذف
                              </button>
                            </>
                          )}
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

      {/* Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-40 bg-brand-teal-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-brand-secondary/20 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-brand-primary p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">
                  تفاصيل تقفيلة الوردية #{selectedReport.id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-[10px] text-white/70 mt-1">
                  الموظف: {selectedReport.reporter?.name} | الفرع: {translateBranch(selectedReport.branch?.name)} | الوردية: {selectedReport.shiftLabel}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              
              {/* Rejection Alert Box */}
              {selectedReport.status === 'Rejected' && selectedReport.rejectionReason && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                  <h4 className="font-extrabold text-[11px] mb-1 flex items-center gap-1 text-rose-700">
                    <X className="w-4 h-4" />
                    سبب رفض التقفيلة من المحاسب:
                  </h4>
                  <p className="leading-relaxed font-semibold mt-0.5">{selectedReport.rejectionReason}</p>
                </div>
              )}

              {/* Shift Timing Details for Open Shifts or Manual Entry Info */}
              {(selectedReport.customStartTime || selectedReport.customEndTime || selectedReport.isManual) && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-3 text-slate-700 font-semibold">
                  {selectedReport.isManual && (
                    <div className="col-span-2 flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-100 p-2 rounded">
                      <span>⚠️ تم إدخال هذا التقرير يدوياً بواسطة الإدارة</span>
                      {selectedReport.manualEnteredBy && (
                        <span>(بواسطة: {selectedReport.manualEnteredBy === 'Admin' ? 'مدير النظام' : selectedReport.manualEnteredBy === 'FinanceManager' ? 'المدير المالي' : selectedReport.manualEnteredBy})</span>
                      )}
                    </div>
                  )}
                  {selectedReport.customStartTime && (
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">وقت بدء الوردية (الفعلي):</span>
                      <span className="font-mono text-sm">{selectedReport.customStartTime}</span>
                    </div>
                  )}
                  {selectedReport.customEndTime && (
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">وقت انتهاء الوردية (الفعلي):</span>
                      <span className="font-mono text-sm">{selectedReport.customEndTime}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Grid: Financial Stats Breakdown */}
              <div className="space-y-4">
                {/* Section 1: Cash Net Calculation */}
                <div>
                  <h4 className="font-bold text-brand-teal-dark mb-2.5 pb-1 border-b border-brand-cream-dark flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-brand-primary" />
                    تفاصيل حركة الكاش (النقد):
                  </h4>
                  <div className="grid grid-cols-3 gap-4 bg-brand-cream p-4 rounded-lg border border-brand-secondary/20">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-muted block mb-1">إجمالي الكاش المستلم</span>
                      <span className="font-extrabold text-brand-teal-dark text-sm">{selectedReport.cashTotal.toLocaleString()} ريال</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-muted block mb-1">المصروفات من الكاش</span>
                      <span className="font-extrabold text-rose-600 text-sm">({selectedReport.cashExpenses.toLocaleString()}) ريال</span>
                    </div>
                    <div className="text-center border-r border-brand-secondary/20 pr-4">
                      <span className="text-[10px] font-bold text-brand-primary block mb-1">صافي الكاش الفعلي</span>
                      <span className="font-extrabold text-brand-primary text-sm">{selectedReport.cashNet.toLocaleString()} ريال</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Cards & Digital Networks */}
                <div>
                  <h4 className="font-bold text-brand-teal-dark mb-2.5 pb-1 border-b border-brand-cream-dark flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-brand-primary" />
                    شبكات وعمليات الدفع الإلكتروني (الشبكة):
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white border border-brand-cream-dark p-3 rounded text-center">
                      <span className="text-[9px] font-bold text-muted block mb-0.5">مدى (Mada)</span>
                      <span className="font-extrabold text-brand-teal-dark">{selectedReport.mada.toLocaleString()} ريال</span>
                    </div>
                    <div className="bg-white border border-brand-cream-dark p-3 rounded text-center">
                      <span className="text-[9px] font-bold text-muted block mb-0.5">فيزا (Visa)</span>
                      <span className="font-extrabold text-brand-teal-dark">{selectedReport.visa.toLocaleString()} ريال</span>
                    </div>
                    <div className="bg-white border border-brand-cream-dark p-3 rounded text-center">
                      <span className="text-[9px] font-bold text-muted block mb-0.5">ماستر كارد (Mastercard)</span>
                      <span className="font-extrabold text-brand-teal-dark">{selectedReport.mastercard.toLocaleString()} ريال</span>
                    </div>
                    <div className="bg-white border border-brand-cream-dark p-3 rounded text-center">
                      <span className="text-[9px] font-bold text-muted block mb-0.5">شبكة خليجية (GulfNet)</span>
                      <span className="font-extrabold text-brand-teal-dark">{selectedReport.gulfNet.toLocaleString()} ريال</span>
                    </div>
                    <div className="bg-white border border-brand-cream-dark p-3 rounded text-center">
                      <span className="text-[9px] font-bold text-muted block mb-0.5">تابي (Tabby)</span>
                      <span className="font-extrabold text-brand-teal-dark">{selectedReport.tabby.toLocaleString()} ريال</span>
                    </div>
                    <div className="bg-white/50 border border-brand-cream-dark p-3 rounded text-center font-bold">
                      <span className="text-[9px] text-brand-primary block mb-0.5">مجموع الشبكة</span>
                      <span className="text-brand-primary">
                        {(selectedReport.visa + selectedReport.mada + selectedReport.mastercard + selectedReport.gulfNet + selectedReport.tabby).toLocaleString()} ريال
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2.5: Revenue Split & Damages */}
                <div>
                  <h4 className="font-bold text-brand-teal-dark mb-2.5 pb-1 border-b border-brand-cream-dark flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-brand-primary" />
                    توزيع الإيرادات والتعويضات (تقسيم تلقائي):
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded text-center">
                      <span className="text-[9px] font-bold text-amber-800 block mb-0.5">تعويضات تلفيات</span>
                      <span className="font-extrabold text-amber-900">
                        {((selectedReport.damageCompensations || 0)).toLocaleString()} ريال
                      </span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded text-center">
                      <span className="text-[9px] font-bold text-blue-800 block mb-0.5">إيراد الغرف (75%)</span>
                      <span className="font-extrabold text-blue-900">
                        {((selectedReport.roomRevenue || 0)).toLocaleString(undefined, {maximumFractionDigits: 2})} ريال
                      </span>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-3 rounded text-center">
                      <span className="text-[9px] font-bold text-purple-800 block mb-0.5">إيراد الخدمات (25%)</span>
                      <span className="font-extrabold text-purple-900">
                        {((selectedReport.serviceRevenue || 0)).toLocaleString(undefined, {maximumFractionDigits: 2})} ريال
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Bank Transfer & Totals */}
                <div>
                  <h4 className="font-bold text-brand-teal-dark mb-2.5 pb-1 border-b border-brand-cream-dark flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-brand-primary" />
                    التحويلات البنكية والملخص العام:
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-brand-secondary/20 p-4 rounded-lg flex flex-col justify-center text-center">
                      <span className="text-[10px] font-bold text-muted block mb-1">التحويل البنكي المباشر</span>
                      <span className="font-extrabold text-brand-teal-dark text-sm">{selectedReport.bankTransfer.toLocaleString()} ريال</span>
                    </div>

                    <div className="bg-brand-primary/10 border border-brand-primary/25 p-4 rounded-lg flex flex-col justify-center text-center">
                      <span className="text-[10px] font-extrabold text-brand-primary block mb-1">📊 الإجمالي الكلي للتقرير</span>
                      <span className="font-black text-brand-primary text-base">{selectedReport.grandTotal.toLocaleString()} ريال</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviewer Meta Information */}
              {(selectedReport.reviewedBy || selectedReport.reviewedAt) && (
                <div className="pt-4 border-t border-brand-cream-dark text-[10px] text-muted flex justify-between">
                  <span>المراجع: {selectedReport.reviewedBy || 'غير متوفر'}</span>
                  <span>تاريخ المراجعة: {selectedReport.reviewedAt ? new Date(selectedReport.reviewedAt).toLocaleString('ar-EG') : 'غير متوفر'}</span>
                </div>
              )}

              {/* Rejection Form inside Modal */}
              {isRejecting && (
                <form onSubmit={handleReject} className="p-4 bg-rose-50/50 border border-rose-200 rounded-lg space-y-3 pt-3">
                  <label className="text-xs font-bold text-rose-800 block">يرجى كتابة سبب الرفض لتوجيهه للاستقبال:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="مثال: يوجد عجز في الكاش بقيمة 50 ريال، يرجى مراجعة الصندوق وإعادة الإرسال."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full text-xs bg-white border border-rose-300 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-rose-500 font-semibold"
                  />
                  <div className="flex justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="text-xs font-bold border border-rose-200 bg-white text-rose-800 px-3 py-1.5 rounded transition-all cursor-pointer"
                    >
                      تراجع
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAction}
                      className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded transition-all cursor-pointer disabled:opacity-50"
                    >
                      تأكيد الرفض والإرسال
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer (Actions) */}
            <div className="bg-brand-cream-dark p-4 border-t border-brand-secondary/15 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedReport(null)}
                className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream text-brand-teal-dark px-4 py-2.5 rounded transition-all cursor-pointer"
              >
                إغلاق النافذة
              </button>

              {selectedReport.status === 'PendingAccountant' && canReview && !isRejecting && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsRejecting(true)}
                    disabled={submittingAction}
                    className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    رفض التقرير
                  </button>
                  
                  <button
                    onClick={() => handleApprove(selectedReport.id)}
                    disabled={submittingAction}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    قبول واعتماد التقرير
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Add Shift Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-40 bg-brand-teal-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-brand-secondary/20 max-h-[90vh] flex flex-col">
            
            <div className="bg-emerald-600 p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">إضافة تقرير وردية جديد (تقفيلة)</h3>
                <p className="text-[10px] text-white/70 mt-1">أدخل المبيعات والكاش اليومي لإرساله للتدقيق والمراجعة المالية.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-teal-dark block">موظف الاستقبال:</label>
                    <select
                      value={formReporterId}
                      onChange={(e) => setFormReporterId(e.target.value)}
                      required
                      className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                    >
                      {users.filter(u => u.role === Role.Receptionist).map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-teal-dark block">الفرع (الفندق):</label>
                    <select
                      value={formBranchId}
                      onChange={(e) => setFormBranchId(e.target.value)}
                      required
                      className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{translateBranch(b.name)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-teal-dark block">الوردية:</label>
                    <select
                      value={formShiftId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        setFormShiftId(sId);
                        const matchedShift = shifts.find(s => s.id === sId);
                        if (matchedShift) {
                          setFormShiftLabel(matchedShift.name);
                        }
                      }}
                      required
                      className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium font-semibold"
                    >
                      <option value="" disabled>اختر الوردية...</option>
                      {shifts.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.isOpen ? '(مفتوحة/مرنة)' : `(${s.startTime} - ${s.endTime})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom times for Open Shift */}
                {shifts.find(s => s.id === formShiftId)?.isOpen && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-purple-900 block">وقت البدء الفعلي:</label>
                      <input
                        type="time"
                        value={formCustomStartTime}
                        onChange={(e) => setFormCustomStartTime(e.target.value)}
                        required
                        className="w-full text-xs bg-white border border-purple-200 rounded p-2 text-right"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-purple-900 block">وقت الانتهاء الفعلي:</label>
                      <input
                        type="time"
                        value={formCustomEndTime}
                        onChange={(e) => setFormCustomEndTime(e.target.value)}
                        required
                        className="w-full text-xs bg-white border border-purple-200 rounded p-2 text-right"
                      />
                    </div>
                  </div>
                )}

                {/* Administrative Manual Entry Toggle */}
                {canReview && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                    <label className="flex items-center gap-2 font-bold text-amber-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsManual}
                        onChange={(e) => setFormIsManual(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span>إدخال إداري يدوي (تسجيل بأثر رجعي)</span>
                    </label>
                    
                    {formIsManual && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-950 block">تاريخ تسجيل الوردية:</label>
                        <input
                          type="date"
                          value={formManualCreatedAt}
                          onChange={(e) => setFormManualCreatedAt(e.target.value)}
                          required={formIsManual}
                          className="w-full text-xs bg-white border border-amber-300 rounded p-2 text-right"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-brand-cream-dark my-4 pt-3">
                  <h4 className="font-bold text-brand-teal-dark mb-3">حركة الكاش والمصروفات:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-teal-dark block">إجمالي الكاش المستلم (ريال):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formCashTotal}
                        onChange={(e) => setFormCashTotal(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-teal-dark block">المصروفات النقدية (ريال):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formCashExpenses}
                        onChange={(e) => setFormCashExpenses(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-brand-cream-dark my-4 pt-3">
                  <h4 className="font-bold text-brand-teal-dark mb-3">إيرادات الشبكات والتحويلات:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">مدى (Mada):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formMada}
                        onChange={(e) => setFormMada(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">فيزا (Visa):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formVisa}
                        onChange={(e) => setFormVisa(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">ماستر كارد:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formMastercard}
                        onChange={(e) => setFormMastercard(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">شبكة خليجية:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formGulfNet}
                        onChange={(e) => setFormGulfNet(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">تابي (Tabby):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formTabby}
                        onChange={(e) => setFormTabby(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">تحويل بنكي:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formBankTransfer}
                        onChange={(e) => setFormBankTransfer(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-brand-cream border border-brand-secondary/20 p-4 rounded-lg space-y-2 mt-4">
                  <h5 className="font-bold text-brand-teal-dark text-[10px]">خلاصة الحسابات التلقائية (مباشر):</h5>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-2.5 rounded border border-brand-cream-dark">
                      <span className="text-[9px] text-muted block mb-0.5">صافي الكاش (💵 كاش - ➖ مصروفات):</span>
                      <span className="font-extrabold text-brand-teal-dark text-xs">{(formCashTotal - formCashExpenses).toLocaleString()} ريال</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-brand-primary/25">
                      <span className="text-[9px] text-brand-primary block mb-0.5">📊 الإجمالي الكلي المحسوب:</span>
                      <span className="font-black text-brand-primary text-xs">
                        {(
                          (formCashTotal - formCashExpenses) +
                          formMada +
                          formVisa +
                          formMastercard +
                          formGulfNet +
                          formTabby +
                          formBankTransfer
                        ).toLocaleString()} ريال
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="bg-brand-cream-dark p-4 border-t border-brand-secondary/15 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream text-brand-teal-dark px-4 py-2.5 rounded transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  حفظ وإرسال التقفيلة
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Edit Shift Report Modal */}
      {showEditModal && editingReport && (
        <div className="fixed inset-0 z-40 bg-brand-teal-dark/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-brand-secondary/20 max-h-[90vh] flex flex-col">
            
            <div className="bg-amber-600 p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-sm font-bold text-white">تعديل تقرير وردية (التقفيلة) #{editingReport.id.slice(-6).toUpperCase()}</h3>
                <p className="text-[10px] text-white/70 mt-1">تعديل المبيعات والكاش لتقرير الوردية في وضع الانتظار.</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReport(null);
                }}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateReport} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-teal-dark block">موظف الاستقبال:</label>
                    <select
                      value={formReporterId}
                      onChange={(e) => setFormReporterId(e.target.value)}
                      required
                      className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                    >
                      {users.filter(u => u.role === Role.Receptionist).map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-teal-dark block">الفرع (الفندق):</label>
                    <select
                      value={formBranchId}
                      onChange={(e) => setFormBranchId(e.target.value)}
                      required
                      className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{translateBranch(b.name)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-teal-dark block">الوردية:</label>
                    <select
                      value={formShiftId}
                      onChange={(e) => {
                        const sId = e.target.value;
                        setFormShiftId(sId);
                        const matchedShift = shifts.find(s => s.id === sId);
                        if (matchedShift) {
                          setFormShiftLabel(matchedShift.name);
                        }
                      }}
                      required
                      className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium font-semibold"
                    >
                      <option value="" disabled>اختر الوردية...</option>
                      {shifts.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.isOpen ? '(مفتوحة/مرنة)' : `(${s.startTime} - ${s.endTime})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom times for Open Shift */}
                {shifts.find(s => s.id === formShiftId)?.isOpen && (
                  <div className="grid grid-cols-2 gap-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-purple-900 block">وقت البدء الفعلي:</label>
                      <input
                        type="time"
                        value={formCustomStartTime}
                        onChange={(e) => setFormCustomStartTime(e.target.value)}
                        required
                        className="w-full text-xs bg-white border border-purple-200 rounded p-2 text-right"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-purple-900 block">وقت الانتهاء الفعلي:</label>
                      <input
                        type="time"
                        value={formCustomEndTime}
                        onChange={(e) => setFormCustomEndTime(e.target.value)}
                        required
                        className="w-full text-xs bg-white border border-purple-200 rounded p-2 text-right"
                      />
                    </div>
                  </div>
                )}

                {/* Administrative Manual Entry Toggle */}
                {canReview && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                    <label className="flex items-center gap-2 font-bold text-amber-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formIsManual}
                        onChange={(e) => setFormIsManual(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span>إدخل إداري يدوي (تسجيل بأثر رجعي)</span>
                    </label>
                    
                    {formIsManual && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-950 block">تاريخ تسجيل الوردية:</label>
                        <input
                          type="date"
                          value={formManualCreatedAt}
                          onChange={(e) => setFormManualCreatedAt(e.target.value)}
                          required={formIsManual}
                          className="w-full text-xs bg-white border border-amber-300 rounded p-2 text-right"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-brand-cream-dark my-4 pt-3">
                  <h4 className="font-bold text-brand-teal-dark mb-3">حركة الكاش والمصروفات:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-teal-dark block">إجمالي الكاش المستلم (ريال):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formCashTotal}
                        onChange={(e) => setFormCashTotal(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-teal-dark block">المصروفات النقدية (ريال):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formCashExpenses}
                        onChange={(e) => setFormCashExpenses(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-brand-cream-dark my-4 pt-3">
                  <h4 className="font-bold text-brand-teal-dark mb-3">إيرادات الشبكات والتحويلات:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">مدى (Mada):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formMada}
                        onChange={(e) => setFormMada(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">فيزا (Visa):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formVisa}
                        onChange={(e) => setFormVisa(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">ماستر كارد:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formMastercard}
                        onChange={(e) => setFormMastercard(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">شبكة خليجية:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formGulfNet}
                        onChange={(e) => setFormGulfNet(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">تابي (Tabby):</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formTabby}
                        onChange={(e) => setFormTabby(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-teal-dark block">تحويل بنكي:</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formBankTransfer}
                        onChange={(e) => setFormBankTransfer(Number(e.target.value))}
                        className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-brand-cream border border-brand-secondary/20 p-4 rounded-lg space-y-2 mt-4">
                  <h5 className="font-bold text-brand-teal-dark text-[10px]">خلاصة الحسابات التلقائية (مباشر):</h5>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white p-2.5 rounded border border-brand-cream-dark">
                      <span className="text-[9px] text-muted block mb-0.5">صافي الكاش (💵 كاش - ➖ مصروفات):</span>
                      <span className="font-extrabold text-brand-teal-dark text-xs">{(formCashTotal - formCashExpenses).toLocaleString()} ريال</span>
                    </div>
                    <div className="bg-white p-2.5 rounded border border-brand-primary/25">
                      <span className="text-[9px] text-brand-primary block mb-0.5">📊 الإجمالي الكلي المحسوب:</span>
                      <span className="font-black text-brand-primary text-xs">
                        {(
                          (formCashTotal - formCashExpenses) +
                          formMada +
                          formVisa +
                          formMastercard +
                          formGulfNet +
                          formTabby +
                          formBankTransfer
                        ).toLocaleString()} ريال
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="bg-brand-cream-dark p-4 border-t border-brand-secondary/15 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingReport(null);
                  }}
                  className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream text-brand-teal-dark px-4 py-2.5 rounded transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
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
