// Structured Data schemas for better SEO

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TravelAI",
  "description": "AI-powered trip planner and travel assistant",
  "url": "https://your-domain.com",
  "logo": "https://your-domain.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@your-domain.com"
  },
  "sameAs": [
    "https://twitter.com/travelai",
    "https://facebook.com/travelai",
    "https://instagram.com/travelai"
  ]
}

export const webApplicationSchema = {
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
}

export const breadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
})

export const faqSchema = (faqs: Array<{question: string, answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
}) 