import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Upload, Users, Eye, Clock, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

const Dashboard = () => {
  const { language, t } = useLanguage();
  const dict = translations.dashboard;

  // Mock data - in real app, this would come from API
  const stats = [
    { 
      label: t(dict.stats.totalDocuments), 
      value: '1,234', 
      icon: FileText, 
      change: '+12%',
      trend: 'up',
      color: 'bg-blue-500'
    },
    { 
      label: t(dict.stats.activeUsers), 
      value: '45', 
      icon: Users, 
      change: '+5%',
      trend: 'up',
      color: 'bg-green-500'
    },
    { 
      label: t(dict.stats.newsArticles), 
      value: '89', 
      icon: Eye, 
      change: '+23%',
      trend: 'up',
      color: 'bg-purple-500'
    },
    { 
      label: t(dict.stats.pendingTasks), 
      value: '12', 
      icon: Clock, 
      change: '-3%',
      trend: 'down',
      color: 'bg-amber-500'
    },
  ];

  const recentActivities = [
    { 
      user: 'ንጉስ ', 
      action: t(dict.recentActivities.actions.addedDocument), 
      time: '2 ደቂቃ በፊት',
      type: 'document' 
    },
    { 
      user: 'ተስፋዬ መኮንን', 
      action: t(dict.recentActivities.actions.editedNews), 
      time: '1 ሰዓት በፊት',
      type: 'news' 
    },
    { 
      user: 'ያሬድ ገብረመድህን', 
      action: t(dict.recentActivities.actions.completedTask), 
      time: '3 ሰዓት በፊት',
      type: 'task' 
    },
    { 
      user: 'ሄኖክ ታደሰ', 
      action: t(dict.recentActivities.actions.addedUser), 
      time: '5 ሰዓት በፊት',
      type: 'user' 
    },
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'news': return <Eye className="h-4 w-4" />;
      case 'task': return <Clock className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'document': return 'bg-blue-100 text-blue-600';
      case 'news': return 'bg-green-100 text-green-600';
      case 'task': return 'bg-yellow-100 text-yellow-600';
      case 'user': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-amharic">
            {t(dict.title)}
          </h1>
          <p className="text-muted-foreground">
            {t(dict.subtitle)}
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Upload className="h-4 w-4" />
          {t(dict.uploadDocument)}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
          const trendColor = stat.trend === 'up' ? 'text-green-500' : 'text-red-500';
          
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground font-amharic">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} text-white rounded-xl p-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <div className={`flex items-center ${trendColor}`}>
                    <TrendIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    {t(dict.stats.comparedToLastMonth)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="font-amharic">{t(dict.recentActivities.title)}</CardTitle>
            <CardDescription>{t(dict.recentActivities.description)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 group hover:bg-muted/50 p-2 rounded-lg transition-colors">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-amharic">{t(dict.quickActions.title)}</CardTitle>
            <CardDescription>{t(dict.quickActions.description)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary transition-colors group w-full"
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium font-amharic">{t(dict.quickActions.newDocument.title)}</p>
                  <p className="text-sm text-muted-foreground">{t(dict.quickActions.newDocument.subtitle)}</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary transition-colors group w-full"
              >
                <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Eye className="h-4 w-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium font-amharic">{t(dict.quickActions.addNews.title)}</p>
                  <p className="text-sm text-muted-foreground">{t(dict.quickActions.addNews.subtitle)}</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary transition-colors group w-full"
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium font-amharic">{t(dict.quickActions.addUser.title)}</p>
                  <p className="text-sm text-muted-foreground">{t(dict.quickActions.addUser.subtitle)}</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start gap-2 h-auto py-4 hover:bg-primary/5 hover:border-primary transition-colors group w-full"
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium font-amharic">{t(dict.quickActions.createTask.title)}</p>
                  <p className="text-sm text-muted-foreground">{t(dict.quickActions.createTask.subtitle)}</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;