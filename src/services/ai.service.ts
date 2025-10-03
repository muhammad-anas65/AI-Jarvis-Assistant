interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  response: string;
  action?: {
    type: string;
    params: any;
  };
}

export class AIService {
  private systemPrompt = `You are Jarvis, an advanced AI personal assistant inspired by Tony Stark's AI. You are helpful, intelligent, sophisticated, and witty.

Your capabilities include:
- Managing tasks and to-do lists
- Setting reminders and scheduling
- Creating and organizing notes
- Providing weather, news, and stock information
- Answering questions and having natural conversations
- Learning user preferences over time

When users ask you to perform actions (create tasks, set reminders, etc.), respond naturally and indicate what action you're taking.

For task-related requests, include an action object in your response with:
{
  "action": {
    "type": "create_task" | "update_task" | "delete_task" | "create_reminder" | "create_note",
    "params": { relevant parameters }
  }
}

Be conversational, helpful, and maintain context from previous messages. Address the user naturally and professionally.`;

  async chat(messages: Message[], userContext?: any): Promise<AIResponse> {
    const allMessages = [
      { role: 'system' as const, content: this.systemPrompt },
      ...messages,
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: allMessages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      const responseText = data.choices[0]?.message?.content || 'I apologize, I encountered an error.';

      return this.parseResponse(responseText);
    } catch (error) {
      console.error('AI service error:', error);
      return {
        response: this.getFallbackResponse(messages[messages.length - 1]?.content || ''),
      };
    }
  }

  private parseResponse(text: string): AIResponse {
    const actionMatch = text.match(/\{[\s\S]*"action"[\s\S]*\}/);

    if (actionMatch) {
      try {
        const parsed = JSON.parse(actionMatch[0]);
        const cleanText = text.replace(actionMatch[0], '').trim();
        return {
          response: cleanText || parsed.response || 'Action completed.',
          action: parsed.action,
        };
      } catch (e) {
        return { response: text };
      }
    }

    return { response: text };
  }

  private getFallbackResponse(userMessage: string): string {
    const lower = userMessage.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return 'Hello! I am Jarvis, your AI assistant. How may I assist you today?';
    }

    if (lower.includes('task') || lower.includes('todo')) {
      return 'I can help you manage your tasks. You can ask me to create, update, or list your tasks.';
    }

    if (lower.includes('remind') || lower.includes('reminder')) {
      return 'I can set reminders for you. Just tell me what you need to be reminded about and when.';
    }

    if (lower.includes('note')) {
      return 'I can help you create and organize notes. What would you like to note down?';
    }

    if (lower.includes('weather')) {
      return 'I can provide weather information. Which location would you like to know about?';
    }

    return 'I am Jarvis, your AI assistant. I can help you with tasks, reminders, notes, and information. How may I assist you?';
  }
}

export const aiService = new AIService();
