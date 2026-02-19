import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { 
  Search, Plus, MoreVertical, Edit, Trash2, UserCog, 
  Shield, Mail, Phone, Calendar, CheckCircle, XCircle,
  RefreshCw, Download, Filter, ChevronLeft, ChevronRight,
  Users, UserPlus, Lock, Unlock, Key, Eye, Upload,
  FileSpreadsheet, AlertCircle, X
} from 'lucide-react';

// Toast setup
import { useToast } from '../../components/ui/use-toast';

const UserManagement = () => {
  const { language, t } = useLanguage();
  const { token } = useAuth();
  const { toast } = useToast();
  
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Dialog states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    fullNameAm: '',
    fullNameEn: '',
    email: '',
    phone: '',
    department: 'Administration',
    role: 'viewer',
    password: '',
    confirmPassword: ''
  });

  // Bulk upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const itemsPerPage = 10;

  // Translations
  const translations = {
    title: { am: 'የተጠቃሚዎች አስተዳደር', en: 'User Management' },
    subtitle: { am: 'ሁሉንም ተጠቃሚዎች ይመልከቱ፣ ያስተዳድሩ እና ይቆጣጠሩ', en: 'View, manage and monitor all users' },
    addUser: { am: 'አዲስ ተጠቃሚ ጨምር', en: 'Add New User' },
    search: { am: 'ተጠቃሚዎችን ፈልግ...', en: 'Search users...' },
    filters: { am: 'ማጣሪያዎች', en: 'Filters' },
    export: { am: 'ኤክስፖርት', en: 'Export' },
    refresh: { am: 'አድስ', en: 'Refresh' },
    
    table: {
      employeeId: { am: 'ሰራተኛ መለያ', en: 'Employee ID' },
      name: { am: 'ስም', en: 'Name' },
      contact: { am: 'መገኛ', en: 'Contact' },
      department: { am: 'ክፍል', en: 'Department' },
      role: { am: 'ሚና', en: 'Role' },
      status: { am: 'ሁኔታ', en: 'Status' },
      lastLogin: { am: 'የመጨረሻ መግቢያ', en: 'Last Login' },
      actions: { am: 'ድርጊቶች', en: 'Actions' }
    },

    departments: {
      all: { am: 'ሁሉም ክፍሎች', en: 'All Departments' },
      Communication: { am: 'ኮሙኒኬሽን', en: 'Communication' },
      Archives: { am: 'አርክይቭ', en: 'Archives' },
      Administration: { am: 'አስተዳደር', en: 'Administration' },
      IT: { am: 'አይቲ', en: 'IT' }
    },

    roles: {
      all: { am: 'ሁሉም ሚናዎች', en: 'All Roles' },
      super_admin: { am: 'ሱፐር አስተዳዳሪ', en: 'Super Admin' },
      admin: { am: 'አስተዳዳሪ', en: 'Admin' },
      editor: { am: 'አርታኢ', en: 'Editor' },
      viewer: { am: 'ተመልካች', en: 'Viewer' }
    },

    status: {
      all: { am: 'ሁሉም ሁኔታ', en: 'All Status' },
      active: { am: 'ንቁ', en: 'Active' },
      inactive: { am: 'ንቁ ያልሆነ', en: 'Inactive' }
    },

    actions: {
      edit: { am: 'አርትዕ', en: 'Edit' },
      delete: { am: 'ሰርዝ', en: 'Delete' },
      activate: { am: 'አንቃ', en: 'Activate' },
      deactivate: { am: 'አጥፋ', en: 'Deactivate' },
      resetPassword: { am: 'የይለፍ ቃል ቀይር', en: 'Reset Password' }
    },

    addUserDialog: {
      title: { am: 'አዲስ ተጠቃሚ ይመዝግቡ', en: 'Register New User' },
      description: { am: 'የአዲሱን ተጠቃሚ መረጃዎች ይሙሉ', en: 'Fill in the new user information' },
      employeeId: { am: 'ሰራተኛ መለያ', en: 'Employee ID' },
      fullNameAm: { am: 'ሙሉ ስም (አማርኛ)', en: 'Full Name (Amharic)' },
      fullNameEn: { am: 'ሙሉ ስም (እንግሊዝኛ)', en: 'Full Name (English)' },
      email: { am: 'ኢሜል', en: 'Email' },
      phone: { am: 'ስልክ ቁጥር', en: 'Phone Number' },
      department: { am: 'ክፍል', en: 'Department' },
      role: { am: 'ሚና', en: 'Role' },
      password: { am: 'የይለፍ ቃል', en: 'Password' },
      confirmPassword: { am: 'የይለፍ ቃል አረጋግጥ', en: 'Confirm Password' },
      cancel: { am: 'ሰርዝ', en: 'Cancel' },
      create: { am: 'ፍጠር', en: 'Create' }
    },

    deleteDialog: {
      title: { am: 'ተጠቃሚ ሰርዝ', en: 'Delete User' },
      description: { am: 'እርግጠኛ ነዎት ይህን ተጠቃሚ መሰረዝ ይፈልጋሉ?', en: 'Are you sure you want to delete this user?' },
      warning: { am: 'ይህ እርምጃ ሊቀለበስ አይችልም', en: 'This action cannot be undone' },
      cancel: { am: 'አይ, ሰርዝ', en: 'No, Cancel' },
      confirm: { am: 'አዎ, ሰርዝ', en: 'Yes, Delete' }
    },

    toast: {
      userAdded: { am: 'ተጠቃሚ በተሳካ ሁኔታ ተመዝግቧል', en: 'User added successfully' },
      userUpdated: { am: 'ተጠቃሚ በተሳካ ሁኔታ ተሻሽሏል', en: 'User updated successfully' },
      userDeleted: { am: 'ተጠቃሚ በተሳካ ሁኔታ ተሰርዟል', en: 'User deleted successfully' },
      statusChanged: { am: 'የተጠቃሚ ሁኔታ ተቀይሯል', en: 'User status changed successfully' },
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

  // Fetch users from API
// Fetch users from API
const fetchUsers = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit: itemsPerPage,
      ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
      ...(selectedRole !== 'all' && { role: selectedRole }),
      ...(selectedStatus !== 'all' && { 
        isActive: selectedStatus === 'active' ? 'true' : 'false' 
      }),
      ...(searchTerm && { search: searchTerm })
    });

    const response = await api.get(`/users?${params}`);
    console.log('API Response:', response.data); // Debug log
    
    if (response.data.status === 'success') {
      // Check different possible response structures
      if (response.data.data.users) {
        // Structure: { status: 'success', data: { users: [], pagination: {} } }
        setUsers(response.data.data.users);
        setTotalUsers(response.data.data.pagination?.total || response.data.data.users.length);
        setTotalPages(response.data.data.pagination?.pages || 1);
      } else if (Array.isArray(response.data.data)) {
        // Structure: { status: 'success', data: [] }
        setUsers(response.data.data);
        setTotalUsers(response.data.data.length);
        setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
      } else if (Array.isArray(response.data.users)) {
        // Structure: { status: 'success', users: [], total: 100 }
        setUsers(response.data.users);
        setTotalUsers(response.data.total || response.data.users.length);
        setTotalPages(response.data.pages || Math.ceil((response.data.total || response.data.users.length) / itemsPerPage));
      } else {
        // Fallback
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    toast({
      title: t(translations.toast.error),
      description: error.response?.data?.message || 'Failed to fetch users',
      variant: 'destructive'
    });
  } finally {
    setLoading(false);
  }
};

  // Load users on mount and when filters change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedDepartment, selectedRole, selectedStatus, searchTerm]);

