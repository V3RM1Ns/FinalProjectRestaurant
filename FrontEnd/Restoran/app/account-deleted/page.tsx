"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, Mail } from "lucide-react"

export default function AccountDeletedPage() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  if (status === "soft-success") {
    return (
      <div className="container flex items-center justify-center min-h-screen py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Hesabınız Başarıyla Devre Dışı Bırakıldı</CardTitle>
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
                    E-postanıza gönderilen linke tıklayarak hesabınızı istediğiniz zaman tekrar aktif edebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Tekrar aktif etmek için giriş yapmayı denediğinizde e-postanıza yeni bir aktivasyon linki gönderilecektir.
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

