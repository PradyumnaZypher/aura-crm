// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Bot } from "lucide-react";

// // Access the Chatbot URL from environment variables
// // IMPORTANT: The variable MUST start with NEXT_PUBLIC_ to be accessible in the browser.
// const CHATBOT_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CHATBOT_URL : undefined;

// export default function ExternalChatTrigger() {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm">
//           <Bot className="h-4 w-4 mr-2" />
//           AI Assistant
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="p-0 max-w-lg h-[80vh] flex flex-col">
//         <DialogHeader className="p-4 border-b">
//           <DialogTitle>AI Assistant</DialogTitle>
//         </DialogHeader>
//         {/* Check if the CHATBOT_URL is set in the environment file */}
//         {!CHATBOT_URL ? (
//           <div className="flex-1 flex items-center justify-center p-4 text-center">
//             <p className="text-muted-foreground">
//               Please set the <code>NEXT_PUBLIC_CHATBOT_URL</code> in your 
//               <br/><code>.env.local</code> file.
//             </p>
//           </div>
//         ) : (
//           <iframe
//             src={CHATBOT_URL}
//             title="AI Chat Bot"
//             className="w-full h-full border-0 flex-1"
//           />
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Bot } from "lucide-react";

// // Access the Chatbot URL from environment variables
// // IMPORTANT: The variable MUST start with NEXT_PUBLIC_ to be accessible in the browser.
// const CHATBOT_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CHATBOT_URL : undefined;

// export default function ExternalChatTrigger() {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm">
//           <Bot className="h-4 w-4 mr-2" />
//           AI Assistant
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="p-0 w-screen h-screen max-w-none flex flex-col">
//         <DialogHeader className="p-4 border-b">
//           <DialogTitle>AI Assistant</DialogTitle>
//         </DialogHeader>
//         {/* Check if the CHATBOT_URL is set in the environment file */}
//         {!CHATBOT_URL ? (
//           <div className="flex-1 flex items-center justify-center p-4 text-center">
//             <p className="text-muted-foreground">
//               Please set the <code>NEXT_PUBLIC_CHATBOT_URL</code> in your 
//               <br/><code>.env.local</code> file.
//             </p>
//           </div>
//         ) : (
//           <iframe
//             src={CHATBOT_URL}
//             title="AI Chat Bot"
//             className="w-full h-full border-0 flex-1"
//           />
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Bot } from "lucide-react";

// // Access the Chatbot URL from environment variables
// // IMPORTANT: The variable MUST start with NEXT_PUBLIC_ to be accessible in the browser.
// const CHATBOT_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CHATBOT_URL : undefined;

// export default function ExternalChatTrigger() {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm">
//           <Bot className="h-4 w-4 mr-2" />
//           AI Assistant
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="p-0 w-screen h-screen max-w-none flex flex-col">
//         <DialogHeader className="p-4 border-b">
//           <DialogTitle>AI Assistant</DialogTitle>
//         </DialogHeader>
//         {/* Check if the CHATBOT_URL is set in the environment file */}
//         {!CHATBOT_URL ? (
//           <div className="flex-1 flex items-center justify-center p-4 text-center">
//             <p className="text-muted-foreground">
//               Please set the <code>NEXT_PUBLIC_CHATBOT_URL</code> in your 
//               <br/><code>.env.local</code> file.
//             </p>
//           </div>
//         ) : (
//           <iframe
//             src={CHATBOT_URL}
//             title="AI Chat Bot"
//             className="w-full h-full border-0 flex-1"
//           />
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }

// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Bot } from "lucide-react";

// // Access the Chatbot URL from environment variables
// // IMPORTANT: The variable MUST start with NEXT_PUBLIC_ to be accessible in the browser.
// const CHATBOT_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CHATBOT_URL : undefined;

// export default function ExternalChatTrigger() {
//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm">
//           <Bot className="h-4 w-4 mr-2" />
//           AI Assistant
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="p-0 w-[100vw] h-[100vh] max-w-none max-h-none flex flex-col fixed inset-0">
//         <DialogHeader className="p-4 border-b">
//           <DialogTitle>AI Assistant</DialogTitle>
//         </DialogHeader>
//         {/* Check if the CHATBOT_URL is set in the environment file */}
//         {!CHATBOT_URL ? (
//           <div className="flex-1 flex items-center justify-center p-4 text-center">
//             <p className="text-muted-foreground">
//               Please set the <code>NEXT_PUBLIC_CHATBOT_URL</code> in your 
//               <br/><code>.env.local</code> file.
//             </p>
//           </div>
//         ) : (
//           <iframe
//             src={CHATBOT_URL}
//             title="AI Chat Bot"
//             className="w-full h-full border-0 flex-1"
//             allowFullScreen
//           />
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }


"use client";

import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { useState } from "react";

// Access the Chatbot URL from environment variables
const CHATBOT_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CHATBOT_URL : undefined;

export default function ExternalChatTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  // Close on escape key
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={openChat}>
        <Bot className="h-4 w-4 mr-2" />
        AI Assistant
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeChat}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          {!CHATBOT_URL ? (
            <div className="flex-1 flex items-center justify-center p-4 text-center">
              <p className="text-muted-foreground">
                Please set the <code>NEXT_PUBLIC_CHATBOT_URL</code> in your 
                <br/><code>.env.local</code> file.
              </p>
            </div>
          ) : (
            <iframe
              src={CHATBOT_URL}
              title="AI Chat Bot"
              className="w-full h-full border-0 flex-1"
              allowFullScreen
            />
          )}
        </div>
      )}
    </>
  );
}



