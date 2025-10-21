"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, Mail, AlertCircle } from "lucide-react"

export default function AccountDeletedPage() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  if (status === "success") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Hesabınız Başarıyla Silindi</CardTitle>
            <CardDescription>
              Hesabınız geçici olarak devre dışı bırakıldı. Verileriniz korunmaktadır.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-blue-900">Hesabınızı Tekrar Aktif Edebilirsiniz</p>
                  <p className="text-blue-700 mt-1">
                    Tekrar giriş yapmak istediğinizde, register sayfasından aynı e-posta ile kayıt olmayı deneyip "Hesabınızı Geri Yükleyin" butonuna tıklayabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Hesabınız güvenli bir şekilde saklanmaktadır ve istediğiniz zaman tekrar aktif edebilirsiniz.
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

  if (status === "failed") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>İşlem Başarısız</CardTitle>
            <CardDescription>
              Hesap silme işlemi sırasında bir hata oluştu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Lütfen daha sonra tekrar deneyin veya destek ekibiyle iletişime geçin.
            </p>
            <div className="pt-4">
              <Link href="/profile" className="w-full">
                <Button className="w-full">Profile Dön</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "invalid" || status === "invalid-token") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Geçersiz veya Süresi Dolmuş Link</CardTitle>
            <CardDescription>
              Bu hesap silme linki geçersiz veya süresi dolmuş.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Lütfen profil ayarlarınızdan tekrar hesap silme işlemi başlatın.
            </p>
            <div className="pt-4">
              <Link href="/profile" className="w-full">
                <Button className="w-full">Profile Dön</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "not-found") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Kullanıcı Bulunamadı</CardTitle>
            <CardDescription>
              Bu kullanıcı hesabı bulunamadı.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Hesap zaten silinmiş olabilir veya mevcut olmayabilir.
            </p>
            <div className="pt-4">
              <Link href="/" className="w-full">
                <Button className="w-full">Ana Sayfaya Dön</Button>
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
            Hesap silme durumu bulunamadı.
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
