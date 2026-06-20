'use client';

import React, { useState, useEffect } from 'react';
import { api, InventoryItem, Branch } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import { Plus, Search, RotateCw, Pencil, Trash2, X, Package, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const { role } = useRole();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranchId, setFilterBranchId] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Add Item Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('مستلزمات الغرف');
  const [itemStock, setItemStock] = useState('50');
  const [itemReorder, setItemReorder] = useState('10');
  const [itemBranchId, setItemBranchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Edit Item Modal State
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('مستلزمات الغرف');
  const [editStock, setEditStock] = useState('50');
  const [editReorder, setEditReorder] = useState('10');
  const [editBranchId, setEditBranchId] = useState('');

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Check if current user is allowed to manage (Admin, CEO, or Warehouse Manager)
  const canManage = role === Role.Admin || role === Role.CEO || role === Role.WarehouseManager;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [inventoryData, branchesData] = await Promise.all([
        api.getInventory(),
        api.getBranches()
      ]);
      setItems(inventoryData);
      setBranches(branchesData);
      
      // Default the modal branch selection to the first branch if available
      if (branchesData.length > 0) {
        setItemBranchId(branchesData[0].id);
      }
    } catch (error) {
      console.error('Failed to load inventory data:', error);
      showToast('خطأ أثناء تحميل البيانات من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle status toggle (Available <=> Out_of_Stock)
  const handleToggleStatus = async (item: InventoryItem) => {
    if (!canManage) {
      showToast('عذراً، لا تمتلك الصلاحية لتعديل المخزون.', 'error');
      return;
    }

    const currentStatus = item.status;
    const newStatus: 'Available' | 'Out_of_Stock' = currentStatus === 'Available' ? 'Out_of_Stock' : 'Available';
    
    // Optimistic UI update
    const previousItems = [...items];
    const updatedItems = items.map(i => {
      if (i.id === item.id) {
        let updatedStock = i.stockLevel;
        if (newStatus === 'Available' && i.stockLevel === 0) {
          updatedStock = 10; // Default stock when made available
        } else if (newStatus === 'Out_of_Stock') {
          updatedStock = 0; // Empty stock when marked out of stock
        }
        return { ...i, status: newStatus, stockLevel: updatedStock };
      }
      return i;
    });
    setItems(updatedItems);

    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'Available' && item.stockLevel === 0) {
        updates.stockLevel = 10;
      } else if (newStatus === 'Out_of_Stock') {
        updates.stockLevel = 0;
      }

      await api.updateInventoryItem(item.id, updates);
      showToast(`تم تغيير حالة "${item.name}" إلى ${newStatus === 'Available' ? 'متوفر' : 'غير متوفر'}`);
    } catch (error) {
      console.error('Failed to toggle status:', error);
      setItems(previousItems); // Rollback on error
      showToast('فشل تحديث الحالة في قاعدة البيانات', 'error');
    }
  };

  // Quick stock quantity adjustments (+/- buttons)
  const handleAdjustStock = async (item: InventoryItem, amount: number) => {
    if (!canManage) {
      showToast('عذراً، لا تمتلك الصلاحية لتعديل المخزون.', 'error');
      return;
    }

    const newStock = Math.max(0, item.stockLevel + amount);
    if (newStock === item.stockLevel) return;

    // Optimistic UI update
    const previousItems = [...items];
    const updatedItems = items.map(i => {
      if (i.id === item.id) {
        const newStatus: 'Available' | 'Out_of_Stock' = newStock <= 0 ? 'Out_of_Stock' : 'Available';
        return { ...i, stockLevel: newStock, status: newStatus };
      }
      return i;
    });
    setItems(updatedItems);

    try {
      await api.updateInventoryItem(item.id, { stockLevel: newStock });
      if (newStock === 0) {
        showToast(`نفذ مخزون "${item.name}" وتم إخفاؤه تلقائياً من الواتساب`, 'success');
      }
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      setItems(previousItems); // Rollback
      showToast('فشل حفظ تحديث كمية المخزون', 'error');
    }
  };

  // Submit adding a new item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    if (!itemName.trim()) {
      setModalError('الرجاء إدخال اسم الصنف');
      return;
    }

    const stock = parseInt(itemStock, 10);
    const reorder = parseInt(itemReorder, 10);

    if (isNaN(stock) || stock < 0) {
      setModalError('كمية المخزون يجب أن تكون رقماً أكبر من أو يساوي الصفر');
      return;
    }

    if (isNaN(reorder) || reorder < 0) {
      setModalError('حد إعادة الطلب يجب أن يكون رقماً أكبر من أو يساوي الصفر');
      return;
    }

    if (!itemBranchId) {
      setModalError('الرجاء تحديد موقع التخزين (المستودع)');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const newItem = await api.createInventoryItem({
        name: itemName.trim(),
        category: itemCategory,
        stockLevel: stock,
        reorderLevel: reorder,
        branchId: itemBranchId,
        status: stock > 0 ? 'Available' : 'Out_of_Stock'
      });

      setItems([newItem, ...items]);
      setIsModalOpen(false);
      showToast(`تمت إضافة "${newItem.name}" إلى موقع التخزين (المستودع) بنجاح`);
      
      // Reset form fields
      setItemName('');
      setItemCategory('مستلزمات الغرف');
      setItemStock('50');
      setItemReorder('10');
      if (branches.length > 0) {
        setItemBranchId(branches[0].id);
      }
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      setModalError('حدث خطأ أثناء الاتصال بالخادم لحفظ الصنف الجديد');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an inventory item
  const handleDeleteItem = async (itemId: string, itemNameStr: string) => {
    if (!canManage) return;
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف الصنف "${itemNameStr}" نهائياً؟ سيتم إزالته فوراً من بوت الواتساب.`)) {
      return;
    }

    const previousItems = [...items];
    setItems(items.filter(i => i.id !== itemId));

    try {
      await api.deleteInventoryItem(itemId);
      showToast(`تم حذف الصنف "${itemNameStr}" بنجاح.`);
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      setItems(previousItems); // rollback
      showToast('فشل حذف الصنف من قاعدة البيانات', 'error');
    }
  };

  // Open Edit Modal and fill state
  const handleStartEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditStock(item.stockLevel.toString());
    setEditReorder(item.reorderLevel.toString());
    setEditBranchId(item.branchId);
    setModalError('');
  };

  // Submit edits for inventory item
  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !editingItem) return;

    if (!editName.trim()) {
      setModalError('الرجاء إدخال اسم الصنف');
      return;
    }

    const stock = parseInt(editStock, 10);
    const reorder = parseInt(editReorder, 10);

    if (isNaN(stock) || stock < 0) {
      setModalError('كمية المخزون يجب أن تكون رقماً أكبر من أو يساوي الصفر');
      return;
    }

    if (isNaN(reorder) || reorder < 0) {
      setModalError('حد إعادة الطلب يجب أن يكون رقماً أكبر من أو يساوي الصفر');
      return;
    }

    if (!editBranchId) {
      setModalError('الرجاء تحديد موقع التخزين (المستودع)');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const updated = await api.updateInventoryItem(editingItem.id, {
        name: editName.trim(),
        category: editCategory,
        stockLevel: stock,
        reorderLevel: reorder,
        status: stock > 0 ? 'Available' : 'Out_of_Stock',
        branchId: editBranchId
      });

      setItems(items.map(i => i.id === editingItem.id ? updated : i));
      setEditingItem(null);
      showToast(`تم تحديث الصنف "${updated.name}" بنجاح.`);
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      setModalError('حدث خطأ أثناء حفظ التعديلات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items based on user inputs
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = filterBranchId ? item.branchId === filterBranchId : true;
    const matchesCategory = filterCategory ? item.category === filterCategory : true;
    return matchesSearch && matchesBranch && matchesCategory;
  });

  // Category list for filter dropdown
  const categoriesList = Array.from(new Set(items.map(i => i.category)));

  // Statistics calculation
  const totalItemsCount = filteredItems.length;
  const availableItemsCount = filteredItems.filter(i => i.status === 'Available').length;
  const outOfStockCount = filteredItems.filter(i => i.status === 'Out_of_Stock' || i.stockLevel === 0).length;
  const lowStockCount = filteredItems.filter(i => i.status === 'Available' && i.stockLevel <= i.reorderLevel).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
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
        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-secondary/10 blur-2xl"></div>
        <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-brand-secondary/40"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-brand-secondary/40"></div>

        <div>
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">إدارة مخزون المستودعات</h1>
          <p className="text-xs text-white/70 mt-1">
            تابع مستويات المخزون بالفندق، وحدث حالة توافر المواد الحية لتنعكس تلقائياً على خيارات قائمة الواتساب للموظفين الميدانيين.
          </p>
        </div>
        
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold bg-brand-secondary hover:bg-brand-secondary-hover text-brand-teal-dark px-4 py-2.5 rounded border border-brand-secondary transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            إضافة صنف جديد
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Items */}
        <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden group hover:border-brand-secondary/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">إجمالي الأصناف</p>
              <h3 className="text-3xl font-extrabold text-brand-teal-dark mt-2">
                {loading ? '...' : totalItemsCount}
              </h3>
            </div>
            <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted mt-3 font-semibold">المواد المسجلة في فلاتر التصفية</div>
        </div>

        {/* Card 2: Available Items */}
        <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden group hover:border-brand-secondary/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">الأصناف المتوفرة</p>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">
                {loading ? '...' : availableItemsCount}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted mt-3 font-semibold">تظهر حالياً في بوت الواتساب للميدان</div>
        </div>

        {/* Card 3: Out of Stock */}
        <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden group hover:border-brand-secondary/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">الأصناف النفدة</p>
              <h3 className="text-3xl font-extrabold text-rose-600 mt-2">
                {loading ? '...' : outOfStockCount}
              </h3>
            </div>
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-lg shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted mt-3 font-semibold">مخفية تلقائياً من قوائم طلبات الواتساب</div>
        </div>

        {/* Card 4: Low Stock warning */}
        <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm relative overflow-hidden group hover:border-brand-secondary/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted uppercase tracking-wider">مواد منخفضة المخزون</p>
              <h3 className="text-3xl font-extrabold text-amber-500 mt-2">
                {loading ? '...' : lowStockCount}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[10px] text-muted mt-3 font-semibold">أقل من حد إعادة الطلب المحدد للمادة</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="بحث باسم الصنف أو الفئة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg py-2.5 pr-9 pl-3 text-brand-teal-dark focus:outline-none focus:border-brand-primary placeholder:text-muted/60"
          />
          <Search className="w-4 h-4 text-muted/60 absolute right-3 top-3.5" />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          
          {/* Branch filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-brand-teal-dark shrink-0">موقع التخزين (المستودع):</span>
            <select
              value={filterBranchId}
              onChange={(e) => setFilterBranchId(e.target.value)}
              className="text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-primary text-brand-teal-dark font-medium"
            >
              <option value="">كل الفروع</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' : b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-brand-teal-dark shrink-0">الفئة:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-primary text-brand-teal-dark font-medium"
            >
              <option value="">كل الفئات</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadData}
            title="تحديث البيانات"
            className="p-2 border border-brand-secondary/35 rounded-lg bg-brand-cream hover:bg-brand-cream-dark text-brand-teal-dark transition-colors cursor-pointer self-end sm:self-auto flex items-center justify-center shrink-0"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-xs text-muted italic">جاري تحميل سجلات المخزون ومزامنة الحالة...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-xs text-muted italic">لا توجد أصناف مخزون تطابق فلاتر البحث الحالية.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                  <th className="px-6 py-4">اسم الصنف</th>
                  <th className="px-6 py-4">الفئة</th>
                  <th className="px-6 py-4">موقع التخزين (المستودع)</th>
                  <th className="px-6 py-4 text-center">المخزون الحالي</th>
                  <th className="px-6 py-4 text-center">حد إعادة الطلب</th>
                  <th className="px-6 py-4 text-center">الحالة بالواتساب</th>
                  <th className="px-6 py-4 text-center">تنبيه النقص</th>
                  {canManage && <th className="px-6 py-4 text-center">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                {filteredItems.map((item) => {
                  const isLowStock = item.status === 'Available' && item.stockLevel <= item.reorderLevel;
                  const isOutOfStock = item.stockLevel <= 0 || item.status === 'Out_of_Stock';
                  
                  return (
                    <tr key={item.id} className="hover:bg-brand-cream/10 transition-colors">
                      {/* Name */}
                      <td className="px-6 py-4 font-bold text-sm">{item.name}</td>
                      
                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="bg-brand-cream-dark px-2.5 py-1 rounded text-brand-teal-dark border border-brand-secondary/15 font-medium">
                          {item.category}
                        </span>
                      </td>
                      
                      {/* Branch */}
                      <td className="px-6 py-4 font-medium text-muted">
                        {item.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 
                         item.branch?.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : 
                         (item.branch?.name || item.branchId)}
                      </td>
                      
                      {/* Stock Level with Increments */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {canManage && (
                            <button
                              onClick={() => handleAdjustStock(item, -1)}
                              disabled={item.stockLevel <= 0}
                              className="w-6 h-6 rounded bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                              -
                            </button>
                          )}
                          <span className={`w-10 text-center font-black text-sm ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-500' : 'text-brand-teal-dark'}`}>
                            {item.stockLevel}
                          </span>
                          {canManage && (
                            <button
                              onClick={() => handleAdjustStock(item, 1)}
                              className="w-6 h-6 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold hover:bg-emerald-100 transition-all cursor-pointer"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </td>
                      
                      {/* Reorder Level */}
                      <td className="px-6 py-4 text-center font-semibold text-muted">
                        {item.reorderLevel}
                      </td>
                      
                      {/* Status Toggle Switch */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            disabled={!canManage}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-brand-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                              item.status === 'Available' ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                item.status === 'Available' ? '-translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-extrabold ${item.status === 'Available' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {item.status === 'Available' ? 'نشط بالواتساب' : 'مخفي بالواتساب'}
                          </span>
                        </div>
                      </td>
                      
                      {/* Alert status column */}
                      <td className="px-6 py-4 text-center">
                        {isOutOfStock ? (
                          <span className="bg-rose-50 border border-rose-200 text-rose-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                            نفذ من المخزون
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-50 border border-brand-secondary/35 text-amber-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                            مخزون منخفض
                          </span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                            كافٍ ومستقر
                          </span>
                        )}
                      </td>

                      {/* Actions Column (Edit/Delete) */}
                      {canManage && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleStartEdit(item)}
                              title="تعديل الصنف"
                              className="p-1.5 border border-brand-secondary/30 rounded text-brand-teal-dark hover:bg-brand-cream transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              title="حذف الصنف نهائياً"
                              className="p-1.5 border border-rose-200 rounded text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">إضافة صنف جديد</h3>
                <p className="text-[10px] text-white/60 mt-1">تعبئة مواصفات الصنف لإدراجه في مخزون مستودعات فنادق راحتي.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded">
                  ⚠️ {modalError}
                </div>
              )}

              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">اسم الصنف:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شامبو للاستحمام عبوة 100 مل"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Category & Branch Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">الفئة:</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                  >
                    <option value="مستلزمات الغرف">مستلزمات الغرف</option>
                    <option value="البياضات">البياضات</option>
                    <option value="أدوات ومواد التنظيف">أدوات ومواد التنظيف</option>
                    <option value="الأغذية والمشروبات">الأغذية والمشروبات</option>
                    <option value="مستلزمات الصيانة">مستلزمات الصيانة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                {/* Branch selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">موقع التخزين (المستودع):</label>
                  <select
                    value={itemBranchId}
                    onChange={(e) => setItemBranchId(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' : b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock Levels Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Stock Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">الكمية الابتدائية بالمخزون:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Reorder Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">حد إعادة الطلب (نقص المخزون):</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={itemReorder}
                    onChange={(e) => setItemReorder(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream-dark text-brand-teal-dark px-4 py-2.5 rounded transition-all cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded border border-brand-primary transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && (
                    <RotateCw className="animate-spin w-3.5 h-3.5" />
                  )}
                  إضافة وحفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal Dialog */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">تعديل تفاصيل الصنف</h3>
                <p className="text-[10px] text-white/60 mt-1">تحديث بيانات الصنف ومستوى مخزونه الحالي في المستودع.</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditItemSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded">
                  ⚠️ {modalError}
                </div>
              )}

              {/* Item Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">اسم الصنف:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Category & Branch Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">الفئة:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                  >
                    <option value="مستلزمات الغرف">مستلزمات الغرف</option>
                    <option value="البياضات">البياضات</option>
                    <option value="أدوات ومواد التنظيف">أدوات ومواد التنظيف</option>
                    <option value="الأغذية والمشروبات">الأغذية والمشروبات</option>
                    <option value="مستلزمات الصيانة">مستلزمات الصيانة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                {/* Storage Location/Warehouse Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">موقع التخزين (المستودع):</label>
                  <select
                    value={editBranchId}
                    onChange={(e) => setEditBranchId(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' : b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock Levels Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Stock Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">الكمية الحالية بالمخزون:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Reorder Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">حد إعادة الطلب:</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editReorder}
                    onChange={(e) => setEditReorder(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream-dark text-brand-teal-dark px-4 py-2.5 rounded transition-all cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded border border-brand-primary transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && (
                    <RotateCw className="animate-spin w-3.5 h-3.5" />
                  )}
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
