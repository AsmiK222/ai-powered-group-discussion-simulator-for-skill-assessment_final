import { PerformanceReport, RealtimeMetrics, PerformanceMetrics, AnalysisDetail } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class ReportService {
  generateReport(
    sessionId: string,
    userId: string,
    topic: string,
    difficulty: string,
    duration: number,
    finalMetrics: PerformanceMetrics,
    metricsHistory: RealtimeMetrics[],
    userMessageCount: number = 0
  ): PerformanceReport {
    // Check if user participated at all
    const hasParticipated = userMessageCount > 0;
    
    let overallScore: number;
    let strengths: string[];
    let weaknesses: string[];
    let improvements: string[];
    let detailedAnalysis: PerformanceReport['detailedAnalysis'];

    if (!hasParticipated) {
      // User didn't participate at all - set all metrics to zero and provide specific feedback
      const zeroMetrics: PerformanceMetrics = {
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
      
      overallScore = 0;
      strengths = ['Shows potential for growth in all areas'];
      weaknesses = ['No participation in the group discussion'];
      improvements = this.generateNonParticipationImprovements(topic);
      detailedAnalysis = this.generateNonParticipationAnalysis(zeroMetrics);
      
      return {
        sessionId,
        userId,
        topic,
        difficulty,
        duration,
        finalMetrics: zeroMetrics,
        strengths,
        weaknesses,
        improvements,
        overallScore,
        detailedAnalysis,
        progressOverTime: metricsHistory,
        generatedAt: new Date()
      };
    }

    // Normal processing for participating users
    overallScore = this.calculateOverallScore(finalMetrics);
    strengths = this.identifyStrengths(finalMetrics);
    weaknesses = this.identifyWeaknesses(finalMetrics);
    improvements = this.generateImprovements(finalMetrics, topic);
    detailedAnalysis = this.generateDetailedAnalysis(finalMetrics);

    return {
      sessionId,
      userId,
      topic,
      difficulty,
      duration,
      finalMetrics,
      strengths,
      weaknesses,
      improvements,
      overallScore,
      detailedAnalysis,
      progressOverTime: metricsHistory,
      generatedAt: new Date()
    };
  }

  private calculateOverallScore(metrics: PerformanceMetrics): number {
    // Core metrics contribute 70%, supporting signals contribute 30%
    const coreWeights = {
      confidence: 0.14, // 0.2 scaled to 70%
      fluency: 0.14,
      originality: 0.105, // 0.15 scaled
      teamwork: 0.14,
      reasoning: 0.175
    } as const;

    const supportingWeights = {
      wordsPerMinute: 0.08,
      fillerWords: 0.08,
      pausePattern: 0.05,
      sentiment: 0.04,
      participation: 0.05
    } as const;

    // Normalization helpers to map raw values to 0-100
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    // Target speaking rate window: ~110-160 wpm is best. Below/above reduces score linearly.
    const normalizeWpm = (wpm: number): number => {
      const idealMin = 110;
      const idealMax = 160;
      const hardMin = 60;
      const hardMax = 220;
      if (wpm <= hardMin || wpm >= hardMax) return 20; // very low score for extremes
      if (wpm < idealMin) {
        const ratio = (wpm - hardMin) / (idealMin - hardMin); // 0..1
        return clamp(20 + ratio * 80, 0, 100);
      }
      if (wpm > idealMax) {
        const ratio = (hardMax - wpm) / (hardMax - idealMax); // 0..1
        return clamp(20 + ratio * 80, 0, 100);
      }
      return 100;
    };

    // Fewer filler words is better. 0 -> 100, 20+ -> 0 linearly.
    const normalizeFillerWords = (count: number): number => {
      const maxBad = 20;
      const score = 100 - clamp((count / maxBad) * 100, 0, 100);
      return score;
    };

    // Assume pausePattern, sentiment, participation already 0-100; clamp just in case
    const normPause = clamp(metrics.pausePattern, 0, 100);
    const normSentiment = clamp(metrics.sentiment, 0, 100);
    const normParticipation = clamp(metrics.participation, 0, 100);

    const coreScore =
      metrics.confidence * coreWeights.confidence +
      metrics.fluency * coreWeights.fluency +
      metrics.originality * coreWeights.originality +
      metrics.teamwork * coreWeights.teamwork +
      metrics.reasoning * coreWeights.reasoning;

    const supportingScore =
      normalizeWpm(metrics.wordsPerMinute) * supportingWeights.wordsPerMinute +
      normalizeFillerWords(metrics.fillerWords) * supportingWeights.fillerWords +
      normPause * supportingWeights.pausePattern +
      normSentiment * supportingWeights.sentiment +
      normParticipation * supportingWeights.participation;

    return Math.round(coreScore + supportingScore);
  }

  private identifyStrengths(metrics: PerformanceMetrics): string[] {
    const strengths: string[] = [];
    const threshold = 75;

    if (metrics.confidence >= threshold) {
      strengths.push('Strong confidence in communication and idea presentation');
    }
    if (metrics.fluency >= threshold) {
      strengths.push('Excellent verbal fluency and articulation skills');
    }
    if (metrics.originality >= threshold) {
      strengths.push('Creative thinking and original perspective contribution');
    }
    if (metrics.teamwork >= threshold) {
      strengths.push('Effective collaboration and team-oriented approach');
    }
    if (metrics.reasoning >= threshold) {
      strengths.push('Logical reasoning and evidence-based argumentation');
    }
    if (metrics.participation >= threshold) {
      strengths.push('Active participation and engagement in discussion');
    }

    if (strengths.length === 0) {
      strengths.push('Shows potential for growth in all areas');
    }

    return strengths;
  }

  private identifyWeaknesses(metrics: PerformanceMetrics): string[] {
    const weaknesses: string[] = [];
    const threshold = 65;

    if (metrics.confidence < threshold) {
      weaknesses.push('Communication confidence could be improved');
    }
    if (metrics.fluency < threshold) {
      weaknesses.push('Verbal fluency and speech delivery need development');
    }
    if (metrics.originality < threshold) {
      weaknesses.push('More creative and original thinking would enhance contributions');
    }
    if (metrics.teamwork < threshold) {
      weaknesses.push('Team collaboration skills require strengthening');
    }
    if (metrics.reasoning < threshold) {
      weaknesses.push('Logical reasoning and argument structure need improvement');
    }
    if (metrics.fillerWords > 10) {
      weaknesses.push('Frequent use of filler words affects communication clarity');
    }

    return weaknesses;
  }

  private generateImprovements(metrics: PerformanceMetrics, topic?: string): string[] {
    // Use tailored improvements if topic is provided
    if (topic) {
      return this.generateTailoredImprovements(metrics, topic);
    }
    
    // Fallback to basic improvements
    const improvements: string[] = [];

    if (metrics.confidence < 70) {
      improvements.push('Practice speaking in front of mirrors to build confidence');
      improvements.push('Prepare key points in advance to feel more secure during discussions');
    }
    if (metrics.fluency < 70) {
      improvements.push('Practice reading aloud daily to improve verbal fluency');
      improvements.push('Record yourself speaking and listen for areas to improve');
    }
    if (metrics.originality < 70) {
      improvements.push('Read widely on various topics to broaden perspective');
      improvements.push('Practice brainstorming techniques to generate more creative ideas');
    }
    if (metrics.teamwork < 70) {
      improvements.push('Focus on actively listening to others before responding');
      improvements.push('Practice building on others\' ideas rather than just presenting your own');
    }
    if (metrics.reasoning < 70) {
      improvements.push('Structure arguments using clear evidence and logical flow');
      improvements.push('Practice identifying and addressing counterarguments');
    }
    if (metrics.fillerWords > 8) {
      improvements.push('Practice pausing instead of using filler words');
      improvements.push('Slow down speech pace to reduce reliance on fillers');
    }

    return improvements;
  }

  private generateDetailedAnalysis(metrics: PerformanceMetrics): PerformanceReport['detailedAnalysis'] {
    return {
      confidence: this.analyzeConfidence(metrics.confidence),
      fluency: this.analyzeFluency(metrics.fluency, metrics.wordsPerMinute, metrics.fillerWords),
      originality: this.analyzeOriginality(metrics.originality),
      teamwork: this.analyzeTeamwork(metrics.teamwork),
      reasoning: this.analyzeReasoning(metrics.reasoning)
    };
  }

  private analyzeConfidence(score: number): AnalysisDetail {
    let feedback = '';
    let examples: string[] = [];
    let improvements: string[] = [];

    if (score >= 85) {
      feedback = 'Excellent confidence levels throughout the discussion. You demonstrated strong self-assurance and conviction in your ideas.';
      examples = ['Clear voice projection', 'Assertive body language', 'Willingness to take initiative'];
      improvements = ['Maintain this confidence while remaining open to feedback', 'Help encourage others to participate'];
    } else if (score >= 70) {
      feedback = 'Good confidence levels with room for further development. You showed comfortable participation with occasional hesitation.';
      examples = ['Generally clear communication', 'Participated actively', 'Some hesitation in challenging topics'];
      improvements = ['Practice speaking on controversial topics', 'Work on maintaining composure under pressure'];
    } else {
      feedback = 'Confidence levels could be improved. Consider building your self-assurance through practice and preparation.';
      examples = ['Frequent hesitation', 'Soft voice projection', 'Tendency to defer to others'];
      improvements = [
        'Watch "How to Build Confidence" by TED-Ed on YouTube for practical techniques',
        'Follow "Charisma on Command" YouTube channel for communication confidence tips',
        'Practice with "Toastmasters International" speaking exercises available on YouTube',
        'Join local speaking clubs or practice groups to build real-world confidence'
      ];
    }

    return { score, feedback, examples, improvements };
  }

  private analyzeFluency(score: number, wpm: number, fillers: number): AnalysisDetail {
    let feedback = '';
    let examples: string[] = [];
    let improvements: string[] = [];

    if (score >= 85) {
      feedback = `Excellent fluency with ${wpm} words per minute and minimal filler words. Your speech flow was natural and engaging.`;
      examples = ['Smooth transitions between ideas', 'Natural speech rhythm', 'Minimal use of filler words'];
      improvements = ['Maintain this excellent pace', 'Consider varying speech rhythm for emphasis'];
    } else if (score >= 70) {
      feedback = `Good fluency with some areas for improvement. Speech rate of ${wpm} wpm is reasonable with ${fillers} filler words noted.`;
      examples = ['Generally smooth delivery', 'Occasional pauses for thought', 'Some filler word usage'];
      improvements = ['Practice eliminating filler words', 'Work on smoother transitions'];
    } else {
      feedback = `Fluency needs development. Focus on improving speech flow and reducing the ${fillers} filler words observed.`;
      examples = ['Frequent pauses', 'Many filler words', 'Disrupted speech flow'];
      improvements = [
        'Watch "How to Speak More Clearly" by Voice Coach on YouTube',
        'Follow "Rachel\'s English" YouTube channel for pronunciation and fluency exercises',
        'Practice with "English Speaking Practice" videos by English Addict with Mr Steve',
        'Use "Shadowing Technique" tutorials available on YouTube for speech rhythm improvement',
        'Practice reading aloud daily with news articles or books to improve flow'
      ];
    }

    return { score, feedback, examples, improvements };
  }

  private analyzeOriginality(score: number): AnalysisDetail {
    let feedback = '';
    let examples: string[] = [];
    let improvements: string[] = [];

    if (score >= 85) {
      feedback = 'Outstanding original thinking and creative contributions. You brought unique perspectives that enhanced the discussion.';
      examples = ['Novel insights and connections', 'Creative problem-solving approaches', 'Unique examples and analogies'];
      improvements = ['Continue developing creative thinking', 'Share your creative process with others'];
    } else if (score >= 70) {
      feedback = 'Good original thinking with some creative contributions. You showed ability to think beyond conventional approaches.';
      examples = ['Some unique perspectives', 'Occasional creative insights', 'Building on others\' ideas creatively'];
      improvements = ['Read diverse sources for inspiration', 'Practice brainstorming techniques'];
    } else {
      feedback = 'Originality could be enhanced. Focus on developing more creative and unique perspectives on topics.';
      examples = ['Conventional thinking patterns', 'Limited unique contributions', 'Tendency to agree without adding value'];
      improvements = [
        'Watch "Creative Thinking Techniques" by TED-Ed on YouTube',
        'Study "How to Think Outside the Box" by MindTools on YouTube',
        'Follow "Brainstorming Methods" tutorials by business coaches on YouTube',
        'Watch "Lateral Thinking" videos by Edward de Bono on YouTube',
        'Explore topics from multiple angles and practice devil\'s advocate approach'
      ];
    }

    return { score, feedback, examples, improvements };
  }

  private analyzeTeamwork(score: number): AnalysisDetail {
    let feedback = '';
    let examples: string[] = [];
    let improvements: string[] = [];

    if (score >= 85) {
      feedback = 'Excellent teamwork and collaboration skills. You effectively built on others\' ideas and facilitated inclusive discussion.';
      examples = ['Active listening demonstrated', 'Built on others\' contributions', 'Encouraged participation from all members'];
      improvements = ['Continue modeling excellent teamwork', 'Consider taking on leadership roles'];
    } else if (score >= 70) {
      feedback = 'Good teamwork skills with room for improvement. You collaborated well but could enhance your facilitation of others.';
      examples = ['Generally collaborative approach', 'Some building on others\' ideas', 'Respectful interaction style'];
      improvements = ['Practice more active listening', 'Focus on encouraging quieter participants'];
    } else {
      feedback = 'Teamwork skills need development. Focus on more collaborative and inclusive interaction with team members.';
      examples = ['Limited building on others\' ideas', 'Tendency to focus on own contributions', 'Missed collaboration opportunities'];
      improvements = [
        'Watch "How to Be a Better Team Player" by Harvard Business Review on YouTube',
        'Study "Active Listening Skills" by Communication Coach on YouTube',
        'Follow "Collaboration Techniques" by business leadership channels on YouTube',
        'Watch "How to Facilitate Group Discussions" by facilitation experts on YouTube',
        'Practice active listening techniques and focus on asking questions about others\' ideas'
      ];
    }

    return { score, feedback, examples, improvements };
  }

  private analyzeReasoning(score: number): AnalysisDetail {
    let feedback = '';
    let examples: string[] = [];
    let improvements: string[] = [];

    if (score >= 85) {
      feedback = 'Excellent logical reasoning and argumentation. Your points were well-structured and supported with clear evidence.';
      examples = ['Clear logical flow', 'Evidence-based arguments', 'Addressed counterarguments effectively'];
      improvements = ['Continue developing complex reasoning skills', 'Help others structure their arguments'];
    } else if (score >= 70) {
      feedback = 'Good reasoning abilities with some well-structured arguments. Continue developing logical flow and evidence support.';
      examples = ['Generally logical arguments', 'Some evidence provided', 'Clear main points'];
      improvements = ['Strengthen evidence gathering', 'Practice addressing counterarguments'];
    } else {
      feedback = 'Reasoning skills need development. Focus on creating more structured arguments with better evidence support.';
      examples = ['Weak argument structure', 'Limited evidence provided', 'Difficulty addressing opposing views'];
      improvements = [
        'Watch "Critical Thinking Skills" by TED-Ed on YouTube',
        'Study "Logical Fallacies" by Crash Course Philosophy on YouTube',
        'Follow "Argument Structure" tutorials by academic writing channels on YouTube',
        'Watch "How to Build Strong Arguments" by debate coaches on YouTube',
        'Practice structured argumentation and research topics thoroughly'
      ];
    }

    return { score, feedback, examples, improvements };
  }

  async exportToPDF(report: PerformanceReport): Promise<Blob> {
    // Render HTML report offscreen, rasterize to canvas, and embed in a PDF
    const htmlContent = this.generateHTMLReport(report);

    // Create an off-DOM container to render the HTML for capture
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '794px'; // ~ A4 width at 96 DPI
    container.style.background = 'white';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
      const target = container as HTMLElement;
      const canvas = await html2canvas(target, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');

      // Create A4 PDF in portrait, units in px to match canvas easier
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions to fit within page while preserving aspect ratio
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let remainingHeight = imgHeight;
      let positionY = 0;

      // Handle multipage if content exceeds one page
      pdf.addImage(imgData, 'PNG', 0, positionY, imgWidth, Math.min(imgHeight, pageHeight));
      remainingHeight -= pageHeight;
      positionY = -pageHeight;

      while (remainingHeight > 0) {
        pdf.addPage();
        positionY += pageHeight;
        pdf.addImage(imgData, 'PNG', 0, positionY, imgWidth, Math.min(imgHeight, pageHeight));
        remainingHeight -= pageHeight;
      }

      // Return as Blob for caller to download
      const blob = pdf.output('blob');
      return blob;
    } finally {
      document.body.removeChild(container);
    }
  }

  exportToHTML(report: PerformanceReport): string {
    return this.generateHTMLReport(report);
  }

  private generateNonParticipationImprovements(topic: string): string[] {
    const topicBasedRecommendations = this.getTopicBasedRecommendations(topic);
    
    return [
      'The user could have spoken in the group discussion to demonstrate their communication skills',
      'Practice speaking up in group settings to build confidence',
      'Prepare talking points in advance to feel more comfortable contributing',
      'Start with small contributions and gradually increase participation',
      'Focus on active listening and building on others\' ideas',
      ...topicBasedRecommendations
    ];
  }

  private generateTailoredImprovements(metrics: PerformanceMetrics, topic: string): string[] {
    const improvements: string[] = [];
    
    // Topic-specific recommendations
    const topicRecommendations = this.getTopicBasedRecommendations(topic);
    improvements.push(...topicRecommendations);
    
    // Confidence-based recommendations
    if (metrics.confidence < 60) {
      improvements.push(...this.getConfidenceBuildingRecommendations());
    }
    
    // Fluency-based recommendations
    if (metrics.fluency < 60) {
      improvements.push(...this.getFluencyImprovementRecommendations());
    }
    
    // Originality-based recommendations
    if (metrics.originality < 60) {
      improvements.push(...this.getOriginalityImprovementRecommendations());
    }
    
    // Teamwork-based recommendations
    if (metrics.teamwork < 60) {
      improvements.push(...this.getTeamworkImprovementRecommendations());
    }
    
    // Reasoning-based recommendations
    if (metrics.reasoning < 60) {
      improvements.push(...this.getReasoningImprovementRecommendations());
    }
    
    // Emotional engagement recommendations
    if (metrics.emotionalEngagement && metrics.emotionalEngagement < 60) {
      improvements.push(...this.getEmotionalEngagementRecommendations());
    }
    
    // Filler words recommendations
    if (metrics.fillerWords > 8) {
      improvements.push(...this.getFillerWordsReductionRecommendations());
    }
    
    // Participation recommendations
    if (metrics.participation < 60) {
      improvements.push(...this.getParticipationImprovementRecommendations());
    }
    
    return improvements;
  }

  private generateNonParticipationAnalysis(_metrics: PerformanceMetrics): PerformanceReport['detailedAnalysis'] {
    return {
      confidence: {
        score: 0,
        feedback: 'No participation detected in the discussion. Confidence cannot be assessed without verbal contribution.',
        examples: ['No verbal contributions', 'No voice projection', 'No assertive communication'],
        improvements: ['Practice speaking in group settings', 'Prepare key points before discussions', 'Start with small contributions']
      },
      fluency: {
        score: 0,
        feedback: 'Speech fluency cannot be evaluated without verbal participation in the discussion.',
        examples: ['No speech delivery', 'No verbal communication', 'No articulation demonstrated'],
        improvements: ['Practice speaking aloud daily', 'Record yourself speaking', 'Join speaking clubs or groups']
      },
      originality: {
        score: 0,
        feedback: 'Original thinking cannot be assessed without contribution of ideas or perspectives.',
        examples: ['No unique perspectives shared', 'No creative contributions', 'No original ideas presented'],
        improvements: ['Read widely on various topics', 'Practice brainstorming techniques', 'Develop unique viewpoints']
      },
      teamwork: {
        score: 0,
        feedback: 'Teamwork skills cannot be evaluated without active participation and collaboration.',
        examples: ['No collaboration demonstrated', 'No team interaction', 'No facilitation of others'],
        improvements: ['Practice active listening', 'Focus on building on others\' ideas', 'Work on inclusive communication']
      },
      reasoning: {
        score: 0,
        feedback: 'Logical reasoning cannot be assessed without presenting arguments or structured thoughts.',
        examples: ['No arguments presented', 'No logical structure demonstrated', 'No evidence-based thinking shown'],
        improvements: ['Practice structured argumentation', 'Research topics thoroughly', 'Learn logical reasoning techniques']
      }
    };
  }

  private getTopicBasedRecommendations(topic: string): string[] {
    const t = (topic || '').toLowerCase();

    // Keyword-first routing for free-form topics (improves mapping for real titles)
    if (t.includes('mental health')) {
      return [
        'Read WHO and UNESCO briefs on school-based mental health programs',
        'Review "School Mental Health: A Framework for Promotion, Prevention, and Intervention" (Springer)',
        'Study research on curriculum-integrated mental health literacy by Dr. Stan Kutcher',
        'Read systematic reviews on SEL (Social and Emotional Learning) outcomes (CASEL)',
        'Explore "Mental Health in Schools" articles in The Lancet Child & Adolescent Health'
      ];
    }
    if (t.includes('school') && (t.includes('curriculum') || t.includes('education'))) {
      return [
        'Study OECD reports on education innovation and curriculum reform',
        'Read UNESCO guidance on competency-based curricula and digital literacy',
        'Review meta-analyses on curriculum design effectiveness (Review of Educational Research)'
      ];
    }
    if (t.includes('ai ethics') || (t.includes('ai') && t.includes('ethic'))) {
      return [
        'Read "Weapons of Math Destruction" by Cathy O’Neil for AI bias foundations',
        'Study the IEEE Ethically Aligned Design guidelines',
        'Review the EU AI Act overview and NIST AI Risk Management Framework'
      ];
    }
    if (t.includes('remote work') || t.includes('hybrid work')) {
      return [
        'Read "Remote Work Revolution" by Tsedal Neeley',
        'Study McKinsey Global Institute reports on hybrid work productivity',
        'Review HBR articles on asynchronous collaboration best practices'
      ];
    }
    if (t.includes('sustainable') || t.includes('sdg') || t.includes('climate')) {
      return [
        'Study the UN Sustainable Development Goals (SDGs) primary documentation',
        'Read "Planetary Boundaries" research (Stockholm Resilience Centre)',
        'Review IPCC synthesis reports for latest climate evidence'
      ];
    }

    // Fallback to predefined catalog (IDs used elsewhere in the app)
    const recommendations: { [key: string]: string[] } = {
      'social-media-impact': [
        'Read research papers on "Social Media and Mental Health" by Royal Society for Public Health',
        'Study "The Social Media Effect" by Dr. Jean Twenge for deeper insights',
        'Review articles on "Digital Wellbeing and Social Media Usage Patterns"'
      ],
      'remote-work-future': [
        'Read "Remote Work Revolution" by Tsedal Neeley for comprehensive understanding',
        'Study "The Future of Work" research by McKinsey Global Institute',
        'Review articles on "Hybrid Work Models and Productivity" in Harvard Business Review'
      ],
      'ai-ethics': [
        'Read "Weapons of Math Destruction" by Cathy O\'Neil for AI bias understanding',
        'Study "AI Ethics Guidelines" by IEEE Standards Association',
        'Review "Artificial Intelligence and Ethics" research papers from MIT'
      ],
      'sustainable-development': [
        'Read "Doughnut Economics" by Kate Raworth for sustainable development concepts',
        'Study UN Sustainable Development Goals official documentation',
        'Review "Planetary Boundaries" research by Stockholm Resilience Centre'
      ],
      'education-technology': [
        'Read "The Digital Divide" research by Pew Research Center',
        'Study "Educational Technology Trends" by EDUCAUSE',
        'Review "Online Learning Effectiveness" studies from Stanford University'
      ],
      'healthcare-innovation': [
        'Read "The Digital Doctor" by Robert Wachter for healthcare technology insights',
        'Study "Telemedicine and Healthcare Delivery" research from Mayo Clinic',
        'Review "AI in Healthcare" articles from Nature Medicine journal'
      ]
    };

    // Find matching topic or return general recommendations
    const topicKey = Object.keys(recommendations).find(key => 
      t.includes(key.replace('-', ' ')) || 
      key.replace('-', ' ').includes(t)
    );

    return topicKey ? recommendations[topicKey] : [
      'Read widely on the discussion topic to build knowledge base',
      'Study relevant research papers and articles in the field',
      'Follow industry experts and thought leaders on the topic'
    ];
  }

  private getConfidenceBuildingRecommendations(): string[] {
    return [
      'Watch "How to Build Confidence" by TED-Ed on YouTube for practical confidence-building techniques',
      'Follow "Charisma on Command" YouTube channel for communication confidence tips',
      'Practice with "Toastmasters International" speaking exercises available on YouTube',
      'Watch "Public Speaking Tips" by Communication Coach Alex Lyon on YouTube',
      'Study "Confidence Building Exercises" by Psych2Go on YouTube for mental preparation techniques',
      'Join local speaking clubs or practice groups to build real-world confidence',
      'Record yourself speaking and gradually increase your comfort level with self-observation'
    ];
  }

  private getFluencyImprovementRecommendations(): string[] {
    return [
      'Watch "How to Speak More Clearly" by Voice Coach on YouTube',
      'Follow "Rachel\'s English" YouTube channel for pronunciation and fluency exercises',
      'Practice with "English Speaking Practice" videos by English Addict with Mr Steve',
      'Use "Shadowing Technique" tutorials available on YouTube for speech rhythm improvement',
      'Watch "Tongue Twisters for Speech Clarity" videos for articulation practice',
      'Study "Breathing Techniques for Speaking" by voice coaches on YouTube',
      'Practice reading aloud daily with news articles or books to improve flow'
    ];
  }

  private getOriginalityImprovementRecommendations(): string[] {
    return [
      'Watch "Creative Thinking Techniques" by TED-Ed on YouTube',
      'Study "How to Think Outside the Box" by MindTools on YouTube',
      'Follow "Brainstorming Methods" tutorials by business coaches on YouTube',
      'Watch "Lateral Thinking" videos by Edward de Bono on YouTube',
      'Practice with "Creative Problem Solving" exercises available on educational channels',
      'Study "Design Thinking Process" by IDEO on YouTube for structured creativity',
      'Read diverse sources and practice connecting ideas from different fields'
    ];
  }

  private getTeamworkImprovementRecommendations(): string[] {
    return [
      'Watch "How to Be a Better Team Player" by Harvard Business Review on YouTube',
      'Study "Active Listening Skills" by Communication Coach on YouTube',
      'Follow "Collaboration Techniques" by business leadership channels on YouTube',
      'Watch "How to Facilitate Group Discussions" by facilitation experts on YouTube',
      'Study "Conflict Resolution in Teams" by professional development channels',
      'Practice "Building on Others\' Ideas" techniques shown in teamwork videos',
      'Join group activities or volunteer work to practice collaborative skills'
    ];
  }

  private getReasoningImprovementRecommendations(): string[] {
    return [
      'Watch "Critical Thinking Skills" by TED-Ed on YouTube',
      'Study "Logical Fallacies" by Crash Course Philosophy on YouTube',
      'Follow "Argument Structure" tutorials by academic writing channels on YouTube',
      'Watch "How to Build Strong Arguments" by debate coaches on YouTube',
      'Study "Evidence-Based Reasoning" by research methodology channels',
      'Practice with "Logical Reasoning Exercises" available on educational YouTube channels',
      'Read philosophy and logic books to strengthen reasoning foundations'
    ];
  }

  private getEmotionalEngagementRecommendations(): string[] {
    return [
      'Watch "How to Show Genuine Interest" by communication experts on YouTube',
      'Study "Emotional Intelligence in Communication" by psychology channels on YouTube',
      'Follow "Body Language for Engagement" tutorials by communication coaches',
      'Watch "How to Express Emotions Appropriately" by emotional intelligence experts',
      'Practice "Active Listening with Empathy" techniques shown in counseling videos',
      'Study "Non-verbal Communication" by body language experts on YouTube',
      'Practice mindfulness and emotional awareness exercises'
    ];
  }

  private getFillerWordsReductionRecommendations(): string[] {
    return [
      'Watch "How to Stop Using Filler Words" by public speaking coaches on YouTube',
      'Study "Pause Instead of Fillers" techniques by communication experts on YouTube',
      'Follow "Speech Clarity Exercises" by voice coaches on YouTube',
      'Practice with "Speaking Without Um and Uh" tutorials on YouTube',
      'Watch "Breathing Techniques for Smooth Speech" by speech therapists on YouTube',
      'Use "Slow Down Your Speech" exercises available on communication channels',
      'Record yourself and identify specific filler words to eliminate'
    ];
  }

  private getParticipationImprovementRecommendations(): string[] {
    return [
      'Watch "How to Participate More in Group Discussions" by communication coaches on YouTube',
      'Study "Speaking Up in Meetings" techniques by business communication experts',
      'Follow "Overcoming Shyness in Groups" by psychology channels on YouTube',
      'Watch "How to Make Your Voice Heard" by leadership development channels',
      'Practice with "Group Discussion Strategies" tutorials on educational YouTube channels',
      'Study "Assertive Communication" by communication skills experts on YouTube',
      'Start with small contributions and gradually increase participation frequency'
    ];
  }

  private generateHTMLReport(report: PerformanceReport): string {
    const formatDate = (date: Date) => date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Group Discussion Performance Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
          .metric { display: inline-block; margin: 10px; padding: 15px; background: #e3f2fd; border-radius: 8px; }
          .strength { color: #4caf50; }
          .weakness { color: #f44336; }
          .improvement { color: #ff9800; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Group Discussion Performance Report</h1>
          <p><strong>Topic:</strong> ${report.topic}</p>
          <p><strong>Difficulty:</strong> ${report.difficulty}</p>
          <p><strong>Duration:</strong> ${Math.round(report.duration / 60)} minutes</p>
          <p><strong>Overall Score:</strong> ${report.overallScore}/100</p>
          <p><strong>Generated:</strong> ${formatDate(report.generatedAt)}</p>
        </div>
        
        <h2>Performance Metrics</h2>
        <div class="metric">Confidence: ${report.finalMetrics.confidence.toFixed(1)}</div>
        <div class="metric">Fluency: ${report.finalMetrics.fluency.toFixed(1)}</div>
        <div class="metric">Originality: ${report.finalMetrics.originality.toFixed(1)}</div>
        <div class="metric">Teamwork: ${report.finalMetrics.teamwork.toFixed(1)}</div>
        <div class="metric">Reasoning: ${report.finalMetrics.reasoning.toFixed(1)}</div>
        
        <h2>Strengths</h2>
        <ul class="strength">
          ${report.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
        
        <h2>Areas for Improvement</h2>
        <ul class="weakness">
          ${report.weaknesses.map(w => `<li>${w}</li>`).join('')}
        </ul>
        
        <h2>Improvement Recommendations</h2>
        <ul class="improvement">
          ${report.improvements.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </body>
      </html>
    `;
  }
}

export const reportService = new ReportService();