"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, UserCheck, Info } from "lucide-react"

export default function AccountReactivatedPage() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  if (status === "success") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Hesabınız Yeniden Aktif Edildi! 🎉</CardTitle>
            <CardDescription>
              Hoş geldiniz! Hesabınız başarıyla tekrar aktif edildi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-green-900">Artık Giriş Yapabilirsiniz</p>
                  <p className="text-green-700 mt-1">
                    Hesabınız aktif duruma getirildi. Şimdi giriş yaparak Restaurant Management sistemini kullanmaya devam edebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Tüm verileriniz ve ayarlarınız korunmuştur.
            </p>

            <div className="pt-4 space-y-2">
              <Link href="/login" className="w-full">
                <Button className="w-full">Giriş Yap</Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">Ana Sayfaya Dön</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "already-active") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Hesabınız Zaten Aktif</CardTitle>
            <CardDescription>
              Bu hesap zaten aktif durumda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Hesabınız kullanılabilir durumda. Giriş yapabilirsiniz.
            </p>
            <div className="pt-4">
              <Link href="/login" className="w-full">
                <Button className="w-full">Giriş Yap</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "user-not-found") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Kullanıcı Bulunamadı</CardTitle>
            <CardDescription>
              Bu hesap bulunamadı veya kalıcı olarak silinmiş.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Hesap tamamen silinmiş olabilir. Yeni bir hesap oluşturmanız gerekebilir.
            </p>
            <div className="pt-4 space-y-2">
              <Link href="/register" className="w-full">
                <Button className="w-full">Yeni Hesap Oluştur</Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">Ana Sayfaya Dön</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "invalid-token") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <XCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Geçersiz veya Süresi Dolmuş Link</CardTitle>
            <CardDescription>
              Aktivasyon linki geçersiz veya süresi dolmuş.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Lütfen giriş yapmayı tekrar deneyin. E-postanıza yeni bir aktivasyon linki gönderilecektir.
            </p>
            <div className="pt-4">
              <Link href="/login" className="w-full">
                <Button className="w-full">Giriş Sayfasına Git</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Aktivasyon Başarısız</CardTitle>
            <CardDescription>
              Hesap aktivasyonu sırasında bir hata oluştu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Lütfen daha sonra tekrar deneyin veya destek ekibiyle iletişime geçin.
            </p>
            <div className="pt-4">
              <Link href="/login" className="w-full">
                <Button className="w-full">Giriş Sayfasına Dön</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Geçersiz İstek</CardTitle>
          <CardDescription>
            Aktivasyon durumu bulunamadı.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/" className="w-full">
            <Button className="w-full">Ana Sayfaya Dön</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
