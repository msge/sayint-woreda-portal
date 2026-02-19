import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Eye, EyeOff, Globe } from 'lucide-react';

const Login = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('am');

  const { login } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const result = await login(employeeId, password);
  
  if (result.success) {
    navigate('/admin/dashboard', { replace: true }); // Added replace: true
  } else {
    setError(result.message || (language === 'am' ? 'የተሳሳተ ሰራተኛ መለያ ወይም የይለፍ ቃል' : 'Invalid credentials'));
  }
  
  setLoading(false);
};
  const toggleLanguage = () => {
    setLanguage(language === 'am' ? 'en' : 'am');
  };

  const translations = {
    am: {
      title: 'እንኳን ደህና መጡ',
      description: 'የሳይንት ወረዳ ኮሙኒኬሽን ጉዳይ ቢሮ',
      employeeId: 'ሰራተኛ መለያ',
      password: 'የይለፍ ቃል',
      login: 'ግባ',
      loading: 'በመግባት ላይ...',
      error: 'ስህተት',
      defaultCredentials: 'የመጀመሪያ ተጠቃሚ: SAY001 / Admin@123',
    },
    en: {
      title: 'Welcome Back',
      description: 'Sayint Woreda Communication Affairs Office',
      employeeId: 'Employee ID',
      password: 'Password',
      login: 'Login',
      loading: 'Logging in...',
      error: 'Error',
      defaultCredentials: 'First time user: SAY001 / Admin@123',
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === 'am' ? 'English' : 'አማርኛ'}
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-primary text-primary-foreground rounded-full p-3">
                <svg
                  className="h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-amharic">
              {t.title}
            </CardTitle>
            <CardDescription className="text-center">
              {t.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="employeeId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-amharic">
                  {t.employeeId}
                </label>
                <Input
                  id="employeeId"
                  type="text"
                  placeholder={language === 'am' ? 'ሰራተኛ መለያ ያስገቡ' : 'Enter employee ID'}
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  className="font-amharic"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-amharic">
                  {t.password}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={language === 'am' ? 'የይለፍ ቃል ያስገቡ' : 'Enter password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="font-amharic pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full font-amharic"
                disabled={loading}
              >
                {loading ? t.loading : t.login}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-600">
              <p className="font-medium mb-1">{t.defaultCredentials}</p>
              <p className="text-xs">
                {language === 'am' 
                  ? 'ይህ መለያ ለሙከራ ብቻ ነው። ከተጠቀሙ በኋላ የይለፍ ቃልዎን ይቀይሩ።'
                  : 'This account is for testing only. Please change password after use.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Sayint Woreda. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;