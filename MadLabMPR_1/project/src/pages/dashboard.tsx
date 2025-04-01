import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, ClipboardList, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  _id: string;
  testId: {
    _id: string;
    title: string;
    totalMarks: number;
    passingMarks: number;
  };
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const response = await api.get('/test-results');
        setTestResults(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load test results',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [toast]);

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Quiz Platform</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Welcome, {user?.name}</CardTitle>
          <CardDescription>Your quiz dashboard</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tests">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="tests">Available Tests</TabsTrigger>
          <TabsTrigger value="results">My Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tests">
          <div className="space-y-4">
            <Link to="/categories">
              <Button className="w-full flex items-center justify-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Browse Test Categories
              </Button>
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="results">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : testResults.length > 0 ? (
            <div className="space-y-4">
              {testResults.map((result) => (
                <Card key={result._id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{result.testId.title}</h3>
                      <span className={`text-sm font-medium ${result.score >= result.testId.passingMarks ? 'text-green-500' : 'text-red-500'}`}>
                        {result.score >= result.testId.passingMarks ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Score: {result.score}/{result.testId.totalMarks}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Correct: {result.correctAnswers}/{result.totalQuestions}
                    </div>
                    <Link to={`/tests/${result.testId._id}/results`}>
                      <Button variant="outline" size="sm" className="w-full">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">You haven't taken any tests yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;