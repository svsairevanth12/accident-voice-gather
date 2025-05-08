
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X } from "lucide-react";
import { storeResponse } from '@/utils/storage';
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hello! I'm here to help you report your accident. Can you tell me when it happened?",
    sender: 'bot'
  }
];

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };
    
    setMessages([...messages, newMessage]);
    setInput('');
    
    // Store the response
    storeResponse('chat', { question: messages[messages.length - 1].text, answer: input });
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      let botResponse: Message;
      
      // Simple response logic based on conversation flow
      if (messages.length === 1) {
        botResponse = {
          id: messages.length + 2,
          text: "Thank you. Were there any injuries or other vehicles involved?",
          sender: 'bot'
        };
      } else if (messages.length === 3) {
        botResponse = {
          id: messages.length + 2,
          text: "I understand. Can you briefly describe how the accident occurred?",
          sender: 'bot'
        };
      } else if (messages.length === 5) {
        botResponse = {
          id: messages.length + 2,
          text: "Thanks for providing those details. Would you like to upload any photos of the damage?",
          sender: 'bot'
        };
      } else if (messages.length === 7) {
        botResponse = {
          id: messages.length + 2,
          text: "Thank you for reporting this accident. Your case number is #AC-2023-7845. We'll be in touch shortly with next steps.",
          sender: 'bot'
        };
        
        // Show success toast
        toast({
          title: "Report Submitted",
          description: "Your accident report has been successfully recorded.",
        });
      } else {
        botResponse = {
          id: messages.length + 2,
          text: "Thank you for that information. Is there anything else you'd like to add about the incident?",
          sender: 'bot'
        };
      }
      
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-brand-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-700 transition-colors z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
      
      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50 border border-gray-200">
          <div className="bg-brand-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
              <h3 className="font-semibold">Accident Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${
                    msg.sender === 'user' 
                      ? 'bg-gray-100 ml-auto rounded-tl-lg rounded-bl-lg rounded-tr-none' 
                      : 'bg-brand-50 rounded-tr-lg rounded-br-lg rounded-tl-none'
                  } p-3 rounded-lg max-w-[75%]`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendMessage} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
