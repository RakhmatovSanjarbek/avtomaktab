import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/i18n/language-provider";
import { auth } from "@/auth";
import { getLocaleServer } from "@/lib/get-locale-server";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Avtomaktab",
  description: "Nazariy imtihon platformasi",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const fallback = (session?.user as any)?.preferredLang ?? "uz-latin";
  const initialLocale = await getLocaleServer(fallback);

  return (
    <html lang="uz" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthSessionProvider>
            <LanguageProvider initialLocale={initialLocale}>
              {children}
            </LanguageProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
