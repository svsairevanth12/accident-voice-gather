
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, MicOff, Volume2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { storeResponse } from '@/utils/storage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from "@/hooks/use-toast";
import { accidentQuestions, Question, getQuestionsByCategory } from '@/data/accidentQuestions';

const VoiceAgent: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  
  // Reference for speech recognition
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const currentQuestion = accidentQuestions[currentQuestionIndex];
  
  useEffect(() => {
    // Initialize responses with stored answers
    const initialResponses: Record<number, string> = {};
    accidentQuestions.forEach(q => {
      if (q.answer) {
        initialResponses[q.id] = q.answer;
      }
    });
    
    setResponses(initialResponses);
    
    if (accidentQuestions.length > 0) {
      setActiveCategory(accidentQuestions[0].category);
    }
    
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setTranscript(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "There was a problem with speech recognition. Please try again.",
        });
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          stopListening();
        }
      };
    }
  }, []);
  
  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use a different browser.",
      });
      return;
    }
    
    setTranscript('');
    setIsListening(true);
    recognitionRef.current.start();
    
    toast({
      title: "Listening...",
      description: "Please speak clearly into your microphone.",
    });
  };
  
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    setIsListening(false);
    
    // Use transcript if available or fallback to pre-defined answer
    const answer = transcript || currentQuestion.answer || '';
    
    // Store the response
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    
    // Store in our storage util
    storeResponse('voice', {
      question: currentQuestion.text,
      answer
    });
    
    toast({
      title: "Response Recorded",
      description: "We've recorded your answer.",
    });
    
    // Reset transcript
    setTranscript('');
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < accidentQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setActiveCategory(accidentQuestions[nextIndex].category);
    } else {
      setIsComplete(true);
      
      toast({
        title: "Report Complete",
        description: "Thank you for providing all the details about your accident.",
      });
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setActiveCategory(accidentQuestions[prevIndex].category);
    }
  };
  
  const resetForm = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setIsComplete(false);
    if (accidentQuestions.length > 0) {
      setActiveCategory(accidentQuestions[0].category);
    }
  };
  
  const hasCurrentResponse = responses[currentQuestion?.id];
  
  // Get unique categories
  const categories = Array.from(new Set(accidentQuestions.map(q => q.category)));
  
  // Get current category progress
  const getCurrentCategoryProgress = () => {
    if (!activeCategory) return { current: 0, total: 0 };
    
    const categoryQuestions = accidentQuestions.filter(q => q.category === activeCategory);
    const currentCatIndex = categoryQuestions.findIndex(q => q.id === currentQuestion.id);
    
    return {
      current: currentCatIndex + 1,
      total: categoryQuestions.length
    };
  };
  
  const progress = getCurrentCategoryProgress();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Voice Accident Assistant</h1>
            
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category, index) => (
                  <div 
                    key={index}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors
                      ${activeCategory === category ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
            
            <Card className="shadow-md border-gray-200">
              <CardHeader>
                <CardTitle>Accident Details Collection</CardTitle>
                <CardDescription>
                  Please answer the following questions about your accident using your voice.
                </CardDescription>
                {activeCategory && (
                  <div className="mt-2 text-sm text-gray-600">
                    {activeCategory} - Question {progress.current} of {progress.total}
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                {!isComplete ? (
                  <>
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-brand-100 p-2 rounded-full">
                          <Volume2 className="h-5 w-5 text-brand-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-medium">{currentQuestion.text}</p>
                          {transcript && isListening && (
                            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200 animate-pulse">
                              <p className="text-gray-700">{transcript}</p>
                            </div>
                          )}
                          {hasCurrentResponse && !isListening && (
                            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-gray-700">{responses[currentQuestion.id]}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-center">
                        <Button 
                          size="lg"
                          onClick={isListening ? stopListening : startListening} 
                          className={`rounded-full h-16 w-16 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-600 hover:bg-brand-700'}`}
                          disabled={!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)}
                        >
                          {isListening ? (
                            <MicOff className="h-6 w-6" />
                          ) : (
                            <Mic className="h-6 w-6" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="text-center text-sm text-gray-500">
                        {isListening ? 'Click to stop recording' : 'Click to start recording your answer'}
                      </div>
                      
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          Previous
                        </Button>
                        <Button onClick={handleNext} disabled={!hasCurrentResponse && !transcript}>
                          {currentQuestionIndex === accidentQuestions.length - 1 ? 'Complete' : 'Next'}
                          {currentQuestionIndex !== accidentQuestions.length - 1 && (
                            <ChevronRight className="ml-1 h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-6">
                    <div className="flex flex-col items-center justify-center text-center gap-4">
                      <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Accident Report Complete</h3>
                      <p className="text-gray-600 max-w-md">
                        Thank you for providing all the necessary details about your accident. Your case number is #AC-2023-8954.
                      </p>
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3 w-full mt-4">
                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          An insurance representative will contact you within 24 hours to discuss the next steps in your claim process.
                        </p>
                      </div>
                      <Button onClick={resetForm} className="mt-4">
                        Start a New Report
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VoiceAgent;
