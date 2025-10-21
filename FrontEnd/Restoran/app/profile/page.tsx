"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, MapPin, Lock, Store, FileText, Trash2 } from "lucide-react"
import { ApiClient } from "@/lib/api"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function ProfilePage() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [fetchingProfile, setFetchingProfile] = useState(true)
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        userName: "",
        email: "",
        phone: "",
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

    // Profil bilgilerini API'den çek
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await ApiClient.get<any>("/Account/profile")
                setProfile({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    userName: data.userName || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                })
            } catch (error: any) {
                toast({
                    title: "Hata",
                    description: error.message || "Profil bilgileri yüklenemedi.",
                    variant: "destructive",
                })
            } finally {
                setFetchingProfile(false)
            }
        }

        fetchProfile()
    }, [toast])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = await ApiClient.post<any>("/Account/profile", profile)
            toast({
                title: "Başarılı",
                description: data.message || "Profil başarıyla güncellendi.",
            })
        } catch (error: any) {
            // Hata mesajını parse et
            const errorMessage = error.message || "Profil güncellenemedi."

            toast({
                title: "Hata",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
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

        try {
            const data = await ApiClient.post<any>("/Account/change-password", {
                currentPassword: passwords.current,
                newPassword: passwords.new,
                confirmPassword: passwords.confirm,
            })

            toast({
                title: "Başarılı",
                description: data.message || "Şifreniz başarıyla değiştirildi.",
            })

            setPasswords({ current: "", new: "", confirm: "" })
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.message || "Şifre değiştirilemedi.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleOwnershipApplication = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = await ApiClient.post<any>("/Account/restaurant-ownership-application", {
                businessName: ownershipApplication.businessName,
                businessDescription: ownershipApplication.businessDescription,
                businessAddress: ownershipApplication.businessAddress,
                businessPhone: ownershipApplication.businessPhone,
                businessEmail: ownershipApplication.businessEmail,
                category: ownershipApplication.category,
                additionalNotes: ownershipApplication.additionalNotes,
            })

            toast({
                title: "Başarılı",
                description: data.message || "Restoran sahipliği başvurunuz alındı ve incelenecektir.",
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
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.message || "Başvuru gönderilemedi.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        setLoading(true)

        try {
            const data = await ApiClient.post<any>("/Account/request-account-deletion", {})

            toast({
                title: "E-posta Gönderildi",
                description: data.message || "Hesap silme onayı e-postanıza gönderildi. Lütfen e-postanızı kontrol edin.",
            })

        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.message || "Hesap silme işlemi başlatılamadı.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (fetchingProfile) {
        return (
            <div className="container py-8 max-w-4xl">
                <div className="flex items-center justify-center h-96">
                    <p className="text-lg">Yükleniyor...</p>
                </div>
            </div>
        )
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
                                    <Label htmlFor="firstName">Ad</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="firstName"
                                            value={profile.firstName}
                                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="lastName">Soyad</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="lastName"
                                            value={profile.lastName}
                                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="userName">Kullanıcı Adı</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="userName"
                                            value={profile.userName}
                                            onChange={(e) => setProfile({ ...profile, userName: e.target.value })}
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
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
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

            {/* Hesap Silme Bölümü */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Hesap Silme</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Hesabınızı Silin</CardTitle>
                        <CardDescription>
                            Hesabınızı silmek istiyorsanız aşağıdaki butona tıklayın. E-postanıza bir doğrulama linki gönderilecektir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                                <p className="text-sm text-blue-900">
                                    <strong>Bilgi:</strong> Hesabınız geçici olarak devre dışı bırakılacak ve verileriniz korunacaktır.
                                    İstediğiniz zaman geri dönüp hesabınızı tekrar aktif edebilirsiniz.
                                </p>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={loading} className="w-full">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Hesabımı Silmek İstiyorum
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Hesabınızı silmek istediğinizden emin misiniz?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            E-postanıza bir doğrulama linki gönderilecek. Linke tıkladığınızda hesabınız geçici olarak devre dışı bırakılacaktır.
                                            Verileriniz korunacak ve istediğiniz zaman hesabınızı tekrar aktif edebileceksiniz.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handleDeleteAccount()
                                            }}
                                            disabled={loading}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            {loading ? "Gönderiliyor..." : "Evet, E-posta Gönder"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
