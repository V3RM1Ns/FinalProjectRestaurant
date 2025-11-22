'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

const RESTAURANT_CATEGORIES = [
	{ value: 'Turkish', label: 'Türk Mutfağı' },
	{ value: 'Italian', label: 'İtalyan Mutfağı' },
	{ value: 'Japanese', label: 'Japon Mutfağı' },
	{ value: 'Chinese', label: 'Çin Mutfağı' },
	{ value: 'American', label: 'Amerikan Mutfağı' },
	{ value: 'Mexican', label: 'Meksika Mutfağı' },
	{ value: 'Indian', label: 'Hint Mutfağı' },
	{ value: 'FastFood', label: 'Fast Food' },
	{ value: 'Seafood', label: 'Deniz Ürünleri' },
	{ value: 'Vegan', label: 'Vegan' },
	{ value: 'Dessert', label: 'Tatlı & Pasta' },
	{ value: 'Other', label: 'Diğer' },
]

export default function NewRestaurantPage() {
	const router = useRouter()
	const { toast } = useToast()
	const [loading, setLoading] = useState(false)
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [formData, setFormData] = useState({
		restaurantName: '',
		description: '',
		phoneNumber: '',
		address: '',
		email: '',
		category: '',
		additionalNotes: '',
	})

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				toast({
					title: 'Hata',
					description: 'Lütfen bir resim dosyası seçin',
					variant: 'destructive',
				})
				return
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast({
					title: 'Hata',
					description: 'Dosya boyutu en fazla 5MB olabilir',
					variant: 'destructive',
				})
				return
			}

			setImageFile(file)
			const reader = new FileReader()
			reader.onloadend = () => {
				setImagePreview(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const removeImage = () => {
		setImageFile(null)
		setImagePreview(null)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const token = localStorage.getItem('auth_token')
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
			const fullUrl = `${apiUrl}/api/Owner/restaurant-applications`

			if (!token) {
				toast({
					title: 'Hata',
					description: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.',
					variant: 'destructive',
				})
				router.push('/login')
				return
			}

			// Create FormData for file upload
			const formDataToSend = new FormData()
			formDataToSend.append('RestaurantName', formData.restaurantName)
			formDataToSend.append('Description', formData.description)
			formDataToSend.append('Address', formData.address)
			formDataToSend.append('PhoneNumber', formData.phoneNumber)
			formDataToSend.append('Email', formData.email)
			formDataToSend.append('Category', formData.category)
			if (formData.additionalNotes) {
				formDataToSend.append('AdditionalNotes', formData.additionalNotes)
			}
			if (imageFile) {
				formDataToSend.append('imageFile', imageFile)
			}

			const response = await fetch(fullUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formDataToSend,
			})

			if (response.ok) {
				const data = await response.json()
				toast({
					title: 'Başarılı!',
					description: 'Restoran başvurunuz başarıyla gönderildi. Admin onayı bekleniyor.',
				})
				router.push('/owner/restaurants')
			} else {
				const errorText = await response.text()
				let errorMessage = 'Restoran başvurusu gönderilemedi'
				try {
					const errorJson = JSON.parse(errorText)
					errorMessage = errorJson.message || errorJson.Message || errorMessage
				} catch {}

				toast({
					title: 'Hata',
					description: errorMessage,
					variant: 'destructive',
				})
			}
		} catch (error) {
			toast({
				title: 'Hata',
				description: `Bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
				variant: 'destructive',
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="container mx-auto p-6 max-w-2xl">
			<Button
				variant="ghost"
				className="mb-4"
				onClick={() => router.push('/owner/restaurants')}
			>
				<ArrowLeft className="w-4 h-4 mr-2" />
				Restoranlarıma Dön
			</Button>

			<Card>
				<CardHeader>
					<CardTitle>Yeni Restoran Başvurusu</CardTitle>
					<CardDescription>
						Restoran bilgilerinizi girin ve başvurunuzu gönderin. Başvurunuz admin tarafından incelendikten sonra onaylanacaktır.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="restaurantName">Restoran Adı *</Label>
							<Input
								id="restaurantName"
								required
								value={formData.restaurantName}
								onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
								placeholder="Restoran adını girin"
							/>
						</div>

						<div>
							<Label htmlFor="description">Açıklama *</Label>
							<Textarea
								id="description"
								required
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder="Restoranınızı tanımlayın"
								rows={4}
							/>
						</div>

						<div>
							<Label htmlFor="category">Kategori *</Label>
							<Select
								required
								value={formData.category}
								onValueChange={(value) => setFormData({ ...formData, category: value })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Kategori seçin" />
								</SelectTrigger>
								<SelectContent>
									{RESTAURANT_CATEGORIES.map((cat) => (
										<SelectItem key={cat.value} value={cat.value}>
											{cat.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="address">Adres *</Label>
							<Input
								id="address"
								required
								value={formData.address}
								onChange={(e) => setFormData({ ...formData, address: e.target.value })}
								placeholder="Sokak, şehir, posta kodu"
							/>
						</div>

						<div>
							<Label htmlFor="phoneNumber">Telefon *</Label>
							<Input
								id="phoneNumber"
								required
								value={formData.phoneNumber}
								onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
								placeholder="+90 XXX XXX XX XX"
							/>
						</div>

						<div>
							<Label htmlFor="email">E-posta</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								placeholder="restaurant@example.com"
							/>
						</div>

						<div>
							<Label htmlFor="image">Restoran Görseli</Label>
							<div className="mt-2">
								{imagePreview ? (
									<div className="relative w-full h-64 rounded-lg overflow-hidden border">
										<Image
											src={imagePreview}
											alt="Restaurant preview"
											fill
											className="object-cover"
										/>
										<Button
											type="button"
											variant="destructive"
											size="icon"
											className="absolute top-2 right-2"
											onClick={removeImage}
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								) : (
									<label
										htmlFor="image"
										className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
									>
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											<Upload className="w-10 h-10 mb-3 text-muted-foreground" />
											<p className="mb-2 text-sm text-muted-foreground">
												<span className="font-semibold">Tıklayın</span> veya sürükleyin
											</p>
											<p className="text-xs text-muted-foreground">PNG, JPG, JPEG (MAX. 5MB)</p>
										</div>
										<Input
											id="image"
											type="file"
											className="hidden"
											accept="image/*"
											onChange={handleImageChange}
										/>
									</label>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="additionalNotes">Ek Notlar</Label>
							<Textarea
								id="additionalNotes"
								value={formData.additionalNotes}
								onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
								placeholder="Eklemek istediğiniz başka bilgiler var mı?"
								rows={3}
							/>
						</div>

						<div className="flex gap-4 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.push('/owner/restaurants')}
								className="flex-1"
								disabled={loading}
							>
								İptal
							</Button>
							<Button type="submit" disabled={loading} className="flex-1">
								{loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
