// src/lib/vapiClient.ts
import Vapi from '@vapi-ai/web';

// Replace this with your real Public Key from Vapi dashboard
export const vapi = new Vapi('your-public-key');

// Example event listeners (you can customize these)
vapi.on('call-start', () => console.log('Vapi call started'));
vapi.on('call-end', () => console.log('Vapi call ended'));
vapi.on('speech-start', () => console.log('Speech started'));
vapi.on('speech-end', () => console.log('Speech ended'));
vapi.on('error', (e) => console.error('Vapi Error:', e));
