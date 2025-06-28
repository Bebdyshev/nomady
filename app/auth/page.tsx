"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { GoogleSignInButton } from "@/components/google-signin-button"
import { useAuth } from "@/contexts/auth-context"
import { useTranslations } from "@/lib/i18n-client"
import { Sparkles, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { AnimatePresence } from "framer-motion"
import { Logo } from "@/components/ui/logo"

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [verificationStep, setVerificationStep] = useState<'register' | 'verify-code' | null>(null)
  const [verificationEmail, setVerificationEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const { login, register, verifyCode, resendCode, googleLogin, isAuthenticated } = useAuth()
  const router = useRouter()
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/chat")
    }
  }, [isAuthenticated, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await login(loginData.email, loginData.password)

    if (result.success) {
      router.push("/chat")
    } else {
      // Handle specific error for unverified email
      if (result.error?.includes("verify") || result.error?.includes("verified")) {
        setError(t('errors.verifyEmail'))
        setVerificationStep('verify-code')
        setVerificationEmail(loginData.email)
    } else {
      setError(result.error || t('errors.loginFailed'))
      }
    }

    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (registerData.password !== registerData.confirmPassword) {
      setError(t('errors.passwordsNotMatch'))
      setIsLoading(false)
      return
    }

    const result = await register(registerData.name, registerData.email, registerData.password)

    if (result.success) {
      // Move to verification step
      setVerificationStep('verify-code')
      setVerificationEmail(result.email || registerData.email)
      setError("")
      // Clear form data
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
    } else {
      setError(result.error || t('errors.registrationFailed'))
    }

    setIsLoading(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (verificationCode.length !== 6) {
      setError(t('errors.enterValidCode'))
      setIsLoading(false)
      return
    }

    const result = await verifyCode(verificationEmail, verificationCode)

    if (result.success) {
      // Verification successful, user should now be logged in
      router.push("/chat")
    } else {
      setError(result.error || t('errors.invalidCode'))
    }

    setIsLoading(false)
  }

  const handleResendCode = async () => {
    setResendLoading(true)
    const result = await resendCode(verificationEmail)
    
    if (result.success) {
      setError("")
      // Could show a success message here
    } else {
      setError(result.error || t('errors.resendFailed'))
    }
    
    setResendLoading(false)
  }

  const handleCodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setVerificationCode(numericValue)
  }

  // Format code for display with spaces between digits
  const formatCodeForDisplay = (code: string) => {
    return code.split('').join(' ')
  }

  const handleGoogleSuccess = async (credential: string) => {
    setIsLoading(true)
    setError("")

    const result = await googleLogin(credential)

    if (result.success) {
      router.push("/chat")
    } else {
      setError(result.error || t('errors.googleSignInFailed'))
    }

    setIsLoading(false)
  }

  const handleGoogleError = (error: any) => {
    console.error("Google sign-in error:", error)
    setError(t('errors.googleSignInFailed'))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Logo width={40} height={40} className="rounded-lg" />
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">Nomady</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('welcome')}</h1>
          <p className="text-slate-600 dark:text-slate-300">{t('subtitle')}</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-slate-900 dark:text-white">{t('getStarted')}</CardTitle>
            <CardDescription className="text-center">{t('chooseMethod')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Verification Success Message */}
              {verificationStep === 'verify-code' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {t('checkEmail')}
                      </h3>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                        {t('verificationMessage')} {verificationEmail}
                      </p>
                      <div className="mt-3 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResendCode}
                          disabled={resendLoading}
                          className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          {resendLoading ? (
                            <>
                              <div className="h-3 w-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1" />
                              {t('sending')}
                            </>
                          ) : (
                            t('resendCode')
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVerificationStep(null)}
                          className="text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                        >
                          {t('back')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Code Verification Form */}
              {verificationStep === 'verify-code' ? (
                <motion.form
                  onSubmit={handleVerifyCode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">{t('verificationCode')}</Label>
                    <Input
                      id="verification-code"
                      type="text"
                      placeholder="0 0 0 0 0 0"
                      value={formatCodeForDisplay(verificationCode)}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      maxLength={11} // 6 digits + 5 spaces
                      className="h-12 text-center text-xl tracking-widest font-mono border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                      disabled={isLoading}
                      autoComplete="one-time-code"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      {t('codeInstructions')}
                    </p>
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('verifying')}</span>
                      </div>
                    ) : (
                      t('verifyCode')
                    )}
                  </Button>
                </motion.form>
              ) : (
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-700">
                  <TabsTrigger value="login" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    {t('signIn')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    {t('signUp')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" asChild>
                  <motion.form
                    key="login"
                    onSubmit={handleLogin}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t('enterEmail')}
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                        disabled={isLoading}
                        className="h-11 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('password')}</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t('enterPassword')}
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          disabled={isLoading}
                          className="h-11 pr-10 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {error && (
                      <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        {error}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('signingIn')}</span>
                        </div>
                      ) : (
                        t('signIn')
                      )}
                    </Button>
                  </motion.form>
                </TabsContent>

                <TabsContent value="register" asChild>
                  <motion.form
                    key="register"
                    onSubmit={handleRegister}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="register-name">{t('fullName')}</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder={t('enterFullName')}
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                        disabled={isLoading}
                        className="h-11 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t('email')}</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder={t('enterEmail')}
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                        disabled={isLoading}
                        className="h-11 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">{t('password')}</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t('createPassword')}
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                          disabled={isLoading}
                          className="h-11 pr-10 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">{t('confirmPassword')}</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder={t('confirmYourPassword')}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                        className="h-11 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                    </div>
                    {error && (
                      <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        {error}
                      </div>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t('creatingAccount')}</span>
                        </div>
                      ) : (
                        t('createAccount')
                      )}
                    </Button>
                  </motion.form>
                </TabsContent>
              </Tabs>
              )}

              {/* Google Sign-In moved below forms */}
              {verificationStep !== 'verify-code' && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                      {t('orContinueWith')}
                    </span>
                  </div>
                </div>

                <GoogleSignInButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={isLoading}
                  text={t('continueWithGoogle')}
                />
              </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
