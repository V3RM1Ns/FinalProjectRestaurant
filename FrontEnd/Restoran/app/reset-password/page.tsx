"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { KeyRound } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const userId = params.get("userId")
  const token = params.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    if (!userId || !token) {
      setError("Geçersiz veya eksik bağlantı!")
      return
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.")
      return
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.")
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/Account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token, password, confirmPassword })
      })
      const data = await response.json()
      if (response.ok) {
        setMessage("Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...")
        setTimeout(() => router.push("/login"), 2500)
      } else {
        setError(data.Message || "Şifre sıfırlama başarısız. Linkin süresi dolmuş olabilir.")
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
          <CardTitle className="text-2xl font-bold">Yeni Şifre Belirle</CardTitle>
          <CardDescription>Yeni şifrenizi girin ve onaylayın.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <Alert variant="default">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
              <Input
                id="password"
                type="password"
                placeholder="Yeni şifreniz"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Yeni Şifre (Tekrar)</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Yeni şifrenizi tekrar yazın"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : "Şifreyi Sıfırla"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

