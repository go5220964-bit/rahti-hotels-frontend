'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRole } from '../../../components/RoleContext';
import { api, LostFoundItem, DamageReport, Branch, User } from '../../../utils/api';
import {
  Briefcase,
  AlertTriangle,
  Search,
  RotateCw,
  CheckCircle,
  XCircle,
  Plus,
  X
} from 'lucide-react';

function LostFoundDashboard() {
  const { user } = useRole();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'lost-found' | 'damages'>(
    tabParam === 'damages' ? 'damages' : 'lost-found'
  );

  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>([]);
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isLostFoundModalOpen, setIsLostFoundModalOpen] = useState(false);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState<LostFoundItem | null>(null);

  const [lfBranchId, setLfBranchId] = useState('');
  const [itemName, setItemName] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [foundByUserId, setFoundByUserId] = useState('');
  const [description, setDescription] = useState('');

  const [deliverToGuest, setDeliverToGuest] = useState({ guestName: '', guestPhone: '', notes: '' });

  const [dmgBranchId, setDmgBranchId] = useState('');
  const [dmgRoomNumber, setDmgRoomNumber] = useState('');
  const [dmgDescription, setDmgDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [reportedByUserId, setReportedByUserId] = useState('');

  useEffect(() => {
    if (tabParam === 'damages' || tabParam === 'lost-found') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'lost-found' | 'damages') => {
    setActiveTab(tab);
    setStatusFilter('ALL');
    router.replace(`/branch-management/lost-found?tab=${tab}`);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [lfData, dmgData, bData, uData] = await Promise.all([
        api.getLostFoundItems(),
        api.getDamageReports(),
        api.getBranches(),
        api.getUsers()
      ]);
      setLostFoundItems(Array.isArray(lfData) ? lfData : []);
      setDamageReports(Array.isArray(dmgData) ? dmgData : []);
      setBranches(Array.isArray(bData) ? bData : []);
      setEmployees(Array.isArray(uData) ? uData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateLostFound = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLostFoundItem({
        branchId: lfBranchId || user?.branchId || branches[0]?.id || '',
        itemName,
        foundLocation,
        roomNumber,
        foundByUserId: foundByUserId || user?.id || undefined,
        description
      });
      setIsLostFoundModalOpen(false);
      setLfBranchId('');
      setItemName('');
      setFoundLocation('');
      setRoomNumber('');
      setFoundByUserId('');
      setDescription('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDamageReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDamageReport({
        branchId: dmgBranchId || user?.branchId || branches[0]?.id || '',
        roomNumber: dmgRoomNumber,
        description: dmgDescription,
        estimatedCost: parseFloat(estimatedCost) || 0,
        reportedByUserId: reportedByUserId || user?.id || undefined
      });
      setIsDamageModalOpen(false);
      setDmgBranchId('');
      setDmgRoomNumber('');
      setDmgDescription('');
      setEstimatedCost('');
      setReportedByUserId('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateLFStatus = async (id: string, status: 'DELIVERED' | 'DISPOSED' | 'AUCTIONED') => {
    try {
      await api.updateLostFoundItem(id, {
        status,
        deliveredToGuestName: status === 'DELIVERED' ? deliverToGuest.guestName : undefined,
        deliveredToGuestPhone: status === 'DELIVERED' ? deliverToGuest.guestPhone : undefined,
        notes: status === 'DELIVERED' ? deliverToGuest.notes : undefined
      });
      setSelectedItemForAction(null);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateDamageStatus = async (dmg: DamageReport, newStatus: 'CHARGED' | 'WAIVED') => {
    try {
      if ((api as any).updateDamageReport) {
        await (api as any).updateDamageReport(dmg.id, {
          status: newStatus,
          chargedAmount: newStatus === 'CHARGED' ? dmg.estimatedCost : 0
        });
      }
      setDamageReports((prev) =>
        prev.map((item) =>
          item.id === dmg.id
            ? {
                ...item,
                status: newStatus,
                chargedAmount: newStatus === 'CHARGED' ? item.estimatedCost : 0
              }
            : item
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLostFound = lostFoundItems.filter((item) => {
    const matchBranch = selectedBranch === 'ALL' || item.branchId === selectedBranch;
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchQuery =
      !searchQuery ||
      item.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBranch && matchStatus && matchQuery;
  });

  const filteredDamages = damageReports.filter((dmg) => {
    const matchBranch = selectedBranch === 'ALL' || dmg.branchId === selectedBranch;
    const matchStatus = statusFilter === 'ALL' || dmg.status === statusFilter;
    const matchQuery =
      !searchQuery ||
      dmg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dmg.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchBranch && matchStatus && matchQuery;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المفقودات والتلفيات</h1>
          <p className="text-gray-500 text-sm">إدارة الأغراض المفقودة وتقارير التلفيات والأضرار في الفروع</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'lost-found' ? (
            <button
              onClick={() => setIsLostFoundModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              تسجيل غرض مفقود
            </button>
          ) : (
            <button
              onClick={() => setIsDamageModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              تسجيل بلاغ تلفيات
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 flex gap-4">
        <button
          onClick={() => handleTabChange('lost-found')}
          className={`pb-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'lost-found'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          سجل المفقودات ({filteredLostFound.length})
        </button>
        <button
          onClick={() => handleTabChange('damages')}
          className={`pb-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'damages'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          بلاغات التلفيات ({filteredDamages.length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالغرض، رقم الغرفة، أو الوصف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="ALL">جميع الحالات</option>
            {activeTab === 'lost-found' ? (
              <>
                <option value="KEPT">محتفظ به</option>
                <option value="DELIVERED">تم التسليم</option>
                <option value="DISPOSED">تم الإتلاف</option>
              </>
            ) : (
              <>
                <option value="REPORTED">مسجل</option>
                <option value="CHARGED">تم الخصم والتحصيل</option>
                <option value="WAIVED">معفى</option>
              </>
            )}
          </select>
        </div>
        <button
          onClick={loadData}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
          title="تحديث البيانات"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">جاري تحميل البيانات...</div>
      ) : activeTab === 'lost-found' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">الغرض / التوصيف</th>
                <th className="p-4 font-semibold">الفرع / المكان</th>
                <th className="p-4 font-semibold">تاريخ العثور</th>
                <th className="p-4 font-semibold">بواسطة</th>
                <th className="p-4 font-semibold">الحالة</th>
                <th className="p-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLostFound.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    لا توجد أغراض مفقودة مسجلة
                  </td>
                </tr>
              ) : (
                filteredLostFound.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{item.itemName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description || 'لا يوجد وصف'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900">{item.branch?.name || item.branchId}</div>
                      <div className="text-xs text-gray-500">
                        {item.roomNumber ? `غرفة: ${item.roomNumber}` : item.foundLocation}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-4 text-gray-600">{item.foundByUser?.name || 'غير محدد'}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'KEPT'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.status === 'KEPT'
                          ? 'محتفظ به'
                          : item.status === 'DELIVERED'
                          ? 'تم التسليم'
                          : 'تم الإتلاف'}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.status === 'KEPT' && (
                        <button
                          onClick={() => setSelectedItemForAction(item)}
                          className="text-amber-600 hover:text-amber-700 font-medium text-xs bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg"
                        >
                          تسليم / إتلاف
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">وصف الضرر</th>
                <th className="p-4 font-semibold">الفرع / الغرفة</th>
                <th className="p-4 font-semibold">التكلفة التقديرية</th>
                <th className="p-4 font-semibold">المبلغ المحصل</th>
                <th className="p-4 font-semibold">الحالة</th>
                <th className="p-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDamages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    لا توجد بلاغات تلفيات مسجلة
                  </td>
                </tr>
              ) : (
                filteredDamages.map((dmg) => (
                  <tr key={dmg.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{dmg.description}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        بواسطة: {dmg.reportedByUser?.name || 'غير محدد'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900">{dmg.branch?.name || dmg.branchId}</div>
                      <div className="text-xs text-gray-500">غرفة: {dmg.roomNumber}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {(dmg.estimatedCost || 0).toLocaleString()} ر.س
                    </td>
                    <td className="p-4 font-medium text-red-600">
                      {dmg.chargedAmount ? `${dmg.chargedAmount.toLocaleString()} ر.س` : '-'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dmg.status === 'REPORTED'
                            ? 'bg-amber-100 text-amber-800'
                            : dmg.status === 'CHARGED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {dmg.status === 'REPORTED'
                          ? 'مسجل'
                          : dmg.status === 'CHARGED'
                          ? 'تم الخصم'
                          : 'معفى'}
                      </span>
                    </td>
                    <td className="p-4">
                      {dmg.status === 'REPORTED' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateDamageStatus(dmg, 'CHARGED')}
                            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            خصم التكلفة
                          </button>
                          <button
                            onClick={() => handleUpdateDamageStatus(dmg, 'WAIVED')}
                            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            إعفاء
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create Damage Report */}
      {isDamageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">تسجيل بلاغ تلفيات جديد</h3>
              <button onClick={() => setIsDamageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDamageReport} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الفرع</label>
                <select
                  value={dmgBranchId}
                  onChange={(e) => setDmgBranchId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">اختر الفرع...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">رقم الغرفة / المرفق</label>
                <input
                  type="text"
                  value={dmgRoomNumber}
                  onChange={(e) => setDmgRoomNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="مثال: 204"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">وصف التلف</label>
                <textarea
                  value={dmgDescription}
                  onChange={(e) => setDmgDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">التكلفة التقديرية (ر.س)</label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDamageModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  حفظ البلاغ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-500">جاري التحميل...</div>}>
      <LostFoundDashboard />
    </Suspense>
  );
}
