"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UtensilsCrossed, Chrome, Mail, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState("")
  const { login } = useAuth()
  const { toast } = useToast()

  const testAccounts = [
    { role: "Admin", email: "admin@gmail.com", password: "admin123" },
    { role: "Owner", email: "owner@gmail.com", password: "owner123" },
    { role: "Employee", email: "employee@gmail.com", password: "employee123" },
    { role: "Customer", email: "customer@gmail.com", password: "customer123" },
    { role: "Delivery", email: "delivery@gmail.com", password: "delivery123" },
  ]

  const handleTestLogin = (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
  }

  const handleResendVerification = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/Account/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: unverifiedEmail }),
      })

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: "Doğrulama e-postası tekrar gönderildi. Lütfen e-posta gelen kutunuzu kontrol edin.",
        })
      } else {
        toast({
          title: "Hata",
          description: "E-posta gönderilemedi. Lütfen tekrar deneyin.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setNeedsVerification(false)
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      if (err?.requiresEmailVerification) {
        setNeedsVerification(true)
        setUnverifiedEmail(email)
        setError("E-posta adresiniz doğrulanmamış. Lütfen e-posta gelen kutunuzu kontrol edin.")
      } else {
        setError(err?.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";

  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Test Hesapları</CardTitle>
            <CardDescription>Sistemi test etmek için aşağıdaki hesapları kullanabilirsiniz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {testAccounts.map((account) => (
              <div
                key={account.role}
                className="p-3 bg-background rounded-lg border hover:border-primary transition-colors cursor-pointer"
                onClick={() => handleTestLogin(account.email, account.password)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{account.role}</span>
                  <Button size="sm" variant="ghost" className="h-6 text-xs">
                    Kullan
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>E-posta: {account.email}</div>
                  <div>Şifre: {account.password}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Hoş Geldiniz</CardTitle>
            <CardDescription>Hesabınıza giriş yapın</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {needsVerification && (
                <Alert className="bg-yellow-50 border-yellow-300">
                  <Mail className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <div className="space-y-2">
                      <p className="font-semibold">E-posta doğrulaması gerekli</p>
                      <p className="text-sm">Hesabınıza giriş yapabilmek için e-posta adresinizi doğrulamanız gerekmektedir.</p>
                      <Button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isLoading}
                        size="sm"
                        variant="outline"
                        className="mt-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
                      >
                        {isLoading ? "Gönderiliyor..." : "Doğrulama E-postasını Tekrar Gönder"}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">veya</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full bg-transparent" onClick={handleGoogleLogin}>
                <Chrome className="mr-2 h-4 w-4" />
                Google ile Giriş Yap
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Hesabınız yok mu?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Kayıt Ol
                </Link>
              </p>
              <p className="text-center text-sm mt-2">
                <Link href="/forgot-password" className="text-blue-600 hover:underline">
                  Şifremi Unuttum?
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
