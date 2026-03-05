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
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Newspaper, Plus, Edit, Trash2, Eye, EyeOff, Calendar, Tag, 
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight, MoreVertical,
  Globe, Users, Clock, CheckCircle, XCircle, AlertCircle, X,
  Upload, Image, Link2, Hash, Star, Copy, Send, Archive,
  TrendingUp, MessageCircle, Share2, Download
} from 'lucide-react';

// Toast setup
import { useToast } from '../../components/ui/use-toast';

const NewsManagement = () => {
  const { language, t } = useLanguage();
  const { token, user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNews, setTotalNews] = useState(0);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    headlineAm: '',
    headlineEn: '',
    contentAm: '',
    contentEn: '',
    category: 'general',
    featuredImage: null,
    isPublished: false,
    tags: [],
    tagInput: ''
  });

  // Image preview
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const itemsPerPage = 10;

  // Quill editor modules
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  // Translations
  const translations = {
    title: { am: 'የዜና አስተዳደር', en: 'News Management' },
    subtitle: { am: 'ዜናዎችን ይፍጠሩ፣ ያስተዳድሩ እና ያትሙ', en: 'Create, manage and publish news articles' },
    createNews: { am: 'አዲስ ዜና ፍጠር', en: 'Create News' },
    search: { am: 'ዜናዎችን ፈልግ...', en: 'Search news...' },
    filters: { am: 'ማጣሪያዎች', en: 'Filters' },
    refresh: { am: 'አድስ', en: 'Refresh' },
    
    table: {
      title: { am: 'ርዕስ', en: 'Title' },
      category: { am: 'ምድብ', en: 'Category' },
      author: { am: 'ደራሲ', en: 'Author' },
      date: { am: 'ቀን', en: 'Date' },
      status: { am: 'ሁኔታ', en: 'Status' },
      views: { am: 'እይታዎች', en: 'Views' },
      actions: { am: 'ድርጊቶች', en: 'Actions' }
    },

    categories: {
      all: { am: 'ሁሉም ምድቦች', en: 'All Categories' },
      announcement: { am: 'ማስታወቂያ', en: 'Announcement' },
      event: { am: 'ክስተት', en: 'Event' },
      achievement: { am: 'ስኬት', en: 'Achievement' },
      general: { am: 'አጠቃላይ', en: 'General' }
    },

    status: {
      all: { am: 'ሁሉም ሁኔታ', en: 'All Status' },
      published: { am: 'የታተመ', en: 'Published' },
      draft: { am: 'ረቂቅ', en: 'Draft' }
    },

    actions: {
      view: { am: 'አሳይ', en: 'View' },
      edit: { am: 'አርትዕ', en: 'Edit' },
      delete: { am: 'ሰርዝ', en: 'Delete' },
      publish: { am: 'አትም', en: 'Publish' },
      unpublish: { am: 'ከህትመት አውርድ', en: 'Unpublish' },
      preview: { am: 'ቅድመ እይታ', en: 'Preview' }
    },

    createDialog: {
      title: { am: 'አዲስ ዜና ፍጠር', en: 'Create New News' },
      description: { am: 'የዜናውን ዝርዝሮች ይሙሉ', en: 'Fill in the news details' },
      headlineAm: { am: 'አርዕስት (አማርኛ)', en: 'Headline (Amharic)' },
      headlineEn: { am: 'አርዕስት (እንግሊዝኛ)', en: 'Headline (English)' },
      contentAm: { am: 'ይዘት (አማርኛ)', en: 'Content (Amharic)' },
      contentEn: { am: 'ይዘት (እንግሊዝኛ)', en: 'Content (English)' },
      category: { am: 'ምድብ', en: 'Category' },
      featuredImage: { am: 'ዋና ምስል', en: 'Featured Image' },
      tags: { am: 'መለያዎች', en: 'Tags' },
      addTag: { am: 'መለያ ጨምር', en: 'Add Tag' },
      saveDraft: { am: 'ረቂቅ አስቀምጥ', en: 'Save Draft' },
      publish: { am: 'አትም', en: 'Publish' },
      cancel: { am: 'ሰርዝ', en: 'Cancel' }
    },

    toast: {
      newsCreated: { am: 'ዜና በተሳካ ሁኔታ ተፈጥሯል', en: 'News created successfully' },
      newsUpdated: { am: 'ዜና በተሳካ ሁኔታ ተሻሽሏል', en: 'News updated successfully' },
      newsDeleted: { am: 'ዜና በተሳካ ሁኔታ ተሰርዟል', en: 'News deleted successfully' },
      newsPublished: { am: 'ዜና በተሳካ ሁኔታ ታትሟል', en: 'News published successfully' },
      error: { am: 'ስህተት ተከስቷል', en: 'An error occurred' }
    }
  };

