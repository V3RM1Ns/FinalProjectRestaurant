import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Yetkisiz Erişim</CardTitle>
          <CardDescription>Bu sayfaya erişim yetkiniz bulunmamaktadır.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/login">Ana Sayfaya Dön</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
