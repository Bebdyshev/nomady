"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/lib/i18n-client"
import { useAuth } from "@/contexts/auth-context"
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Download,
  Calendar,
  MessageCircle,
  Star,
  Gift,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/ui/logo"
import confetti from "canvas-confetti"

// Disable static generation for this page
export const dynamic = 'force-dynamic'

interface PaymentDetails {
  amount: string
  plan: string
  transactionId: string
  email: string
}

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const t = useTranslations('success')
  const tCommon = useTranslations('common')
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Extract payment details from URL params (Polar webhook data)
  useEffect(() => {
    const amount = searchParams.get('amount')
    const plan = searchParams.get('plan')
    const transactionId = searchParams.get('transaction_id')
    const email = searchParams.get('email')

    if (amount && plan && transactionId) {
      setPaymentDetails({
        amount,
        plan,
        transactionId,
        email: email || user?.email || ''
      })
    }
    
    setIsLoading(false)

    // Trigger confetti animation
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchParams, user])

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  const getPlanFeatures = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'pro':
        return [
          'Unlimited AI trip suggestions',
          'Advanced itinerary customization', 
          'Priority customer support',
          'Offline access',
          'Group planning tools',
          'Real-time travel updates'
        ]
      case 'team':
        return [
          'Everything in Pro',
          'Team collaboration tools',
          'White-label options',
          'API access',
          'Custom integrations',
          'Dedicated account manager'
        ]
      default:
        return ['Premium features unlocked']
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'pro':
        return <Sparkles className="h-8 w-8 text-blue-600" />
      case 'team':
        return <Zap className="h-8 w-8 text-purple-600" />
      default:
        return <Star className="h-8 w-8 text-yellow-600" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName?.toLowerCase()) {
      case 'pro':
        return 'from-blue-500 to-blue-600'
      case 'team':
        return 'from-purple-500 to-purple-600'
      default:
        return 'from-yellow-500 to-yellow-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Processing your payment...</p>
        </div>
      </div>
    )
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Information Missing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">
              We couldn't find your payment details. Please contact support if you believe this is an error.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push('/chat')}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => router.push('/contact')}
                className="flex-1"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const planFeatures = getPlanFeatures(paymentDetails.plan)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Logo width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-bold text-blue-600">Nomady</span>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Payment Successful
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="text-center mb-12"
          >
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
              <div className="relative bg-green-500 rounded-full p-6">
                <CheckCircle2 className="h-16 w-16 text-white" />
              </div>
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mt-6 mb-4"
            >
              Payment Successful! 🎉
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Welcome to the premium Nomady experience! Your account has been upgraded and you're ready to plan amazing trips.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Payment Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <span>Payment Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">Plan</span>
                    <div className="flex items-center space-x-2">
                      {getPlanIcon(paymentDetails.plan)}
                      <span className="font-semibold capitalize">{paymentDetails.plan} Plan</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">Amount</span>
                    <span className="font-bold text-2xl text-green-600">${paymentDetails.amount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">Transaction ID</span>
                    <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                      {paymentDetails.transactionId}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Email</span>
                    <span className="text-slate-900">{paymentDetails.email}</span>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.print()}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Plan Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <div className={`p-2 bg-gradient-to-r ${getPlanColor(paymentDetails.plan)} rounded-lg`}>
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <span>What's Included</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {planFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">What's Next?</h2>
            
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Start Planning</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Begin your first premium trip planning session with unlimited AI assistance
                  </p>
                  <Button 
                    onClick={() => router.push('/chat')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chatting
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">View Bookings</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Manage all your travel reservations in one convenient place
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/bookings')}
                    className="w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    My Bookings
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Star className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Explore Premium</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Discover all the premium features and advanced planning tools
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/explore')}
                    className="w-full"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Explore
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
            >
              <h3 className="text-2xl font-bold mb-4">Ready to Plan Your Dream Trip?</h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Your premium account is now active! Start planning your next adventure with unlimited AI assistance, 
                advanced features, and priority support.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push('/chat')}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Planning Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/explore')}
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg"
                >
                  Explore Destinations
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-slate-600 mb-4">
              Need help getting started? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="ghost" size="sm">
                📧 support@nomady.live
              </Button>
              <Button variant="ghost" size="sm">
                💬 Live Chat Support
              </Button>
              <Button variant="ghost" size="sm">
                📚 Help Center
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}