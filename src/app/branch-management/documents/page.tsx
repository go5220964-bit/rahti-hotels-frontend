'use client';

import React, { useState, useEffect } from 'react';
import { api, Document, Branch } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Role } from '@/types_local';
import { 
  Plus, 
  Trash2, 
  X, 
  RotateCw, 
  Upload, 
  File, 
  FileText, 
  Search, 
  Building, 
  Filter, 
  Calendar, 
  FileCheck, 
  FileWarning, 
  FileX, 
  Eye, 
  User, 
  Info,
  ExternalLink
} from 'lucide-react';

export default function BranchDocumentsPage() {
  const { role: currentRole, user } = useRole();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State (defaults to current user's branch)
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('الكل');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  // Form Fields
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('OTHER');
  const [department, setDepartment] = useState('BRANCH');
  const [branchId, setBranchId] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const canDelete = currentRole === Role.Admin;
  const isBranchManager = currentRole === Role.BranchManager;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (user?.branchId) {
      setSelectedBranch(user.branchId);
      setBranchId(user.branchId);
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const activeBranch = isBranchManager ? (user?.branchId || '') : selectedBranch;
      const docsData = await api.getDocuments({
        branchId: activeBranch || undefined,
        department: selectedDepartment === 'الكل' ? undefined : selectedDepartment,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery
      });
      setDocuments(docsData);

      const branchesData = await api.getBranches();
      setBranches(branchesData);
      
      if (branchesData.length > 0 && !branchId) {
        setBranchId(user?.branchId || branchesData[0].id);
      }
    } catch (error) {
      console.error('Failed to load document data:', error);
      showToast('خطأ أثناء تحميل البيانات من الخادم', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [selectedBranch, selectedDepartment, selectedStatus, searchQuery, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setModalError('الرجاء اختيار ملف للرفع');
      return;
    }

    setIsUploading(true);
    setModalError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('branchId', isBranchManager ? (user?.branchId || '') : branchId);
      formData.append('department', department);
      formData.append('type', docType);
      
      if (title.trim()) formData.append('title', title.trim());
      if (issuer.trim()) formData.append('issuer', issuer.trim());
      if (issueDate) formData.append('issueDate', issueDate);
      if (expiryDate) formData.append('expiryDate', expiryDate);
      if (notes.trim()) formData.append('notes', notes.trim());

      const newDoc = await api.uploadDocument(formData);
      
      setDocuments([newDoc, ...documents]);
      setIsModalOpen(false);
      showToast(`تم حفظ الوثيقة "${newDoc.title}" بنجاح في قاعدة البيانات.`);
      
      // Reset form
      setFile(null);
      setTitle('');
      setDocType('OTHER');
      setDepartment('BRANCH');
      setIssuer('');
      setIssueDate('');
      setExpiryDate('');
      setNotes('');
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      setModalError(error.message || 'حدث خطأ أثناء رفع المستند ومعالجته.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, docTitle: string) => {
    if (!canDelete) return;
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف الوثيقة: "${docTitle}" نهائياً؟`)) return;

    try {
      await api.deleteDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
      showToast('تم حذف الوثيقة بنجاح.');
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      showToast(error.message || 'خطأ أثناء حذف الوثيقة', 'error');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const translateDocType = (type: string) => {
    switch (type) {
      case 'LICENSE': return 'رخصة تشغيل';
      case 'CONTRACT': return 'عقد صيانة/توريد';
      case 'ID_CARD': return 'بطاقة تعريفية';
      case 'CERTIFICATE': return 'شهادة اعتماد';
      case 'INSURANCE': return 'وثيقة تأمين';
      case 'HEALTH_PERMIT': return 'تصريح صحي';
      case 'FIRE_PERMIT': return 'تصريح الدفاع المدني';
      default: return 'مستند آخر';
    }
  };

  const translateDepartment = (dept: string) => {
    switch (dept) {
      case 'BRANCH': return 'إدارة الفرع';
      case 'HR': return 'الموارد البشرية';
      case 'FINANCE': return 'المالية والمحاسبة';
      case 'MAINTENANCE': return 'الصيانة والتشغيل';
      case 'WAREHOUSE': return 'المستودعات';
      default: return dept;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-right" dir="rtl">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg text-white font-bold text-xs flex items-center gap-2.5 transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 border border-emerald-500' : 'bg-rose-600 border border-rose-500'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-brand-secondary/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-teal-dark flex items-center gap-2.5">
            <Building className="w-6 h-6 text-brand-primary" />
            <span>وثائق ومستندات الفرع</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            {isBranchManager ? 'استعراض وثائق فرعك الحالي وعقوده وتراخيص الدفاع المدني والبلدية.' : 'استعراض وإدارة الوثائق الخاصة بفروع فنادق راحتي.'}
          </p>
        </div>
        <button
          onClick={() => {
            setModalError('');
            setIsModalOpen(true);
          }}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold text-xs px-4.5 py-2.5 rounded-lg flex items-center gap-2 transition shadow shrink-0 self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>رفع مستند جديد</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-brand-primary" />
            <span>تصفية الوثائق:</span>
          </div>

          {/* Branch filter (hidden/disabled for BranchManager) */}
          {!isBranchManager && (
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg text-slate-800 font-bold focus:outline-none"
            >
              <option value="">كل الفروع</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name === 'Sail Road Branch' ? 'فرع طريق السيل (مكة)' : b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ (جدة)' : b.name}
                </option>
              ))}
            </select>
          )}

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg text-slate-800 font-bold focus:outline-none"
          >
            <option value="الكل">كل الأقسام</option>
            <option value="BRANCH">إدارة الفرع</option>
            <option value="MAINTENANCE">الصيانة والتشغيل</option>
            <option value="WAREHOUSE">المستودعات</option>
            <option value="HR">الموارد البشرية</option>
            <option value="FINANCE">المالية</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg text-slate-800 font-bold focus:outline-none"
          >
            <option value="all">كل الحالات</option>
            <option value="valid">سارية المفعول</option>
            <option value="expiring_soon">تنتهي قريباً (خلال 30 يوم)</option>
            <option value="expired">منتهية الصلاحية ⚠️</option>
          </select>

          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="البحث باسم الوثيقة أو الجهة المصدرة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 right-3" />
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-brand-secondary/20 rounded-lg transition"
            title="تحديث البيانات"
          >
            <RotateCw className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-2xl border border-brand-secondary/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <RotateCw className="w-8 h-8 text-brand-primary animate-spin" />
            <span>جاري تحميل مستندات الفرع...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لا توجد وثائق مسجلة للفرع المحدد حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                  <th className="p-4">اسم الوثيقة</th>
                  <th className="p-4">النوع</th>
                  <th className="p-4">القسم</th>
                  <th className="p-4">الجهة المصدرة</th>
                  <th className="p-4">تاريخ الانتهاء</th>
                  <th className="p-4">حجم الملف</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => {
                  const now = new Date();
                  const thirtyDays = new Date(Date.now() + 30 * 24 * 3600 * 1000);
                  const expiry = doc.expiryDate ? new Date(doc.expiryDate) : null;
                  const isExpired = doc.isExpired || (expiry && expiry <= now);
                  const isExpiringSoon = expiry && expiry > now && expiry <= thirtyDays;

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg ${
                            isExpired ? 'bg-rose-50 text-rose-600' : isExpiringSoon ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {isExpired ? <FileX className="w-5 h-5" /> : isExpiringSoon ? <FileWarning className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{doc.title}</div>
                            {doc.notes && <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{doc.notes}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-brand-cream text-brand-teal-dark px-2 py-0.5 rounded border border-brand-secondary/20 text-[9px] font-extrabold">
                          {translateDocType(doc.type)}
                        </span>
                      </td>
                      <td className="p-4">{translateDepartment(doc.department)}</td>
                      <td className="p-4 text-slate-800">{doc.issuer || '--'}</td>
                      <td className="p-4">
                        {expiry ? (
                          <div className="space-y-0.5">
                            <div className={`font-bold ${isExpired ? 'text-rose-600' : isExpiringSoon ? 'text-amber-600' : 'text-slate-800'}`}>
                              {expiry.toLocaleDateString('ar-EG')}
                            </div>
                            {isExpired ? (
                              <span className="text-[9px] font-bold text-rose-500">منتهية الصلاحية ⚠️</span>
                            ) : isExpiringSoon ? (
                              <span className="text-[9px] font-bold text-amber-500">ينتهي قريباً!</span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">غير محدد</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 font-mono">{formatFileSize(doc.fileSize)}</td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <a
                          href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://127.0.0.1:3000'}${doc.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-100 hover:bg-brand-primary/10 text-slate-600 hover:text-brand-primary rounded transition flex items-center gap-1 font-bold text-[10px]"
                        >
                          <Eye className="w-4 h-4" />
                          <span>عرض</span>
                        </a>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(doc.id, doc.title)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition"
                            title="حذف الوثيقة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUploadSubmit} className="bg-white rounded-2xl max-w-lg w-full border border-brand-secondary/25 overflow-hidden animate-in zoom-in duration-200 text-right p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-brand-teal-dark flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-primary" />
                <span>رفع وثيقة جديدة للفرع</span>
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
                ⚠️ {modalError}
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                dragOver ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-brand-primary opacity-80" />
                <span className="text-xs font-bold text-slate-700">اسحب الملف وأفلته هنا، أو اضغط للتصفح</span>
                <span className="text-[10px] text-slate-400 font-semibold">يقبل ملفات PDF، صور (PNG, JPG) بحد أقصى 5MB</span>
              </label>
              {file && (
                <div className="mt-4 p-3 bg-white border border-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-700 font-bold max-w-sm mx-auto shadow-sm">
                  <div className="flex items-center gap-2 text-right truncate">
                    <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 pr-4">{formatFileSize(file.size)}</span>
                </div>
              )}
            </div>

            {/* Document metadata fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">اسم الوثيقة / المعرف:</label>
                <input
                  type="text"
                  placeholder="مثال: رخصة البلدية 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">نوع الوثيقة:</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
                >
                  <option value="LICENSE">رخصة تشغيل (LICENSE)</option>
                  <option value="FIRE_PERMIT">تصريح الدفاع المدني (FIRE_PERMIT)</option>
                  <option value="HEALTH_PERMIT">تصريح صحي (HEALTH_PERMIT)</option>
                  <option value="CONTRACT">عقد صيانة/توريد (CONTRACT)</option>
                  <option value="INSURANCE">وثيقة تأمين (INSURANCE)</option>
                  <option value="CERTIFICATE">شهادة اعتماد (CERTIFICATE)</option>
                  <option value="OTHER">مستند آخر (OTHER)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">القسم التابع له:</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
                >
                  <option value="BRANCH">إدارة الفرع</option>
                  <option value="MAINTENANCE">الصيانة والتشغيل</option>
                  <option value="WAREHOUSE">المستودعات</option>
                  <option value="HR">الموارد البشرية</option>
                  <option value="FINANCE">المالية</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">الجهة المصدرة للوثيقة:</label>
                <input
                  type="text"
                  placeholder="مثال: أمانة العاصمة المقدسة"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">تاريخ الإصدار:</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">تاريخ انتهاء الصلاحية:</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">ملاحظات إضافية:</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                placeholder="أدخل أي ملاحظات حول العقد أو الترخيص..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="submit"
                disabled={isUploading}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {isUploading ? 'جاري الرفع والمعالجة...' : 'رفع المستند وحفظه'}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
