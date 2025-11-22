"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RestaurantsMap } from "@/components/maps/RestaurantsMap";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Restaurant {
  id: string;
  name: string;
  address: string;
  description: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  rate: number;
}

export default function AdminRestaurantsMapPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>("/Admin/restaurants");

      // Backend'den gelen data'nın yapısına göre düzenleme
      let restaurantArray: Restaurant[] = [];

      if (Array.isArray(data)) {
        restaurantArray = data;
      } else if (data && Array.isArray(data.items)) {
        // Eğer paginated response ise
        restaurantArray = data.items;
      } else if (data && typeof data === "object") {
        // Tek bir object ise array'e çevir
        restaurantArray = [data];
      }

      setRestaurants(restaurantArray);
    } catch (error: any) {
      console.error("Error fetching restaurants:", error);
      toast({
        title: "Hata",
        description: "Restoranlar yüklenemedi",
        variant: "destructive",
      });
      setRestaurants([]); // Hata durumunda boş array
    } finally {
      setLoading(false);
    }
  };

  // restaurants'ın array olduğundan emin ol
  const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];
  const restaurantsWithoutLocation = safeRestaurants.filter(
    (r) => !r.latitude || !r.longitude
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MapPin className="w-8 h-8" />
          Restoran Haritası Yönetimi
        </h1>
        <p className="text-muted-foreground">
          Tüm restoranların konum bilgilerini harita üzerinde yönetin
        </p>
      </div>

      {restaurantsWithoutLocation.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              Konum Bilgisi Eksik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-3">
              {restaurantsWithoutLocation.length} restoranın konum bilgisi
              bulunmamaktadır. Bu restoranlar haritada görüntülenemez.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/restaurants")}
            >
              Restoranları Düzenle
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            Harita Görünümü (
            {safeRestaurants.filter((r) => r.latitude && r.longitude).length}{" "}
            Restoran)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <RestaurantsMap restaurants={safeRestaurants} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Toplam Restoran</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{safeRestaurants.length}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm text-green-800">Konum Bilgisi Olan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">
              {safeRestaurants.filter((r) => r.latitude && r.longitude).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-sm text-orange-800">Konum Bilgisi Olmayan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-700">
              {restaurantsWithoutLocation.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ortalama Puan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {safeRestaurants.length > 0
                ? (
                    safeRestaurants.reduce(
                      (sum, r) => sum + (r.rate || 0),
                      0
                    ) / safeRestaurants.length
                  ).toFixed(1)
                : "0"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
