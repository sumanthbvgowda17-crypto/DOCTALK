const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChoice {
  message: { role: string; content: string };
  finish_reason: string;
}

interface GroqResponse {
  choices: GroqChoice[];
}

const SYSTEM_PROMPT = `You are DocBot, a friendly and helpful AI assistant for DocTalk — a telemedicine platform designed for rural India with offline-first capabilities. You help users navigate the platform, answer health-related general questions, explain medical terms in simple language, and assist with using DocTalk features.

Key DocTalk features you know about:
- Video/Audio/Chat consultations with automatic fallback based on network quality
- Offline-first case recording that syncs when network returns
- Multi-language support (Kannada, Hindi, English)
- AI-powered symptom triage assistant
- Doctor queue management and clinical workspace
- Network resilience simulator

Important rules:
- Be warm, concise, and helpful
- If asked about specific medical conditions, provide general educational information but always recommend consulting a real doctor
- You can help with platform navigation, feature explanations, and general queries
- Keep responses short (2-4 sentences) unless the user asks for detailed explanations
- Use emojis sparingly to be friendly
- If the user shares an image, describe what you see and provide relevant help
- This is a demonstration prototype — remind users when relevant that no real doctors are connected`;

export async function sendToGroq(
  messages: GroqMessage[],
  imageBase64?: string
): Promise<string> {
  const apiKey =
    import.meta.env.VITE_GROQ_API_KEY || '';

  if (!apiKey) {
    return "⚠️ Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file.";
  }

  const systemMessage: GroqMessage = {
    role: 'system',
    content: SYSTEM_PROMPT
  };

  // Build the messages array for the API
  const apiMessages: GroqMessage[] = [systemMessage, ...messages];

  // If there's an image, append a note about it to the last user message
  if (imageBase64 && apiMessages.length > 0) {
    const lastMsg = apiMessages[apiMessages.length - 1];
    if (lastMsg.role === 'user') {
      lastMsg.content = `${lastMsg.content}\n\n[User has attached an image. Since this is a text model, acknowledge the image was received and offer to help with any questions about it.]`;
    }
  }

  try {
    let response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: apiMessages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    // Fallback to openai/gpt-oss-120b if needed
    if (!response.ok && response.status === 404) {
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: apiMessages,
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 0.9
        })
      });
    }

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', response.status, errorData);
      if (response.status === 401) {
        return "⚠️ API authentication failed. Please check your Groq API key.";
      }
      if (response.status === 429) {
        return "⏳ Rate limit reached. Please wait a moment and try again.";
      }
      return `❌ API error (${response.status}). Please try again.`;
    }

    const data: GroqResponse = await response.json();
    return data.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Groq API call failed:', error);
    return "🔌 Connection error. Please check your internet and try again.";
  }
}
