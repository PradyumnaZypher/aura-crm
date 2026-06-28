// src/app/api/make-outbound-call/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 1. Get the customer's phone number from the request
  const { customerPhoneNumber } = await request.json();

  if (!customerPhoneNumber) {
    return NextResponse.json(
      { error: 'customerPhoneNumber is required' },
      { status: 400 }
    );
  }

  // 2. Load your secret keys from .env
  const VAPI_API_KEY = process.env.VAPI_PRIVATE_KEY;
  const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;
  const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

  if (!VAPI_API_KEY || !VAPI_PHONE_NUMBER_ID || !VAPI_ASSISTANT_ID) {
    return NextResponse.json(
      { error: 'Server environment variables are not set.' },
      { status: 500 }
    );
  }

  try {
    // 3. Make the API call to Vapi to start the phone call
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`, // Use your Private Key here
      },
      body: JSON.stringify({
        phoneNumberId: VAPI_PHONE_NUMBER_ID, // The Twilio number to call FROM
        assistantId: VAPI_ASSISTANT_ID,       // The assistant who will speak
        customer: {
          number: customerPhoneNumber,        // The customer's number to call TO
        },
      }),
    });

    if (!response.ok) {
      // If Vapi returns an error
      const error = await response.json();
      console.error('Vapi API Error:', error);
      return NextResponse.json(
        { error: 'Failed to start call', details: error },
        { status: 500 }
      );
    }

    // 4. Send the successful call data back to the frontend
    const callData = await response.json();
    return NextResponse.json(callData);

  } catch (error: any) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}