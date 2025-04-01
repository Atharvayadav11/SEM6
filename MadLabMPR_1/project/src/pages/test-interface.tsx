import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock } from 'lucide-react';

interface Question {
  _id: string;
  text: string;
  options: string[];
  marks: number;
}

interface Test {
  _id: string;
  title: string;
  duration: number;
  totalQuestions: number;
  questions: Question[];
}

const TestInterface = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/${testId}/questions`);
        setTest(response.data);
        setTimeLeft(response.data.duration * 60); // Convert minutes to seconds
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load test questions',
          variant: 'destructive',
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId, toast, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      submitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours > 0 ? `${hours}:` : '',
      minutes.toString().padStart(2, '0'),
      ':',
      secs.toString().padStart(2, '0')
    ].join('');
  };

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const goToNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const submitTest = async () => {
    if (!test) return;
    
    try {
      const response = await api.post(`/tests/${testId}/submit`, {
        answers: Object.entries(answers).map(([questionId, optionIndex]) => ({
          questionId,
          selectedOption: optionIndex,
        })),
      });
      
      navigate(`/tests/${testId}/results`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit test',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!test || test.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No questions available for this test.</p>
            <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / test.questions.length * 100;
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="sticky top-0 bg-background pt-2 pb-4 z-10">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-sm font-medium">Question {currentQuestionIndex + 1}/{test.questions.length}</h2>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={timeLeft < 60 ? 'text-destructive' : ''}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Marks: {currentQuestion.marks}</p>
            <h3 className="text-base font-medium mt-1">{currentQuestion.text}</h3>
          </div>
          
          <RadioGroup 
            value={answers[currentQuestion._id]?.toString()} 
            onValueChange={(value) => handleAnswerChange(currentQuestion._id, parseInt(value))}
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-start space-x-2 py-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-sm font-normal cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        {isLastQuestion ? (
          <Button onClick={() => setShowSubmitDialog(true)}>Submit Test</Button>
        ) : (
          <Button onClick={goToNextQuestion}>Next</Button>
        )}
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your test? You won't be able to change your answers after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitTest}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestInterface;