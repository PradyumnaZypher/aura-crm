import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI CRM System",
  description: "AI-powered CRM based Software",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Team Hexonic" }],
  // icons: {
  //   icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  // },
  openGraph: {
    title: "AI CRM System",
    description: "AI-powered CRM based Software",
    // url: "https://chat.z.ai",
    // siteName: "Z.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI CRM System",
    description: "AI-powered CRM based Software",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}


// For OmniDimension Use, use the the below command only

// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { Toaster } from "@/components/ui/toaster";
// import Script from "next/script"; // 1. IMPORT THE SCRIPT COMPONENT

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Z.ai Code Scaffold - AI-Powered Development",
//   description: "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
//   keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
//   authors: [{ name: "Z.ai Team" }],
//   icons: {
//     icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
//   },
//   openGraph: {
//     title: "Z.ai Code Scaffold",
//     description: "AI-powered development with modern React stack",
//     url: "https://chat.z.ai",
//     siteName: "Z.ai",
//     type: "website",
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: "Z.ai Code Scaffold",
//     description: "AI-powered development with modern React stack",
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
//       >
//         {children}
//         <Toaster />

//         {/* 2. ADD THE OMNIDIMENSION SCRIPT HERE */}
//         <Script
//           id="omnidimension-web-widget"
//           src={`https://backend.omnidim.io/web_widget.js?secret_key=${process.env.NEXT_PUBLIC_OMNIDIMENSION_SECRET_KEY}`}
//           strategy="afterInteractive"
//           async
//         />
//       </body>
//     </html>
//   );
// }

