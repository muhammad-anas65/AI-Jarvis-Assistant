import { useEffect, useRef } from 'react';
import { Bot, User, Loader2, Volume2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  loading: boolean;
  isSpeaking: boolean;
}

export default function ChatInterface({ messages, loading, isSpeaking }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-6">
              <Bot className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to JARVIS</h2>
            <p className="text-slate-400 mb-6">
              Your AI-powered personal assistant. I can help you manage tasks, set reminders,
              take notes, and much more.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Voice Commands</h3>
                <p className="text-slate-400 text-sm">
                  Click the microphone icon to use voice commands. I'll respond with voice too!
                </p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Task Management</h3>
                <p className="text-slate-400 text-sm">
                  Ask me to create tasks, set reminders, or take notes for you.
                </p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Smart Conversations</h3>
                <p className="text-slate-400 text-sm">
                  I remember context and can help with complex multi-step requests.
                </p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Information</h3>
                <p className="text-slate-400 text-sm">
                  Ask me about weather, news, or any information you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
          )}

          <div
            className={`max-w-2xl rounded-2xl px-6 py-4 ${
              message.role === 'user'
                ? 'bg-blue-500/20 border border-blue-500/30 text-white'
                : 'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-slate-100'
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            <p className="text-xs mt-2 opacity-50">
              {new Date(message.created_at).toLocaleTimeString()}
            </p>
          </div>

          {message.role === 'user' && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="flex gap-4 justify-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-6 py-4 flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-slate-300">Thinking...</span>
          </div>
        </div>
      )}

      {isSpeaking && (
        <div className="flex gap-4 justify-start">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-6 py-4 flex items-center gap-2">
            <span className="text-slate-300">Speaking...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
