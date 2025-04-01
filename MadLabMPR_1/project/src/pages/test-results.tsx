import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Home, XCircle } from 'lucide-react';

interface Question {
  _id: string;
  text: string;
  options: string[];
  marks: number;
  correctOption: number;
}

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
  wrongAnswers: number;
  skippedAnswers: number;
  answers: {
    questionId: Question;
    selectedOption: number;
    isCorrect: boolean;
  }[];
  completedAt: string;
}

const TestResults = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResult = async () => {
      try {
        const response = await api.get(`/tests/${testId}/results`);
        setResult(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load test results',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResult();
  }, [testId, toast, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const isPassed = result.score >= result.testId.passingMarks;
  const scorePercentage = (result.score / result.testId.totalMarks) * 100;
  const formattedDate = new Date(result.completedAt).toLocaleDateString();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Test Results</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <Home className="h-5 w-5" />
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{result.testId.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <div className={`text-2xl font-bold mb-2 ${isPassed ? 'text-green-500' : 'text-red-500'}`}>
              {isPassed ? 'Passed' : 'Failed'}
            </div>
            <div className="text-3xl font-bold mb-4">
              {result.score}/{result.testId.totalMarks}
            </div>
            <Progress value={scorePercentage} className="h-2 w-full mb-2" />
            <div className="text-sm text-muted-foreground">
              Completed on {formattedDate}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="text-lg font-bold">{result.correctAnswers}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="text-lg font-bold">{result.wrongAnswers}</div>
              <div className="text-xs text-muted-foreground">Wrong</div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <div className="text-lg font-bold">{result.skippedAnswers}</div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-bold mb-4">Question Review</h2>
      <div className="space-y-4">
        {result.answers.map((answer, index) => (
          <Card key={answer.questionId._id} className={answer.isCorrect ? 'border-green-500/30' : 'border-red-500/30'}>
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Question {index + 1} • {answer.questionId.marks} marks</p>
                  <h3 className="text-base font-medium mb-3">{answer.questionId.text}</h3>
                  
                  <div className="space-y-2">
                    {answer.questionId.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex} 
                        className={`p-2 rounded-md text-sm ${
                          optionIndex === answer.questionId.correctOption
                            ? 'bg-green-500/10 border border-green-500/30'
                            : optionIndex === answer.selectedOption && !answer.isCorrect
                            ? 'bg-red-500/10 border border-red-500/30'
                            : 'bg-muted'
                        }`}
                      >
                        {option}
                        {optionIndex === answer.questionId.correctOption && (
                          <span className="ml-2 text-xs text-green-500">(Correct answer)</span>
                        )}
                        {optionIndex === answer.selectedOption && !answer.isCorrect && (
                          <span className="ml-2 text-xs text-red-500">(Your answer)</span>
                        )}
                      </div>
                    ))}
                    
                    {answer.selectedOption === -1 && (
                      <div className="text-sm text-muted-foreground italic">
                        You didn't answer this question
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestResults;