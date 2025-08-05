"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default function SuccessPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)

  useEffect(() => {
    // Проверяем статус подписки пользователя
    const checkSubscriptionStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/users/me`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const userData = await response.json()
          setSubscriptionStatus(userData.subscription_status)
        }
      } catch (error) {
        console.error('Error checking subscription status:', error)
      } finally {
    setIsLoading(false)
      }
    }

    checkSubscriptionStatus()
  }, [])

  const handleContinue = () => {
    router.push('/chat')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <Logo width={48} height={48} />
        </div>
        
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {subscriptionStatus === 'active' ? 'Welcome to Premium!' : 'Thank you for your purchase!'}
          </h1>
          <p className="text-slate-600">
            {subscriptionStatus === 'active' 
              ? 'Your subscription has been activated successfully. You now have access to all premium features.'
              : 'Your payment has been processed. You will receive a confirmation email shortly.'
            }
          </p>
            </div>
            
        <div className="space-y-4">
                    <Button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700"
                  >
            Continue to Chat
            <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
                >
            Back to Home
                </Button>
        </div>

        {subscriptionStatus === 'active' && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Premium Features Unlocked:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Unlimited AI conversations</li>
              <li>• Advanced travel planning</li>
              <li>• Priority support</li>
              <li>• Export itineraries</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}