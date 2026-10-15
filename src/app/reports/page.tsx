'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  api,
  Branch,
  User,
  MaintenanceTask,
  LoanRequest,
  LeaveRequest,
  LostFoundItem,
  DamageReport,
  StockEntry,
  ProcurementRequest
} from '@/utils/api';
import {
  BarChart3,
  Package,
  Wrench,
  Users,
  Wallet,
  AlertTriangle,
  Download,
  RotateCw,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building2
} from 'lucide-react';

export default function RealKPIsReportsPage() {
  const [activeTab, setActiveTab] = useState<
    'executive' | 'inventory' | 'maintenance' | 'finance' | 'hr' | 'damages'
  >('inventory');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [lostFound, setLostFound] = useState<LostFoundItem[]>([]);
  const [damages, setDamages] = useState<DamageReport[]>([]);

  const loadAllLiveData = async () => {
    setLoading(true);
    try {
      const [bData, uData, mData, lData, lvData, sData, pData, lfData, dData] = await Promise.all([
        api.getBranches().catch(() => []),
        api.getUsers().catch(() => []),
        api.getMaintenanceTasks().catch(() => []),
        api.getLoans().catch(() => []),
        api.getLeaves().catch(() => []),
        api.getStockEntries().catch(() => []),
        api.getProcurementRequests().catch(() => []),
        api.getLostFoundItems().catch(() => []),
        api.getDamageReports().catch(() => [])
      ]);

      setBranches(Array.isArray(bData) ? bData : []);
      setUsers(Array.isArray(uData) ? uData : []);
      setTasks(Array.isArray(mData) ? mData : []);
      setLoans(Array.isArray(lData) ? lData : []);
      setLeaves(Array.isArray(lvData) ? lvData : []);
      setStock(Array.isArray(sData) ? sData : []);
      setProcurements(Array.isArray(pData) ? pData : []);
      setLostFound(Array.isArray(lfData) ? lfData : []);
      setDamages(Array.isArray(dData) ? dData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllLiveData();
  }, []);

  // حساب مؤشرات الأداء الحقيقية والدقيقة لحظياً من البيانات الفعلية
  const kpis = useMemo(() => {
    const filterByBranch = (item: any) =>
      selectedBranch === 'ALL' ||
      item.branchId === selectedBranch ||
      item.user?.branchId === selectedBranch ||
      item.warehouse?.branchId === selectedBranch;

    const fUsers = users.filter(filterByBranch);
    const fTasks = tasks.filter(filterByBranch);
    const fLoans = loans.filter(filterByBranch);
    const fLeaves = leaves.filter(filterByBranch);
    const fStock = stock.filter(filterByBranch);
    const fProc = procurements.filter(filterByBranch);
    const fDamages = damages.filter(filterByBranch);
    const fLost = lostFound.filter(filterByBranch);

    // 1. مؤشرات المخزون والمستودعات
    const totalItems = fStock.length;
    const outOfStock = fStock.filter((i: any) => (i.quantity ?? 0) <= 0);
    const lowStock = fStock.filter(
      (i: any) => (i.quantity ?? 0) > 0 && (i.quantity ?? 0) <= (i.minQuantity ?? 5)
    );
    const totalStockValueSAR = fStock.reduce(
      (sum: number, i: any) => sum + (i.quantity ?? 0) * (i.unitPrice ?? i.price ?? 0),
      0
    );
    const stockAvailabilityRate =
      totalItems > 0
        ? Number((((totalItems - outOfStock.length) / totalItems) * 100).toFixed(1))
        : 100;
    const criticalReorderRate =
      totalItems > 0
        ? Number((((outOfStock.length + lowStock.length) / totalItems) * 100).toFixed(1))
        : 0;

    const approvedPOs = fProc.filter((p: any) => p.status === 'APPROVED');
    const totalProcurementSAR = fProc.reduce(
      (sum: number, p: any) => sum + (p.totalAmount ?? p.amount ?? 0),
      0
    );

    // 2. مؤشرات الصيانة والفنيين
    const totalTickets = fTasks.length;
    const completedTickets = fTasks.filter((t: any) => t.status === 'COMPLETED');
    const inProgressTickets = fTasks.filter((t: any) => t.status === 'IN_PROGRESS');
    const pendingTickets = fTasks.filter((t: any) => t.status === 'PENDING');
    const maintenanceCompletionRate =
      totalTickets > 0 ? Number(((completedTickets.length / totalTickets) * 100).toFixed(1)) : 100;

    const roomCountMap = new Map<string, number>();
    fTasks.forEach((t: any) => {
      if (t.roomNumber) {
        roomCountMap.set(t.roomNumber, (roomCountMap.get(t.roomNumber) || 0) + 1);
      }
    });
    const topProblemRooms = Array.from(roomCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 3. مؤشرات الموارد البشرية والسلف
    const totalPayrollSAR = fUsers.reduce((sum: number, u: any) => sum + (u.salary || 0), 0);
    const approvedLoansList = fLoans.filter((l: any) => l.status === 'APPROVED');
    const pendingLoansList = fLoans.filter((l: any) => l.status === 'PENDING');
    const totalApprovedLoansSAR = approvedLoansList.reduce(
      (sum: number, l: any) => sum + (l.amount || 0),
      0
    );
    const loanToPayrollRatio =
      totalPayrollSAR > 0 ? Number(((totalApprovedLoansSAR / totalPayrollSAR) * 100).toFixed(1)) : 0;

    // 4. مؤشرات التلفيات والمفقودات
    const totalEstimatedDamagesSAR = fDamages.reduce(
      (sum: number, d: any) => sum + (d.estimatedCost || 0),
      0
    );
    const totalChargedDamagesSAR = fDamages
      .filter((d: any) => d.status === 'CHARGED')
      .reduce((sum: number, d: any) => sum + (d.chargedAmount || d.estimatedCost || 0), 0);
    const damageRecoveryRate =
      totalEstimatedDamagesSAR > 0
        ? Number(((totalChargedDamagesSAR / totalEstimatedDamagesSAR) * 100).toFixed(1))
        : 0;

    const deliveredLostItems = fLost.filter((l: any) => l.status === 'DELIVERED').length;
    const lostFoundReturnRate =
      fLost.length > 0 ? Number(((deliveredLostItems / fLost.length) * 100).toFixed(1)) : 0;

    return {
      inventory: {
        totalItems,
        outOfStockCount: outOfStock.length,
        lowStockCount: lowStock.length,
        totalStockValueSAR,
        stockAvailabilityRate,
        criticalReorderRate,
        totalPOs: fProc.length,
        approvedPOsCount: approvedPOs.length,
        totalProcurementSAR,
        criticalList: [...outOfStock, ...lowStock]
      },
      maintenance: {
        totalTickets,
        completedCount: completedTickets.length,
        inProgressCount: inProgressTickets.length,
        pendingCount: pendingTickets.length,
        maintenanceCompletionRate,
        topProblemRooms
      },
      hr: {
        totalEmployees: fUsers.length,
        totalPayrollSAR,
        totalApprovedLoansSAR,
        pendingLoansCount: pendingLoansList.length,
        loanToPayrollRatio,
        totalLeaves: fLeaves.length,
        approvedLeavesCount: fLeaves.filter((l: any) => l.status === 'APPROVED').length
      },
      damages: {
        totalReports: fDamages.length,
        totalEstimatedDamagesSAR,
        totalChargedDamagesSAR,
        damageRecoveryRate,
        totalLostItems: fLost.length,
        deliveredLostItems,
        lostFoundReturnRate
      }
    };
  }, [selectedBranch, users, tasks, loans, leaves, stock, procurements, damages, lostFound]);

  const handleExportCSV = () => {
    const rows = [
      ['القسم', 'المؤشر', 'القيمة', 'الوحدة'],
      ['المخزون', 'إجمالي الأصناف المسجلة', String(kpis.inventory.totalItems), 'صنف'],
      ['المخزون', 'نسبة توفر المخزون الفعلي', String(kpis.inventory.stockAvailabilityRate), '%'],
      ['المخزون', 'نسبة الأصناف الحرجة تحت حد الطلب', String(kpis.inventory.criticalReorderRate), '%'],
      ['المخزون', 'إجمالي قيمة المخزون الحالي', String(kpis.inventory.totalStockValueSAR), 'ر.س'],
      ['الصيانة', 'إجمالي بلاغات الصيانة', String(kpis.maintenance.totalTickets), 'بلاغ'],
      ['الصيانة', 'نسبة إنجاز وإغلاق البلاغات', String(kpis.maintenance.maintenanceCompletionRate), '%'],
      ['الموارد البشرية', 'إجمالي الموظفين', String(kpis.hr.totalEmployees), 'موظف'],
      ['الموارد البشرية', 'إجمالي السلف المعتمدة', String(kpis.hr.totalApprovedLoansSAR), 'ر.س'],
      ['التلفيات', 'إجمالي التلفيات المقدرة', String(kpis.damages.totalEstimatedDamagesSAR), 'ر.س'],
      ['التلفيات', 'نسبة استرداد وتحصيل التلفيات', String(kpis.damages.damageRecoveryRate), '%']
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rahti_kpis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            مركز مؤشرات الأداء الحقيقية والتقارير (Real-Time KPIs)
          </h1>
          <p className="text-gray-500 text-sm">
            مؤشرات قياس دقيقة ومحسوبة لحظياً من قاعدة البيانات لكافة الأقسام بالريال السعودي (ر.س)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="ALL">جميع الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير المؤشرات CSV
          </button>
          <button
            onClick={loadAllLiveData}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          <Package className="w-4 h-4" />
          مؤشرات المخزون والمستودعات
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'maintenance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          <Wrench className="w-4 h-4" />
          مؤشرات الصيانة والأصول
        </button>
        <button
          onClick={() => setActiveTab('hr')}
          className={`pb-3 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'hr'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          <Users className="w-4 h-4" />
          مؤشرات الموارد البشرية والسلف
        </button>
        <button
          onClick={() => setActiveTab('damages')}
          className={`pb-3 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'damages'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          مؤشرات التلفيات والمفقودات
        </button>
        <button
          onClick={() => setActiveTab('executive')}
          className={`pb-3 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'executive'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500'
          }`}
        >
          <Building2 className="w-4 h-4" />
          بطاقة مقارنة الفروع التنفيذية
        </button>
      </div>

      {/* Tab 1: Inventory KPIs */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500">نسبة توفر المخزون (Availability)</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {kpis.inventory.stockAvailabilityRate}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                من إجمالي {kpis.inventory.totalItems} صنف مسجل
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500">مؤشر الأصناف الحرجة (Critical Reorder)</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {kpis.inventory.criticalReorderRate}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {kpis.inventory.outOfStockCount} نافد | {kpis.inventory.lowStockCount} منخفض
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500">القيمة الدفترية للمخزون الحالي</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {kpis.inventory.totalStockValueSAR.toLocaleString()} ر.س
              </div>
              <div className="text-xs text-gray-400 mt-1">محسوبة بالريال السعودي</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500">إجمالي طلبات الشراء والتعميدات</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {kpis.inventory.totalProcurementSAR.toLocaleString()} ر.س
              </div>
              <div className="text-xs text-gray-400 mt-1">
                معتمد: {kpis.inventory.approvedPOsCount} من {kpis.inventory.totalPOs} طلب
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-900 text-sm">
              قائمة الأصناف الحرجة التي تتطلب إعادة تموين فوري ({kpis.inventory.criticalList.length})
            </div>
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3">الصنف</th>
                  <th className="p-3">الرصيد الحالي</th>
                  <th className="p-3">الحد الأدنى</th>
                  <th className="p-3">حالة المخزون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kpis.inventory.criticalList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-emerald-600 font-medium">
                      جميع الأصناف المخزنية فوق الحد الآمن (100%)
                    </td>
                  </tr>
                ) : (
                  kpis.inventory.criticalList.map((item: any) => (
                    <tr key={item.id}>
                      <td className="p-3 font-medium text-gray-900">
                        {item.name || item.item?.name || item.id}
                      </td>
                      <td className="p-3 font-bold text-red-600">{item.quantity ?? 0}</td>
                      <td className="p-3 text-gray-600">{item.minQuantity ?? 5}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {(item.quantity ?? 0) <= 0 ? 'نافد تماماً (0)' : 'تحت الحد الأدنى'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Maintenance KPIs */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500">نسبة إغلاق وإنجاز البلاغات (SLA)</div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">
                {kpis.maintenance.maintenanceCompletionRate}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                مكتمل: {kpis.maintenance.completedCount} من {kpis.maintenance.totalTickets}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500">البلاغات قيد الإصلاح حالياً</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {kpis.maintenance.inProgressCount}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500">البلاغات المعلقة بانتظار المباشرة</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {kpis.maintenance.pendingCount}
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500">الغرف المتكررة الأعطال</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {kpis.maintenance.topProblemRooms.length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-900 text-sm">
              أعلى الغرف والوحدات تكراراً لطلبات الصيانة
            </div>
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3">رقم الغرفة / الوحدة</th>
                  <th className="p-3">عدد البلاغات المسجلة</th>
                  <th className="p-3">التوصية التشغيلية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kpis.maintenance.topProblemRooms.map(([room, count]) => (
                  <tr key={room}>
                    <td className="p-3 font-bold text-gray-900">غرفة {room}</td>
                    <td className="p-3 font-semibold text-indigo-600">{count} بلاغات</td>
                    <td className="p-3 text-xs text-gray-600">
                      {count > 1 ? 'تحتاج فحص صيانة وقائية شامل للأصل' : 'ضمن المعدل الطبيعي'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: HR & Loans KPIs */}
      {activeTab === 'hr' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">إجمالي الكادر الوظيفي النشط</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {kpis.hr.totalEmployees} موظف
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">إجمالي السلف المعتمدة القائمة</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {kpis.hr.totalApprovedLoansSAR.toLocaleString()} ر.س
            </div>
            <div className="text-xs text-gray-400 mt-1">
              طلبات معلقة: {kpis.hr.pendingLoansCount}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">نسبة السلف إلى كتلة الرواتب</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {kpis.hr.loanToPayrollRatio}%
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">الإجازات المعتمدة / الإجمالي</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {kpis.hr.approvedLeavesCount} / {kpis.hr.totalLeaves}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Damages & LostFound KPIs */}
      {activeTab === 'damages' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">إجمالي تكلفة التلفيات المسجلة</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {kpis.damages.totalEstimatedDamagesSAR.toLocaleString()} ر.س
            </div>
            <div className="text-xs text-gray-400 mt-1">
              عدد البلاغات: {kpis.damages.totalReports}
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">المبالغ المحصلة فعلياً من التلفيات</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {kpis.damages.totalChargedDamagesSAR.toLocaleString()} ر.س
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">مؤشر استرداد قيمة التلفيات (Recovery Rate)</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">
              {kpis.damages.damageRecoveryRate}%
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="text-xs text-gray-500">نسبة تسليم المفقودات لأصحابها</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {kpis.damages.lostFoundReturnRate}%
            </div>
            <div className="text-xs text-gray-400 mt-1">
              تم تسليم {kpis.damages.deliveredLostItems} من {kpis.damages.totalLostItems}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Executive Multi-Branch Comparison */}
      {activeTab === 'executive' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-900 text-sm">
            مقارنة الأداء التشغيلي المباشر بين الفروع ({branches.length} فروع)
          </div>
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">الفرع</th>
                <th className="p-3">عدد الموظفين</th>
                <th className="p-3">بلاغات الصيانة المفتوحة</th>
                <th className="p-3">نسبة إنجاز الصيانة</th>
                <th className="p-3">بلاغات التلفيات (ر.س)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map((b) => {
                const bUsers = users.filter((u: any) => u.branchId === b.id).length;
                const bTasks = tasks.filter((t: any) => t.branchId === b.id);
                const bOpen = bTasks.filter((t: any) => t.status !== 'COMPLETED').length;
                const bDone = bTasks.filter((t: any) => t.status === 'COMPLETED').length;
                const bRate =
                  bTasks.length > 0 ? Math.round((bDone / bTasks.length) * 100) : 100;
                const bDmgSAR = damages
                  .filter((d: any) => d.branchId === b.id)
                  .reduce((s: number, d: any) => s + (d.estimatedCost || 0), 0);

                return (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-900">{b.name}</td>
                    <td className="p-3 text-gray-700">{bUsers}</td>
                    <td className="p-3 font-semibold text-amber-600">{bOpen}</td>
                    <td className="p-3 font-bold text-emerald-600">{bRate}%</td>
                    <td className="p-3 font-medium text-red-600">
                      {bDmgSAR.toLocaleString()} ر.س
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
