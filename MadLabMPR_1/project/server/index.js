const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true },
  marks: { type: Number, required: true, default: 1 }
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  duration: { type: Number, required: true }, // in minutes
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  instructions: [{ type: String }]
});

const testResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  wrongAnswers: { type: Number, required: true },
  skippedAnswers: { type: Number, required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: Number },
    isCorrect: { type: Boolean }
  }],
  completedAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Question = mongoose.model('Question', questionSchema);
const Test = mongoose.model('Test', testSchema);
const TestResult = mongoose.model('TestResult', testResultSchema);

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Category routes
app.get('/api/categories', authenticate, async (req, res) => {
  try {
    const categories = await Category.find();
    
    // Get test count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const testsCount = await Test.countDocuments({ category: category._id });
        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          testsCount
        };
      })
    );
    
    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test routes
app.get('/api/categories/:categoryId/tests', authenticate, async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const tests = await Test.find({ category: categoryId })
      .select('title description totalQuestions totalMarks passingMarks duration');
    
    res.json({
      categoryName: category.name,
      tests
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/tests/:testId', authenticate, async (req, res) => {
  try {
    const { testId } = req.params;
    
    const test = await Test.findById(testId)
      .select('title description totalQuestions totalMarks passingMarks duration instructions');
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/tests/:testId/questions', authenticate, async (req, res) => {
  try {
    const { testId } = req.params;
    
    const test = await Test.findById(testId)
      .select('title duration totalQuestions')
      .populate({
        path: 'questions',
        select: 'text options marks -_id' // Exclude correctOption
      });
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/tests/:testId/submit', authenticate, async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;
    
    // Get test with questions
    const test = await Test.findById(testId).populate('questions');
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    // Calculate score
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let skippedAnswers = 0;
    
    const processedAnswers = test.questions.map(question => {
      const answer = answers.find(a => a.questionId === question._id.toString());
      
      if (!answer || answer.selectedOption === undefined || answer.selectedOption === -1) {
        skippedAnswers++;
        return {
          questionId: question._id,
          selectedOption: -1,
          isCorrect: false
        };
      }
      
      const isCorrect = answer.selectedOption === question.correctOption;
      
      if (isCorrect) {
        score += question.marks;
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
      
      return {
        questionId: question._id,
        selectedOption: answer.selectedOption,
        isCorrect
      };
    });
    
    // Create test result
    const testResult = new TestResult({
      user: userId,
      testId,
      score,
      totalQuestions: test.questions.length,
      correctAnswers,
      wrongAnswers,
      skippedAnswers,
      answers: processedAnswers
    });
    
    await testResult.save();
    
    res.json({
      message: 'Test submitted successfully',
      resultId: testResult._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/tests/:testId/results', authenticate, async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user._id;
    
    const result = await TestResult.findOne({ testId, user: userId })
      .populate('testId', 'title totalMarks passingMarks')
      .populate({
        path: 'answers.questionId',
        model: 'Question',
        select: 'text options correctOption marks'
      });
    
    if (!result) {
      return res.status(404).json({ message: 'Test result not found' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/test-results', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const results = await TestResult.find({ user: userId })
      .sort({ completedAt: -1 })
      .populate('testId', 'title totalMarks passingMarks');
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});