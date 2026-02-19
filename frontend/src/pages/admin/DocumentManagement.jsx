import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '../../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  FileText, Upload, Download, Eye, Edit, Trash2, MoreVertical,
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  File, FileImage, FileSpreadsheet, FileArchive, Lock, Unlock,
  Globe, Users, Calendar, Tag, Clock, CheckCircle, XCircle,
  AlertCircle, X, Plus, Copy, Share2, Archive as ArchiveIcon,
  Image, Video, Music, Code, BookOpen, Newspaper
} from 'lucide-react';

// Toast setup
import { useToast } from '../../components/ui/use-toast';

const DocumentManagement = () => {
  const { language, t } = useLanguage();
  const { token } = useAuth();
  const { toast } = useToast();
  
  // State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  
  // Dialog states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    titleAm: '',
    titleEn: '',
    descriptionAm: '',
    descriptionEn: '',
    category: 'administrative',
    documentType: 'pdf',
    language: 'am',
    keywords: '',
    accessLevel: 'restricted',
    file: null
  });

  // File upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const itemsPerPage = 10;

  // Translations
  const translations = {
    title: { am: 'የሰነዶች አስተዳደር', en: 'Document Management' },
    subtitle: { am: 'ሁሉንም ሰነዶች ይመልከቱ፣ ያስተዳድሩ እና ይቆጣጠሩ', en: 'View, manage and monitor all documents' },
    uploadDocument: { am: 'አዲስ ሰነድ ጫን', en: 'Upload New Document' },
    search: { am: 'ሰነዶችን ፈልግ...', en: 'Search documents...' },
    filters: { am: 'ማጣሪያዎች', en: 'Filters' },
    export: { am: 'ኤክስፖርት', en: 'Export' },
    refresh: { am: 'አድስ', en: 'Refresh' },
    
    table: {
      docId: { am: 'የሰነድ መለያ', en: 'Document ID' },
      title: { am: 'ርዕስ', en: 'Title' },
      category: { am: 'ምድብ', en: 'Category' },
      type: { am: 'አይነት', en: 'Type' },
      size: { am: 'መጠን', en: 'Size' },
      uploadedBy: { am: 'ላኪ', en: 'Uploaded By' },
      date: { am: 'ቀን', en: 'Date' },
      access: { am: 'መዳረሻ', en: 'Access' },
      status: { am: 'ሁኔታ', en: 'Status' },
      views: { am: 'እይታዎች', en: 'Views' },
      actions: { am: 'ድርጊቶች', en: 'Actions' }
    },

    categories: {
      all: { am: 'ሁሉም ምድቦች', en: 'All Categories' },
      historical_record: { am: 'ታሪካዊ መዝገብ', en: 'Historical Record' },
      government_notice: { am: 'የመንግስት ማስታወቂያ', en: 'Government Notice' },
      news: { am: 'ዜና', en: 'News' },
      biography: { am: 'የህይወት ታሪክ', en: 'Biography' },
      administrative: { am: 'አስተዳደራዊ', en: 'Administrative' },
      cultural_heritage: { am: 'ባህላዊ ቅርስ', en: 'Cultural Heritage' },
      form_template: { am: 'የፎርም አብነት', en: 'Form Template' }
    },

    documentTypes: {
      all: { am: 'ሁሉም አይነቶች', en: 'All Types' },
      pdf: { am: 'PDF', en: 'PDF' },
      image: { am: 'ምስል', en: 'Image' },
      word: { am: 'Word', en: 'Word' },
      excel: { am: 'Excel', en: 'Excel' },
      scanned: { am: 'ስካን', en: 'Scanned' },
      text: { am: 'ጽሁፍ', en: 'Text' }
    },

    accessLevels: {
      all: { am: 'ሁሉም መዳረሻ', en: 'All Access' },
      public: { am: 'ህዝባዊ', en: 'Public' },
      restricted: { am: 'የተገደበ', en: 'Restricted' },
      confidential: { am: 'ሚስጥራዊ', en: 'Confidential' }
    },

    status: {
      active: { am: 'ንቁ', en: 'Active' },
      archived: { am: 'ማህደር', en: 'Archived' }
    },

    actions: {
      view: { am: 'አሳይ', en: 'View' },
      edit: { am: 'አርትዕ', en: 'Edit' },
      delete: { am: 'ሰርዝ', en: 'Delete' },
      download: { am: 'አውርድ', en: 'Download' },
      share: { am: 'አጋራ', en: 'Share' },
      archive: { am: 'ወደ ማህደር', en: 'Archive' },
      restore: { am: 'መልስ', en: 'Restore' }
    },

    uploadDialog: {
      title: { am: 'አዲስ ሰነድ ጫን', en: 'Upload New Document' },
      description: { am: 'የሰነዱን መረጃዎች ይሙሉ እና ፋይል ይምረጡ', en: 'Fill in document information and select file' },
      dragDrop: { am: 'ፋይል ይጎትቱ እና ይጣሉ ወይም ይምረጡ', en: 'Drag and drop or click to select file' },
      fileTypes: { am: 'PDF, Word, Excel, ምስሎች', en: 'PDF, Word, Excel, Images' },
      maxSize: { am: 'ከፍተኛ መጠን: 10MB', en: 'Max size: 10MB' },
      cancel: { am: 'ሰርዝ', en: 'Cancel' },
      upload: { am: 'ጫን', en: 'Upload' }
    },

    toast: {
      documentUploaded: { am: 'ሰነድ በተሳካ ሁኔታ ተጭኗል', en: 'Document uploaded successfully' },
      documentUpdated: { am: 'ሰነድ በተሳካ ሁኔታ ተሻሽሏል', en: 'Document updated successfully' },
      documentDeleted: { am: 'ሰነድ በተሳካ ሁኔታ ተሰርዟል', en: 'Document deleted successfully' },
      error: { am: 'ስህተት ተከስቷል', en: 'An error occurred' }
    }
  };

  // Configure axios with auth token
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Fetch documents from API
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedType !== 'all' && { documentType: selectedType }),
        ...(selectedAccessLevel !== 'all' && { accessLevel: selectedAccessLevel }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/documents?${params}`);
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        setDocuments(data.documents || []);
        setTotalDocuments(data.pagination?.total || data.documents?.length || 0);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to fetch documents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load documents on mount and when filters change
  useEffect(() => {
    fetchDocuments();
  }, [currentPage, selectedCategory, selectedType, selectedAccessLevel, searchTerm]);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive'
      });
      return;
    }

    setUploadedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Auto-detect document type from file extension
    const extension = file.name.split('.').pop().toLowerCase();
    let docType = 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) docType = 'image';
    else if (['doc', 'docx'].includes(extension)) docType = 'word';
    else if (['xls', 'xlsx'].includes(extension)) docType = 'excel';
    else if (['txt', 'md'].includes(extension)) docType = 'text';
    
    setFormData(prev => ({
      ...prev,
      documentType: docType
    }));
  };

  // Upload document
  const handleUploadDocument = async () => {
    if (!uploadedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.titleAm) {
      toast({
        title: 'Title Required',
        description: 'Please enter an Amharic title',
        variant: 'destructive'
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', uploadedFile);
      formDataToSend.append('titleAm', formData.titleAm);
      formDataToSend.append('titleEn', formData.titleEn || '');
      formDataToSend.append('descriptionAm', formData.descriptionAm || '');
      formDataToSend.append('descriptionEn', formData.descriptionEn || '');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('documentType', formData.documentType);
      formDataToSend.append('language', formData.language);
      formDataToSend.append('accessLevel', formData.accessLevel);
      
      if (formData.keywords) {
        formDataToSend.append('keywords', formData.keywords.split(',').map(k => k.trim()));
      }

      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await api.post('/documents/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (response.data.status === 'success') {
        toast({
          title: t(translations.toast.documentUploaded),
          description: `${formData.titleAm} has been uploaded`,
        });
        
        setIsUploadDialogOpen(false);
        resetForm();
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to upload document',
        variant: 'destructive'
      });
    } finally {
      setUploadProgress(0);
    }
  };

  // Delete document
  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      const response = await api.delete(`/documents/${selectedDocument.id}`);

      if (response.data.status === 'success') {
        toast({
          title: t(translations.toast.documentDeleted),
          description: `${selectedDocument.titleAm} has been deleted`,
        });
        
        setIsDeleteDialogOpen(false);
        setSelectedDocument(null);
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  // Toggle archive status
  const handleToggleArchive = async (document) => {
    try {
      const response = await api.put(`/documents/${document.id}`, {
        archived: !document.archived
      });

      if (response.data.status === 'success') {
        toast({
          title: document.archived ? 'Document Restored' : 'Document Archived',
          description: `${document.titleAm} has been ${document.archived ? 'restored' : 'archived'}`,
        });
        
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to update document',
        variant: 'destructive'
      });
    }
  };

  // Download document
  const handleDownload = (document) => {
    // In a real app, you would trigger a download from the server
    window.open(`${api.defaults.baseURL}/documents/download/${document.id}`, '_blank');
    
    toast({
      title: 'Download Started',
      description: `${document.titleAm} is being downloaded`,
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Get document icon based on type
  const getDocumentIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'image': return <Image className="h-5 w-5 text-blue-500" />;
      case 'word': return <FileText className="h-5 w-5 text-blue-700" />;
      case 'excel': return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'scanned': return <FileArchive className="h-5 w-5 text-amber-600" />;
      case 'text': return <FileText className="h-5 w-5 text-gray-600" />;
      default: return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    switch(category) {
      case 'historical_record': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'government_notice': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'news': return 'bg-green-100 text-green-800 border-green-200';
      case 'biography': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'administrative': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cultural_heritage': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'form_template': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get access level badge
  const getAccessBadge = (level) => {
    switch(level) {
      case 'public':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><Globe className="h-3 w-3 mr-1" /> Public</Badge>;
      case 'restricted':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Users className="h-3 w-3 mr-1" /> Restricted</Badge>;
      case 'confidential':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><Lock className="h-3 w-3 mr-1" /> Confidential</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      titleAm: '',
      titleEn: '',
      descriptionAm: '',
      descriptionEn: '',
      category: 'administrative',
      documentType: 'pdf',
      language: 'am',
      keywords: '',
      accessLevel: 'restricted',
      file: null
    });
    setUploadedFile(null);
    setFilePreview(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-amharic">
            {t(translations.title)}
          </h1>
          <p className="text-muted-foreground">
            {t(translations.subtitle)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t(translations.refresh)}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t(translations.export)}
          </Button>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            {t(translations.uploadDocument)}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t(translations.search)}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t(translations.categories.all)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t(translations.categories.all)}</SelectItem>
                  <SelectItem value="historical_record">{t(translations.categories.historical_record)}</SelectItem>
                  <SelectItem value="government_notice">{t(translations.categories.government_notice)}</SelectItem>
                  <SelectItem value="news">{t(translations.categories.news)}</SelectItem>
                  <SelectItem value="biography">{t(translations.categories.biography)}</SelectItem>
                  <SelectItem value="administrative">{t(translations.categories.administrative)}</SelectItem>
                  <SelectItem value="cultural_heritage">{t(translations.categories.cultural_heritage)}</SelectItem>
                  <SelectItem value="form_template">{t(translations.categories.form_template)}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t(translations.documentTypes.all)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t(translations.documentTypes.all)}</SelectItem>
                  <SelectItem value="pdf">{t(translations.documentTypes.pdf)}</SelectItem>
                  <SelectItem value="image">{t(translations.documentTypes.image)}</SelectItem>
                  <SelectItem value="word">{t(translations.documentTypes.word)}</SelectItem>
                  <SelectItem value="excel">{t(translations.documentTypes.excel)}</SelectItem>
                  <SelectItem value="scanned">{t(translations.documentTypes.scanned)}</SelectItem>
                  <SelectItem value="text">{t(translations.documentTypes.text)}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t(translations.accessLevels.all)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t(translations.accessLevels.all)}</SelectItem>
                  <SelectItem value="public">{t(translations.accessLevels.public)}</SelectItem>
                  <SelectItem value="restricted">{t(translations.accessLevels.restricted)}</SelectItem>
                  <SelectItem value="confidential">{t(translations.accessLevels.confidential)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(translations.table.docId)}</TableHead>
                <TableHead>{t(translations.table.title)}</TableHead>
                <TableHead>{t(translations.table.category)}</TableHead>
                <TableHead>{t(translations.table.type)}</TableHead>
                <TableHead>{t(translations.table.size)}</TableHead>
                <TableHead>{t(translations.table.date)}</TableHead>
                <TableHead>{t(translations.table.access)}</TableHead>
                <TableHead>{t(translations.table.views)}</TableHead>
                <TableHead className="text-right">{t(translations.table.actions)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <div className="flex justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No documents found</p>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id} className="group">
                    <TableCell className="font-mono text-xs">{doc.docId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getDocumentIcon(doc.documentType)}
                        <div>
                          <p className="font-medium">{doc.titleAm}</p>
                          {doc.titleEn && (
                            <p className="text-xs text-muted-foreground">{doc.titleEn}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getCategoryColor(doc.category)} border`}>
                        {t(translations.categories[doc.category] || doc.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">
                        {doc.documentType}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(doc.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>{getAccessBadge(doc.accessLevel)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{doc.views || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setIsViewDialogOpen(true);
                          }}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleDownload(doc)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedDocument(doc);
                              // Open edit dialog
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleArchive(doc)}>
                              {doc.archived ? (
                                <>
                                  <ArchiveIcon className="h-4 w-4 mr-2" />
                                  Restore
                                </>
                              ) : (
                                <>
                                  <ArchiveIcon className="h-4 w-4 mr-2" />
                                  Archive
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedDocument(doc);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalDocuments > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalDocuments)} of {totalDocuments} documents
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Document Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-amharic flex items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              {t(translations.uploadDialog.title)}
            </DialogTitle>
            <DialogDescription>
              {t(translations.uploadDialog.description)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors group">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.txt"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {uploadedFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      {getDocumentIcon(formData.documentType)}
                      <div className="text-left">
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                    </div>
                    {filePreview && (
                      <img src={filePreview} alt="Preview" className="max-h-32 mx-auto rounded border" />
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto group-hover:bg-primary/20 transition-colors">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{t(translations.uploadDialog.dragDrop)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t(translations.uploadDialog.fileTypes)}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t(translations.uploadDialog.maxSize)}
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Document Details Form */}
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Title (Amharic) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.titleAm}
                    onChange={(e) => setFormData({...formData, titleAm: e.target.value})}
                    placeholder="ሰነድ ርዕስ"
                    className="font-amharic"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => setFormData({...formData, titleEn: e.target.value})}
                    placeholder="Document title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Description (Amharic)</Label>
                  <Textarea
                    value={formData.descriptionAm}
                    onChange={(e) => setFormData({...formData, descriptionAm: e.target.value})}
                    placeholder="የሰነዱ መግለጫ"
                    className="font-amharic"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({...formData, descriptionEn: e.target.value})}
                    placeholder="Document description"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData({...formData, category: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="historical_record">Historical Record</SelectItem>
                      <SelectItem value="government_notice">Government Notice</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="biography">Biography</SelectItem>
                      <SelectItem value="administrative">Administrative</SelectItem>
                      <SelectItem value="cultural_heritage">Cultural Heritage</SelectItem>
                      <SelectItem value="form_template">Form Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(v) => setFormData({...formData, language: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="am">አማርኛ</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Access Level</Label>
                  <Select 
                    value={formData.accessLevel} 
                    onValueChange={(v) => setFormData({...formData, accessLevel: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Keywords (comma separated)</Label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  placeholder="report, annual, 2024, budget"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsUploadDialogOpen(false);
              resetForm();
            }}>
              {t(translations.uploadDialog.cancel)}
            </Button>
            <Button 
              onClick={handleUploadDocument}
              disabled={!uploadedFile || !formData.titleAm || uploadProgress > 0}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {t(translations.uploadDialog.upload)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getDocumentIcon(selectedDocument.documentType)}
                  <span>{selectedDocument.titleAm}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Document ID</p>
                    <p className="font-mono">{selectedDocument.docId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uploaded By</p>
                    <p>{selectedDocument.Uploader?.fullNameAm || 'Unknown'}</p>
                  </div>
                </div>

                {selectedDocument.titleEn && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Title (English)</p>
                    <p>{selectedDocument.titleEn}</p>
                  </div>
                )}

                {selectedDocument.descriptionAm && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description (Amharic)</p>
                    <p className="font-amharic">{selectedDocument.descriptionAm}</p>
                  </div>
                )}

                {selectedDocument.descriptionEn && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description (English)</p>
                    <p>{selectedDocument.descriptionEn}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <Badge className={getCategoryColor(selectedDocument.category)}>
                      {t(translations.categories[selectedDocument.category])}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <Badge variant="outline" className="uppercase">
                      {selectedDocument.documentType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Size</p>
                    <p>{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Access Level</p>
                    {getAccessBadge(selectedDocument.accessLevel)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Views</p>
                    <p>{selectedDocument.views || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Version</p>
                    <p>{selectedDocument.version || 1}</p>
                  </div>
                </div>

                {selectedDocument.keywords && selectedDocument.keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.keywords.map((keyword, i) => (
                        <Badge key={i} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleDownload(selectedDocument)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600">
                  This will permanently delete "{selectedDocument.titleAm}"
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManagement;