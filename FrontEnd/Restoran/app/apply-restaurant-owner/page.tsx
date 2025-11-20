"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";

export default function ApplyRestaurantOwnerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    category: "",
    additionalNotes: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Hata",
          description: "Lütfen sadece resim dosyası seçin",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Hata",
          description: "Resim boyutu en fazla 5MB olmalıdır",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast({
        title: "Uyarı",
        description: "Lütfen restoran fotoğrafı yükleyin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Hata",
          description: "Lütfen önce giriş yapın",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // Create FormData for multipart/form-data
      const submitData = new FormData();
      submitData.append("businessName", formData.businessName);
      submitData.append("businessDescription", formData.businessDescription);
      submitData.append("businessAddress", formData.businessAddress);
      submitData.append("businessPhone", formData.businessPhone);
      submitData.append("businessEmail", formData.businessEmail);
      submitData.append("category", formData.category);
      submitData.append("additionalNotes", formData.additionalNotes);
      submitData.append("image", imageFile);

      const response = await fetch("http://localhost:5272/api/Account/restaurant-ownership-application", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: data.message || "Başvurunuz alındı ve incelenecektir.",
        });
        router.push("/profile");
      } else {
        toast({
          title: "Hata",
          description: data.message || "Başvuru gönderilemedi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Başvuru hatası:", error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Restoran Sahipliği Başvurusu</CardTitle>
              <CardDescription>
                Restoranınızı platformumuza eklemek için başvuru formu
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">İşletme Adı *</Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Örn: Lezzet Durağı Restaurant"
                required
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessDescription">İşletme Açıklaması *</Label>
              <Textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                placeholder="Restoranınız hakkında detaylı bilgi verin..."
                required
                maxLength={1000}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                {formData.businessDescription.length}/1000 karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessAddress">İşletme Adresi *</Label>
              <Textarea
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                placeholder="Restoranınızın tam adresi..."
                required
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessPhone">İşletme Telefonu *</Label>
                <Input
                  id="businessPhone"
                  name="businessPhone"
                  type="tel"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  placeholder="0555 555 55 55"
                  required
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessEmail">İşletme E-postası</Label>
                <Input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  placeholder="info@restaurant.com"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Örn: Türk Mutfağı, İtalyan, Fast Food"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Ek Notlar</Label>
              <Textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                placeholder="Eklemek istediğiniz diğer bilgiler..."
                maxLength={2000}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                {formData.additionalNotes.length}/2000 karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Restoran Fotoğrafı *</Label>
              <div className="flex flex-col gap-2">
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  onClick={() => document.getElementById('image')?.click()}
                  variant={imageFile ? "default" : "outline"}
                  className="w-full justify-center"
                >
                  {imageFile ? (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      {imageFile.name}
                      <Button
                        type="button"
                        onClick={handleRemoveImage}
                        variant="destructive"
                        size="icon"
                        className="p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Fotoğraf Yükle
                    </div>
                  )}
                </Button>
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Restoran Fotoğrafı"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                * işaretli alanlar zorunludur. Başvurunuz incelendikten sonra size geri dönüş yapılacaktır.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  "Başvuruyu Gönder"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
