import React from 'react';
import { MessageCircle, Users, BarChart3, Brain, Target, Award, Sparkles, Zap, TrendingUp, CheckCircle } from 'lucide-react';

interface HomePageProps {
  onStartDiscussion: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartDiscussion }) => {
  const features = [
    {
      icon: Users,
      title: 'AI Bot Personalities',
      description: 'Practice with 4 distinct AI bots: Alexa (Knowledge Coach), Maya (Communication Mentor), Sarah (Leadership Guide), and Momo (Panel Evaluator)'
    },
    {
      icon: MessageCircle,
      title: 'Multi-Modal Interaction',
      description: 'Communicate using both text and voice input with real-time speech recognition and text-to-speech capabilities'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Get instant feedback on confidence, fluency, originality, teamwork, and reasoning skills as you participate'
    },
    {
      icon: Brain,
      title: 'Comprehensive Reports',
      description: 'Receive detailed performance analysis with actionable insights and personalized improvement recommendations'
    }
  ];

  const benefits = [
    { icon: Target, text: 'Improve interview performance' },
    { icon: Users, text: 'Develop teamwork skills' },
    { icon: Brain, text: 'Enhance critical thinking' },
    { icon: Award, text: 'Build communication confidence' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-blue-100 mb-6">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Learning Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Master Group Discussions
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
                with AI Coaching
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Practice with intelligent AI bots, get real-time feedback on your performance, 
              and build the communication skills you need to excel in interviews and placements.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onStartDiscussion}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center gap-2"
              >
                <Zap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Start Practice Session
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No signup required</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">4</div>
                <div className="text-sm text-gray-600 mt-1">AI Bots</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">15+</div>
                <div className="text-sm text-gray-600 mt-1">Metrics Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">Real-time</div>
                <div className="text-sm text-gray-600 mt-1">Analysis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Features</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced AI technology meets intuitive design for the ultimate practice experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-start mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center text-white mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Choose GD Simulator?
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Develop essential skills for academic and professional success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl text-center hover:bg-opacity-20 transition-all duration-300 border border-white border-opacity-20 hover:scale-105 hover:shadow-2xl"
              >
                <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-white font-semibold text-lg">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-3xl p-12 border border-white border-opacity-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Skills?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join students and professionals who are mastering group discussions with AI-powered practice
            </p>
            
            <button
              onClick={onStartDiscussion}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-xl text-xl font-bold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-blue-500/50 flex items-center gap-3 mx-auto"
            >
              <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
              Start Your First Session
              <span className="text-sm font-normal opacity-75">→</span>
            </button>
            
            <p className="text-gray-400 text-sm mt-6">No credit card required • Free to use • Instant access</p>
          </div>
        </div>
      </div>
    </div>
  );
};