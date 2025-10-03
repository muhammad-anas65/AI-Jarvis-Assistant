import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import { aiService } from '../services/ai.service';
import ChatInterface from './ChatInterface';
import TaskPanel from './TaskPanel';
import InfoWidgets from './InfoWidgets';
import { LogOut, Mic, MicOff, Volume2, VolumeX, Menu, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { isListening, transcript, startListening, stopListening, speak, isSpeaking, isSupported } = useVoice();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const lastTranscriptRef = useRef('');

  useEffect(() => {
    if (user) {
      loadOrCreateConversation();
    }
  }, [user]);

  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current && !isListening) {
      lastTranscriptRef.current = transcript;
      handleSendMessage(transcript);
    }
  }, [transcript, isListening]);

  const loadOrCreateConversation = async () => {
    if (!user) return;

    const { data: conversations } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (conversations && conversations.length > 0) {
      setConversationId(conversations[0].id);
      loadMessages(conversations[0].id);
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: 'New Conversation',
        })
        .select()
        .single();

      if (newConv) {
        setConversationId(newConv.id);
      }
    }
  };

  const loadMessages = async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data as Message[]);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !conversationId || !user) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: content.trim(),
    });

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const aiResponse = await aiService.chat([
        ...chatHistory,
        { role: 'user', content: content.trim() },
      ]);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse.response,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse.response,
      });

      if (voiceEnabled && aiResponse.response) {
        speak(aiResponse.response);
      }

      if (aiResponse.action) {
        await handleAction(aiResponse.action);
      }

      await supabase.from('command_history').insert({
        user_id: user.id,
        command: content.trim(),
        response: aiResponse.response,
        success: true,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: any) => {
    if (!user) return;

    switch (action.type) {
      case 'create_task':
        await supabase.from('tasks').insert({
          user_id: user.id,
          title: action.params.title,
          description: action.params.description || '',
          priority: action.params.priority || 'medium',
          due_date: action.params.due_date || null,
        });
        break;

      case 'create_reminder':
        await supabase.from('reminders').insert({
          user_id: user.id,
          title: action.params.title,
          description: action.params.description || '',
          remind_at: action.params.remind_at,
        });
        break;

      case 'create_note':
        await supabase.from('notes').insert({
          user_id: user.id,
          title: action.params.title || 'Quick Note',
          content: action.params.content,
        });
        break;
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />

      <div
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } transition-all duration-300 bg-slate-800/30 backdrop-blur-sm border-r border-slate-700/50 overflow-hidden`}
      >
        <div className="h-full overflow-y-auto p-4 space-y-4">
          <TaskPanel />
        </div>
      </div>

      <div className="flex-1 flex flex-col relative">
        <div className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-white"
            >
              {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse" />
              <div>
                <h1 className="text-xl font-bold text-white">JARVIS</h1>
                <p className="text-xs text-slate-400">AI Personal Assistant</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSupported && (
              <>
                <button
                  onClick={toggleVoice}
                  className={`p-2 rounded-lg transition ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-700/50 text-slate-400 hover:text-white'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-2 rounded-lg transition ${
                    voiceEnabled
                      ? 'bg-slate-700/50 text-blue-400'
                      : 'bg-slate-700/50 text-slate-400'
                  } hover:text-white`}
                  title={voiceEnabled ? 'Disable voice responses' : 'Enable voice responses'}
                >
                  {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </>
            )}

            <button
              onClick={signOut}
              className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white transition"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <ChatInterface messages={messages} loading={loading} isSpeaking={isSpeaking} />
            </div>

            <div className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
              <ChatInput onSend={handleSendMessage} disabled={loading} isListening={isListening} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatInput({
  onSend,
  disabled,
  isListening,
}: {
  onSend: (message: string) => void;
  disabled: boolean;
  isListening: boolean;
}) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Type a message or use voice...'}
          disabled={disabled || isListening}
          className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </form>
  );
}
