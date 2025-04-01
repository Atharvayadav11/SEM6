import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, FileText } from 'lucide-react';

interface Test {
  _id: string;
  title: string;
  description: string;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  duration: number;
}

const Tests = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get(`/categories/${categoryId}/tests`);
        setTests(response.data.tests);
        setCategoryName(response.data.categoryName);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load tests',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [categoryId, toast]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">{categoryName}</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : tests.length > 0 ? (
        <div className="space-y-4">
          {tests.map((test) => (
            <Link key={test._id} to={`/tests/${test._id}/instructions`}>
              <Card className="hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{test.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        <span>{test.totalQuestions} questions</span>
                        <span>{test.totalMarks} marks</span>
                        <span>Pass: {test.passingMarks} marks</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(test.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tests available in this category.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tests;