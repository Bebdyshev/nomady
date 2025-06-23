import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "TravelAI - AI-Powered Trip Planner & Travel Assistant",
    template: "%s | TravelAI"
  },
  description: "Plan your perfect trip with AI assistance. Find flights, hotels, restaurants, and activities all in one place. Smart travel planning made easy with artificial intelligence.",
  keywords: [
    "travel planner",
    "AI travel assistant", 
    "trip planning",
    "flight booking",
    "hotel booking",
    "travel AI",
    "vacation planner",
    "travel recommendations",
    "smart travel",
    "trip advisor"
  ],
  authors: [{ name: "TravelAI Team" }],
  creator: "TravelAI",
  publisher: "TravelAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'TravelAI - AI-Powered Trip Planner & Travel Assistant',
    description: 'Plan your perfect trip with AI assistance. Find flights, hotels, restaurants, and activities all in one place.',
    siteName: 'TravelAI',
    images: [
      {
        url: '/og-image.jpg', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'TravelAI - AI-Powered Trip Planner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TravelAI - AI-Powered Trip Planner',
    description: 'Plan your perfect trip with AI assistance. Find flights, hotels, restaurants, and activities.',
    site: '@travelai', // Replace with your Twitter handle
    creator: '@travelai',
    images: ['/twitter-image.jpg'], // You'll need to create this
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer />
        
        {/* Enhanced favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "TravelAI",
              "description": "AI-powered trip planner and travel assistant",
              "url": "https://your-domain.com",
              "applicationCategory": "TravelApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "150"
              },
              "publisher": {
                "@type": "Organization",
                "name": "TravelAI",
                "url": "https://your-domain.com"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