// Configure axios with auth token
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

  // Fetch news from API
  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedStatus !== 'all' && { 
          isPublished: selectedStatus === 'published' ? 'true' : 'false' 
        }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/news?${params}`);
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        setNews(data.news || []);
        setTotalNews(data.pagination?.total || data.news?.length || 0);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to fetch news',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load news on mount and when filters change
  useEffect(() => {
    fetchNews();
  }, [currentPage, selectedCategory, selectedStatus, searchTerm]);

  // Handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Maximum image size is 5MB',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    setFormData({ ...formData, featuredImage: file });
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Add tag
  const handleAddTag = () => {
    if (!formData.tagInput.trim()) return;
    
    setFormData({
      ...formData,
      tags: [...formData.tags, formData.tagInput.trim()],
      tagInput: ''
    });
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Create news
  const handleCreateNews = async (publish = false) => {
    if (!formData.headlineAm || !formData.contentAm) {
      toast({
        title: 'Validation Error',
        description: 'Amharic headline and content are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('headlineAm', formData.headlineAm);
      formDataToSend.append('headlineEn', formData.headlineEn || '');
      formDataToSend.append('contentAm', formData.contentAm);
      formDataToSend.append('contentEn', formData.contentEn || '');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isPublished', publish);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      
      if (formData.featuredImage) {
        formDataToSend.append('featuredImage', formData.featuredImage);
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

      const response = await api.post('/news', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (response.data.status === 'success') {
        toast({
          title: publish ? t(translations.toast.newsPublished) : t(translations.toast.newsCreated),
          description: `${formData.headlineAm} has been ${publish ? 'published' : 'created'}`,
        });
        
        setIsCreateDialogOpen(false);
        resetForm();
        fetchNews();
      }
    } catch (error) {
      console.error('Error creating news:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to create news',
        variant: 'destructive'
      });
    } finally {
      setUploadProgress(0);
    }
  };

  // Update news
  const handleUpdateNews = async () => {
    if (!selectedNews) return;

    try {
      const updateData = {
        headlineAm: formData.headlineAm,
        headlineEn: formData.headlineEn,
        contentAm: formData.contentAm,
        contentEn: formData.contentEn,
        category: formData.category,
        tags: formData.tags
      };

      const response = await api.put(`/news/${selectedNews.id}`, updateData);

      if (response.data.status === 'success') {
        toast({
          title: t(translations.toast.newsUpdated),
          description: `${formData.headlineAm} has been updated`,
        });
        
        setIsEditDialogOpen(false);
        resetForm();
        fetchNews();
      }
    } catch (error) {
      console.error('Error updating news:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to update news',
        variant: 'destructive'
      });
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (newsItem) => {
    try {
      const response = await api.put(`/news/${newsItem.id}`, {
        isPublished: !newsItem.isPublished,
        publishedAt: !newsItem.isPublished ? new Date() : null
      });

      if (response.data.status === 'success') {
        toast({
          title: newsItem.isPublished ? 'News Unpublished' : 'News Published',
          description: `${newsItem.headlineAm} has been ${newsItem.isPublished ? 'unpublished' : 'published'}`,
        });
        
        fetchNews();
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  // Delete news
  const handleDeleteNews = async () => {
    if (!selectedNews) return;

    try {
      const response = await api.delete(`/news/${selectedNews.id}`);

      if (response.data.status === 'success') {
        toast({
          title: t(translations.toast.newsDeleted),
          description: `${selectedNews.headlineAm} has been deleted`,
        });
        
        setIsDeleteDialogOpen(false);
        setSelectedNews(null);
        fetchNews();
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to delete news',
        variant: 'destructive'
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  // Get category badge color
  const getCategoryColor = (category) => {
    switch(category) {
      case 'announcement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'event': return 'bg-green-100 text-green-800 border-green-200';
      case 'achievement': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'general': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      headlineAm: '',
      headlineEn: '',
      contentAm: '',
      contentEn: '',
      category: 'general',
      featuredImage: null,
      isPublished: false,
      tags: [],
      tagInput: ''
    });
    setImagePreview(null);
    setUploadProgress(0);
  };

  // Open edit dialog
  const openEditDialog = (newsItem) => {
    setSelectedNews(newsItem);
    setFormData({
      headlineAm: newsItem.headlineAm,
      headlineEn: newsItem.headlineEn || '',
      contentAm: newsItem.contentAm,
      contentEn: newsItem.contentEn || '',
      category: newsItem.category,
      featuredImage: null,
      isPublished: newsItem.isPublished,
      tags: newsItem.tags || [],
      tagInput: ''
    });
    setImagePreview(newsItem.featuredImage || null);
    setIsEditDialogOpen(true);
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
          <Button variant="outline" size="sm" onClick={fetchNews} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t(translations.refresh)}
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t(translations.createNews)}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total News</p>
                <p className="text-2xl font-bold">{totalNews}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Newspaper className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">
                  {news.filter(n => n.isPublished).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold">
                  {news.filter(n => !n.isPublished).length}
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {news.reduce((sum, n) => sum + (n.views || 0), 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <SelectItem value="announcement">{t(translations.categories.announcement)}</SelectItem>
                  <SelectItem value="event">{t(translations.categories.event)}</SelectItem>
                  <SelectItem value="achievement">{t(translations.categories.achievement)}</SelectItem>
                  <SelectItem value="general">{t(translations.categories.general)}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t(translations.status.all)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t(translations.status.all)}</SelectItem>
                  <SelectItem value="published">{t(translations.status.published)}</SelectItem>
                  <SelectItem value="draft">{t(translations.status.draft)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">{t(translations.table.title)}</TableHead>
                <TableHead>{t(translations.table.category)}</TableHead>
                <TableHead>{t(translations.table.author)}</TableHead>
                <TableHead>{t(translations.table.date)}</TableHead>
                <TableHead>{t(translations.table.status)}</TableHead>
                <TableHead className="text-center">{t(translations.table.views)}</TableHead>
                <TableHead className="text-right">{t(translations.table.actions)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="flex justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No news articles found</p>
                  </TableCell>
                </TableRow>
              ) : (
                news.map((item) => (
                  <TableRow key={item.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.featuredImage ? (
                          <img 
                            src={item.featuredImage} 
                            alt={item.headlineAm}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                            <Newspaper className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{item.headlineAm}</p>
                          {item.headlineEn && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.headlineEn}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(item.category)}>
                        {t(translations.categories[item.category])}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {item.Author?.fullNameAm?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{item.Author?.fullNameAm || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(item.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.isPublished ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{item.views || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedNews(item);
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
                          onClick={() => openEditDialog(item)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${
                            item.isPublished 
                              ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' 
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}
                          onClick={() => handleTogglePublish(item)}
                          title={item.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {item.isPublished ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
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
                              setSelectedNews(item);
                              // Preview functionality
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
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
                                setSelectedNews(item);
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
      {totalNews > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalNews)} of {totalNews} news
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

{/* Create News Dialog - Enhanced Attractive Version */}
<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
  <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col p-0">
    {/* Custom Header with Gradient */}
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex-shrink-0">
      <DialogHeader>
        <DialogTitle className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Newspaper className="h-8 w-8 text-white" />
          </div>
          <span className="font-amharic">{t(translations.createDialog.title)}</span>
        </DialogTitle>
        <DialogDescription className="text-blue-100 text-lg mt-2">
          {t(translations.createDialog.description)}
        </DialogDescription>
      </DialogHeader>
    </div>

    {/* Animated Tabs */}
    <Tabs defaultValue="amharic" className="flex-1 overflow-hidden flex flex-col px-6 pt-4">
      <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-xl">
        <TabsTrigger 
          value="amharic" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg py-3 transition-all duration-300 font-amharic text-lg"
        >
          <span className="mr-2">🇪🇹</span> አማርኛ
        </TabsTrigger>
        <TabsTrigger 
          value="english" 
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white rounded-lg py-3 transition-all duration-300 text-lg"
        >
          <span className="mr-2">🇬🇧</span> English
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto pr-2 mt-6 space-y-6 pb-6">
        {/* Amharic Tab */}
        <TabsContent value="amharic" className="space-y-6 mt-0">
          {/* Headline Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
            <Label className="text-blue-800 font-bold text-lg flex items-center gap-2 mb-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Tag className="h-4 w-4 text-white" />
              </div>
              {t(translations.createDialog.headlineAm)}
              <span className="text-red-500 text-sm ml-2">*</span>
            </Label>
            <Input
              value={formData.headlineAm}
              onChange={(e) => setFormData({...formData, headlineAm: e.target.value})}
              placeholder="የዜና አርዕስት ይጻፉ..."
              className="font-amharic text-lg border-2 border-blue-200 focus:border-blue-500 rounded-xl p-4 h-14 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Content Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200 shadow-sm">
            <Label className="text-purple-800 font-bold text-lg flex items-center gap-2 mb-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <Newspaper className="h-4 w-4 text-white" />
              </div>
              {t(translations.createDialog.contentAm)}
              <span className="text-red-500 text-sm ml-2">*</span>
            </Label>
            <div className="border-2 border-purple-200 rounded-xl overflow-hidden bg-white">
              <ReactQuill
                theme="snow"
                value={formData.contentAm}
                onChange={(content) => setFormData({...formData, contentAm: content})}
                modules={quillModules}
                className="h-80"
                placeholder="የዜና ይዘት እዚህ ይጻፉ..."
              />
            </div>
          </div>
        </TabsContent>

        {/* English Tab */}
        <TabsContent value="english" className="space-y-6 mt-0">
          {/* Headline Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
            <Label className="text-green-800 font-bold text-lg flex items-center gap-2 mb-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Tag className="h-4 w-4 text-white" />
              </div>
              {t(translations.createDialog.headlineEn)}
            </Label>
            <Input
              value={formData.headlineEn}
              onChange={(e) => setFormData({...formData, headlineEn: e.target.value})}
              placeholder="Enter news headline..."
              className="text-lg border-2 border-green-200 focus:border-green-500 rounded-xl p-4 h-14 bg-white/80 backdrop-blur-sm"
            />
          </div>

          {/* Content Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 shadow-sm">
            <Label className="text-amber-800 font-bold text-lg flex items-center gap-2 mb-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Newspaper className="h-4 w-4 text-white" />
              </div>
              {t(translations.createDialog.contentEn)}
            </Label>
            <div className="border-2 border-amber-200 rounded-xl overflow-hidden bg-white">
              <ReactQuill
                theme="snow"
                value={formData.contentEn}
                onChange={(content) => setFormData({...formData, contentEn: content})}
                modules={quillModules}
                className="h-80"
                placeholder="Write news content here..."
              />
            </div>
          </div>
        </TabsContent>

        {/* Common Fields - Beautiful Grid */}
        <div className="grid grid-cols-3 gap-6 pt-6">
          {/* Category Selection */}
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-xl border border-cyan-200 shadow-sm">
            <Label className="text-cyan-800 font-bold text-md flex items-center gap-2 mb-3">
              <div className="bg-cyan-500 p-2 rounded-lg">
                <Tag className="h-4 w-4 text-white" />
              </div>
              {t(translations.createDialog.category)}
            </Label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData({...formData, category: v})}
            >
              <SelectTrigger className="border-2 border-cyan-200 rounded-xl p-6 bg-white/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">📢 Announcement</SelectItem>
                <SelectItem value="event">🎉 Event</SelectItem>
                <SelectItem value="achievement">🏆 Achievement</SelectItem>
                <SelectItem value="general">📰 General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured Image Upload */}
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-xl border border-rose-200 shadow-sm">
            <Label className="text-rose-800 font-bold text-md flex items-center gap-2 mb-3">
              <div className="bg-rose-500 p-2 rounded-lg">
                <Image className="h-4 w-4 text-white" />
              </div>
              {t(translations.createDialog.featuredImage)}
            </Label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload-enhanced"
              />
              <label
                htmlFor="image-upload-enhanced"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-rose-200 rounded-xl cursor-pointer hover:border-rose-500 hover:bg-rose-50/50 transition-all duration-300 group"
              >
                <Upload className="h-8 w-8 text-rose-400 group-hover:text-rose-500 group-hover:scale-110 transition-all duration-300" />
                <span className="text-sm text-rose-600 mt-2">Click to upload</span>
              </label>
            </div>
          </div>

          {/* Image Preview */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-200 shadow-sm">
            <Label className="text-violet-800 font-bold text-md flex items-center gap-2 mb-3">
              <div className="bg-violet-500 p-2 rounded-lg">
                <Eye className="h-4 w-4 text-white" />
              </div>
              Preview
            </Label>
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-violet-200 group">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({...formData, featuredImage: null});
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center border-2 border-dashed border-violet-200">
                <span className="text-violet-400">No image selected</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200 shadow-sm">
          <Label className="text-indigo-800 font-bold text-lg flex items-center gap-2 mb-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Hash className="h-4 w-4 text-white" />
            </div>
            {t(translations.createDialog.tags)}
          </Label>
          <div className="flex gap-3">
            <Input
              value={formData.tagInput}
              onChange={(e) => setFormData({...formData, tagInput: e.target.value})}
              placeholder="Enter a tag (e.g., technology, education, health)"
              className="flex-1 border-2 border-indigo-200 focus:border-indigo-500 rounded-xl p-4 h-12"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button 
              onClick={handleAddTag} 
              variant="outline"
              className="border-2 border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-xl px-6 transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t(translations.createDialog.addTag)}
            </Button>
          </div>
          
          {/* Tags Display */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 p-4 bg-white/50 rounded-xl border border-indigo-100">
              {formData.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-red-200 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="flex justify-between text-sm text-green-700 mb-2">
              <span className="font-medium">📤 Uploading...</span>
              <span className="font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300 relative"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Tabs>

    {/* Action Buttons - Glassmorphism Style */}
    <DialogFooter className="flex-shrink-0 gap-3 mt-4 pt-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm p-6">
      <Button 
        variant="outline" 
        onClick={() => {
          setIsCreateDialogOpen(false);
          resetForm();
        }}
        className="border-2 border-gray-300 hover:border-gray-400 rounded-xl px-8 py-6 text-gray-700 font-medium transition-all duration-300 hover:shadow-md"
      >
        <X className="h-5 w-5 mr-2" />
        {t(translations.createDialog.cancel)}
      </Button>
      
      <Button 
        variant="outline"
        onClick={() => handleCreateNews(false)}
        disabled={!formData.headlineAm || !formData.contentAm}
        className="border-2 border-amber-300 hover:border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl px-8 py-6 text-amber-700 font-medium transition-all duration-300 hover:shadow-md disabled:opacity-50"
      >
        <Clock className="h-5 w-5 mr-2" />
        {t(translations.createDialog.saveDraft)}
      </Button>
      
      <Button 
        onClick={() => handleCreateNews(true)}
        disabled={!formData.headlineAm || !formData.contentAm}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl px-10 py-6 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
      >
        <Send className="h-5 w-5 mr-2" />
        {t(translations.createDialog.publish)}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      {/* View News Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedNews && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-amharic">
                  {selectedNews.headlineAm}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedNews.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {selectedNews.views || 0} views
                  </span>
                  <Badge className={getCategoryColor(selectedNews.category)}>
                    {t(translations.categories[selectedNews.category])}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              {selectedNews.featuredImage && (
                <img 
                  src={selectedNews.featuredImage} 
                  alt={selectedNews.headlineAm}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <Tabs defaultValue="amharic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="amharic">አማርኛ</TabsTrigger>
                  <TabsTrigger value="english">English</TabsTrigger>
                </TabsList>

                <TabsContent value="amharic" className="mt-4">
                  <div className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: selectedNews.contentAm }} 
                  />
                </TabsContent>

                <TabsContent value="english" className="mt-4">
                  {selectedNews.contentEn ? (
                    <div className="prose max-w-none" 
                      dangerouslySetInnerHTML={{ __html: selectedNews.contentEn }} 
                    />
                  ) : (
                    <p className="text-muted-foreground">No English content available</p>
                  )}
                </TabsContent>
              </Tabs>

              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNews.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        <Hash className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  openEditDialog(selectedNews);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
{/* Edit News Dialog */}
<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
    <DialogHeader>
      <DialogTitle className="text-2xl font-amharic">Edit News Article</DialogTitle>
      <DialogDescription>
        Update the news article information
      </DialogDescription>
    </DialogHeader>

    <Tabs defaultValue="amharic" className="flex-1 overflow-hidden flex flex-col">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="amharic">አማርኛ</TabsTrigger>
        <TabsTrigger value="english">English</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
        <TabsContent value="amharic" className="space-y-4">
          <div className="space-y-2">
            <Label>Headline (Amharic)</Label>
            <Input
              value={formData.headlineAm}
              onChange={(e) => setFormData({...formData, headlineAm: e.target.value})}
              className="font-amharic"
            />
          </div>
          <div className="space-y-2">
            <Label>Content (Amharic)</Label>
            <div className="border rounded-md">
              <ReactQuill
                theme="snow"
                value={formData.contentAm}
                onChange={(content) => setFormData({...formData, contentAm: content})}
                modules={quillModules}
                className="h-64"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="english" className="space-y-4">
          <div className="space-y-2">
            <Label>Headline (English)</Label>
            <Input
              value={formData.headlineEn}
              onChange={(e) => setFormData({...formData, headlineEn: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>Content (English)</Label>
            <div className="border rounded-md">
              <ReactQuill
                theme="snow"
                value={formData.contentEn}
                onChange={(content) => setFormData({...formData, contentEn: content})}
                modules={quillModules}
                className="h-64"
              />
            </div>
          </div>
        </TabsContent>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={formData.tagInput}
                onChange={(e) => setFormData({...formData, tagInput: e.target.value})}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} variant="outline">Add</Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Tabs>

    <DialogFooter className="mt-4 pt-4 border-t">
      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleUpdateNews}>
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete News</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this news article? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedNews && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600">
                  This will permanently delete "{selectedNews.headlineAm}"
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNews}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsManagement;