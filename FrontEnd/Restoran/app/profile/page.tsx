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
import { User, Mail, Phone, MapPin, Lock, Store, FileText, Trash2, Upload, Image as ImageIcon } from "lucide-react"
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
        category: "",
        additionalNotes: "",
    })
    const [profileImage, setProfileImage] = useState<File | null>(null)
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
    const [restaurantImage, setRestaurantImage] = useState<File | null>(null)
    const [restaurantImagePreview, setRestaurantImagePreview] = useState<string | null>(null)

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

    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setProfileImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfileImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleUploadProfileImage = async () => {
        if (!profileImage) {
            toast({
                title: "Hata",
                description: "Lütfen bir resim seçin.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("file", profileImage)

            const token = localStorage.getItem("auth_token")
            if (!token) {
                throw new Error("Oturum açmanız gerekiyor. Lütfen tekrar giriş yapın.")
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL 
                ? `${process.env.NEXT_PUBLIC_API_URL}/Account/profile/upload-image`
                : "http://localhost:5000/api/Account/profile/upload-image"

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            if (response.status === 401) {
                throw new Error("Yetkilendirme hatası. Lütfen tekrar giriş yapın.")
            }

            const contentType = response.headers.get("content-type")
            let data
            if (contentType && contentType.includes("application/json")) {
                data = await response.json()
            } else {
                const text = await response.text()
                data = { message: text }
            }

            if (!response.ok) {
                throw new Error(data.message || data.Message || "Resim yüklenemedi")
            }

            toast({
                title: "Başarılı",
                description: data.message || "Profil resmi başarıyla yüklendi.",
            })

            setProfileImage(null)
            setProfileImagePreview(null)
        } catch (error: any) {
            toast({
                title: "Hata",
                description: error.message || "Resim yüklenemedi.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRestaurantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("🖼️ Restoran resmi seçildi")
        const file = e.target.files?.[0]
        console.log("📁 Seçilen dosya:", file ? file.name : "YOK")
        
        if (file) {
            console.log("📁 Dosya detayları:", {
                name: file.name,
                size: file.size,
                type: file.type
            })
            
            setRestaurantImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                console.log("✅ Resim önizleme hazır")
                setRestaurantImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            console.log("❌ Dosya seçilmedi")
        }
    }

    const handleOwnershipApplication = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!restaurantImage) {
            toast({
                title: "Hata",
                description: "Lütfen restoran resmi yükleyin.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append("restaurantImage", restaurantImage)
            formData.append("BusinessName", ownershipApplication.businessName)
            formData.append("BusinessDescription", ownershipApplication.businessDescription)
            formData.append("BusinessAddress", ownershipApplication.businessAddress)
            formData.append("BusinessPhone", ownershipApplication.businessPhone)
            formData.append("BusinessEmail", ownershipApplication.businessEmail)
            formData.append("Category", ownershipApplication.category)
            formData.append("AdditionalNotes", ownershipApplication.additionalNotes)

            // Token'ı doğru key ile al
            const token = localStorage.getItem("auth_token")
            if (!token) {
                throw new Error("Oturum açmanız gerekiyor. Lütfen tekrar giriş yapın.")
            }

            // API URL'sini direkt belirt - env hatası için geçici çözüm
            const apiUrl = process.env.NEXT_PUBLIC_API_URL 
                ? `${process.env.NEXT_PUBLIC_API_URL}/Account/restaurant-ownership-application`
                : "http://localhost:5000/api/Account/restaurant-ownership-application"
            
            console.log("🌐 API URL:", apiUrl)
            console.log("🔑 Token var mı:", !!token)

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            console.log("📡 Response status:", response.status)
            
            // 401 hatası için özel kontrol
            if (response.status === 401) {
                throw new Error("Yetkilendirme hatası. Lütfen tekrar giriş yapın.")
            }

            // Response'un JSON olup olmadığını kontrol et
            const contentType = response.headers.get("content-type")
            let data
            if (contentType && contentType.includes("application/json")) {
                data = await response.json()
            } else {
                const text = await response.text()
                data = { message: text }
            }

            if (!response.ok) {
                throw new Error(data.message || data.Message || "Başvuru gönderilemedi")
            }

            toast({
                title: "Başarılı",
                description: data.message || data.Message || "Restoran sahipliği başvurunuz alındı ve incelenecektir.",
            })

            setOwnershipApplication({
                businessName: "",
                businessDescription: "",
                businessAddress: "",
                businessPhone: "",
                businessEmail: "",
                category: "",
                additionalNotes: "",
            })
            setRestaurantImage(null)
            setRestaurantImagePreview(null)
        } catch (error: any) {
            console.log("💥 Hata:", error.message)
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

                                <div>
                                    <Label>Profil Resmi</Label>
                                    <div className="flex items-center gap-4">
                                        {profileImagePreview ? (
                                            <div className="relative w-24 h-24 rounded-full overflow-hidden">
                                                <img src={profileImagePreview} alt="Profil Resmi" className="w-full h-full object-cover rounded-full" />
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                                                <User className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        <label className="flex-1 cursor-pointer">
                                            <div className="flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md">
                                                <Upload className="h-4 w-4" />
                                                Resim Seç
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfileImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                        <Button
                                            type="button"
                                            onClick={handleUploadProfileImage}
                                            disabled={loading || !profileImage}
                                        >
                                            {loading ? "Yükleniyor..." : "Yükle"}
                                        </Button>
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
                                        className="w-full p-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Kategori Seçiniz</option>
                                        <option value="Turkish">Türk Mutfağı</option>
                                        <option value="Italian">İtalyan Mutfağı</option>
                                        <option value="Japanese">Japon Mutfağı</option>
                                        <option value="Chinese">Çin Mutfağı</option>
                                        <option value="Mexican">Meksika Mutfağı</option>
                                        <option value="Indian">Hint Mutfağı</option>
                                        <option value="American">Amerikan Mutfağı</option>
                                        <option value="French">Fransız Mutfağı</option>
                                        <option value="Mediterranean">Akdeniz Mutfağı</option>
                                        <option value="FastFood">Fast Food</option>
                                        <option value="Seafood">Deniz Ürünleri</option>
                                        <option value="Steakhouse">Steakhouse</option>
                                        <option value="Vegetarian">Vejetaryen</option>
                                        <option value="Vegan">Vegan</option>
                                        <option value="Cafe">Kafe</option>
                                        <option value="Dessert">Tatlı & Pasta</option>
                                        <option value="Other">Diğer</option>
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

                                <div>
                                    <Label>Restoran Resmi</Label>
                                    <div className="flex items-center gap-4">
                                        {restaurantImagePreview ? (
                                            <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                                                <img src={restaurantImagePreview} alt="Restoran Resmi" className="w-full h-full object-cover rounded-lg" />
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        <label className="flex-1 cursor-pointer">
                                            <div className="flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md">
                                                <Upload className="h-4 w-4" />
                                                Restoran Resmi Seç
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleRestaurantImageChange}
                                                className="hidden"
                                            />
                                        </label>
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
