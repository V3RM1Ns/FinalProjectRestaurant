"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2 } from "lucide-react";

export default function ApplyRestaurantOwnerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessDescription: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    category: "",
    additionalNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const response = await fetch("http://localhost:5272/api/Account/restaurant-ownership-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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

