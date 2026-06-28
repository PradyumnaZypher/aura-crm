"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import AIChatWidget from './AIChatWidget';

export default function AIChatTrigger() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          AI Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>AI Assistant</DialogTitle>
        </DialogHeader>
        <AIChatWidget />
      </DialogContent>
    </Dialog>
  );
}
