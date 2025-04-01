const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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

// Create models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Question = mongoose.model('Question', questionSchema);
const Test = mongoose.model('Test', testSchema);

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Question.deleteMany({});
    await Test.deleteMany({});

    console.log('Cleared existing data');

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });

    console.log('Created test user');

    // Create categories
    const categories = await Category.insertMany([
      {
        name: 'Web Development',
        description: 'Tests related to HTML, CSS, JavaScript, and web frameworks'
      },
      {
        name: 'Data Science',
        description: 'Tests covering statistics, machine learning, and data analysis'
      },
      {
        name: 'Mobile Development',
        description: 'Tests for Android, iOS, and cross-platform mobile development'
      }
    ]);

    console.log('Created categories');

    // Create questions for Web Development
    const webDevQuestions = await Question.insertMany([
      {
        text: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Multi Language',
          'Hyper Transfer Markup Language',
          'Home Tool Markup Language'
        ],
        correctOption: 0,
        marks: 1
      },
      {
        text: 'Which CSS property is used to control the spacing between elements?',
        options: [
          'spacing',
          'margin',
          'padding',
          'gap'
        ],
        correctOption: 1,
        marks: 1
      },
      {
        text: 'Which of the following is NOT a JavaScript framework?',
        options: [
          'React',
          'Angular',
          'Vue',
          'Django'
        ],
        correctOption: 3,
        marks: 2
      },
      {
        text: 'What is the correct way to declare a variable in JavaScript?',
        options: [
          'var name;',
          'variable name;',
          'v name;',
          'let = name;'
        ],
        correctOption: 0,
        marks: 1
      },
      {
        text: 'Which HTTP status code represents a successful response?',
        options: [
          '200',
          '404',
          '500',
          '302'
        ],
        correctOption: 0,
        marks: 1
      }
    ]);

    // Create questions for Data Science
    const dataScienceQuestions = await Question.insertMany([
      {
        text: 'Which of the following is NOT a Python library used for data analysis?',
        options: [
          'Pandas',
          'NumPy',
          'Express',
          'Matplotlib'
        ],
        correctOption: 2,
        marks: 2
      },
      {
        text: 'What does SQL stand for?',
        options: [
          'Structured Query Language',
          'Simple Query Language',
          'Standard Question Language',
          'Structured Question Logic'
        ],
        correctOption: 0,
        marks: 1
      },
      {
        text: 'Which algorithm is commonly used for classification in machine learning?',
        options: [
          'K-means',
          'Linear Regression',
          'Random Forest',
          'Principal Component Analysis'
        ],
        correctOption: 2,
        marks: 2
      },
      {
        text: 'What is the purpose of data normalization?',
        options: [
          'To increase the size of the dataset',
          'To scale features to a similar range',
          'To remove all outliers',
          'To convert categorical data to numerical'
        ],
        correctOption: 1,
        marks: 2
      },
      {
        text: 'Which measure represents the middle value in a dataset?',
        options: [
          'Mean',
          'Mode',
          'Median',
          'Range'
        ],
        correctOption: 2,
        marks: 1
      }
    ]);

    // Create tests
    await Test.insertMany([
      {
        title: 'HTML & CSS Basics',
        description: 'Test your knowledge of HTML and CSS fundamentals',
        category: categories[0]._id,
        totalQuestions: 2,
        totalMarks: 2,
        passingMarks: 1,
        duration: 5, // 5 minutes
        questions: [webDevQuestions[0]._id, webDevQuestions[1]._id],
        instructions: [
          'Read each question carefully before answering',
          'Each question has only one correct answer',
          'There is no negative marking for wrong answers'
        ]
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'Test covering core JavaScript concepts',
        category: categories[0]._id,
        totalQuestions: 3,
        totalMarks: 4,
        passingMarks: 2,
        duration: 10, // 10 minutes
        questions: [webDevQuestions[2]._id, webDevQuestions[3]._id, webDevQuestions[4]._id],
        instructions: [
          'Read each question carefully before answering',
          'Each question has only one correct answer',
          'There is no negative marking for wrong answers'
        ]
      },
      {
        title: 'Data Science Basics',
        description: 'Test your knowledge of fundamental data science concepts',
        category: categories[1]._id,
        totalQuestions: 5,
        totalMarks: 8,
        passingMarks: 5,
        duration: 15, // 15 minutes
        questions: [
          dataScienceQuestions[0]._id,
          dataScienceQuestions[1]._id,
          dataScienceQuestions[2]._id,
          dataScienceQuestions[3]._id,
          dataScienceQuestions[4]._id
        ],
        instructions: [
          'Read each question carefully before answering',
          'Each question has only one correct answer',
          'Questions have different mark values',
          'There is no negative marking for wrong answers'
        ]
      }
    ]);

    console.log('Created tests and questions');
    console.log('Database seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();