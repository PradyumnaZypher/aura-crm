import type { Twilio } from 'twilio';
import { db } from '@/lib/db';
import { AICallStatus } from '@prisma/client';

class TwilioService {
  private client: Twilio | null = null;

  private async initialize() {
    if (!this.client) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      
      if (!accountSid || !authToken) {
        throw new Error('Twilio credentials not configured');
      }

      const { Twilio } = await import('twilio');
      this.client = new Twilio(accountSid, authToken);
    }
    return this.client;
  }

  // Initiate AI-powered phone call
  async initiateAICall(phoneNumber: string, callId: string, script: string) {
    try {
      const client = await this.initialize();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const twimlUrl = `${baseUrl}/api/ai/call/voice/${callId}`;
      
      const call = await client.calls.create({
        url: twimlUrl,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER!,
        statusCallback: `${baseUrl}/api/ai/call/status/${callId}`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        record: true,
        recordingStatusCallback: `${baseUrl}/api/ai/call/recording/${callId}`,
        recordingStatusCallbackMethod: 'POST',
        timeout: 30,
        machineDetection: 'Enable'
      });

      // Update call record with Twilio SID
      await db.aICall.update({
        where: { id: callId },
        data: {
          callSid: call.sid,
          status: AICallStatus.RINGING,
          startTime: new Date()
        }
      });

      return call;
    } catch (error) {
      console.error('Twilio Call Error:', error);
      
      // Update call status to failed
      await db.aICall.update({
        where: { id: callId },
        data: {
          status: AICallStatus.FAILED,
          endTime: new Date()
        }
      });

      throw new Error(`Failed to initiate call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Send SMS message
  async sendSMS(to: string, message: string, leadId?: string) {
    try {
      const client = await this.initialize();

      const sms = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: to
      });

      // Log communication if leadId is provided
      if (leadId) {
        await db.leadInteraction.create({
          data: {
            leadId,
            userId: 'system', // AI system
            type: 'SMS',
            direction: 'OUTBOUND',
            summary: message,
            metadata: {
              twilioSid: sms.sid,
              status: sms.status,
              aiGenerated: true
            }
          }
        });
      }

      return sms;
    } catch (error) {
      console.error('SMS Send Error:', error);
      throw new Error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Send WhatsApp message
  async sendWhatsApp(to: string, message: string, leadId?: string) {
    try {
      const client = await this.initialize();

      const whatsapp = await client.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`
      });

      // Log communication if leadId is provided
      if (leadId) {
        await db.leadInteraction.create({
          data: {
            leadId,
            userId: 'system', // AI system
            type: 'SMS', // Using SMS type for WhatsApp
            direction: 'OUTBOUND',
            summary: message,
            metadata: {
              twilioSid: whatsapp.sid,
              status: whatsapp.status,
              platform: 'whatsapp',
              aiGenerated: true
            }
          }
        });
      }

      return whatsapp;
    } catch (error) {
      console.error('WhatsApp Send Error:', error);
      throw new Error(`Failed to send WhatsApp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Handle incoming call webhook - generate TwiML
  async handleIncomingCall(callId: string, script: string) {
    try {
      const aiCall = await db.aICall.findUnique({
        where: { id: callId },
        include: {
          lead: true
        }
      });

      if (!aiCall) {
        throw new Error('Call not found');
      }

      // Generate TwiML response
      const twiml = this.generateTwiMLResponse(script, callId);

      // Update call status
      await db.aICall.update({
        where: { id: callId },
        data: {
          status: AICallStatus.IN_PROGRESS,
          startTime: new Date()
        }
      });

      return twiml;
    } catch (error) {
      console.error('Incoming Call Error:', error);
      return this.generateErrorTwiML();
    }
  }

  // Generate TwiML for voice interaction
  private generateTwiMLResponse(script: string, callId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    Hello! This is an AI assistant calling you today. I'll be brief and to the point.
  </Say>
  
  <Gather input="speech" 
          action="${baseUrl}/api/ai/call/process-speech/${callId}" 
          method="POST" 
          speechTimeout="auto" 
          speechModel="phone_call"
          enhanced="true">
    <Say voice="Polly.Joanna" language="en-US">
      ${script}
    </Say>
  </Gather>
  
  <!-- If no speech input, retry once -->
  <Say voice="Polly.Joanna" language="en-US">
    I didn't catch that. Could you please repeat?
  </Say>
  
  <Gather input="speech" 
          action="${baseUrl}/api/ai/call/process-speech/${callId}" 
          method="POST" 
          speechTimeout="auto" 
          speechModel="phone_call"
          timeout="3">
    <Say voice="Polly.Joanna" language="en-US">
      ${script}
    </Say>
  </Gather>
  
  <Say voice="Polly.Joanna" language="en-US">
    Thank you for your time. Have a great day!
  </Say>
  
  <Hangup />
</Response>`;
  }

  // Generate error TwiML
  private generateErrorTwiML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    We apologize, but we're experiencing technical difficulties. Please try again later.
  </Say>
  <Hangup />
</Response>`;
  }

  // Generate follow-up TwiML after AI response
  generateFollowUpTwiML(aiResponse: string, callId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">
    ${aiResponse}
  </Say>
  
  <Gather input="speech" 
          action="${baseUrl}/api/ai/call/process-speech/${callId}" 
          method="POST" 
          speechTimeout="auto" 
          speechModel="phone_call"
          enhanced="true">
    <Say voice="Polly.Joanna" language="en-US">
      Is there anything else I can help you with today?
    </Say>
  </Gather>
  
  <Say voice="Polly.Joanna" language="en-US">
    Thank you for your time. It was great speaking with you!
  </Say>
  
  <Hangup />
</Response>`;
  }

  // Handle call status updates
  async handleCallStatus(callId: string, status: string, callData: any) {
    try {
      let callStatus: AICallStatus;

      switch (status) {
        case 'initiated':
          callStatus = AICallStatus.INITIATED;
          break;
        case 'ringing':
          callStatus = AICallStatus.RINGING;
          break;
        case 'in-progress':
          callStatus = AICallStatus.IN_PROGRESS;
          break;
        case 'completed':
          callStatus = AICallStatus.COMPLETED;
          break;
        case 'failed':
          callStatus = AICallStatus.FAILED;
          break;
        case 'busy':
          callStatus = AICallStatus.BUSY;
          break;
        case 'no-answer':
          callStatus = AICallStatus.NO_ANSWER;
          break;
        default:
          callStatus = AICallStatus.FAILED;
      }

      const updateData: any = {
        status: callStatus
      };

      // Set end time for completed/failed calls
      if ([AICallStatus.COMPLETED, AICallStatus.FAILED, AICallStatus.BUSY, AICallStatus.NO_ANSWER].includes(callStatus)) {
        updateData.endTime = new Date();
        
        // Calculate duration if start time exists
        const existingCall = await db.aICall.findUnique({ where: { id: callId } });
        if (existingCall?.startTime) {
          updateData.duration = Math.floor((new Date().getTime() - existingCall.startTime.getTime()) / 1000);
        }
      }

      // Store recording URL if available
      if (callData.recording_url) {
        updateData.recordingUrl = callData.recording_url;
      }

      await db.aICall.update({
        where: { id: callId },
        data: updateData
      });

      return { success: true, status: callStatus };
    } catch (error) {
      console.error('Call Status Update Error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get call recording
  async getCallRecording(recordingUrl: string) {
    try {
      const client = await this.initialize();
      
      // Extract recording SID from URL
      const recordingSid = recordingUrl.split('/').pop()?.split('.')[0];
      if (!recordingSid) {
        throw new Error('Invalid recording URL');
      }

      const recording = await client.recordings(recordingSid).fetch();
      
      return {
        url: recordingUrl,
        duration: recording.duration,
        dateCreated: recording.dateCreated,
        status: recording.status
      };
    } catch (error) {
      console.error('Get Recording Error:', error);
      throw new Error(`Failed to get recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate phone number
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation - can be enhanced
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
  }

  // Format phone number for Twilio
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add +1 if US number without country code
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }
    
    // Add + if not present
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }
}

export const twilioService = new TwilioService();