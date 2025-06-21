import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle, User, Bot, Loader2, Crown, ArrowLeft, Lock, Zap, Star, CheckCircle, LogOut, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginDialog } from '@/components/LoginDialog';
import { Footer } from '@/components/Footer';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AskRichie = () => {
  const { user, isSubscribed, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hey there! I'm Richie's AI assistant, trained on all his rental arbitrage expertise. I'm here to help you with questions about starting and managing your rental business. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const pricingPlans = [
    {
      id: 'free',
      name: 'Free Trial',
      price: '$0',
      period: '',
      questions: 3,
      features: [
        '3 AI questions',
        'Basic rental arbitrage guidance',
        'Access to quick tips'
      ],
      popular: false
    },
    {
      id: 'essential',
      name: 'Essential',
      price: '$97',
      period: '/month',
      questions: 25,
      features: [
        '25 AI questions per month',
        'Priority response time',
        'Advanced rental strategies',
        'Market analysis guidance'
      ],
      popular: true
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$297',
      period: '/month',
      questions: 100,
      features: [
        '100 AI questions per month',
        'Fastest response time',
        'Advanced deal analysis',
        'Scaling strategies',
        'Legal compliance guidance'
      ],
      popular: false
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: '$497',
      period: '/month',
      questions: 999999,
      features: [
        'Unlimited AI questions',
        'Instant responses',
        'Advanced automation strategies',
        'Portfolio optimization',
        'Direct escalation path to Richie'
      ],
      popular: false
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check question limits
    if (!user) return;
    
    const userPlan = pricingPlans.find(plan => plan.id === selectedPlan) || pricingPlans[0];
    if (questionCount >= userPlan.questions) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `You've reached your question limit of ${userPlan.questions} questions for the ${userPlan.name} plan. Please upgrade to continue asking questions.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setQuestionCount(prev => prev + 1);

    try {
      // Call your AI assistant API here
      const response = await fetch('/api/ask-richie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setQuestionCount(0); // Reset question count when plan changes
  };

  // If user is not logged in, show login/pricing page
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative z-20 w-full border-b border-gray-500/50 bg-slate-700/90 backdrop-blur-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate('/')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-cyan-400"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <BarChart3 className="h-8 w-8 text-cyan-400 neon-text" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    RENTALIZER
                  </h1>
                  <p className="text-sm text-gray-400">Ask Richie AI</p>
                </div>
              </div>

              {/* Login Button */}
              <LoginDialog 
                trigger={
                  <Button 
                    variant="outline"
                    className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300 hover:text-cyan-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                }
              />
            </div>
          </div>
        </header>

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-16">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-6">
                <MessageCircle className="h-16 w-16 text-cyan-400 neon-text" />
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ASK RICHIE AI
                </h1>
              </div>
              <p className="text-lg text-white font-medium mb-4">Your Personal Rental Arbitrage Coach</p>
              
              <div className="mb-12 px-4">
                <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed">
                  Get Instant Answers from Richie's AI - Trained on all of Richie's live coaching sessions, documents, and rental arbitrage expertise.
                </p>
              </div>

              <div className="flex justify-center mb-8">
                <LoginDialog
                  trigger={
                    <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white px-8 py-3">
                      Sign In / Create Account
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-8">Choose Your Plan</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingPlans.map((plan) => (
                  <div key={plan.id} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                    <Card 
                      className={`relative bg-slate-800/80 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-500 h-full group-hover:scale-105 ${
                        plan.popular ? 'ring-2 ring-cyan-500/20' : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-1">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl text-cyan-300">{plan.name}</CardTitle>
                        <div className="text-3xl font-bold text-white">
                          {plan.price}
                          <span className="text-lg text-gray-400">{plan.period}</span>
                        </div>
                        <p className="text-gray-400">
                          {plan.questions === 999999 ? 'Unlimited' : plan.questions} questions{plan.period && ' per month'}
                        </p>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                              <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        <LoginDialog
                          trigger={
                            <Button 
                              className={`w-full ${
                                plan.popular 
                                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500' 
                                  : 'bg-slate-700 hover:bg-slate-600'
                              } text-white`}
                            >
                              {plan.id === 'free' ? 'Start Free Trial' : 'Get Started'}
                            </Button>
                          }
                        />
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Proposition */}
            <Card className="bg-slate-800/30 border-cyan-500/30 backdrop-blur-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-cyan-300 mb-6 text-center">
                  Why Students Choose Ask Richie AI
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Instant Answers</h4>
                    <p className="text-gray-400 text-sm">Get immediate responses to your rental arbitrage questions, 24/7</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Richie's Expertise</h4>
                    <p className="text-gray-400 text-sm">Trained on all live sessions and proven strategies from the $5K program</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Crown className="h-6 w-6 text-cyan-400" />
                    </div>
                    <h4 className="font-semibold text-white mb-2">Proven Results</h4>
                    <p className="text-gray-400 text-sm">Get guidance that's helped thousands build successful rental businesses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // If user is logged in but hasn't selected a plan, show plan selection
  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative z-20 w-full border-b border-gray-500/50 bg-slate-700/90 backdrop-blur-lg">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate('/')}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-cyan-400"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-cyan-400 neon-text" />
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">RENTALIZER</h1>
                    <p className="text-sm text-gray-400">Ask Richie AI</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-gray-300">Welcome back, {user.email}</p>
                </div>
                <Button
                  onClick={signOut}
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">Choose Your Plan</h2>
              <p className="text-gray-300">Select the plan that best fits your needs</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <Card 
                    className={`relative cursor-pointer transition-all bg-slate-800/80 backdrop-blur-lg border border-cyan-500/30 hover:border-cyan-400/60 group-hover:scale-105 ${
                      plan.popular ? 'ring-2 ring-cyan-500/20' : ''
                    }`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl text-cyan-300">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold text-white">
                        {plan.price}
                        <span className="text-lg text-gray-400">{plan.period}</span>
                      </div>
                      <p className="text-gray-400">
                        {plan.questions === 999999 ? 'Unlimited' : plan.questions} questions{plan.period && ' per month'}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                            <CheckCircle className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        } text-white`}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {plan.id === 'free' ? 'Start Free Trial' : 'Select Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Main chat interface for logged-in users with selected plan
  const currentPlan = pricingPlans.find(plan => plan.id === selectedPlan) || pricingPlans[0];
  const remainingQuestions = Math.max(0, currentPlan.questions - questionCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 w-full border-b border-gray-500/50 bg-slate-700/90 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-cyan-400"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-cyan-400 neon-text" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">RENTALIZER</h1>
                  <p className="text-sm text-gray-400">Ask Richie AI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <Badge variant="outline" className="border-cyan-500/50 text-cyan-300">
                  {currentPlan.name} Plan
                </Badge>
                <p className="text-xs text-gray-400 mt-1">
                  {remainingQuestions === 999999 ? 'Unlimited' : remainingQuestions} questions remaining
                </p>
              </div>
              <Button
                onClick={() => setSelectedPlan(null)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Change Plan
              </Button>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Chat Container */}
          <Card className="h-[calc(100vh-200px)] bg-slate-800/80 backdrop-blur-lg border-cyan-500/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Richie's AI Assistant
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Trained on Richie's live coaching sessions, documents, and rental arbitrage expertise
              </p>
            </CardHeader>
            
            <CardContent className="flex flex-col h-full p-0">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white'
                            : 'bg-slate-700/50 text-gray-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>

                    {message.type === 'user' && (
                      <div className="flex-shrink-0 order-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                        <span className="text-gray-400">Richie's AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-700/50 p-6">
                {remainingQuestions === 0 && currentPlan.questions !== 999999 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400 mb-3">You've used all your questions for this month.</p>
                    <Button
                      onClick={() => setSelectedPlan(null)}
                      className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white"
                    >
                      Upgrade Plan
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask Richie's AI about rental arbitrage, property management, scaling strategies..."
                        className="flex-1 bg-slate-700/50 border-gray-600/50 text-white placeholder-gray-400 min-h-[60px] resize-none"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 px-6 h-auto"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Card className="bg-slate-800/30 border-cyan-500/30 backdrop-blur-lg">
              <CardContent className="p-4">
                <h3 className="font-semibold text-cyan-300 mb-2">💡 Quick Tips</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Ask about property selection criteria</li>
                  <li>• Get help with pricing strategies</li>
                  <li>• Learn about automation tools</li>
                  <li>• Understand legal requirements</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800/30 border-cyan-500/30 backdrop-blur-lg">
              <CardContent className="p-4">
                <h3 className="font-semibold text-cyan-300 mb-2">🎯 Popular Questions</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• "How do I find my first rental property?"</li>
                  <li>• "What's the best way to scale to 10 units?"</li>
                  <li>• "How should I handle difficult guests?"</li>
                  <li>• "What are the key metrics to track?"</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AskRichie;
