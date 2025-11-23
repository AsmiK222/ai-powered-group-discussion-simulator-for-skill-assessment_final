import { Topic } from '../types';

export const TOPICS: Topic[] = [
  {
    id: 'social-media-impact',
    title: 'Impact of Social Media on Society',
    description: 'Discuss the positive and negative effects of social media on modern society, relationships, and communication.',
    category: 'Technology & Society',
    difficulty: 'beginner',
    keywords: ['social media', 'communication', 'relationships', 'privacy', 'mental health'],
    estimatedDuration: 20,
    objectives: ['Analyze social media effects', 'Consider multiple perspectives', 'Discuss solutions']
  },
  {
    id: 'remote-work-future',
    title: 'The Future of Remote Work',
    description: 'Explore the long-term implications of remote work on businesses, employees, and society.',
    category: 'Business & Work',
    difficulty: 'intermediate',
    keywords: ['remote work', 'productivity', 'work-life balance', 'collaboration', 'technology'],
    estimatedDuration: 25,
    objectives: ['Evaluate remote work benefits', 'Address challenges', 'Predict future trends']
  },
  {
    id: 'ai-ethics',
    title: 'Ethics in Artificial Intelligence',
    description: 'Discuss the ethical implications of AI development, including bias, privacy, and job displacement.',
    category: 'Technology & Ethics',
    difficulty: 'advanced',
    keywords: ['AI ethics', 'bias', 'privacy', 'automation', 'responsibility'],
    estimatedDuration: 30,
    objectives: ['Examine ethical dilemmas', 'Propose solutions', 'Consider stakeholder perspectives']
  },
  {
    id: 'sustainable-development',
    title: 'Sustainable Development Goals',
    description: 'Analyze progress toward UN Sustainable Development Goals and discuss implementation strategies.',
    category: 'Environment & Policy',
    difficulty: 'intermediate',
    keywords: ['sustainability', 'development', 'environment', 'policy', 'global goals'],
    estimatedDuration: 25,
    objectives: ['Assess current progress', 'Identify barriers', 'Develop action plans']
  },
  {
    id: 'education-technology',
    title: 'Technology in Education',
    description: 'Examine the role of technology in modern education and its impact on learning outcomes.',
    category: 'Education & Technology',
    difficulty: 'beginner',
    keywords: ['education', 'technology', 'learning', 'digital divide', 'online learning'],
    estimatedDuration: 20,
    objectives: ['Evaluate educational technology', 'Consider accessibility', 'Discuss best practices']
  },
  {
    id: 'healthcare-innovation',
    title: 'Innovation in Healthcare',
    description: 'Discuss emerging healthcare technologies and their potential to transform patient care.',
    category: 'Healthcare & Innovation',
    difficulty: 'advanced',
    keywords: ['healthcare', 'innovation', 'patient care', 'medical technology', 'telemedicine'],
    estimatedDuration: 30,
    objectives: ['Explore new technologies', 'Assess implementation challenges', 'Consider patient impact']
  }
];

export const TOPIC_CATEGORIES = [
  'Technology & Society',
  'Business & Work',
  'Technology & Ethics',
  'Environment & Policy',
  'Education & Technology',
  'Healthcare & Innovation'
];