
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mic, MicOff, Volume2, AlertCircle } from "lucide-react";
import { storeResponse } from '@/utils/storage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: number;
  text: string;
}

const questions: Question[] = [
  { id: 1, text: "When did the accident occur? Please provide the date and approximate time." },
  { id: 2, text: "Where exactly did the accident take place? Please provide the location details." },
  { id: 3, text: "Were there any other vehicles involved? If yes, how many?" },
  { id: 4, text: "Were there any injuries to you or others? Please describe." },
  { id: 5, text: "Please describe how the accident occurred in your own words." },
  { id: 6, text: "Were there any witnesses to the accident? If yes, do you have their contact information?" },
  { id: 7, text: "Have you taken any photos of the damage or accident scene?" },
  { id: 8, text: "Have you reported this accident to the police? If yes, do you have a report number?" },
];

const VoiceAgent: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  
  const startListening = () => {
    setIsListening(true);
    
    // In a real implementation, we would use the Web Speech API here
    // This is a simplified mock implementation
    setTimeout(() => {
      stopListening();
    }, 5000);
    
    toast({
      title: "Listening...",
      description: "Please speak clearly into your microphone.",
    });
  };
  
  const stopListening = () => {
    setIsListening(false);
    
    // Mock response - in a real implementation, this would come from speech recognition
    const mockResponses = [
      "It happened yesterday around 3 PM.",
      "At the intersection of Main Street and 5th Avenue.",
      "Yes, there was one other car involved.",
      "No injuries to report fortunately.",
      "I was stopping at a red light and the car behind me didn't brake in time.",
      "Yes, there was one witness who gave me their number.",
      "Yes, I took several photos of both vehicles.",
      "Yes, the report number is 2023-45678."
    ];
    
    // Store the mock response
    const newResponse = mockResponses[currentQuestionIndex];
    
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: newResponse
    }));
    
    // Store in our storage util
    storeResponse('voice', {
      question: currentQuestion.text,
      answer: newResponse
    });
    
    toast({
      title: "Response Recorded",
      description: "We've recorded your answer.",
    });
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
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
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const resetForm = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setIsComplete(false);
  };
  
  const hasCurrentResponse = responses[currentQuestion?.id];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Voice Accident Assistant</h1>
            
            <Card className="shadow-md border-gray-200">
              <CardHeader>
                <CardTitle>Accident Details Collection</CardTitle>
                <CardDescription>
                  Please answer the following questions about your accident using your voice.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {!isComplete ? (
                  <>
                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-brand-100 p-2 rounded-full">
                          <Volume2 className="h-5 w-5 text-brand-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium">{currentQuestion.text}</p>
                          {hasCurrentResponse && (
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
                          Previous
                        </Button>
                        <Button onClick={handleNext} disabled={!hasCurrentResponse}>
                          {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'}
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
