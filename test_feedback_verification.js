// Test to verify enhanced feedback system is working
import { reportService } from './src/services/ReportService';

console.log('=== TESTING ENHANCED FEEDBACK SYSTEM ===\n');

// Test 1: Low confidence user with specific topic
console.log('1. LOW CONFIDENCE USER TEST:');
const lowConfidenceMetrics = {
  confidence: 45,  // Low confidence should trigger YouTube recommendations
  fluency: 70,
  originality: 65,
  teamwork: 80,
  reasoning: 72,
  wordsPerMinute: 120,
  fillerWords: 5,
  pausePattern: 8,
  sentiment: 75,
  participation: 85,
  emotionalEngagement: 70,
  dominantEmotion: 'nervous',
  emotionConfidence: 0.8
};

const report1 = reportService.generateReport(
  'test_session_1',
  'user_1',
  'Impact of Social Media on Society', // Specific topic
  'beginner',
  1200,
  lowConfidenceMetrics,
  [],
  3
);

console.log('Confidence Score:', report1.finalMetrics.confidence);
console.log('Topic:', report1.topic);
console.log('Improvements:');
report1.improvements.forEach((improvement, index) => {
  console.log(`  ${index + 1}. ${improvement}`);
});
console.log('');

// Test 2: Non-participating user
console.log('2. NON-PARTICIPATING USER TEST:');
const zeroMetrics = {
  confidence: 0,
  fluency: 0,
  originality: 0,
  teamwork: 0,
  reasoning: 0,
  wordsPerMinute: 0,
  fillerWords: 0,
  pausePattern: 0,
  sentiment: 0,
  participation: 0,
  emotionalEngagement: 0,
  dominantEmotion: 'neutral',
  emotionConfidence: 0
};

const report2 = reportService.generateReport(
  'test_session_2',
  'user_2',
  'The Future of Remote Work',
  'intermediate',
  1500,
  zeroMetrics,
  [],
  0 // No participation
);

console.log('User Message Count: 0');
console.log('Overall Score:', report2.overallScore);
console.log('Improvements:');
report2.improvements.forEach((improvement, index) => {
  console.log(`  ${index + 1}. ${improvement}`);
});
console.log('');

// Test 3: High filler words user
console.log('3. HIGH FILLER WORDS USER TEST:');
const highFillerMetrics = {
  confidence: 75,
  fluency: 50,  // Low fluency
  originality: 65,
  teamwork: 80,
  reasoning: 72,
  wordsPerMinute: 120,
  fillerWords: 15,  // High filler words
  pausePattern: 8,
  sentiment: 75,
  participation: 85,
  emotionalEngagement: 70,
  dominantEmotion: 'neutral',
  emotionConfidence: 0.5
};

const report3 = reportService.generateReport(
  'test_session_3',
  'user_3',
  'Ethics in Artificial Intelligence',
  'advanced',
  1800,
  highFillerMetrics,
  [],
  5
);

console.log('Filler Words:', report3.finalMetrics.fillerWords);
console.log('Fluency Score:', report3.finalMetrics.fluency);
console.log('Improvements:');
report3.improvements.forEach((improvement, index) => {
  console.log(`  ${index + 1}. ${improvement}`);
});

console.log('\n=== TEST COMPLETE ===');

