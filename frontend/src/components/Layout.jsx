import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  Home,
  FileText,
  Newspaper,
  Archive,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };
  // FIXED: Added /admin prefix to all admin routes
  const navItems = [
    { icon: Home, label: language === 'am' ? 'ዳሽቦርድ' : 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: language === 'am' ? 'ሰነዶች' : 'Documents', path: '/admin/documents' },
    { icon: Newspaper, label: language === 'am' ? 'ዜና' : 'News', path: '/admin/news' },
    { icon: Archive, label: language === 'am' ? 'አርክይቭ' : 'Archives', path: '/admin/archives' },
    { icon: Users, label: language === 'am' ? 'ተጠቃሚዎች' : 'Users', path: '/admin/users' },
    { icon: Settings, label: language === 'am' ? 'ቅንብሮች' : 'Settings', path: '/admin/settings' },
  ];

  const translations = {
    am: {
      welcome: 'እንኳን ደህና መጡ',
      office: 'የሳይንት ወረዳ ኮሙኒኬሽን ጉዳይ ቢሮ',
      search: 'ፈልግ...',
      profile: 'መገለጫ',
      logout: 'ውጣ',
    },
    en: {
      welcome: 'Welcome',
      office: 'Sayint Woreda Communication Office',
      search: 'Search...',
      profile: 'Profile',
      logout: 'Logout',
    },
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold">{t.welcome}, {user?.fullNameAm}</h1>
              <p className="text-sm text-muted-foreground">{t.office}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder={t.search}
                  className="pl-10 pr-4 py-2 rounded-md border bg-background text-sm w-64"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2 h-9"
            >
              <Globe className="h-4 w-4" />
              {language === 'am' ? 'EN' : 'አማ'}
            </Button>

            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-5 w-5" />
            </Button>

            <div className="relative">
              <Button 
                variant="ghost" 
                className="gap-2 h-9"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.fullNameAm?.charAt(0)}
                  </span>
                </div>
                <span className="hidden md:inline">{user?.fullNameAm}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-md z-50">
                  <div className="p-4 border-b">
                    <p className="font-medium">{user?.fullNameAm}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    {/* FIXED: Added /admin prefix */}
                    <Link 
                      to="/admin/profile" 
                      className="block px-3 py-2 text-sm rounded hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {t.profile}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-sm rounded text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="inline-block mr-2 h-4 w-4" />
                      {t.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r bg-background h-[calc(100vh-4rem)] sticky top-16 overflow-hidden`}>
          <div className="h-full py-6">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-amharic">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6 px-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;