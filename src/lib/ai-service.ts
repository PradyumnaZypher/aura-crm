import { db } from '@/lib/db';

export interface AIResponse {
  text: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;
  confidence?: number;
  keyPoints?: string[];
  actionItems?: string[];
}

export interface CallContext {
  leadName: string;
  leadCompany?: string;
  leadStatus: string;
  previousInteractions?: any[];
  script: string;
  purpose: string;
}

export interface MessageContext {
  leadName: string;
  leadCompany?: string;
  leadStatus: string;
  previousMessages?: any[];
  tone: 'professional' | 'friendly' | 'casual' | 'formal';
}

class AIService {
  private async getAnthropic() {
    const { Anthropic } = await import('@anthropic-ai/sdk');
    return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  // Generate AI response for phone conversations
  async generateCallResponse(
    userInput: string,
    conversationHistory: Array<{ userInput: string; aiResponse: string; timestamp: Date }>,
    context: CallContext
  ): Promise<AIResponse> {
    try {
      const anthropic = await this.getAnthropic();

      const systemPrompt = `You are an AI sales assistant having a phone conversation. 
Lead Context: ${JSON.stringify(context)}
Script Guidelines: ${context.script}
Purpose: ${context.purpose}

Be natural, conversational, and focused on the goal. Keep responses under 20 seconds when spoken.
Respond appropriately to the user's input and guide the conversation toward the desired outcome.`;

      const messages: any[] = [];

      // Add conversation history (last 5 exchanges to stay within context limits)
      const recentHistory = conversationHistory.slice(-5);
      for (const entry of recentHistory) {
        messages.push({ role: 'user', content: entry.userInput });
        messages.push({ role: 'assistant', content: entry.aiResponse });
      }

      // Add current input
      messages.push({ role: 'user', content: userInput });

      const completion = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 150,
        temperature: 0.7,
        system: systemPrompt,
        messages: messages,
      });

      const response = completion.content[0].type === 'text' ? completion.content[0].text : "I understand. Let me help you with that.";

      // Analyze sentiment
      const sentiment = await this.analyzeSentiment(userInput);

      return {
        text: response,
        sentiment: sentiment.sentiment as any,
        sentimentScore: sentiment.score,
        confidence: 0.9
      };
    } catch (error) {
      console.error('AI Response Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  // Analyze sentiment of conversation
  async analyzeSentiment(text: string): Promise<{ sentiment: string; score: number }> {
    try {
      const anthropic = await this.getAnthropic();

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 50,
        temperature: 0.1,
        system: 'Analyze the sentiment of the following text and respond with ONLY valid JSON: {"sentiment": "positive" | "neutral" | "negative", "score": -1 to 1}. No markdown blocks, just the raw JSON.',
        messages: [
          { role: 'user', content: text }
        ],
      });

      const result = response.content[0].type === 'text' ? response.content[0].text : '';
      try {
        return JSON.parse(result);
      } catch {
        return { sentiment: 'neutral', score: 0 };
      }
    } catch (error) {
      console.error('Sentiment Analysis Error:', error);
      return { sentiment: 'neutral', score: 0 };
    }
  }

  // Generate call summary
  async generateCallSummary(
    transcript: Array<{ speaker: string; text: string; timestamp: Date }>,
    context: CallContext
  ): Promise<{ summary: string; keyPoints: string[]; actionItems: string[] }> {
    try {
      const anthropic = await this.getAnthropic();

      const transcriptText = transcript.map(entry => `${entry.speaker}: ${entry.text}`).join('\n');

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6', // Uses sonnet for complex summarization
        max_tokens: 300,
        temperature: 0.3,
        system: `Create a concise call summary with the following format. Respond ONLY with valid JSON:
{
  "summary": "Brief overview of the conversation",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "actionItems": ["action item 1", "action item 2"]
}

Context: ${JSON.stringify(context)}`,
        messages: [
          { role: 'user', content: `Transcript:\n${transcriptText}` }
        ]
      });

