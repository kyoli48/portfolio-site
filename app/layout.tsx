import { ThemeProvider } from '@/components/layout/theme-provider'
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Alphonsus Koong - Portfolio",
  description: "Personal portfolio of Alphonsus Koong - Builder, Entrepreneur, Explorer",
  keywords: ["portfolio", "software engineer", "entrepreneur", "writer"],
  authors: [{ name: "Alphonsus Koong" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
