import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import dynamic from "next/dynamic"
import "./globals.css"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/next"

// Динамический импорт без SSR для Google Analytics
const GoogleAnalyticsProvider = dynamic(
  () => import("@/components/analytics/ga-provider").then(mod => ({ default: mod.GoogleAnalyticsProvider })),
  { ssr: false }
)

const inter = Inter({ subsets: ["latin"] })

// Google Analytics ID
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID

export const metadata: Metadata = {
  title: {
    default: "Nomady - AI-Powered Trip Planner & Travel Assistant",
    template: "%s | Nomady"
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
  authors: [{ name: "Nomady Team" }],
  creator: "Nomady",
  publisher: "Nomady",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://nomady.live'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Nomady - AI-Powered Trip Planner',
    description: 'Plan your perfect trip with AI assistance. Find flights, hotels, restaurants, and activities all in one place!',
    url: 'https://nomady.live',
    type: 'website',
    images: [
      {
        url: 'https://nomady.live/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Preview image for Nomady',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nomady - AI-Powered Trip Planner',
    description: 'Plan your perfect trip with AI assistance. Find flights, hotels, restaurants, and activities.',
    site: '@nomady', // Replace with your Twitter handle
    creator: '@nomady',
    images: [
      {
        url: 'https://nomady.live/twitter-image.png',
        width: 1200,
        height: 675,
        alt: 'Twitter preview for Nomady',
      }
    ],
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
        
        {/* Google Analytics */}
        {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        
        {/* Enhanced favicon with cache busting */}
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="manifest" href="/manifest.json?v=2" />
        
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
              "name": "Nomady",
              "description": "AI-powered trip planner and travel assistant",
              "url": "https://nomady.live",
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
                "name": "Nomady",
                "url": "https://nomady.live"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <GoogleAnalyticsProvider />
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