      const result = response.content[0].type === 'text' ? response.content[0].text : '';
      try {
        return JSON.parse(result);
      } catch {
        return { summary: result || 'Summary unavailable', keyPoints: [], actionItems: [] };
      }
    } catch (error) {
      console.error('Call Summary Error:', error);
      return { summary: 'Call summary unavailable', keyPoints: [], actionItems: [] };
    }
  }

  // Generate SMS/WhatsApp responses
  async generateTextResponse(
    message: string,
    context: MessageContext,
    tone: 'professional' | 'friendly' | 'casual' | 'formal' = 'professional'
  ): Promise<AIResponse> {
    try {
      const anthropic = await this.getAnthropic();

      const systemPrompt = `You are a customer service AI responding to a ${tone} message.
Lead Context: ${JSON.stringify(context)}
Tone: ${tone}

Respond appropriately and helpfully. Keep responses concise and suitable for text messaging.`;

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 100,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message }
        ],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : "Thank you for your message. We'll get back to you soon.";

      // Analyze sentiment
      const sentiment = await this.analyzeSentiment(message);

      return {
        text,
        sentiment: sentiment.sentiment as any,
        sentimentScore: sentiment.score,
        confidence: 0.8
      };
    } catch (error) {
      console.error('Text Response Error:', error);
      return {
        text: "Thank you for your message. We'll get back to you soon.",
        sentiment: 'neutral',
        sentimentScore: 0,
        confidence: 0.5
      };
    }
  }

  // Generate AI insights for leads
  async generateLeadInsights(leadId: string): Promise<{
    sentiment: string;
    interestLevel: string;
    riskFactors: string[];
    opportunities: string[];
    recommendations: string[];
  }> {
    try {
      const lead = await db.lead.findUnique({
        where: { id: leadId },
        include: {
          interactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          aiInsights: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      const anthropic = await this.getAnthropic();

      const interactionData = lead.interactions.map(interaction => ({
        type: interaction.type,
        summary: interaction.summary,
        sentiment: interaction.sentiment,
        createdAt: interaction.createdAt
      }));

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 250,
        temperature: 0.3,
        system: `Analyze the following lead data and provide insights in JSON format ONLY:
{
  "sentiment": "positive" | "neutral" | "negative",
  "interestLevel": "high" | "medium" | "low",
  "riskFactors": ["risk 1", "risk 2"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`,
        messages: [
          {
            role: 'user',
            content: `Lead Info: ${JSON.stringify({
              name: `${lead.firstName} ${lead.lastName}`,
              company: lead.company,
              status: lead.status,
              priority: lead.priority
            })}\nInteractions: ${JSON.stringify(interactionData)}`
          }
        ]
      });

      const result = response.content[0].type === 'text' ? response.content[0].text : '';
      try {
        return JSON.parse(result);
      } catch {
        return {
          sentiment: 'neutral',
          interestLevel: 'medium',
          riskFactors: [],
          opportunities: [],
          recommendations: []
        };
      }
    } catch (error) {
      console.error('Lead Insights Error:', error);
      return {
        sentiment: 'neutral',
        interestLevel: 'medium',
        riskFactors: [],
        opportunities: [],
        recommendations: []
      };
    }
  }

  // Generate AI call script
  async generateCallScript(
    purpose: string,
    leadContext: any,
    customInstructions?: string
  ): Promise<string> {
    try {
      const anthropic = await this.getAnthropic();

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 400,
        temperature: 0.6,
        system: `Generate a professional call script for the following purpose. 
The script should be natural, conversational, and effective.
Include opening, key talking points, and closing.`,
        messages: [
          {
            role: 'user',
            content: `Purpose: ${purpose}
Lead Context: ${JSON.stringify(leadContext)}
Custom Instructions: ${customInstructions || 'None'}`
          }
        ],
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'Script generation failed';
    } catch (error) {
      console.error('Script Generation Error:', error);
      return 'Script generation failed. Please try again.';
    }
  }

  // Generate AI campaign content
  async generateCampaignContent(
    campaignType: string,
    targetAudience: string,
    goals: string[]
  ): Promise<{
    script: string;
    keyMessages: string[];
    followUpActions: string[];
  }> {
    try {
      const anthropic = await this.getAnthropic();

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 500,
        temperature: 0.7,
        system: `Generate campaign content in JSON format ONLY:
{
  "script": "Main campaign script",
  "keyMessages": ["message 1", "message 2", "message 3"],
  "followUpActions": ["action 1", "action 2"]
}`,
        messages: [
          {
            role: 'user',
            content: `Campaign Type: ${campaignType}
Target Audience: ${targetAudience}
Goals: ${goals.join(', ')}`
          }
        ],
      });

      const result = response.content[0].type === 'text' ? response.content[0].text : '';
      try {
        return JSON.parse(result);
      } catch {
        return { script: result || '', keyMessages: [], followUpActions: [] };
      }
    } catch (error) {
      console.error('Campaign Content Error:', error);
      return { script: '', keyMessages: [], followUpActions: [] };
    }
  }
}

export const aiService = new AIService();