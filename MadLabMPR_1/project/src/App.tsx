import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/auth-context';
import ProtectedRoute from '@/components/protected-route';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Dashboard from '@/pages/dashboard';
import Categories from '@/pages/categories';
import Tests from '@/pages/tests';
import TestInstructions from '@/pages/test-instructions';
import TestInterface from '@/pages/test-interface';
import TestResults from '@/pages/test-results';
import MobileCheck from '@/components/mobile-check';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="quiz-theme">
      <AuthProvider>
        <MobileCheck>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/categories/:categoryId/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
              <Route path="/tests/:testId/instructions" element={<ProtectedRoute><TestInstructions /></ProtectedRoute>} />
              <Route path="/tests/:testId/take" element={<ProtectedRoute><TestInterface /></ProtectedRoute>} />
              <Route path="/tests/:testId/results" element={<ProtectedRoute><TestResults /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </MobileCheck>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;