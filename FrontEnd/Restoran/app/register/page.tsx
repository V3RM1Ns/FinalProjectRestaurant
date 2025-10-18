"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UtensilsCrossed, Mail, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor")
      return
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/Account/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          FirstName: firstName,
          LastName: lastName,
          Username: username,
          Email: email,
          Password: password,
          ConfirmPassword: confirmPassword,
          Phone: phoneNumber,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setRegisteredEmail(email)
        setRegistrationSuccess(true)
      } else {
        // Detaylı hata mesajları
        console.error("Register error:", data)
        
        if (data.errors) {
          // ModelState hataları - her bir hatayı ayrı satırda göster
          const errorMessages: string[] = []
          
          for (const [field, messages] of Object.entries(data.errors)) {
            if (Array.isArray(messages)) {
              messages.forEach((msg: string) => {
                errorMessages.push(msg)
              })
            } else if (typeof messages === 'string') {
              errorMessages.push(messages)
            }
          }
          
          setError(errorMessages.length > 0 ? errorMessages.join('\n') : "Lütfen tüm alanları doğru şekilde doldurun")
        } else if (data.message || data.Message) {
          setError(data.message || data.Message)
        } else if (data.title) {
          setError(data.title)
        } else {
          setError("Kayıt işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.")
        }
      }
    } catch (err) {
      console.error("Register exception:", err)
      setError("Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch("http://localhost:5000/api/Account/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: registeredEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setError("Doğrulama e-postası tekrar gönderildi!")
      } else {
        setError(data.message || "E-posta gönderilemedi.")
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Kayıt Başarılı!</CardTitle>
            <CardDescription>E-posta adresinizi doğrulayın</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-green-600" />
              <p className="text-sm text-green-800">
                Hesabınız başarıyla oluşturuldu!
              </p>
            </div>
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>{registeredEmail}</strong> adresine bir doğrulama e-postası gönderdik.
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 Lütfen e-posta gelen kutunuzu kontrol edin.</p>
              <p>🔗 E-postadaki doğrulama linkine tıklayın.</p>
              <p>✅ Doğrulama sonrası giriş yapabilirsiniz.</p>
            </div>
            {error && (
              <Alert variant={error.includes("gönderildi") ? "default" : "destructive"}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              onClick={handleResendEmail} 
              variant="outline" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Gönderiliyor..." : "Doğrulama E-postasını Tekrar Gönder"}
            </Button>
            <Button 
              onClick={() => router.push("/login")} 
              className="w-full"
            >
              Giriş Sayfasına Git
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Hesap Oluştur</CardTitle>
          <CardDescription>Yeni hesap oluşturmak için bilgilerinizi girin</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Ahmet"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Yılmaz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                placeholder="ahmetyilmaz"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>
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
              <Label htmlFor="phoneNumber">Telefon (Opsiyonel)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="0555 123 45 67"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="Örnek: Sifre123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Şifre en az 6 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Örnek: Sifre123"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Giriş Yap
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
