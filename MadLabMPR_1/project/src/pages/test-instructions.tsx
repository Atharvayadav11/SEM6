import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Clock, FileText, HelpCircle } from 'lucide-react';

interface Test {
  _id: string;
  title: string;
  description: string;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  instructions: string[];
}

const TestInstructions = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/${testId}`);
        setTest(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load test details',
          variant: 'destructive',
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId, toast, navigate]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hour${hours > 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}` 
      : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const startTest = () => {
    navigate(`/tests/${testId}/take`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!test) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Test Instructions</h1>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{test.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{test.description}</p>
          
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
              <FileText className="h-5 w-5 mb-1 text-primary" />
              <span className="text-sm font-medium">{test.totalQuestions}</span>
              <span className="text-xs text-muted-foreground">Questions</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
              <CheckCircle className="h-5 w-5 mb-1 text-primary" />
              <span className="text-sm font-medium">{test.totalMarks}</span>
              <span className="text-xs text-muted-foreground">Total Marks</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
              <HelpCircle className="h-5 w-5 mb-1 text-primary" />
              <span className="text-sm font-medium">{test.passingMarks}</span>
              <span className="text-xs text-muted-foreground">Passing Marks</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 mb-1 text-primary" />
              <span className="text-sm font-medium">{formatDuration(test.duration)}</span>
              <span className="text-xs text-muted-foreground">Duration</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc pl-5">
            {test.instructions.map((instruction, index) => (
              <li key={index} className="text-sm">{instruction}</li>
            ))}
            <li className="text-sm">The test will automatically submit when the time expires.</li>
            <li className="text-sm">You can navigate between questions using the next and previous buttons.</li>
            <li className="text-sm">You can review your answers before final submission.</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={startTest} className="w-full">Start Test</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestInstructions;