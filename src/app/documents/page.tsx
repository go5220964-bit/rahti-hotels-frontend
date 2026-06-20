'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { api, Document, Branch } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
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
  Sparkles, 
  Eye, 
  User, 
  Info,
  ExternalLink
} from 'lucide-react';

function DocumentsPageContent() {
  const { role: currentRole } = useRole();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const docsData = await api.getDocuments({
        branchId: selectedBranch,
        department: selectedDepartment === 'الكل' ? undefined : selectedDepartment,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery
      });
      setDocuments(docsData);

      const branchesData = await api.getBranches();
      setBranches(branchesData);
      
      // Set default branch in modal upload form if user has a branch
      if (branchesData.length > 0 && !branchId) {
        setBranchId(branchesData[0].id);
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
    loadData();
  }, [selectedBranch, selectedDepartment, selectedStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Drag and Drop handlers
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
      formData.append('branchId', branchId);
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

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper to get status badges
  const getStatusBadge = (doc: Document) => {
    const now = new Date();
    const expiry = doc.expiryDate ? new Date(doc.expiryDate) : null;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (doc.isExpired || (expiry && expiry < now)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
          منتهية الصلاحية
        </span>
      );
    }

    if (expiry && expiry <= thirtyDaysFromNow) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
          تنتهي قريباً
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
        سارية
      </span>
    );
  };

  // Helper to get document icon
  const getDocTypeIcon = (type: string) => {
    switch (type) {
      case 'FIRE_PERMIT':
      case 'HEALTH_PERMIT':
      case 'LICENSE':
        return <Building className="w-6 h-6 text-brand-secondary" />;
      case 'CONTRACT':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'INSURANCE':
        return <FileCheck className="w-6 h-6 text-emerald-500" />;
      case 'CERTIFICATE':
        return <Sparkles className="w-6 h-6 text-yellow-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  // Helper to translate doc type
  const translateDocType = (type: string) => {
    switch (type) {
      case 'LICENSE': return 'رخصة تشغيل بلدية';
      case 'CONTRACT': return 'عقد تجاري';
      case 'ID_CARD': return 'بطاقة هوية';
      case 'CERTIFICATE': return 'شهادة رسمية';
      case 'INSURANCE': return 'تأمين طبي / شامل';
      case 'HEALTH_PERMIT': return 'تصريح صحي';
      case 'FIRE_PERMIT': return 'رخصة الدفاع المدني';
      default: return 'وثيقة أخرى';
    }
  };

  // Helper to translate department
  const translateDept = (dept: string) => {
    switch (dept) {
      case 'BRANCH': return 'رخصة/عقد الفرع';
      case 'HR': return 'الموارد البشرية';
      case 'MAINTENANCE': return 'إدارة الصيانة';
      default: return dept;
    }
  };

  // Stats Counters
  const totalCount = documents.length;
  const expiredCount = documents.filter(d => {
    const expiry = d.expiryDate ? new Date(d.expiryDate) : null;
    return d.isExpired || (expiry && expiry < new Date());
  }).length;
  const expiringCount = documents.filter(d => {
    const expiry = d.expiryDate ? new Date(d.expiryDate) : null;
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);
    return !d.isExpired && expiry && expiry >= now && expiry <= thirtyDays;
  }).length;
  const validCount = totalCount - expiredCount - expiringCount;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto text-foreground" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 left-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}></div>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-primary p-6 rounded-2xl border border-brand-secondary/20 shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-brand-secondary/5 rounded-full filter blur-xl"></div>
        
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            📄 إدارة الوثائق والمستندات
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-secondary/20 border border-brand-secondary/30 text-brand-secondary font-extrabold animate-pulse">
              معزز بالذكاء الاصطناعي ✨
            </span>
          </h2>
          <p className="text-xs text-white/70">
            أرشيف إلكتروني موحد لحفظ رخص التشغيل، العقود، والتأمين مع نظام إنذار مبكر لانتهاء الصلاحية عبر الواتساب.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all duration-200 shrink-0"
            title="تحديث البيانات"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-secondary hover:bg-brand-secondary-hover text-brand-teal-dark font-extrabold text-xs rounded-xl shadow-lg shadow-brand-secondary/15 transition-all duration-200 border border-brand-secondary/35 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            رفع وثيقة جديدة
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Docs */}
        <div className="bg-card p-5 rounded-2xl border border-border-brand shadow-md flex items-center justify-between group hover:border-brand-secondary/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">إجمالي الوثائق</p>
            <h3 className="text-2xl font-extrabold text-brand-primary">{totalCount}</h3>
          </div>
          <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary group-hover:scale-110 transition-transform duration-200">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Valid Docs */}
        <div className="bg-card p-5 rounded-2xl border border-border-brand shadow-md flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">الوثائق السارية</p>
            <h3 className="text-2xl font-extrabold text-emerald-600">{validCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform duration-200">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-card p-5 rounded-2xl border border-border-brand shadow-md flex items-center justify-between group hover:border-yellow-500/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">تنتهي قريباً (30 يوم)</p>
            <h3 className="text-2xl font-extrabold text-yellow-600">{expiringCount}</h3>
          </div>
          <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600 group-hover:scale-110 transition-transform duration-200">
            <FileWarning className="w-5 h-5" />
          </div>
        </div>

        {/* Expired Docs */}
        <div className="bg-card p-5 rounded-2xl border border-border-brand shadow-md flex items-center justify-between group hover:border-red-500/30 transition-all duration-300">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">منتهية الصلاحية</p>
            <h3 className="text-2xl font-extrabold text-red-600">{expiredCount}</h3>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:scale-110 transition-transform duration-200">
            <FileX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-card p-5 rounded-2xl border border-border-brand shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Left: Department Tabs & Status Badges */}
          <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
            {/* Department Filter tabs */}
            <div className="bg-muted-background p-1 rounded-xl flex border border-border-brand shrink-0">
              {['الكل', 'BRANCH', 'HR', 'MAINTENANCE'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                    selectedDepartment === dept 
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'text-muted hover:text-brand-primary'
                  }`}
                >
                  {dept === 'الكل' ? 'الكل' : translateDept(dept)}
                </button>
              ))}
            </div>

            {/* Status filters */}
            <div className="flex gap-1 shrink-0">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'valid', label: 'سارية' },
                { id: 'expiring_soon', label: 'تنتهي قريباً' },
                { id: 'expired', label: 'منتهية' }
              ].map((statusOpt) => (
                <button
                  key={statusOpt.id}
                  onClick={() => setSelectedStatus(statusOpt.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all duration-150 ${
                    selectedStatus === statusOpt.id
                      ? 'bg-brand-cream-dark border-brand-primary text-brand-primary'
                      : 'border-border-brand text-muted hover:bg-brand-cream/50'
                  }`}
                >
                  {statusOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Branch select and search */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
            {/* Branch dropdown */}
            <div className="relative w-full sm:w-48 shrink-0">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs font-bold rounded-xl border border-border-brand bg-white focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
              >
                <option value="">كل الفروع</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <div className="absolute left-3 top-2.5 pointer-events-none text-muted">
                <Building className="w-4 h-4" />
              </div>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث عن وثيقة..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border-brand bg-white focus:outline-none focus:border-brand-primary"
              />
              <button type="submit" className="absolute left-3 top-2.5 text-muted hover:text-brand-primary">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3 bg-card border border-border-brand rounded-2xl">
          <RotateCw className="w-8 h-8 text-brand-primary animate-spin" />
          <p className="text-xs text-muted font-bold">جاري تحميل المستندات والأرشيف الموحد...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 bg-card border border-border-brand rounded-2xl text-center">
          <FileText className="w-12 h-12 text-muted/40" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-brand-primary">لا توجد وثائق مطابقة للفلاتر الحالية</h4>
            <p className="text-xs text-muted">يمكنك رفع وثيقة جديدة بالضغط على الزر بالأعلى أو تعديل خيارات التصفية.</p>
          </div>
        </div>
      ) : (
        /* Document Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const fileUrlStr = doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://127.0.0.1:3000${doc.fileUrl}`;
            
            return (
              <div 
                key={doc.id}
                className="bg-card rounded-2xl border border-border-brand shadow-md overflow-hidden hover:shadow-xl hover:border-brand-secondary/30 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top bar with type and status */}
                <div className="p-4 bg-brand-cream-dark/50 border-b border-border-brand flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted flex items-center gap-1.5">
                    {getDocTypeIcon(doc.type)}
                    {translateDocType(doc.type)}
                  </span>
                  {getStatusBadge(doc)}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-brand-primary leading-snug line-clamp-2" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-muted flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{doc.branch?.name}</span>
                      <span className="text-border-brand">|</span>
                      <span>{translateDept(doc.department)}</span>
                    </p>
                  </div>

                  {/* Dates list */}
                  <div className="p-3 bg-brand-cream/40 border border-border-brand/40 rounded-xl space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-muted">
                      <span>الجهة المصدرة:</span>
                      <span className="font-bold text-foreground truncate max-w-[150px]">{doc.issuer || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted">
                      <span>تاريخ الإصدار:</span>
                      <span className="font-bold text-foreground">
                        {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString('ar-SA') : 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted">
                      <span>تاريخ الانتهاء:</span>
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-brand-secondary" />
                        {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('ar-SA') : 'غير محدد'}
                      </span>
                    </div>
                  </div>

                  {/* Metadata and notes */}
                  {doc.notes && (
                    <p className="text-[11px] text-muted italic line-clamp-2 bg-brand-cream/10 p-2 rounded border border-dotted border-border-brand/50">
                      📝 {doc.notes}
                    </p>
                  )}

                  {/* File Metadata footer */}
                  <div className="flex items-center justify-between text-[10px] text-muted/70 pt-2 border-t border-border-brand/50">
                    <span className="truncate max-w-[150px]" title={doc.fileName}>{doc.fileName}</span>
                    <span>{formatFileSize(doc.fileSize)}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 py-4 border-t border-border-brand bg-brand-cream/10 flex items-center gap-3">
                  <a 
                    href={fileUrlStr}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-cream-dark hover:bg-brand-secondary/10 border border-border-brand hover:border-brand-secondary text-brand-primary hover:text-brand-secondary-hover font-bold text-xs rounded-xl transition-all duration-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    عرض الملف
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 hover:border-red-200 transition-all duration-200"
                      title="حذف المستند نهائياً"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border-brand shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 bg-brand-primary border-b border-brand-secondary/20 flex items-center justify-between text-white">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4 text-brand-secondary" />
                  رفع وثيقة أو رخصة جديدة
                </h3>
                <p className="text-[10px] text-white/70">
                  اسحب وأسقط الملف وسيقوم النظام باستخراج بياناته تلقائياً بالذكاء الاصطناعي.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  {modalError}
                </div>
              )}

              {/* Drag & Drop File Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 relative ${
                  dragOver 
                    ? 'border-brand-secondary bg-brand-secondary/5' 
                    : file 
                      ? 'border-emerald-500/50 bg-emerald-50/10' 
                      : 'border-border-brand hover:border-brand-primary'
                }`}
              >
                <input 
                  type="file" 
                  id="modal-file-upload" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,image/png,image/jpeg,image/webp"
                />
                
                {file ? (
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-brand-primary truncate max-w-[400px] mx-auto">{file.name}</p>
                      <p className="text-[10px] text-muted">{formatFileSize(file.size)}</p>
                    </div>
                    <label 
                      htmlFor="modal-file-upload"
                      className="inline-block text-[10px] font-bold px-3 py-1 bg-brand-cream-dark border border-border-brand hover:border-brand-primary rounded-lg text-brand-primary cursor-pointer transition-colors"
                    >
                      تغيير الملف
                    </label>
                  </div>
                ) : (
                  <label htmlFor="modal-file-upload" className="cursor-pointer space-y-2 block">
                    <div className="mx-auto w-12 h-12 bg-brand-primary/5 text-brand-primary rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-brand-primary">اسحب وأسقط الملف هنا أو اضغط للتصفح</p>
                      <p className="text-[10px] text-muted">الحد الأقصى للملف: 10 ميجا بايت (PDF, PNG, JPG, WEBP)</p>
                    </div>
                  </label>
                )}
              </div>

              {/* Advanced Metadata extraction prompt banner */}
              <div className="bg-brand-cream-dark/60 border border-brand-secondary/20 p-3.5 rounded-xl flex gap-3">
                <Sparkles className="w-5 h-5 text-brand-secondary shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-brand-primary">الاستخراج التلقائي الذكي ✨</h4>
                  <p className="text-[10px] text-muted">
                    عند ترك حقول الاسم والجهة وتواريخ الإصدار والانتهاء فارغة، سيقوم نموذج Gemini AI بفحص محتوى المستند وملئه لك تلقائياً. يمكنك كتابتها يدوياً لتخطي الاستخراج الذكي.
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Title Override */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-muted">اسم الوثيقة (اختياري)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: رخصة الدفاع المدني 2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-brand focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Doc Type */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-muted">نوع الوثيقة</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-border-brand focus:outline-none focus:border-brand-primary bg-white cursor-pointer"
                  >
                    <option value="OTHER">وثيقة أخرى</option>
                    <option value="LICENSE">رخصة تشغيل بلدية</option>
                    <option value="CONTRACT">عقد تجاري</option>
                    <option value="ID_CARD">بطاقة هوية</option>
                    <option value="CERTIFICATE">شهادة تسجيل</option>
                    <option value="INSURANCE">وثيقة تأمين</option>
                    <option value="HEALTH_PERMIT">تصريح صحي</option>
                    <option value="FIRE_PERMIT">رخصة الدفاع المدني</option>
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-muted">القسم التابع للمستند</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-border-brand focus:outline-none focus:border-brand-primary bg-white cursor-pointer"
                  >
                    <option value="BRANCH">رخصة/عقد الفرع (عام)</option>
                    <option value="HR">الموارد البشرية (HR)</option>
                    <option value="MAINTENANCE">إدارة الصيانة (Maintenance)</option>
                  </select>
                </div>

                {/* Branch selection */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-muted">الفرع</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-border-brand focus:outline-none focus:border-brand-primary bg-white cursor-pointer"
                    required
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Issuer */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-muted">الجهة المصدرة (اختياري)</label>
                  <input
                    type="text"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="مثال: الدفاع المدني السعودي"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-brand focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Issue Date */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-muted">تاريخ الإصدار (اختياري)</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-brand focus:outline-none focus:border-brand-primary bg-white"
                  />
                </div>

                {/* Expiry Date */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-muted">تاريخ انتهاء الصلاحية (اختياري)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-brand focus:outline-none focus:border-brand-primary bg-white"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-muted">ملاحظات إضافية (اختياري)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ملاحظات حول تجديد أو سداد الوثيقة..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-brand focus:outline-none focus:border-brand-primary"
                  />
                </div>

              </div>
            </form>

            {/* Modal Actions */}
            <div className="p-4 bg-brand-cream-dark/50 border-t border-border-brand flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isUploading}
                className="px-4 py-2 border border-border-brand text-muted hover:text-brand-primary bg-white font-bold text-xs rounded-xl transition-colors"
              >
                إلغاء
              </button>
              
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/60 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-200"
              >
                {isUploading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    جاري فحص ومعالجة المستند بالذكاء الاصطناعي...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-brand-secondary fill-brand-secondary/15" />
                    حفظ المستند
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center p-20 space-y-3 min-h-[50vh]">
        <RotateCw className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-xs text-muted font-bold">جاري تحميل صفحة إدارة الوثائق...</p>
      </div>
    }>
      <DocumentsPageContent />
    </Suspense>
  );
}
