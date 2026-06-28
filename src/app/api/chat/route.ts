// import Anthropic from '@anthropic-ai/sdk';
// import { NextResponse } from 'next/server';

// // 1. Initialize the Anthropic client with your secret key
// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// });

// // This is the system prompt that defines the AI's role and personality for Claude.
// const systemInstruction = `You are "Momentum AI," a highly intelligent assistant integrated into an AI-enabled CRM system. 
//   Your primary purpose is to help users (admins, agents, and clients) understand and navigate the CRM's features.
//   You are an expert on topics like lead management, customer interactions, analytics, and communication performance.
//   - Be helpful, professional, and concise.
//   - Answer questions about CRM data, lead conversion, and customer satisfaction.
//   - If you don't know an answer, say "I don't have access to that information, but I can help with general CRM questions."
//   - Do not perform actions like sending emails or making calls yourself. Instead, guide the user on how to use the CRM to perform those actions.
//   - Keep your responses structured and easy to read. Use markdown for lists if needed.`;

// export async function POST(request: Request) {
//   try {
//     const { messages } = await request.json();

//     if (!messages) {
//       return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
//     }

//     // 2. Make the API call to Anthropic. We'll use the 'claude-3-haiku' model, which is extremely fast and free.
//     const response = await anthropic.messages.create({
//       model: 'claude-3-haiku-20240307',
//       max_tokens: 1024,
//       system: systemInstruction, // Anthropic has a dedicated 'system' parameter for the prompt
//       messages: messages, // The message format is already compatible
//     });

//     // 3. Parse the response from Anthropic and format it back into the structure our frontend expects.
//     let assistantMessageContent = '';
//     const firstBlock = response.content[0];
//     if (firstBlock.type === 'text') {
//       assistantMessageContent = firstBlock.text;
//     } else {
//       assistantMessageContent = '[No text response from Claude]';
//     }
//     const assistantMessage = {
//       role: 'assistant',
//       content: assistantMessageContent,
//     };
    
//     return NextResponse.json(assistantMessage);

//   } catch (error: any) {
//     console.error('[CHAT_API_ERROR]', error);
//     // Check if it's an authentication error from Anthropic
//     if (error.status === 401) {
//         return NextResponse.json({ error: 'Authentication error. Please check your Anthropic API key.' }, { status: 401 });
//     }
//     return NextResponse.json({ error: error.message || 'An internal error occurred' }, { status: 500 });
//   }
// }

import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'; // 1. Import Prisma Client

// Initialize clients for external services
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
const prisma = new PrismaClient(); // 2. Initialize Prisma Client

// The AI's core identity and instructions
const systemInstruction = `You are "Momentum AI," an intelligent assistant for an AI-enabled CRM. 
  Your primary purpose is to help users by answering questions about CRM data.
  - When the user asks for data (like leads, clients, or products), a CONTEXT block with that data in JSON format will be provided.
  - You MUST use ONLY the data from the CONTEXT block to answer the user's question. Do not make up information.
  - Format your answer in a clean, readable way. For lists of data, use markdown bullet points.
  - If the user asks a general question without requesting data, answer it from your general knowledge about CRMs.
  - Be helpful, professional, and concise.`;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // 3. The RAG Logic Starts Here
    const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
    let context = "";

    // Check for keywords to decide if we need to fetch data
    if (lastUserMessage.includes('team')) {
      const teams = await prisma.team.findMany();
      context = `CONTEXT: Here is the list of teams from the database in JSON format:\n${JSON.stringify(teams, null, 2)}`;
    } else if (lastUserMessage.includes('lead')) {
      const leads = await prisma.lead.findMany({ take: 10, orderBy: { createdAt: 'desc' } }); // Get 10 most recent leads
      context = `CONTEXT: Here is the list of recent leads from the database in JSON format:\n${JSON.stringify(leads, null, 2)}`;
    } else if (lastUserMessage.includes('user')) {
      const users = await prisma.user.findMany({ take: 10, select: { id: true, name: true, email: true, role: true } });
      context = `CONTEXT: Here is the list of users from the database in JSON format:\n${JSON.stringify(users, null, 2)}`;
    }

    // 4. Augment the user's message with the retrieved context (if any)
    const augmentedMessages = [...messages];
    if (context) {
      const lastMessage = augmentedMessages[augmentedMessages.length - 1];
      lastMessage.content = `${context}\n\nBased ONLY on the context provided above, answer the following user question: "${lastMessage.content}"`;
    }

    // 5. Send the final payload to the AI
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048, // Increased token limit to handle more data
      system: systemInstruction,
      messages: augmentedMessages, // Use the augmented message list
    });

    const assistantMessageContent = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '[No text response available]';
    const assistantMessage = {
      role: 'assistant',
      content: assistantMessageContent,
    };
    
    return NextResponse.json(assistantMessage);

  } catch (error: any) {
    console.error('[CHAT_API_ERROR]', error);
    return NextResponse.json({ error: error.message || 'An internal error occurred' }, { status: 500 });
  }
}


