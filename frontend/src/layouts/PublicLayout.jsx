import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Home,
  Newspaper,
  BookOpen,
  FileText,
  Info,
  Mail,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Shield,
  Building,
  Phone,
  MapPin,
} from 'lucide-react';

const PublicLayout = () => {
  const [language, setLanguage] = useState('am');
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'am' ? 'en' : 'am');
  };

  const navItems = [
    { icon: Home, label: language === 'am' ? 'መግቢያ' : 'Home', path: '/' },
    { icon: Newspaper, label: language === 'am' ? 'ዜና' : 'News', path: '/news' },
    { icon: BookOpen, label: language === 'am' ? 'ብሎጎች' : 'Blogs', path: '/blogs' },
    { icon: FileText, label: language === 'am' ? 'ሰነዶች' : 'Documents', path: '/documents' },
    { icon: Shield, label: language === 'am' ? 'ሀብቶች' : 'Resources', path: '/resources' },
    { icon: Info, label: language === 'am' ? 'ስለ እኛ' : 'About', path: '/about' },
    { icon: Mail, label: language === 'am' ? 'ግንኙነት' : 'Contact', path: '/contact' },
  ];

  const translations = {
    am: {
      siteTitle: 'የሳይንት ወረዳ ኮሙኒኬሽን ቢሮ',
      siteTagline: 'ዲጂታል መንግስት፣ ታሪካዊ አርክይቭ፣ ማህበረሰብ መረጃ',
      login: 'ግባ',
      governmentPortal: 'የመንግስት ፖርታል',
      employeeLogin: 'ሰራተኛ መግቢያ',
    },
    en: {
      siteTitle: 'Sayint Woreda Communication Office',
      siteTagline: 'Digital Government, Historical Archive, Community Information',
      login: 'Login',
      governmentPortal: 'Government Portal',
      employeeLogin: 'Employee Login',
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Announcement Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="font-amharic">{t.governmentPortal}</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+251 58 111 2222</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@sayintworeda.gov.et</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2 h-8 text-primary-foreground hover:bg-primary/90"
            >
              <Globe className="h-4 w-4" />
              {language === 'am' ? 'English' : 'አማርኛ'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 text-primary-foreground hover:bg-primary/90"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              asChild
              size="sm"
              className="h-8 gap-2 bg-white text-primary hover:bg-white/90"
            >
              <Link to="/login">
                <User className="h-4 w-4" />
                {t.employeeLogin}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground rounded-lg p-2">
                  <Building className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight font-amharic">
                    {t.siteTitle}
                  </h1>
                  <p className="text-sm text-muted-foreground hidden md:block">
                    {t.siteTagline}
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-amharic">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container mx-auto px-4 py-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                      location.pathname === item.path
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="font-amharic">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary text-primary-foreground rounded-lg p-2">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold font-amharic">የሳይንት ወረዳ</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'am' 
                  ? 'የሳይንት ወረዳ የኮሙኒኬሽን ቢሮ ዲጂታል ፖርታል። በዚህ መድረክ ላይ የመንግስት ዜና፣ ሰነዶች፣ ታሪካዊ አርክይቮች እና የማህበረሰብ መረጃዎችን ማግኘት ይችላሉ።'
                  : 'Sayint Woreda Communication Office Digital Portal. Get government news, documents, historical archives, and community information.'
                }
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 font-amharic">
                {language === 'am' ? 'ፈጣን አገናኞች' : 'Quick Links'}
              </h4>
              <ul className="space-y-2">
                {navItems.slice(1).map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4 font-amharic">
                {language === 'am' ? 'ግንኙነት' : 'Contact Us'}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {language === 'am' 
                      ? 'ሳይንት ወረዳ፣ ደቡብ ወሎ፣ አማራ'
                      : 'Sayint Woreda, South Wollo, Amhara'
                    }
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">+251 58 111 2222</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">info@sayintworeda.gov.et</span>
                </li>
              </ul>
            </div>

            {/* Office Hours */}
            <div>
              <h4 className="font-semibold mb-4 font-amharic">
                {language === 'am' ? 'የስራ ሰዓት' : 'Office Hours'}
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex justify-between">
                  <span>{language === 'am' ? 'ሰኞ - አርብ' : 'Mon - Fri'}</span>
                  <span>8:30 AM - 5:30 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>{language === 'am' ? 'ቅዳሜ' : 'Saturday'}</span>
                  <span>9:00 AM - 1:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>{language === 'am' ? 'እሁድ' : 'Sunday'}</span>
                  <span>{language === 'am' ? 'ተዘጋ' : 'Closed'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {t.siteTitle}.{' '}
              {language === 'am' 
                ? 'ሁሉም መብቶች የተጠበቁ ናቸው።'
                : 'All rights reserved.'
              }
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {language === 'am'
                ? 'ይህ ድህረገጽ የሳይንት ወረዳ የኮሙኒኬሽን ቢሮ ይመራል።'
                : 'This website is managed by Sayint Woreda Communication Office.'
              }
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;