// Add new user
const handleAddUser = async () => {
  // Validate form
  if (!formData.employeeId || !formData.fullNameAm || !formData.fullNameEn || 
      !formData.email || !formData.phone || !formData.password) {
    toast({
      title: 'Validation Error',
      description: 'All fields are required',
      variant: 'destructive'
    });
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    toast({
      title: 'Validation Error',
      description: 'Passwords do not match',
      variant: 'destructive'
    });
    return;
  }

  try {
    // Prepare the data to send
    const userData = {
      employeeId: formData.employeeId,
      fullNameAm: formData.fullNameAm,
      fullNameEn: formData.fullNameEn,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      role: formData.role,
      password: formData.password // Send as 'password', backend will map to passwordHash
    };
    
    console.log('Sending user data:', userData); // Debug log
    
    const response = await api.post('/users', userData);
    console.log('Response:', response.data); // Debug log

    if (response.data.status === 'success') {
      toast({
        title: t(translations.toast.userAdded),
        description: `${formData.fullNameEn} has been added`,
      });
      
      setIsAddUserOpen(false);
      resetForm();
      fetchUsers(); // Refresh the list
    }
  } catch (error) {
    console.error('Error adding user:', error);
    console.error('Error response:', error.response?.data); // Debug log
    
    toast({
      title: t(translations.toast.error),
      description: error.response?.data?.message || 'Failed to add user',
      variant: 'destructive'
    });
  }
};

  // Update user
  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData = {
        fullNameAm: formData.fullNameAm,
        fullNameEn: formData.fullNameEn,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        role: formData.role
      };

      // Only include password if it's provided
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: 'Validation Error',
            description: 'Passwords do not match',
            variant: 'destructive'
          });
          return;
        }
        updateData.password = formData.password;
      }

      const response = await api.put(`/users/${selectedUser.id}`, updateData);

      if (response.data.status === 'success') {
        toast({
          title: t(translations.toast.userUpdated),
          description: `${formData.fullNameEn} has been updated`,
        });
        
        setIsEditUserOpen(false);
        resetForm();
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to update user',
        variant: 'destructive'
      });
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await api.delete(`/users/${selectedUser.id}`);

      if (response.data.status === 'success') {
        toast({
          title: t(translations.toast.userDeleted),
          description: `${selectedUser.fullNameEn} has been deleted`,
        });
        
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user) => {
    try {
      const response = await api.put(`/users/${user.id}`, {
        isActive: !user.isActive
      });

      if (response.data.status === 'success') {
        toast({
          title: t(translations.toast.statusChanged),
          description: `${user.fullNameEn} is now ${!user.isActive ? 'active' : 'inactive'}`,
        });
        
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  // Reset password (send reset email)
  const handleResetPassword = async (user) => {
    try {
      // Assuming you have a forgot password endpoint
      const response = await api.post('/auth/forgot-password', {
        email: user.email
      });

      if (response.data.status === 'success') {
        toast({
          title: 'Password Reset',
          description: `Reset link sent to ${user.email}`,
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: t(translations.toast.error),
        description: error.response?.data?.message || 'Failed to send reset email',
        variant: 'destructive'
      });
    }
  };

  // Template download function
  const downloadTemplate = () => {
    const template = [
      {
        'Employee ID': 'SAY001',
        'Full Name (Amharic)': 'ሙሉ ስም በአማርኛ',
        'Full Name (English)': 'Full Name in English',
        'Email': 'user@sayintworeda.gov.et',
        'Phone': '+251911234567',
        'Department': 'Administration',
        'Role': 'viewer',
        'Password': 'Temp@123'
      }
    ];

    const headers = Object.keys(template[0]);
    const csvContent = [
      headers.join(','),
      ...template.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: language === 'am' ? 'አብነት ተወርዷል' : 'Template Downloaded',
      description: language === 'am' ? 'እባክዎ ፋይሉን በመሙላት ይላኩ' : 'Please fill and upload the file',
    });
  };

  // Sample file download
  const downloadSample = () => {
    const samples = [
      {
        'Employee ID': 'SAY002',
        'Full Name (Amharic)': 'አቶ ሚኪኤል አለማየሁ',
        'Full Name (English)': 'Mikiyal Alemayehu',
        'Email': 'mikiyal@sayintworeda.gov.et',
        'Phone': '+251911234568',
        'Department': 'Communication',
        'Role': 'editor',
        'Password': 'Pass@123'
      },
      {
        'Employee ID': 'SAY003',
        'Full Name (Amharic)': 'ወ/ሮ ሄለን ታደሰ',
        'Full Name (English)': 'Helen Tadese',
        'Email': 'helen@sayintworeda.gov.et',
        'Phone': '+251911234569',
        'Department': 'Archives',
        'Role': 'viewer',
        'Password': 'Pass@123'
      }
    ];

    const headers = Object.keys(samples[0]);
    const csvContent = [
      headers.join(','),
      ...samples.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_samples.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    
    // Simulate file processing
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Here you would actually parse the CSV and send to backend
          // For now, just simulate
          const mockUserCount = Math.floor(Math.random() * 15) + 5;
          setUploadedFile(prev => ({
            ...prev,
            usersCount: mockUserCount
          }));

          toast({
            title: language === 'am' ? 'ፋይል ተሰራሁ' : 'File Processed',
            description: language === 'am' 
              ? `${mockUserCount} ተጠቃሚዎች ተገኝተዋል`
              : `Found ${mockUserCount} users`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employeeId: '',
      fullNameAm: '',
      fullNameEn: '',
      email: '',
      phone: '',
      department: 'Administration',
      role: 'viewer',
      password: '',
      confirmPassword: ''
    });
    setSelectedUser(null);
    setUploadedFile(null);
    setUploadProgress(0);
  };

  // Open edit dialog
  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      employeeId: user.employeeId,
      fullNameAm: user.fullNameAm,
      fullNameEn: user.fullNameEn,
      email: user.email,
      phone: user.phone,
      department: user.department,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setIsEditUserOpen(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'editor': return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch(role) {
      case 'super_admin': return <Shield className="h-3 w-3 mr-1" />;
      case 'admin': return <UserCog className="h-3 w-3 mr-1" />;
      case 'editor': return <Edit className="h-3 w-3 mr-1" />;
      case 'viewer': return <Eye className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  // Form validation
  const isFormValid = () => {
    if (!formData.employeeId || !formData.fullNameAm || !formData.fullNameEn || 
        !formData.email || !formData.phone) {
      return false;
    }
    
    // For add user, password is required
    if (isAddUserOpen && (!formData.password || formData.password !== formData.confirmPassword)) {
      return false;
    }
    
    // For edit user, password is optional but must match if provided
    if (isEditUserOpen && formData.password && formData.password !== formData.confirmPassword) {
      return false;
    }
    
    return true;
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
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t(translations.refresh)}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t(translations.export)}
          </Button>
          <Button onClick={() => setIsAddUserOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t(translations.addUser)}
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
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t(translations.departments.all)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t(translations.departments.all)}</SelectItem>
                  <SelectItem value="Communication">{t(translations.departments.Communication)}</SelectItem>
                  <SelectItem value="Archives">{t(translations.departments.Archives)}</SelectItem>
                  <SelectItem value="Administration">{t(translations.departments.Administration)}</SelectItem>
                  <SelectItem value="IT">{t(translations.departments.IT)}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t(translations.roles.all)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t(translations.roles.all)}</SelectItem>
                  <SelectItem value="super_admin">{t(translations.roles.super_admin)}</SelectItem>
                  <SelectItem value="admin">{t(translations.roles.admin)}</SelectItem>
                  <SelectItem value="editor">{t(translations.roles.editor)}</SelectItem>
                  <SelectItem value="viewer">{t(translations.roles.viewer)}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t(translations.status.all)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t(translations.status.all)}</SelectItem>
                  <SelectItem value="active">{t(translations.status.active)}</SelectItem>
                  <SelectItem value="inactive">{t(translations.status.inactive)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(translations.table.employeeId)}</TableHead>
                <TableHead>{t(translations.table.name)}</TableHead>
                <TableHead>{t(translations.table.contact)}</TableHead>
                <TableHead>{t(translations.table.department)}</TableHead>
                <TableHead>{t(translations.table.role)}</TableHead>
                <TableHead>{t(translations.table.status)}</TableHead>
                <TableHead>{t(translations.table.lastLogin)}</TableHead>
                <TableHead className="text-right">{t(translations.table.actions)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="group">
                    <TableCell className="font-medium">{user.employeeId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.fullNameAm?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.fullNameAm}</p>
                          <p className="text-xs text-muted-foreground">{user.fullNameEn}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(translations.departments[user.department] || user.department)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleBadgeColor(user.role)} border flex items-center w-fit`}>
                        {getRoleIcon(user.role)}
                        {t(translations.roles[user.role] || user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t(translations.status.active)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          {t(translations.status.inactive)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.lastLogin)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${
                            user.isActive 
                              ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                          }`}
                          onClick={() => handleToggleStatus(user)}
                          title={user.isActive ? 'Deactivate user' : 'Activate user'}
                        >
                          {user.isActive ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => openEditDialog(user)}
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => handleResetPassword(user)}
                          title="Reset password"
                        >
                          <Key className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
      {totalUsers > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
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

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-amharic flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-primary" />
              {t(translations.addUserDialog.title)}
            </DialogTitle>
            <DialogDescription>
              {t(translations.addUserDialog.description)}
            </DialogDescription>
          </DialogHeader>

          <Tabs 
            defaultValue="manual" 
            className="w-full flex-1 overflow-hidden flex flex-col"
            onValueChange={() => {
              resetForm();
              setUploadedFile(null);
            }}
          >
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                {language === 'am' ? 'በእጅ መዝግብ' : 'Manual Entry'}
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {language === 'am' ? 'በፋይል ጫን' : 'Bulk Upload'}
              </TabsTrigger>
            </TabsList>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      {t(translations.addUserDialog.employeeId)}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.employeeId}
                      onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                      placeholder="SAY001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      {t(translations.addUserDialog.phone)}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+251911234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      {t(translations.addUserDialog.fullNameAm)}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.fullNameAm}
                      onChange={(e) => setFormData({...formData, fullNameAm: e.target.value})}
                      placeholder="ሙሉ ስም በአማርኛ"
                      className="font-amharic"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      {t(translations.addUserDialog.fullNameEn)}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.fullNameEn}
                      onChange={(e) => setFormData({...formData, fullNameEn: e.target.value})}
                      placeholder="Full Name in English"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    {t(translations.addUserDialog.email)}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="user@sayintworeda.gov.et"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      {t(translations.addUserDialog.department)}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.department} 
                      onValueChange={(v) => setFormData({...formData, department: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Communication">{t(translations.departments.Communication)}</SelectItem>
                        <SelectItem value="Archives">{t(translations.departments.Archives)}</SelectItem>
                        <SelectItem value="Administration">{t(translations.departments.Administration)}</SelectItem>
                        <SelectItem value="IT">{t(translations.departments.IT)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      {t(translations.addUserDialog.role)}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(v) => setFormData({...formData, role: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">{t(translations.roles.super_admin)}</SelectItem>
                        <SelectItem value="admin">{t(translations.roles.admin)}</SelectItem>
                        <SelectItem value="editor">{t(translations.roles.editor)}</SelectItem>
                        <SelectItem value="viewer">{t(translations.roles.viewer)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      {t(translations.addUserDialog.password)}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      {t(translations.addUserDialog.confirmPassword)}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className={formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                      }
                    />
                    {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        {language === 'am' ? 'የይለፍ ቃሎች አይዛመዱም' : 'Passwords do not match'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-2">
                  <span className="text-red-500">*</span> {language === 'am' ? 'የግድ መሙላት ያለባቸው መስኮች' : 'Required fields'}
                </div>
              </div>
            </TabsContent>

            {/* Bulk Upload Tab */}
            <TabsContent value="bulk" className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
              {/* Template Download Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">
                      {language === 'am' ? 'የኤክሴል አብነት ያውርዱ' : 'Download Excel Template'}
                    </h3>
                    <p className="text-sm text-blue-600">
                      {language === 'am' 
                        ? 'አብነቱን በመጠቀም በርካታ ተጠቃሚዎችን በአንድ ጊዜ ይመዝግቡ' 
                        : 'Use the template to register multiple users at once'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1"
                    onClick={downloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {language === 'am' ? 'Excel አብነት' : 'Excel Template'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1"
                    onClick={downloadSample}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    {language === 'am' ? 'ናሙና ፋይል' : 'Sample File'}
                  </Button>
                </div>
              </div>

              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors group">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {language === 'am' ? 'ፋይል ይምረጡ' : 'Choose a file'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === 'am' 
                        ? 'Excel (.xlsx, .xls) ወይም CSV ፋይል ይምረጡ' 
                        : 'Select Excel (.xlsx, .xls) or CSV file'}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {language === 'am' ? 'ከፍተኛ መጠን: 5MB' : 'Max size: 5MB'}
                  </div>
                </label>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{language === 'am' ? 'በመላክ ላይ...' : 'Uploading...'}</span>
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

              {/* Upload Preview */}
              {uploadedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-green-800 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-green-600">
                          {(uploadedFile.size / 1024).toFixed(2)} KB 
                          {uploadedFile.usersCount && ` • ${uploadedFile.usersCount} ${language === 'am' ? 'ተጠቃሚዎች' : 'users'}`}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-green-700 hover:text-green-800 hover:bg-green-100 flex-shrink-0 ml-2"
                      onClick={() => setUploadedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {uploadedFile.usersCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs font-medium text-green-800 mb-2">
                        {language === 'am' ? 'የተገኙ ተጠቃሚዎች ናሙና' : 'Sample of found users:'}
                      </p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="text-xs text-green-700 flex items-center gap-2">
                            <UserPlus className="h-3 w-3" />
                            <span>SAY00{i} - {language === 'am' ? 'ተጠቃሚ' : 'User'} {i}</span>
                          </div>
                        ))}
                        {uploadedFile.usersCount > 3 && (
                          <p className="text-xs text-green-600 italic">
                            {language === 'am' ? `እና ሌሎች ${uploadedFile.usersCount - 3} ተጠቃሚዎች` : `and ${uploadedFile.usersCount - 3} more users`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-1">
                      {language === 'am' ? 'ማስታወሻ' : 'Important Notes'}
                    </h4>
                    <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                      <li>{language === 'am' ? 'የፋይሉ አምዶች ከአብነቱ ጋር መዛመድ አለባቸው' : 'File columns must match the template'}</li>
                      <li>{language === 'am' ? 'ሁሉም መስኮች መሞላት አለባቸው' : 'All fields are required'}</li>
                      <li>{language === 'am' ? 'የስልክ ቁጥር በ+251 መጀመር አለበት' : 'Phone number must start with +251'}</li>
                      <li>{language === 'am' ? 'ኢሜል አድራሻ ትክክለኛ መሆን አለበት' : 'Email address must be valid'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-shrink-0 gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              {t(translations.addUserDialog.cancel)}
            </Button>
            <Button 
              onClick={handleAddUser}
              disabled={!isFormValid()}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {t(translations.addUserDialog.create)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name (Amharic)</Label>
                <Input
                  value={formData.fullNameAm}
                  onChange={(e) => setFormData({...formData, fullNameAm: e.target.value})}
                  className="font-amharic"
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name (English)</Label>
                <Input
                  value={formData.fullNameEn}
                  onChange={(e) => setFormData({...formData, fullNameEn: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(v) => setFormData({...formData, department: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="Archives">Archives</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(v) => setFormData({...formData, role: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password (leave blank to keep current)</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t(translations.deleteDialog.title)}</DialogTitle>
            <DialogDescription>
              {t(translations.deleteDialog.description)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <Trash2 className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600">
                {t(translations.deleteDialog.warning)}
              </p>
            </div>
            {selectedUser && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedUser.fullNameAm}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.employeeId}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t(translations.deleteDialog.cancel)}
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              {t(translations.deleteDialog.confirm)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;