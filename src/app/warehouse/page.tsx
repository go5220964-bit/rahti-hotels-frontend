'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  api,
  StockEntry,
  StockMovement,
  Supplier,
  ProcurementRequest
} from '../../utils/api';
import {
  Package,
  ClipboardList,
  Plus,
  ArrowLeftRight,
  Check,
  X
} from 'lucide-react';

export default function WarehousePage({ defaultTab }: { defaultTab?: string }) {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || searchParams.get('tab') || 'stock'
  );

  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [procurementRequests, setProcurementRequests] = useState<ProcurementRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movItemName, setMovItemName] = useState('');
  const [movQuantity, setMovQuantity] = useState('1');
  const [movType, setMovType] = useState<'IN' | 'OUT'>('OUT');
  const [movBranchName, setMovBranchName] = useState('راحتي للشقق المخدومة');

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [poTitle, setPoTitle] = useState('');
  const [poSupplierName, setPoSupplierName] = useState('');
  const [poAmount, setPoAmount] = useState('');

  const loadWarehouseData = async () => {
    setLoading(true);
    try {
      const [stockData, movData, procData, supData] = await Promise.all([
        api.getStockEntries(),
        api.getStockMovements(),
        api.getProcurementRequests(),
        api.getSuppliers()
      ]);
      setStockEntries(Array.isArray(stockData) ? stockData : []);
      setMovements(Array.isArray(movData) ? movData : []);
      setProcurementRequests(Array.isArray(procData) ? procData : []);
      setSuppliers(Array.isArray(supData) ? supData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouseData();
  }, []);

  const handleCreateMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const newMov: any = {
      id: `MOV-${Date.now()}`,
      createdAt: new Date().toISOString(),
      item: { name: movItemName },
      quantity: parseInt(movQuantity, 10) || 1,
      type: movType,
      branch: { name: movBranchName }
    };
    setMovements((prev) => [newMov, ...prev]);
    setIsMovementModalOpen(false);
    setMovItemName('');
    setMovQuantity('1');
  };

  const handleCreatePurchaseOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if ((api as any).createPurchaseRequest) {
        await (api as any).createPurchaseRequest({
          title: poTitle,
          totalAmount: parseFloat(poAmount) || 0,
          supplierName: poSupplierName
        });
      }
      const newPO: any = {
        id: `PO-${Date.now()}`,
        title: poTitle,
        supplier: { name: poSupplierName || 'مورد معتمد' },
        totalAmount: parseFloat(poAmount) || 0,
        status: 'PENDING'
      };
      setProcurementRequests((prev) => [newPO, ...prev]);
      setIsPurchaseModalOpen(false);
      setPoTitle('');
      setPoSupplierName('');
      setPoAmount('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePOStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setProcurementRequests((prev) =>
      prev.map((req: any) => (req.id === id ? { ...req, status } : req))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المستودع والمخزون والمشتريات</h1>
          <p className="text-gray-500 text-sm">متابعة حركة الأرصدة والمواد الموردة وطلبات الشراء والتعميدات</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'movements' && (
            <button
              onClick={() => setIsMovementModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              تسجيل حركة مخزنية (توريد / صرف)
            </button>
          )}
          {activeTab === 'procurement' && (
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إنشاء طلب شراء جديد
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 flex gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-3 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stock' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500'
          }`}
        >
          <Package className="w-4 h-4" />
          رصيد المخزون الحالي ({stockEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`pb-3 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'movements' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          حركات المواد ({movements.length})
        </button>
        <button
          onClick={() => setActiveTab('procurement')}
          className={`pb-3 font-medium text-sm border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'procurement' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          طلبات الشراء والتعميدات ({procurementRequests.length})
        </button>
      </div>

      {/* Tab Content: Stock */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">الصنف</th>
                <th className="p-4 font-semibold">الكمية المتاحة</th>
                <th className="p-4 font-semibold">الفرع / المستودع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stockEntries.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900">{entry.item?.name || entry.name || entry.id}</td>
                  <td className="p-4 font-bold text-gray-900">{entry.quantity ?? 0}</td>
                  <td className="p-4 text-gray-600">{entry.warehouse?.name || 'المستودع الرئيسي'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Stock Movements */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">تاريخ الحركة</th>
                <th className="p-4 font-semibold">الصنف / المادة</th>
                <th className="p-4 font-semibold">الكمية</th>
                <th className="p-4 font-semibold">نوع الحركة</th>
                <th className="p-4 font-semibold">الفرع / الجهة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.map((mov: any) => (
                <tr key={mov.id} className="hover:bg-gray-50/50">
                  <td className="p-4 text-gray-600">{new Date(mov.createdAt).toLocaleDateString('ar-SA')}</td>
                  <td className="p-4 font-medium text-gray-900">{mov.item?.name || mov.itemId}</td>
                  <td className="p-4 font-bold text-gray-900">{mov.quantity}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mov.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {mov.type === 'IN' ? 'توريد / إضافة' : 'صرف / إخراج'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{mov.branch?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Purchase Orders / Procurement */}
      {activeTab === 'procurement' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">رقم الطلب / البند</th>
                <th className="p-4 font-semibold">المورد</th>
                <th className="p-4 font-semibold">التكلفة التقديرية</th>
                <th className="p-4 font-semibold">الحالة</th>
                <th className="p-4 font-semibold">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {procurementRequests.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-medium text-gray-900">{req.title || req.id}</td>
                  <td className="p-4 text-gray-700">{req.supplier?.name || 'غير محدد'}</td>
                  <td className="p-4 font-bold text-gray-900">{(req.totalAmount || 0).toLocaleString()} ر.س</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status === 'APPROVED' ? 'معتمد' : req.status === 'REJECTED' ? 'مرفوض' : 'قيد الدراسة'}
                    </span>
                  </td>
                  <td className="p-4">
                    {req.status !== 'APPROVED' && req.status !== 'REJECTED' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdatePOStatus(req.id, 'APPROVED')}
                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                          title="اعتماد الطلب"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUpdatePOStatus(req.id, 'REJECTED')}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                          title="رفض الطلب"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Stock Movement */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">تسجيل حركة مخزنية جديدة</h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">اسم الصنف / المادة</label>
                <input
                  type="text"
                  value={movItemName}
                  onChange={(e) => setMovItemName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="مثال: مناديل ورقية فاخرة"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">نوع الحركة</label>
                  <select
                    value={movType}
                    onChange={(e) => setMovType(e.target.value as 'IN' | 'OUT')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="OUT">صرف / إخراج للغرف</option>
                    <option value="IN">توريد / إضافة للمستودع</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الكمية</label>
                  <input
                    type="number"
                    value={movQuantity}
                    onChange={(e) => setMovQuantity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700"
                >
                  تسجيل الحركة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Purchase Order */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">إنشاء طلب شراء جديد</h3>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePurchaseOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">بيان طلب الشراء</label>
                <input
                  type="text"
                  value={poTitle}
                  onChange={(e) => setPoTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="مثال: توريد مستلزمات ضيافة ومنظفات شهرية"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">المورد المقترح</label>
                <input
                  type="text"
                  value={poSupplierName}
                  onChange={(e) => setPoSupplierName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="اسم الشركة أو المورد"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">التكلفة التقديرية (ر.س)</label>
                <input
                  type="number"
                  value={poAmount}
                  onChange={(e) => setPoAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  min="1"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  إرسال للاعتماد المالي
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
