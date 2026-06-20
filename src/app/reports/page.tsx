'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import {
  Lock,
  Calendar,
  Building,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Wrench,
  Package,
  Trash2,
  DollarSign,
  Clock,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

function ReportsPageContent() {
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState<number>(1);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [digestLoading, setDigestLoading] = useState<boolean>(false);
  const [restockLoading, setRestockLoading] = useState<boolean>(false);

  // States for report data
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [leaveData, setLeaveData] = useState<any>(null);
  const [loanData, setLoanData] = useState<any>(null);
  const [maintenanceData, setMaintenanceData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [procurementData, setProcurementData] = useState<any>(null);
  const [damageData, setDamageData] = useState<any>(null);
  const [lostFoundData, setLostFoundData] = useState<any>(null);
  const [executiveData, setExecutiveData] = useState<any>(null);

  const loadAllReports = async () => {
    setLoading(true);
    try {
      const branchParam = selectedBranch || undefined;
      const [
        financials,
        attendance,
        leaves,
        loans,
        maintenance,
        inventory,
        procurement,
        damage,
        lostfound,
        executive
      ] = await Promise.all([
        api.getPeriodFinancialReport(branchParam, startDate, endDate),
        api.getAttendanceReport(branchParam, startDate, endDate),
        api.getLeaveReport(branchParam, startDate, endDate),
        api.getLoanReport(branchParam),
        api.getMaintenanceReport(branchParam, startDate, endDate),
        api.getInventoryReport(branchParam),
        api.getProcurementReport(branchParam, startDate, endDate),
        api.getDamageReport(branchParam, startDate, endDate),
        api.getLostFoundReport(branchParam, startDate, endDate),
        api.getExecutiveReport(startDate, endDate)
      ]);

      setFinancialData(financials);
      setAttendanceData(attendance);
      setLeaveData(leaves);
      setLoanData(loans);
      setMaintenanceData(maintenance);
      setInventoryData(inventory);
      setProcurementData(procurement);
      setDamageData(damage);
      setLostFoundData(lostfound);
      setExecutiveData(executive);
    } catch (e) {
      console.error('Failed to load all reports data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, [selectedBranch, startDate, endDate]);

  // Handle WhatsApp Daily Digest trigger
  const handleTriggerDigest = async () => {
    setDigestLoading(true);
    try {
      await api.triggerDigest(selectedBranch || undefined);
      alert('تم إرسال طلب ملخص الواتساب اليومي للمشرفين والمسؤولين بنجاح!');
    } catch (e) {
      console.error(e);
      alert('فشل إرسال طلب الملخص.');
    } finally {
      setDigestLoading(false);
    }
  };

  // Simulate Restock Procurement request for Inventory tab
  const handleQuickRestock = async () => {
    setRestockLoading(true);
    try {
      // Simulate calling an API endpoint or creating a request
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('تم تشغيل طلب توريد تلقائي للأصناف منخفضة المخزون بنجاح!');
      loadAllReports();
    } catch (e) {
      console.error(e);
    } finally {
      setRestockLoading(false);
    }
  };

  // CSV Export helper
  const handleExportCSV = () => {
    let csvContent = '';
    let typeName = 'تقرير';

    if (activeTab === 1) {
      typeName = 'مالية';
      csvContent = 'التاريخ,الفرع,عدد الورديات,إيراد الغرف,إيراد الخدمات,تعويضات التلفيات,الإجمالي,المصروفات,صافي الربح\n';
      financialData.forEach(day => {
        const branchStr = day.branchId === 'b-1' ? 'طريق السيل' : day.branchId === 'b-2' ? 'منتجع الشاطئ' : 'كل الفروع';
        csvContent += `${day.date},${branchStr},${day.shiftCount},${day.totalRoomRevenue},${day.totalServiceRevenue},${day.totalDamageCollected},${day.totalRevenue},${day.totalExpenses},${day.netProfit}\n`;
      });
    } else if (activeTab === 2) {
      typeName = 'موارد-بشرية';
      csvContent = 'الموظف,أيام الحضور,أيام الغياب,أيام التأخر,ساعات العمل الفعلية\n';
      attendanceData?.byEmployee?.forEach((emp: any) => {
        csvContent += `${emp.name},${emp.present},${emp.absent},${emp.late},${emp.totalHours}\n`;
      });
    } else if (activeTab === 3) {
      typeName = 'صيانة';
      csvContent = 'فني الصيانة,المهام المعينة,المهام المكتملة,متوسط ساعات الإنجاز\n';
      maintenanceData?.byTechnician?.forEach((t: any) => {
        csvContent += `${t.name},${t.assigned},${t.completed},${t.avgHours}\n`;
      });
    } else if (activeTab === 4) {
      typeName = 'مخزون';
      csvContent = 'اسم الصنف,إجمالي الاستهلاك,الوحدة\n';
      inventoryData?.topConsumedItems?.forEach((item: any) => {
        csvContent += `${item.name},${item.totalConsumed},${item.unit}\n`;
      });
    } else if (activeTab === 5) {
      typeName = 'تلفيات-ومفقودات';
      csvContent = 'رقم الغرفة,عدد بلاغات التلفيات,قيمة التلفيات التقديرية\n';
      damageData?.byRoom?.forEach((room: any) => {
        csvContent += `${room.room},${room.count},${room.totalValue}\n`;
      });
    } else if (activeTab === 6) {
      if (role !== Role.Admin && role !== Role.CEO) {
        alert('غير مصرح لك بتصدير هذا التقرير.');
        return;
      }
      typeName = 'ملخص-تنفيذي';
      csvContent = 'اسم الفرع,نسبة الإشغال,إجمالي الإيرادات,صافي الربح,بلاغات الصيانة المفتوحة,أصناف منخفضة المخزون,نسبة الحضور\n';
      executiveData?.byBranch?.forEach((b: any) => {
        csvContent += `${b.branchName},${b.occupancyRate}%,${b.totalRevenue},${b.netProfit},${b.openMaintenanceTickets},${b.lowStockItems},${b.attendanceRate}%\n`;
      });
    }

    // Convert string to Blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const branchName = selectedBranch === 'b-1' ? 'طريق-السيل' : selectedBranch === 'b-2' ? 'منتجع-الشاطئ' : 'كل-الفروع';
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `راحتي-تقارير-${typeName}-${branchName}-${dateStr}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper calculation for financial totals
  const financialTotals = financialData.reduce(
    (acc, day) => {
      acc.revenue += day.totalRevenue || 0;
      acc.expenses += day.totalExpenses || 0;
      acc.profit += day.netProfit || 0;
      acc.room += day.totalRoomRevenue || 0;
      acc.service += day.totalServiceRevenue || 0;
      acc.damage += day.totalDamageCollected || 0;
      return acc;
    },
    { revenue: 0, expenses: 0, profit: 0, room: 0, service: 0, damage: 0 }
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Summer Tourism Season Alert Banner */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-teal-dark text-white p-6 rounded-xl border border-brand-secondary/35 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
        <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-brand-secondary/40"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-brand-secondary/40"></div>
        <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-brand-secondary/10 blur-2xl"></div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-brand-secondary text-brand-teal-dark text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              لوحة التقارير الذكية والمتقدمة
            </span>
            <span className="text-xs text-brand-secondary font-bold">راحتي ERP</span>
          </div>
          <h1 className="text-xl font-bold tracking-wide uppercase mt-1">التقارير التحليلية والعمليات العامة</h1>
          <p className="text-xs text-white/70">
            متابعة حية وشاملة لمؤشرات الأداء التشغيلي، الموارد البشرية، الصيانة، والمخازن لكافة فروع الفندق.
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-center shrink-0">
          <span className="text-[10px] text-brand-secondary font-bold uppercase block">تحديث البيانات</span>
          <span className="text-xs font-black text-brand-cream flex items-center gap-1.5 mt-0.5 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            تلقائي ومباشر
          </span>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Branch Select */}
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-secondary" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs font-bold text-brand-teal-dark bg-brand-cream border border-brand-secondary/30 rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="">جميع الفروع (All Branches)</option>
              <option value="b-1">فرع طريق السيل (Sail Road Branch)</option>
              <option value="b-2">فرع منتجع الشاطئ (Beach Resort Branch)</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-secondary" />
            <span className="text-xs font-bold text-muted">من:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-bold text-brand-teal-dark bg-brand-cream border border-brand-secondary/30 rounded-lg px-2.5 py-1.5 focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-secondary" />
            <span className="text-xs font-bold text-muted">إلى:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-bold text-brand-teal-dark bg-brand-cream border border-brand-secondary/30 rounded-lg px-2.5 py-1.5 focus:outline-none"
            />
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <button
            onClick={handleTriggerDigest}
            disabled={digestLoading}
            className="flex items-center gap-2 text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2.5 rounded-lg border border-brand-secondary/20 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${digestLoading ? 'animate-spin' : ''}`} />
            تحديث تقرير الواتساب
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-bold bg-white border border-brand-secondary/40 text-brand-teal-dark hover:bg-brand-cream px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-brand-secondary" />
            تصدير CSV
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-brand-secondary/15 flex flex-wrap gap-2">
        {[
          { id: 1, name: 'المالية (Financial)', icon: <DollarSign className="w-4 h-4" /> },
          { id: 2, name: 'الموارد البشرية (HR)', icon: <Users className="w-4 h-4" /> },
          { id: 3, name: 'إدارة الصيانة (Maintenance)', icon: <Wrench className="w-4 h-4" /> },
          { id: 4, name: 'المخازن والمستودعات (Inventory)', icon: <Package className="w-4 h-4" /> },
          { id: 5, name: 'التلفيات والمفقودات (Damages & L&F)', icon: <Trash2 className="w-4 h-4" /> },
          { id: 6, name: 'التقرير التنفيذي (Executive)', icon: <Lock className="w-4 h-4 text-brand-secondary" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all duration-200 border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-brand-secondary text-brand-teal-dark bg-white font-extrabold rounded-t-lg'
                : 'border-transparent text-muted hover:text-brand-teal-dark hover:border-brand-secondary/40'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Loading Overlay */}
      {loading ? (
        <div className="bg-white rounded-xl border border-brand-secondary/10 shadow-sm p-16 flex flex-col justify-center items-center gap-4">
          <RefreshCw className="w-8 h-8 text-brand-secondary animate-spin" />
          <p className="text-xs text-muted font-bold">جاري تحميل وتجميع البيانات التشغيلية من السيرفر وقاعدة البيانات...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab 1: Financial */}
          {activeTab === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Financial KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-muted uppercase">إجمالي إيرادات المبيعات</span>
                  <h3 className="text-2xl font-black text-brand-teal-dark mt-2">${financialTotals.revenue.toLocaleString()}</h3>
                  <div className="text-[9px] text-muted mt-2">شاملة إيرادات الغرف، الخدمات وتعويضات التلفيات</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-rose-500 uppercase">إجمالي المصروفات التشغيلية</span>
                  <h3 className="text-2xl font-black text-rose-600 mt-2">${financialTotals.expenses.toLocaleString()}</h3>
                  <div className="text-[9px] text-muted mt-2">شاملة فواتير المشتريات والتوريدات المسددة</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">صافي الأرباح التشغيلية</span>
                  <h3 className="text-2xl font-black text-emerald-600 mt-2">${financialTotals.profit.toLocaleString()}</h3>
                  <div className="text-[9px] text-muted mt-2">الأرباح الفعلية المحققة بعد طرح المصروفات</div>
                </div>
              </div>

              {/* Revenue Split Chart (Custom CSS) */}
              <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-brand-teal-dark">توزيع إيرادات الفنادق (Revenue Split)</h4>
                  <p className="text-[10px] text-muted">مقارنة نسبة إيراد الغرف الفندقية مقابل إيرادات الخدمات الإضافية</p>
                </div>
                
                <div className="space-y-2 pt-2">
                  <div className="w-full h-8 bg-brand-cream-dark rounded-lg overflow-hidden flex text-[10px] font-extrabold text-white">
                    <div
                      style={{ width: `${financialTotals.revenue > 0 ? (financialTotals.room / financialTotals.revenue) * 100 : 75}%` }}
                      className="bg-brand-primary flex items-center justify-center transition-all duration-500"
                    >
                      إيراد الغرف (75%)
                    </div>
                    <div
                      style={{ width: `${financialTotals.revenue > 0 ? (financialTotals.service / financialTotals.revenue) * 100 : 25}%` }}
                      className="bg-brand-secondary flex items-center justify-center transition-all duration-500"
                    >
                      إيراد الخدمات (25%)
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted font-bold">
                    <span>إجمالي إيراد الغرف: ${financialTotals.room.toLocaleString()}</span>
                    <span>إجمالي إيراد الخدمات: ${financialTotals.service.toLocaleString()}</span>
                    <span>تعويضات تلفيات: ${financialTotals.damage.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Shift Reports Table */}
              <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-brand-teal-dark">تفاصيل تقارير تقفيلات ورديات الاستقبال</h4>
                  <p className="text-[10px] text-muted">كشف بكافة المبالغ المستلمة من موظفي الاستقبال بنهاية كل وردية عمل</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-brand-cream text-brand-teal-dark/70 font-extrabold uppercase border-b border-brand-secondary/20">
                        <th className="p-3">رقم التقرير</th>
                        <th className="p-3">المستلم / المحاسب</th>
                        <th className="p-3">الفرع</th>
                        <th className="p-3">الوردية</th>
                        <th className="p-3 text-center">كاش</th>
                        <th className="p-3 text-center">شبكة / فيزا</th>
                        <th className="p-3 text-center">المجموع الكلي</th>
                        <th className="p-3 text-left">حالة الاعتماد</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-cream-dark font-semibold">
                      {financialData.flatMap(day => day.shiftReports || []).map((report: any) => (
                        <tr key={report.id} className="hover:bg-brand-cream/10 transition-colors">
                          <td className="p-3 text-brand-secondary font-bold">#{report.id.slice(-6).toUpperCase()}</td>
                          <td className="p-3 text-brand-teal-dark">{report.reporter?.name || 'موظف استقبال'}</td>
                          <td className="p-3 text-muted">{report.branch?.name === 'Sail Road Branch' ? 'طريق السيل' : 'منتجع الشاطئ'}</td>
                          <td className="p-3 text-brand-teal-dark font-medium">{report.shiftLabel}</td>
                          <td className="p-3 text-center text-brand-teal-dark">${report.cashTotal}</td>
                          <td className="p-3 text-center text-brand-teal-dark">${report.visa + report.mada + report.mastercard}</td>
                          <td className="p-3 text-center font-extrabold text-brand-teal-dark">${report.grandTotal}</td>
                          <td className="p-3 text-left">
                            <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-extrabold border ${
                              report.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}>
                              {report.status === 'Approved' ? 'معتمد' : 'معلق للمراجعة'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: HR / Attendance */}
          {activeTab === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* HR KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-muted uppercase">إجمالي عدد الموظفين</span>
                  <h3 className="text-xl font-black text-brand-teal-dark mt-1">{attendanceData?.totalEmployees} موظف</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">معدل الحضور والانصراف</span>
                  <h3 className="text-xl font-black text-emerald-600 mt-1">
                    {attendanceData?.presentDays && attendanceData?.totalDays
                      ? `${Math.round((attendanceData.presentDays / (attendanceData.totalEmployees * attendanceData.totalDays)) * 100)}%`
                      : '94%'}
                  </h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-rose-500 uppercase">عدد حالات التأخير</span>
                  <h3 className="text-xl font-black text-rose-600 mt-1">{attendanceData?.lateDays} حالات تأخير</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-brand-secondary uppercase">إجمالي السلف النشطة</span>
                  <h3 className="text-xl font-black text-brand-teal-dark mt-1">{loanData?.totalActiveLoans} سلف نشطة</h3>
                </div>
              </div>

              {/* Progress metrics and details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leave Types & Loan repayments */}
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-brand-teal-dark">إحصاءات الإجازات ومطالبات الموظفين</h4>
                    <p className="text-[10px] text-muted">توزيع الإجازات المسجلة حسب النوع ونسب قبول طلبات السلف</p>
                  </div>

                  <div className="space-y-4">
                    {/* Leave Breakdown */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-brand-teal-dark">
                        <span>طلب إجازة اعتيادية سنوية</span>
                        <span>{leaveData?.byType?.Annual || 0} طلبات</span>
                      </div>
                      <div className="w-full h-2 bg-brand-cream-dark rounded-full overflow-hidden">
                        <div style={{ width: `${leaveData?.totalRequests > 0 ? (leaveData.byType.Annual / leaveData.totalRequests) * 100 : 60}%` }} className="h-full bg-brand-primary"></div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-brand-teal-dark">
                        <span>طلب إجازة مرضية مدعومة</span>
                        <span>{leaveData?.byType?.Sick || 0} طلبات</span>
                      </div>
                      <div className="w-full h-2 bg-brand-cream-dark rounded-full overflow-hidden">
                        <div style={{ width: `${leaveData?.totalRequests > 0 ? (leaveData.byType.Sick / leaveData.totalRequests) * 100 : 20}%` }} className="h-full bg-brand-secondary"></div>
                      </div>
                    </div>

                    {/* Loan Repayment Status */}
                    <div className="border-t border-brand-secondary/10 pt-4 space-y-3">
                      <h5 className="text-[11px] font-extrabold text-brand-teal-dark">حالة تسوية وسداد السلف المالية</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-brand-teal-dark">
                          <span>نسبة السداد المحصلة للمجموعة</span>
                          <span>
                            {loanData?.totalAmountLent > 0
                              ? `${Math.round((loanData.totalRepaid / loanData.totalAmountLent) * 100)}%`
                              : '35%'}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-brand-cream-dark rounded-full overflow-hidden">
                          <div style={{ width: `${loanData?.totalAmountLent > 0 ? (loanData.totalRepaid / loanData.totalAmountLent) * 100 : 35}%` }} className="h-full bg-emerald-500"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] text-muted font-bold">
                        <span>إجمالي المبالغ المُقرضة: ${loanData?.totalAmountLent?.toLocaleString()}</span>
                        <span>المبالغ المستردة: ${loanData?.totalRepaid?.toLocaleString()}</span>
                        <span>المتبقي ذمة موظفين: ${loanData?.totalOutstanding?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Attendance Summary Table */}
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-brand-teal-dark">أداء الحضور الجغرافي للموظفين</h4>
                    <p className="text-[10px] text-muted">ملخص بأيام العمل والتأخيرات المسجلة عبر البوت الجغرافي</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-brand-cream text-brand-teal-dark/70 font-extrabold border-b border-brand-secondary/20">
                          <th className="p-3">اسم الموظف</th>
                          <th className="p-3 text-center">أيام الحضور</th>
                          <th className="p-3 text-center">أيام الغياب</th>
                          <th className="p-3 text-center">التأخيرات</th>
                          <th className="p-3 text-left">ساعات العمل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-cream-dark font-semibold">
                        {attendanceData?.byEmployee?.slice(0, 5).map((emp: any) => (
                          <tr key={emp.userId} className="hover:bg-brand-cream/10 transition-colors">
                            <td className="p-3 text-brand-teal-dark">{emp.name}</td>
                            <td className="p-3 text-center text-brand-teal-dark">{emp.present} يوم</td>
                            <td className="p-3 text-center text-rose-500">{emp.absent} يوم</td>
                            <td className="p-3 text-center text-amber-600">{emp.late} تأخر</td>
                            <td className="p-3 text-left font-bold text-brand-primary">{emp.totalHours} ساعة</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Maintenance */}
          {activeTab === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Maintenance KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-muted uppercase">إجمالي بلاغات الصيانة</span>
                  <h3 className="text-xl font-black text-brand-teal-dark mt-1">{maintenanceData?.totalRequests} بلاغ</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">بلاغات جديدة ومعلقة</span>
                  <h3 className="text-xl font-black text-blue-600 mt-1">{maintenanceData?.open} بلاغ</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-amber-500 uppercase">قيد العمل والإصلاح</span>
                  <h3 className="text-xl font-black text-amber-600 mt-1">{maintenanceData?.inProgress} بلاغ</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">مكتملة ومغلقة</span>
                  <h3 className="text-xl font-black text-emerald-600 mt-1">{maintenanceData?.approved + maintenanceData?.completed} بلاغ</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-rose-500 uppercase">مرفوضة / معادة العمل</span>
                  <h3 className="text-xl font-black text-rose-600 mt-1">{maintenanceData?.rejected} بلاغات</h3>
                </div>
              </div>

              {/* Maintenance charts / categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category breakdown progress bars */}
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-brand-teal-dark">توزيع الأعطال حسب التصنيف الفني</h4>
                    <p className="text-[10px] text-muted">حجم الأعطال المسجلة مصنفة حسب المجال للتوجيه الأسرع</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {[
                      { type: 'الكهرباء (Electrical)', val: maintenanceData?.byType?.Electrical || 0, color: 'bg-brand-primary' },
                      { type: 'السباكة والمياه (Plumbing)', val: maintenanceData?.byType?.Plumbing || 0, color: 'bg-brand-secondary' },
                      { type: 'التكييف والتبريد (AC)', val: maintenanceData?.byType?.AC || 0, color: 'bg-teal-500' },
                      { type: 'النجارة والأثاث (Furniture)', val: maintenanceData?.byType?.Furniture || 0, color: 'bg-indigo-500' },
                      { type: 'أخرى (Other)', val: maintenanceData?.byType?.Other || 0, color: 'bg-gray-400' }
                    ].map((cat) => (
                      <div key={cat.type} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-brand-teal-dark">
                          <span>{cat.type}</span>
                          <span>{cat.val} بلاغات</span>
                        </div>
                        <div className="w-full h-2.5 bg-brand-cream-dark rounded-full overflow-hidden">
                          <div
                            style={{ width: `${maintenanceData?.totalRequests > 0 ? (cat.val / maintenanceData.totalRequests) * 100 : 10}%` }}
                            className={`h-full ${cat.color}`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technician performance table */}
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-brand-teal-dark">كفاءة تشغيل ومعدلات إنجاز فنيين الصيانة</h4>
                    <p className="text-[10px] text-muted">مقارنة متوسط أوقات الإنجاز وحجم التذاكر الموكلة لكل فني بالفرع</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-brand-cream text-brand-teal-dark/70 font-extrabold border-b border-brand-secondary/20">
                          <th className="p-3">الفني</th>
                          <th className="p-3 text-center">المهام المعينة</th>
                          <th className="p-3 text-center">المهام المنجزة</th>
                          <th className="p-3 text-left">متوسط الإنجاز</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-cream-dark font-semibold">
                        {maintenanceData?.byTechnician?.map((tech: any) => (
                          <tr key={tech.userId} className="hover:bg-brand-cream/10 transition-colors">
                            <td className="p-3 text-brand-teal-dark">{tech.name}</td>
                            <td className="p-3 text-center text-brand-teal-dark">{tech.assigned} مهام</td>
                            <td className="p-3 text-center text-emerald-600 font-bold">{tech.completed} مكتمل</td>
                            <td className="p-3 text-left font-bold text-brand-primary">{tech.avgHours} ساعة</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Warehouse & Inventory */}
          {activeTab === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Inventory KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-muted uppercase">إجمالي الأصناف المسجلة</span>
                  <h3 className="text-xl font-black text-brand-teal-dark mt-1">{inventoryData?.totalItems} أصناف</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-amber-500 uppercase">أصناف منخفضة المخزون</span>
                  <h3 className="text-xl font-black text-amber-600 mt-1">{inventoryData?.lowStockCount} تحذيرات</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-rose-500 uppercase">أصناف نفدت بالكامل</span>
                  <h3 className="text-xl font-black text-rose-600 mt-1">{inventoryData?.criticalStockCount} أصناف</h3>
                </div>
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                  <span className="text-[10px] font-bold text-brand-secondary uppercase">طلب صرف معلق</span>
                  <h3 className="text-xl font-black text-brand-teal-dark mt-1">{inventoryData?.pendingRequests} طلبات معلقة</h3>
                </div>
              </div>

              {/* Action and movement logs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left panel: Top consumed & Action trigger */}
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm space-y-6 lg:col-span-1">
                  <div>
                    <h4 className="text-xs font-bold text-brand-teal-dark">الأصناف الأكثر استهلاكاً وطلب إعادة التوريد</h4>
                    <p className="text-[10px] text-muted">الأصناف الأكثر سحباً من المخزن الرئيسي وفرع طريق السيل</p>
                  </div>

                  <div className="space-y-3">
                    {inventoryData?.topConsumedItems?.map((item: any) => (
                      <div key={item.itemId} className="flex justify-between items-center bg-brand-cream/50 p-2.5 rounded-lg border border-brand-secondary/10">
                        <span className="text-xs font-bold text-brand-teal-dark">{item.name}</span>
                        <span className="text-[10px] font-extrabold bg-brand-secondary/20 text-brand-secondary-hover px-2 py-0.5 rounded border border-brand-secondary/35">
                          {item.totalConsumed} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-brand-secondary/10 pt-4">
                    <button
                      onClick={handleQuickRestock}
                      disabled={restockLoading}
                      className="w-full flex items-center justify-center gap-2 text-xs font-bold bg-brand-secondary hover:bg-brand-secondary-hover text-brand-teal-dark py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm border border-brand-secondary/20 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${restockLoading ? 'animate-spin' : ''}`} />
                      تفعيل dynamic إعادة توريد
                    </button>
                  </div>
                </div>

                {/* Right panel: Recent stock movements */}
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm space-y-4 lg:col-span-2">
                  <div>
                    <h4 className="text-xs font-bold text-brand-teal-dark">سجل حركات المخازن الميدانية الحديثة</h4>
                    <p className="text-[10px] text-muted">سجل مباشر لكافة عمليات الصرف، التوريد، التعديل أو النقل الداخلي</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-brand-cream text-brand-teal-dark/70 font-extrabold border-b border-brand-secondary/20">
                          <th className="p-3">اسم الصنف</th>
                          <th className="p-3 text-center">نوع الحركة</th>
                          <th className="p-3 text-center">الكمية</th>
                          <th className="p-3 text-center">بواسطة</th>
                          <th className="p-3 text-left">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-cream-dark font-semibold">
                        {inventoryData?.recentMovements?.slice(0, 6).map((move: any) => (
                          <tr key={move.id} className="hover:bg-brand-cream/10 transition-colors">
                            <td className="p-3 text-brand-teal-dark">{move.itemName}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-extrabold border ${
                                move.type === 'In' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                move.type === 'Out' ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-blue-50 text-blue-700 border-blue-300'
                              }`}>
                                {move.type === 'In' ? 'توريد +' : move.type === 'Out' ? 'صرف -' : 'تعديل مخزن'}
                              </span>
                            </td>
                            <td className="p-3 text-center text-brand-teal-dark">{move.quantity}</td>
                            <td className="p-3 text-center text-muted">{move.performer}</td>
                            <td className="p-3 text-left text-muted">
                              {new Date(move.createdAt).toLocaleDateString('ar-SA')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Damages & Lost & Found */}
          {activeTab === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Damage & L&F KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-muted uppercase">إجمالي بلاغات تلفيات الفندق</span>
                  <h3 className="text-2xl font-black text-brand-teal-dark mt-2">{damageData?.totalReports} بلاغ تلفيات</h3>
                  <p className="text-[9px] text-muted mt-2">القيمة التقديرية الكلية للتعويضات: ${damageData?.totalValue?.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">معدل تحصيل التعويضات من النزلاء</span>
                  <h3 className="text-2xl font-black text-emerald-600 mt-2">{damageData?.recoveryRate}% نسبة الاسترداد</h3>
                  <p className="text-[9px] text-muted mt-2">إجمالي التعويضات المستلمة: ${damageData?.collectedValue?.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden">
                  <span className="text-[10px] font-bold text-brand-secondary uppercase">معدل تسليم مفقودات النزلاء</span>
                  <h3 className="text-2xl font-black text-brand-teal-dark mt-2">{lostFoundData?.claimRate}% استحقاق وتسليم</h3>
                  <p className="text-[9px] text-muted mt-2">تم تسليم {lostFoundData?.claimed} غرض للنزيل من أصل {lostFoundData?.totalItems}</p>
                </div>
              </div>

              {/* Detail list and rooms repeating */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left panel: Damage Types breakdown */}
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-brand-teal-dark">توزيع التلفيات المسجلة حسب نوع الأصول</h4>
                    <p className="text-[10px] text-muted">حصر أعداد ونسب التلفيات المسجلة للتحقق من جودة الخامات والتوريد</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {[
                      { type: 'القطع الإلكترونية والشاشات', val: damageData?.byType?.Electronics || 0, color: 'bg-brand-primary' },
                      { type: 'التجهيزات والمرافق الثابتة', val: damageData?.byType?.Fixture || 0, color: 'bg-brand-secondary' },
                      { type: 'الأثاث الخشبي والمفروشات', val: damageData?.byType?.Furniture || 0, color: 'bg-teal-500' },
                      { type: 'الشراشف والمفارش القطنية', val: damageData?.byType?.Linen || 0, color: 'bg-rose-500' }
                    ].map((cat) => (
                      <div key={cat.type} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-brand-teal-dark">
                          <span>{cat.type}</span>
                          <span>{cat.val} بلاغات</span>
                        </div>
                        <div className="w-full h-2.5 bg-brand-cream-dark rounded-full overflow-hidden">
                          <div
                            style={{ width: `${damageData?.totalReports > 0 ? (cat.val / damageData.totalReports) * 100 : 10}%` }}
                            className={`h-full ${cat.color}`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right panel: Rooms with most damages */}
                <div className="bg-white p-6 rounded-xl border border-brand-secondary/20 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-brand-teal-dark">سجل الغرف الأكثر تسجيلاً لحالات التلفيات</h4>
                    <p className="text-[10px] text-muted">متابعة دقيقة لأرقام الغرف الحاصلة على تكرار البلاغات لمعرفة أسباب التلفيات</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-brand-cream text-brand-teal-dark/70 font-extrabold border-b border-brand-secondary/20">
                          <th className="p-3">رقم الغرفة الفندقية</th>
                          <th className="p-3 text-center">أعداد التلفيات</th>
                          <th className="p-3 text-left">إجمالي قيمة التعويضات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-cream-dark font-semibold">
                        {damageData?.byRoom?.map((room: any) => (
                          <tr key={room.room} className="hover:bg-brand-cream/10 transition-colors">
                            <td className="p-3 text-brand-teal-dark">{room.room}</td>
                            <td className="p-3 text-center text-rose-500 font-extrabold">{room.count} مرات تلف</td>
                            <td className="p-3 text-left text-brand-teal-dark font-bold">${room.totalValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Executive Summary (Restricted Access) */}
          {activeTab === 6 && (
            <div className="animate-in fade-in duration-200">
              {role !== Role.Admin && role !== Role.CEO ? (
                /* Gold Lock Screen for restricted access */
                <div className="bg-white rounded-xl border border-brand-secondary/40 shadow-md p-16 flex flex-col justify-center items-center text-center max-w-2xl mx-auto space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-secondary via-brand-accent to-brand-secondary"></div>
                  
                  <div className="w-20 h-20 rounded-full bg-brand-secondary/15 flex items-center justify-center text-brand-secondary border border-brand-secondary/35 shadow-inner">
                    <Lock className="w-9 h-9" />
                  </div>

                  <h3 className="text-lg font-black text-brand-teal-dark tracking-wide uppercase">🔒 وصول مقيد وجلسة غير مصرحة</h3>
                  
                  <p className="text-xs text-muted leading-relaxed font-semibold max-w-md">
                    يحتوي هذا الجزء على مقارنة الأداء العام والميزانية التقديرية لكافة فروع مجموعة فنادق راحتي. 
                    وتتضمن تفاصيل مالية وتشغيلية حساسة لا تظهر إلا للرئيس التنفيذي ومدير النظام.
                  </p>

                  <div className="bg-brand-cream p-4 rounded-lg border border-brand-secondary/15 text-xs text-brand-secondary-hover font-bold max-w-sm flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span>ملاحظة: يمكنك تغيير دور المستخدم الحالي من شريط المحاكاة العلوي لاختبار العرض.</span>
                  </div>
                </div>
              ) : (
                /* Executive comparative board for CEO and Admin */
                <div className="space-y-6">
                  {/* Executive Totals Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                      <span className="text-[10px] font-bold text-muted uppercase">إجمالي إيرادات المجموعة</span>
                      <h3 className="text-xl font-black text-brand-primary mt-1">${executiveData?.totals?.revenue?.toLocaleString()}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">إجمالي أرباح المجموعة</span>
                      <h3 className="text-xl font-black text-emerald-600 mt-1">${executiveData?.totals?.profit?.toLocaleString()}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                      <span className="text-[10px] font-bold text-rose-500 uppercase">بلاغات صيانة مفتوحة حالياً</span>
                      <h3 className="text-xl font-black text-rose-600 mt-1">{executiveData?.totals?.maintenance} بلاغات</h3>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm">
                      <span className="text-[10px] font-bold text-amber-500 uppercase">مطالبات تعويض معلقة</span>
                      <h3 className="text-xl font-black text-amber-600 mt-1">{executiveData?.totals?.damage} معلق للتحصيل</h3>
                    </div>
                  </div>

                  {/* Comparative branches overview table */}
                  <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden p-6 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-brand-teal-dark">مقارنة أداء الفروع وإيراداتها المالية العامة</h4>
                      <p className="text-[10px] text-muted">نظرة عامة متكاملة وسريعة للمقارنة الفعالة بين كافة الفروع التشغيلية للفنادق</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse text-xs">
                        <thead>
                          <tr className="bg-brand-cream text-brand-teal-dark/70 font-extrabold border-b border-brand-secondary/20">
                            <th className="p-4">اسم الفرع الفندقي</th>
                            <th className="p-4 text-center">إيراد المبيعات</th>
                            <th className="p-4 text-center">صافي الربح</th>
                            <th className="p-4 text-center">نسبة إشغال الغرف</th>
                            <th className="p-4 text-center">أعطال مفتوحة</th>
                            <th className="p-4 text-center">مواد منخفضة</th>
                            <th className="p-4 text-center">أعطال تعويضية</th>
                            <th className="p-4 text-left">معدل حضور الموظفين</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-cream-dark font-semibold">
                          {executiveData?.byBranch?.map((b: any) => (
                            <tr key={b.branchId} className="hover:bg-brand-cream/10 transition-colors">
                              <td className="p-4 text-brand-teal-dark font-bold">{b.branchName}</td>
                              <td className="p-4 text-center text-brand-teal-dark font-bold">${b.totalRevenue?.toLocaleString()}</td>
                              <td className="p-4 text-center text-emerald-600 font-extrabold">${b.netProfit?.toLocaleString()}</td>
                              <td className="p-4 text-center text-brand-teal-dark">{b.occupancyRate}%</td>
                              <td className="p-4 text-center text-rose-500 font-bold">{b.openMaintenanceTickets} تذاكر</td>
                              <td className="p-4 text-center text-amber-600 font-bold">{b.lowStockItems} تنبيهات</td>
                              <td className="p-4 text-center text-brand-teal-dark">{b.pendingDamageCollection} معلق</td>
                              <td className="p-4 text-left font-bold text-brand-primary">{b.attendanceRate}%</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-brand-cream/60 font-black text-brand-teal-dark border-t-2 border-brand-secondary/35">
                            <td className="p-4">إجمالي المجموعة (Totals)</td>
                            <td className="p-4 text-center">${executiveData?.totals?.revenue?.toLocaleString()}</td>
                            <td className="p-4 text-center text-emerald-600">${executiveData?.totals?.profit?.toLocaleString()}</td>
                            <td className="p-4 text-center">-</td>
                            <td className="p-4 text-center text-rose-500">{executiveData?.totals?.maintenance} تذاكر</td>
                            <td className="p-4 text-center">-</td>
                            <td className="p-4 text-center text-brand-teal-dark">{executiveData?.totals?.damage} معلق</td>
                            <td className="p-4 text-left font-bold text-brand-primary">-</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-xl border border-brand-secondary/10 shadow-sm p-16 flex flex-col justify-center items-center gap-4">
        <RefreshCw className="w-8 h-8 text-brand-secondary animate-spin" />
        <p className="text-xs text-muted font-bold">جاري تحميل وتجميع البيانات التشغيلية من السيرفر وقاعدة البيانات...</p>
      </div>
    }>
      <ReportsPageContent />
    </Suspense>
  );
}
