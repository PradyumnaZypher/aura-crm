// src/components/VapiCallButton.tsx

// This tells Next.js to run this component in the browser (client-side)
"use client";

import Vapi from "@vapi-ai/web";
import { useState } from "react";

// 1. Initialize Vapi with your Public Key
// We check if (typeof window !== 'undefined') to ensure this code only runs in the browser.
let vapi: Vapi | null = null;
if (typeof window !== "undefined") {
  vapi = new Vapi(
    process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ""
  );
}

const VapiCallButton = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "";

  // 2. Define functions to start and stop the call
  const startCall = () => {
    if (vapi) {
      vapi.start(assistantId);
    }
  };

  const stopCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  // 3. Set up event listeners for call status
  if (vapi) {
    vapi.on("call-start", () => {
      console.log("Vapi call has started.");
      setIsCallActive(true);
    });

    vapi.on("call-end", () => {
      console.log("Vapi call has ended.");
      setIsCallActive(false);
    });

    // You can add other listeners from the docs here (e.g., 'speech-start', 'message')
    vapi.on("message", (message) => {
      console.log("Vapi message:", message);
    });

    vapi.on("error", (e) => {
      console.error("Vapi error:", e);
      setIsCallActive(false);
    });
  }

  // 4. Render a button to toggle the call
  return (
    <button
      onClick={isCallActive ? stopCall : startCall}
      style={{
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: isCallActive ? "red" : "green",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      {isCallActive ? "Stop Call" : "Call Assistant"}
    </button>
  );
};

export default VapiCallButton;