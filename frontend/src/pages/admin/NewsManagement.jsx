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
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
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

      {/* Create News Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-amharic flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              {t(translations.createDialog.title)}
            </DialogTitle>
            <DialogDescription>
              {t(translations.createDialog.description)}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="amharic" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="amharic">አማርኛ</TabsTrigger>
              <TabsTrigger value="english">English</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
              {/* Amharic Tab */}
              <TabsContent value="amharic" className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    {t(translations.createDialog.headlineAm)}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.headlineAm}
                    onChange={(e) => setFormData({...formData, headlineAm: e.target.value})}
                    placeholder="የዜና አርዕስት"
                    className="font-amharic"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    {t(translations.createDialog.contentAm)}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="border rounded-md">
                    <ReactQuill
                      theme="snow"
                      value={formData.contentAm}
                      onChange={(content) => setFormData({...formData, contentAm: content})}
                      modules={quillModules}
                      className="h-64"
                      placeholder="የዜና ይዘት..."
                    />
                  </div>
                </div>
              </TabsContent>

              {/* English Tab */}
              <TabsContent value="english" className="space-y-4">
                <div className="space-y-2">
                  <Label>{t(translations.createDialog.headlineEn)}</Label>
                  <Input
                    value={formData.headlineEn}
                    onChange={(e) => setFormData({...formData, headlineEn: e.target.value})}
                    placeholder="News headline"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t(translations.createDialog.contentEn)}</Label>
                  <div className="border rounded-md">
                    <ReactQuill
                      theme="snow"
                      value={formData.contentEn}
                      onChange={(content) => setFormData({...formData, contentEn: content})}
                      modules={quillModules}
                      className="h-64"
                      placeholder="News content..."
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>{t(translations.createDialog.category)}</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData({...formData, category: v})}
                  >
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
                  <Label>{t(translations.createDialog.featuredImage)}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('image-upload').click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({...formData, featuredImage: null});
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Tags */}
              <div className="space-y-2">
                <Label>{t(translations.createDialog.tags)}</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.tagInput}
                    onChange={(e) => setFormData({...formData, tagInput: e.target.value})}
                    placeholder="Enter tag and press Add"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    {t(translations.createDialog.addTag)}
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Hash className="h-3 w-3" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
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
            </div>
          </Tabs>

          <DialogFooter className="flex-shrink-0 gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              resetForm();
            }}>
              {t(translations.createDialog.cancel)}
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleCreateNews(false)}
              disabled={!formData.headlineAm || !formData.contentAm}
            >
              <Clock className="h-4 w-4 mr-2" />
              {t(translations.createDialog.saveDraft)}
            </Button>
            <Button 
              onClick={() => handleCreateNews(true)}
              disabled={!formData.headlineAm || !formData.contentAm}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
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