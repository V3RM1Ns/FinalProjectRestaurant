"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"

export default function EmailVerifiedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push("/login")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [status, router])

  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 animate-bounce">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-600">E-posta Doğrulandı! ✓</CardTitle>
              <CardDescription className="text-base">Hesabınız başarıyla aktif edildi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center border border-green-200">
                <p className="text-lg font-semibold text-green-800 mb-2">
                  🎉 Tebrikler!
                </p>
                <p className="text-sm text-green-700">
                  E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{countdown} saniye içinde giriş sayfasına yönlendirileceksiniz...</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                onClick={() => router.push("/login")} 
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Hemen Giriş Yap
              </Button>
              <Button 
                onClick={() => router.push("/")} 
                variant="outline"
                className="w-full"
              >
                Ana Sayfaya Dön
              </Button>
            </CardFooter>
          </>
        )

      case "already-verified":
        return (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <AlertCircle className="h-12 w-12 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-blue-600">Zaten Doğrulanmış</CardTitle>
              <CardDescription className="text-base">E-posta adresiniz daha önce doğrulandı</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center border border-blue-200">
                <p className="text-sm text-blue-700">
                  E-posta adresiniz zaten doğrulanmış durumda. Hesabınıza giriş yapabilirsiniz.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                onClick={() => router.push("/login")} 
                className="w-full"
                size="lg"
              >
                Giriş Yap
              </Button>
              <Button 
                onClick={() => router.push("/")} 
                variant="outline"
                className="w-full"
              >
                Ana Sayfaya Dön
              </Button>
            </CardFooter>
          </>
        )

      case "failed":
        return (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-red-600">Doğrulama Başarısız</CardTitle>
              <CardDescription className="text-base">E-posta doğrulaması yapılamadı</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gradient-to-br from-red-50 to-pink-50 p-6 text-center border border-red-200">
                <p className="text-sm text-red-700 mb-3">
                  Doğrulama linkiniz geçersiz veya süresi dolmuş olabilir.
                </p>
                <div className="space-y-1 text-xs text-red-600">
                  <p>• Link sadece bir kez kullanılabilir</p>
                  <p>• Link 24 saat geçerlidir</p>
                  <p>• Yeni bir doğrulama linki talep edebilirsiniz</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                onClick={() => router.push("/register")} 
                className="w-full"
                size="lg"
              >
                Yeni Doğrulama Linki İste
              </Button>
              <Button 
                onClick={() => router.push("/")} 
                variant="outline"
                className="w-full"
              >
                Ana Sayfaya Dön
              </Button>
            </CardFooter>
          </>
        )

      default:
        return (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <AlertCircle className="h-12 w-12 text-gray-600" />
              </div>
              <CardTitle className="text-3xl font-bold">Geçersiz İstek</CardTitle>
              <CardDescription className="text-base">Doğrulama durumu belirlenemedi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-6 text-center border border-gray-200">
                <p className="text-sm text-gray-700">
                  Lütfen e-postanızdaki doğrulama linkini kullanın.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => router.push("/")} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                Ana Sayfaya Dön
              </Button>
            </CardFooter>
          </>
        )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        {renderContent()}
      </Card>
    </div>
  )
}

