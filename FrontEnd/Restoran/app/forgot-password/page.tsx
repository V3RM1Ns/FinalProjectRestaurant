"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, KeyRound } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/Account/ForgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (response.ok) {
        setMessage(data.Message || "Eğer bu e-posta adresine kayıtlı bir hesap varsa, şifre sıfırlama talimatları gönderildi.")
      } else {
        setError(data.Message || "Bir hata oluştu. Lütfen tekrar deneyin.")
      }
    } catch {
      setError("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <KeyRound className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Şifre Sıfırlama</CardTitle>
          <CardDescription>Hesabınıza ait e-posta adresini girin. Şifre sıfırlama talimatları e-posta ile gönderilecektir.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <Alert variant="default">
                <Mail className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Gönderiliyor..." : "Şifre Sıfırla"}
            </Button>
            <Button type="button" className="w-full" variant="outline" onClick={() => window.location.href = '/login'}>
              Giriş Sayfasına Git
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
