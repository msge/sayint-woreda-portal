import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Upload, Users, Eye, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Documents', value: '1,234', icon: FileText, change: '+12%' },
    { label: 'Active Users', value: '45', icon: Users, change: '+5%' },
    { label: 'News Articles', value: '89', icon: Eye, change: '+23%' },
    { label: 'Pending Tasks', value: '12', icon: Clock, change: '-3%' },
  ];

  const recentActivities = [
    { user: 'ሚኪኤል አለማየሁ', action: 'ሰነድ ጨምሯል', time: '2 ደቂቃ በፊት', type: 'document' },
    { user: 'ተስፋዬ መኮንን', action: 'ዜና አርትኗል', time: '1 ሰዓት በፊት', type: 'news' },
    { user: 'ያሬድ ገብረመድህን', action: 'ተግባር ሰርቷል', time: '3 ሰዓት በፊት', type: 'task' },
    { user: 'ሄኖክ ታደሰ', action: 'ተጠቃሚ ጨምሯል', time: '5 ሰዓት በፊት', type: 'user' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-amharic">ዳሽቦርድ</h1>
          <p className="text-muted-foreground">
            የሳይንት ወረዳ የኮሙኒኬሽን ጉዳይ ቢሮ ዲጂታል ፖርታል
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          ሰነድ ጫን
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-amharic">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">{stat.change}</span>
                <span className="text-sm text-muted-foreground ml-2">ከባለፈው ወር</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="font-amharic">የቅርብ ጊዜ እንቅስቃሴዎች</CardTitle>
            <CardDescription>በቅርብ ጊዜ የተከናወኑ ለውጦች</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'document' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'news' ? 'bg-green-100 text-green-600' :
                    activity.type === 'task' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'document' && <FileText className="h-4 w-4" />}
                    {activity.type === 'news' && <Eye className="h-4 w-4" />}
                    {activity.type === 'task' && <Clock className="h-4 w-4" />}
                    {activity.type === 'user' && <Users className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-amharic">ፈጣን ተግባራት</CardTitle>
            <CardDescription>በፍጥነት የሚፈጽሙ ተግባራት</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                <FileText className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium font-amharic">አዲስ ሰነድ ጫን</p>
                  <p className="text-sm text-muted-foreground">PDF, Word, Excel ፋይሎች</p>
                </div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                <Eye className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium font-amharic">ዜና ጨምር</p>
                  <p className="text-sm text-muted-foreground">ለህዝብ የሚለቀቅ ዜና</p>
                </div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                <Users className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium font-amharic">ተጠቃሚ ጨምር</p>
                  <p className="text-sm text-muted-foreground">አዲስ ተጠቃሚ ይመዝግቡ</p>
                </div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                <Clock className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium font-amharic">ተግባር ፍጠር</p>
                  <p className="text-sm text-muted-foreground">አዲስ የስራ ተግባር</p>
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