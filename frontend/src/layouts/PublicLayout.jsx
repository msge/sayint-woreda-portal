import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
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
  Clock,
  ChevronDown,
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  Linkedin,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Calendar,
  ArrowUp,
  ExternalLink,
  Sparkles,
  Award,
  Heart,
  ChevronRight
} from 'lucide-react';

const PublicLayout = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentYear] = useState(new Date().getFullYear());

  // Theme handling
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Navigation items with metadata
  const navItems = [
    { 
      icon: Home, 
      label: { am: 'መግቢያ', en: 'Home' }, 
      path: '/',
      description: { am: 'ዋና ገጽ', en: 'Home page' }
    },
    { 
      icon: Newspaper, 
      label: { am: 'ዜና', en: 'News' }, 
      path: '/news',
      description: { am: 'የቅርብ ጊዜ ዜናዎች', en: 'Latest news and updates' }
    },
    { 
      icon: Building, 
      label: { am: 'አገልግሎቶች', en: 'Services' }, 
      path: '/services',
      description: { am: 'የመንግስት የኮሙኒኬሽን አገልግሎቶች', en: 'Government communication services' }
    },
    { 
      icon: FileText, 
      label: { am: 'ሰነዶች', en: 'Documents' }, 
      path: '/documents',
      description: { am: 'መደበኛ ሰነዶች እና ፎርሞች', en: 'Official documents and forms' }
    },
    { 
      icon: BookOpen, 
      label: { am: 'ሚዲያ ጋለሪ', en: 'Media Gallery' }, 
      path: '/media',
      description: { am: 'ፎቶዎች እና ቪዲዮዎች', en: 'Photos and videos' }
    },
    { 
      icon: Info, 
      label: { am: 'ስለ እኛ', en: 'About' }, 
      path: '/about',
      description: { am: 'ስለ ሳይንት ወረዳ', en: 'About Sayint Woreda' }
    },
    { 
      icon: Mail, 
      label: { am: 'ግንኙነት', en: 'Contact' }, 
      path: '/contact',
      description: { am: 'ያግኙን', en: 'Get in touch' }
    },
  ];

  // Social media links with hover colors
  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/sayintworeda', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: Twitter, href: 'https://twitter.com/sayintworeda', label: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: Youtube, href: 'https://youtube.com/sayintworeda', label: 'YouTube', color: 'hover:bg-red-600' },
    { icon: Instagram, href: 'https://instagram.com/sayintworeda', label: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: Linkedin, href: 'https://linkedin.com/company/sayintworeda', label: 'LinkedIn', color: 'hover:bg-blue-700' },
  ];

  // Quick contact info
  const contactInfo = [
    { icon: PhoneIcon, text: '+251 58 111 2222', href: 'tel:+251581112222', label: 'Call us' },
    { icon: MailIcon, text: 'info@sayintworeda.gov.et', href: 'mailto:info@sayintworeda.gov.et', label: 'Email us' },
    { icon: MapPinIcon, text: { am: 'ሳይንት ወረዳ፣ ደቡብ ወሎ', en: 'Sayint Woreda, South Wollo' }, label: 'Visit us' },
  ];

  // Office hours
  const officeHours = [
    { days: { am: 'ሰኞ - አርብ', en: 'Mon - Fri' }, hours: '8:30 - 17:30' },
    { days: { am: 'ቅዳሜ', en: 'Saturday' }, hours: '9:00 - 13:00' },
    { days: { am: 'እሁድ', en: 'Sunday' }, hours: { am: 'ተዘጋ', en: 'Closed' } },
  ];

  const translations = {
    siteTitle: { 
      am: 'የሳይንት ወረዳ ኮሙኒኬሽን ቢሮ', 
      en: 'Sayint Woreda Communication Office' 
    },
    siteTagline: { 
      am: 'ዲጂታል መንግስት • ታሪካዊ አርክይቭ • ማህበረሰብ መረጃ', 
      en: 'Digital Government • Historical Archive • Community Information' 
    },
    governmentPortal: { 
      am: 'ይፋዊ የመንግስት ፖርታል', 
      en: 'Official Government Portal' 
    },
    employeeLogin: { 
      am: 'የሰራተኞች መግቢያ', 
      en: 'Employee Login' 
    },
    quickLinks: { 
      am: 'ፈጣን አገናኞች', 
      en: 'Quick Links' 
    },
    contactUs: { 
      am: 'ግንኙነት', 
      en: 'Contact Us' 
    },
    followUs: { 
      am: 'ይከተሉን', 
      en: 'Follow Us' 
    },
    officeHours: { 
      am: 'የስራ ሰዓት', 
      en: 'Office Hours' 
    },
    copyright: { 
      am: 'ሁሉም መብቶች የተጠበቁ ናቸው', 
      en: 'All rights reserved' 
    },
    managedBy: { 
      am: 'በሳይንት ወረዳ ኮሙኒኬሽን ቢሮ የሚተዳደር', 
      en: 'Managed by Sayint Woreda Communication Office' 
    },
    backToTop: { 
      am: 'ወደ ላይ ይመለሱ', 
      en: 'Back to top' 
    },
    welcome: {
      am: 'እንኳን ደህና መጡ',
      en: 'Welcome'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex flex-col">
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg z-[100]">
        {language === 'am' ? 'ወደ ዋና ይዘት ይሂዱ' : 'Skip to main content'}
      </a>

      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-secondary text-primary-foreground py-2 px-4 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm relative z-10">
          <div className="flex items-center gap-4 mb-2 md:mb-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span className="font-medium tracking-wide uppercase text-xs">{t(translations.governmentPortal)}</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <a href="tel:+251581112222" className="flex items-center gap-1 hover:underline transition-all hover:opacity-80">
                <Phone className="h-3 w-3" />
                <span>+251 58 111 2222</span>
              </a>
              <span className="w-px h-4 bg-white/30"></span>
              <a href="mailto:info@sayintworeda.gov.et" className="flex items-center gap-1 hover:underline transition-all hover:opacity-80">
                <MailIcon className="h-3 w-3" />
                <span>info@sayintworeda.gov.et</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-1.5 h-7 px-3 text-primary-foreground hover:bg-white/20 transition-all duration-300 group"
              aria-label={language === 'am' ? 'Switch to English' : 'ወደ አማርኛ ቀይር'}
            >
              <Globe className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-medium uppercase">{language === 'am' ? 'EN' : 'አማ'}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-7 w-7 text-primary-foreground hover:bg-white/20 transition-all duration-300"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </Button>

            <Button
              asChild
              size="sm"
              className="h-7 gap-1.5 bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl px-3"
            >
              <Link to="/login">
                <User className="h-3.5 w-3.5" />
                <span className="text-xs font-medium hidden sm:inline">{t(translations.employeeLogin)}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo */}
            {/* Logo with Animation */}
<Link to="/" className="flex items-center gap-3 group" aria-label="Home">
  <div className="relative w-14 h-14 md:w-20 md:h-20">
    {/* Gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
    
    {/* Logo container */}
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-white p-2 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 flex items-center justify-center border border-gray-100">
      <img
        src="/sayint_woreda_communication_office_logo.jpg"
        alt="Sayint Woreda Communication Office Logo"
        className="max-w-full max-h-full object-contain"
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
          // Show fallback icon
          const parent = e.target.parentElement;
          const fallback = document.createElement('div');
          fallback.className = 'w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center';
          fallback.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M2 21h20"/></svg>';
          parent.appendChild(fallback);
        }}
      />
    </div>
  </div>
  
  <div className="hidden md:block">
    <h1 className="text-lg font-bold tracking-tight font-amharic bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
      {t(translations.siteTitle)}
    </h1>
    <p className="text-xs text-muted-foreground flex items-center gap-1">
      <span className="w-1 h-1 bg-primary rounded-full"></span>
      {t(translations.siteTagline)}
    </p>
  </div>
</Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-primary' : ''
                      }`} />
                      <span className="font-amharic">{t(item.label)}</span>
                    </div>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-accent transition-all duration-300"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-0.5 bg-foreground rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                }`}></span>
                <span className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-0.5 bg-foreground rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}></span>
                <span className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-0.5 bg-foreground rounded-full transition-all duration-300 ${
                  mobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                }`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[32rem] border-t' : 'max-h-0'
        }`}>
          <div className="container mx-auto px-4 py-4 bg-background/95 backdrop-blur-sm">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-amharic flex-1">{t(item.label)}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
              
              {/* Mobile Contact Info */}
              <div className="pt-4 mt-4 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-3 px-4">
                  {t(translations.contactUs)}
                </p>
                <div className="space-y-2 px-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <info.icon className="h-4 w-4 text-primary" />
                      {info.href ? (
                        <a href={info.href} className="hover:text-primary transition-colors">
                          {typeof info.text === 'object' ? t(info.text) : info.text}
                        </a>
                      ) : (
                        <span>{typeof info.text === 'object' ? t(info.text) : info.text}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 animate-in fade-in duration-500">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-b from-background to-muted/30 mt-16 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Main Footer Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* About Section */}
            <div className="space-y-4">
  <div className="flex items-center gap-3">
    <div className="relative w-12 h-12 md:w-14 md:h-14">
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-xl opacity-20"></div>
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-white p-1.5 shadow-md flex items-center justify-center border border-gray-100">
        <img
          src="/sayint_woreda_communication_office_logo.jpg"
          alt="Sayint Woreda Logo"
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
            const parent = e.target.parentElement;
            const fallback = document.createElement('div');
            fallback.className = 'w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center';
            fallback.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/><path d="M2 21h20"/></svg>';
            parent.appendChild(fallback);
          }}
        />
      </div>
    </div>
    <h3 className="text-lg font-bold font-amharic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      {language === 'am' ? 'ሳይንት ወረዳ' : 'Sayint Woreda'}
    </h3>
  </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {language === 'am' 
                  ? 'የሳይንት ወረዳ ኮሙኒኬሽን ቢሮ ዲጂታል ፖርታል። የመንግስት ዜና፣ ሰነዶች፣ ታሪካዊ አርክይቮች እና የማህበረሰብ መረጃዎች።'
                  : 'Sayint Woreda Communication Office Digital Portal. Government news, documents, historical archives, and community information.'}
              </p>

              {/* Social Links */}
              <div className="flex gap-2 pt-2">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-lg bg-primary/10 text-primary transition-all duration-300 hover:scale-110 hover:text-white ${social.color}`}
                      aria-label={social.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 font-amharic flex items-center gap-2">
                <span className="w-6 h-px bg-primary"></span>
                {t(translations.quickLinks)}
              </h4>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      <item.icon className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {t(item.label)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="font-semibold mb-4 font-amharic flex items-center gap-2">
                <span className="w-6 h-px bg-secondary"></span>
                {t(translations.contactUs)}
              </h4>
              <ul className="space-y-3">
                {contactInfo.map((info, index) => (
                  <li key={index}>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                      >
                        <info.icon className="h-4 w-4 shrink-0 group-hover:scale-110 transition-transform" />
                        <span>{typeof info.text === 'object' ? t(info.text) : info.text}</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <info.icon className="h-4 w-4 shrink-0" />
                        <span>{typeof info.text === 'object' ? t(info.text) : info.text}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Office Hours */}
            <div>
              <h4 className="font-semibold mb-4 font-amharic flex items-center gap-2">
                <span className="w-6 h-px bg-primary"></span>
                {t(translations.officeHours)}
              </h4>
              <div className="space-y-2">
                {officeHours.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-dashed last:border-0">
                    <span className="text-muted-foreground">{t(item.days)}</span>
                    <span className="font-medium">
                      {typeof item.hours === 'object' ? t(item.hours) : item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground text-center md:text-left">
                © {currentYear} {t(translations.siteTitle)}. {t(translations.copyright)}.
              </p>
              <p className="text-xs text-muted-foreground text-center md:text-right flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-500" />
                {t(translations.managedBy)}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label={t(translations.backToTop)}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
};

export default PublicLayout;