"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UtensilsCrossed, ChefHat, Clock, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      switch (user.roles?.[0]) {
        case "Owner":
          router.push("/owner/dashboard")
          break
        case "Employee":
          router.push("/employee/dashboard")
          break
        case "Admin":
          router.push("/admin/dashboard")
          break
        default:
          router.push("/restaurants")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <img src="/restaurant-hero.jpg" alt="Restaurant" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">En Lezzetli Yemekler Kapınızda</h1>
            <p className="text-xl md:text-2xl mb-8 text-pretty">
              Binlerce restoran arasından seçim yapın, hızlı teslimat ile siparişinizi alın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link href="/restaurants">Restoranları Keşfet</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white"
              >
                <Link href="/login">Giriş Yap</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <h2 className="text-4xl font-bold text-center mb-12">Neden Bizi Seçmelisiniz?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <UtensilsCrossed className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Geniş Restoran Seçeneği</h3>
                <p className="text-muted-foreground">
                  Türk mutfağından dünya mutfağına kadar binlerce restoran seçeneği
                </p>
              </div>
              <div className="text-center p-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Hızlı Teslimat</h3>
                <p className="text-muted-foreground">Siparişiniz ortalama 30-45 dakika içinde kapınızda</p>
              </div>
              <div className="text-center p-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Kaliteli Hizmet</h3>
                <p className="text-muted-foreground">Müşteri memnuniyeti odaklı, güvenilir ve kaliteli hizmet</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container text-center">
            <ChefHat className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Hemen Sipariş Vermeye Başlayın</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Favori restoranlarınızdan kolayca sipariş verin, özel fırsatlardan yararlanın
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg px-8">
              <Link href="/register">Ücretsiz Kayıt Ol</Link>
            </Button>
          </div>
        </section>
      </div>
    )
  }

  return null
}
