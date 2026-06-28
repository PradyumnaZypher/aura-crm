// src/components/AIChatButton.tsx

"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

// This function will trigger the Omnidimension widget
const openOmniChat = () => {
  // Third-party scripts often attach a function to the global 'window' object.
  // We check if it exists before calling it to prevent errors.
  if (typeof (window as any).OmniDimensionWidget !== 'undefined') {
    (window as any).OmniDimensionWidget.toggle();
  } else {
    console.error("Omnidimension widget is not available.");
    alert("The AI Chat is not available at the moment. Please try again later.");
  }
};

const AIChatButton = () => {
  return (
    <Button variant="outline" size="sm" onClick={openOmniChat}>
      <MessageCircle className="h-4 w-4 mr-2" />
      AI Chat
    </Button>
  );
};

export default AIChatButton;