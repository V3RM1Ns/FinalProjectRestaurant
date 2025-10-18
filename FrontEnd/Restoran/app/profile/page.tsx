"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, MapPin, Lock, Store, FileText } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: "",
  })
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [ownershipApplication, setOwnershipApplication] = useState({
    businessName: "",
    businessDescription: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    category: "Türk Mutfağı",
    additionalNotes: "",
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Profil Güncellendi",
      description: "Bilgileriniz başarıyla güncellendi.",
    })

    setLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Şifre Değiştirildi",
      description: "Şifreniz başarıyla değiştirildi.",
    })

    setPasswords({ current: "", new: "", confirm: "" })
    setLoading(false)
  }

  const handleOwnershipApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Başvuru Gönderildi",
      description: "Restoran sahipliği başvurunuz başarıyla gönderildi.",
    })

    setOwnershipApplication({
      businessName: "",
      businessDescription: "",
      businessAddress: "",
      businessPhone: "",
      businessEmail: "",
      category: "Türk Mutfağı",
      additionalNotes: "",
    })
    setLoading(false)
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Profilim</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profil Bilgileri</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
          <TabsTrigger value="ownership">Restoran Sahipliği Başvuru</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
              <CardDescription>Hesap bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Ad Soyad</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phoneNumber}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      className="pl-10"
                      placeholder="+90 555 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adres</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="pl-10"
                      placeholder="Ev veya iş adresiniz"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Şifre Değiştir</CardTitle>
              <CardDescription>Hesabınızın güvenliği için güçlü bir şifre kullanın</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ownership">
          <Card>
            <CardHeader>
              <CardTitle>Restoran Sahipliği Başvuru</CardTitle>
              <CardDescription>Restoran sahipliği için başvuru formunu doldurun</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOwnershipApplication} className="space-y-4">
                <div>
                  <Label htmlFor="businessName">İşletme Adı</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessName"
                      value={ownershipApplication.businessName}
                      onChange={(e) => setOwnershipApplication({ ...ownershipApplication, businessName: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessDescription">İşletme Açıklaması</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessDescription"
                      value={ownershipApplication.businessDescription}
                      onChange={(e) => setOwnershipApplication({ ...ownershipApplication, businessDescription: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessAddress">İşletme Adresi</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessAddress"
                      value={ownershipApplication.businessAddress}
                      onChange={(e) => setOwnershipApplication({ ...ownershipApplication, businessAddress: e.target.value })}
                      className="pl-10"
                      placeholder="İşletmenizin adresi"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessPhone">İşletme Telefonu</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={ownershipApplication.businessPhone}
                      onChange={(e) => setOwnershipApplication({ ...ownershipApplication, businessPhone: e.target.value })}
                      className="pl-10"
                      placeholder="+90 555 123 4567"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessEmail">İşletme E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessEmail"
                      type="email"
                      value={ownershipApplication.businessEmail}
                      onChange={(e) => setOwnershipApplication({ ...ownershipApplication, businessEmail: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <select
                    id="category"
                    value={ownershipApplication.category}
                    onChange={(e) => setOwnershipApplication({ ...ownershipApplication, category: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="Türk Mutfağı">Türk Mutfağı</option>
                    <option value="İtalyan Mutfağı">İtalyan Mutfağı</option>
                    <option value="Japon Mutfağı">Japon Mutfağı</option>
                    <option value="Çin Mutfağı">Çin Mutfağı</option>
                    <option value="Hint Mutfağı">Hint Mutfağı</option>
                    <option value="Meksika Mutfağı">Meksika Mutfağı</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="additionalNotes">Ekstra Notlar</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="additionalNotes"
                      value={ownershipApplication.additionalNotes}
                      onChange={(e) => setOwnershipApplication({ ...ownershipApplication, additionalNotes: e.target.value })}
                      className="pl-10"
                      placeholder="Opsiyonel, eklemek istediğiniz notlar"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
