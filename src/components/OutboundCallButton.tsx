// src/components/OutboundCallButton.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneCall, Loader2, XCircle, CheckCircle } from "lucide-react";

export default function OutboundCallButton() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleCall = async () => {
    if (!phoneNumber) {
      setStatus("error");
      setMessage("Please enter a phone number.");
      return;
    }

    // IMPORTANT: Ensure number is in E.164 format for international
    if (!phoneNumber.startsWith('+')) {
        setStatus("error");
        setMessage("Number must be in E.164 format (e.g., +15551234567)");
        return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // Call your OWN server endpoint
      const response = await fetch('/api/make-outbound-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhoneNumber: phoneNumber,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.details?.message || "Failed to start call.");
      }

      const callData = await response.json();
      console.log("Call started:", callData);
      setStatus("success");
      setMessage(`Call to ${phoneNumber} initiated!`);
      setPhoneNumber(""); // Clear input on success

    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
      console.error("Call failed:", error);
    }
  };

  // Reset status on input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    if (status !== "loading") {
        setStatus("idle");
        setMessage("");
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg">
      <label htmlFor="phone" className="text-sm font-medium">
        Make Outbound AI Call
      </label>
      <p className="text-xs text-slate-500">
        Enter full international number (e.g., +442071234567)
      </p>
      <div className="flex gap-2">
        <Input
          id="phone"
          type="tel"
          placeholder="+15551234567"
          value={phoneNumber}
          onChange={handleInputChange}
          disabled={status === "loading"}
        />
        <Button
          onClick={handleCall}
          disabled={status === "loading" || !phoneNumber}
          className="w-32"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PhoneCall className="w-4 h-4 mr-2" />
          )}
          {status === "loading" ? "Calling..." : "Call"}
        </Button>
      </div>
      {message && (
         <div className={`flex items-center gap-2 text-sm mt-2 ${
            status === 'error' ? 'text-red-600' :
            status === 'success' ? 'text-green-600' : 'text-slate-500'
         }`}>
            {status === 'error' && <XCircle className="w-4 h-4" />}
            {status === 'success' && <CheckCircle className="w-4 h-4" />}
            {message}
         </div>
      )}
    </div>
  );
}