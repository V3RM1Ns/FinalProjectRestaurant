'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { loyaltyApi } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { Gift, Plus, Edit, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Reward {
  id: string
  restaurantId: string
  restaurantName: string
  name: string
  description: string
  pointsRequired: number
  discountAmount?: number
  discountPercentage?: number
  imageUrl?: string
  isActive: boolean
  startDate?: string
  endDate?: string
  maxRedemptions?: number
  currentRedemptions: number
}

export default function OwnerRewardsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  
  const [formData, setFormData] = useState({
    restaurantId: '',
    name: '',
    description: '',
    pointsRequired: 1000,
    discountAmount: '',
    discountPercentage: '',
    imageUrl: '',
    startDate: '',
    endDate: '',
    maxRedemptions: '',
  })

  useEffect(() => {
    fetchRestaurants()
  }, [])

  useEffect(() => {
    if (formData.restaurantId) {
      fetchRewards()
    }
  }, [formData.restaurantId])

  const fetchRestaurants = async () => {
    try {
      const data = await loyaltyApi.admin.getAllCodes() // Use owner API in real implementation
      // In real implementation, fetch owner's restaurants
      // For now, we'll set a placeholder
    } catch (error: any) {
      console.error(error)
    }
  }

  const fetchRewards = async () => {
    if (!formData.restaurantId) return
    
    setLoading(true)
    try {
      const data = await loyaltyApi.getRestaurantRewards(formData.restaurantId)
      setRewards(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.pointsRequired) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const data = {
        restaurantId: formData.restaurantId,
        name: formData.name,
        description: formData.description,
        pointsRequired: formData.pointsRequired,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : undefined,
        discountPercentage: formData.discountPercentage ? parseInt(formData.discountPercentage) : undefined,
        imageUrl: formData.imageUrl || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        maxRedemptions: formData.maxRedemptions ? parseInt(formData.maxRedemptions) : undefined,
      }

      if (editingReward) {
        await loyaltyApi.owner.updateReward(editingReward.id, { ...data, isActive: editingReward.isActive })
        toast({
          title: 'Success',
          description: 'Reward updated successfully',
        })
      } else {
        await loyaltyApi.owner.createReward(data)
        toast({
          title: 'Success',
          description: 'Reward created successfully',
        })
      }

      setDialogOpen(false)
      resetForm()
      fetchRewards()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (rewardId: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return

    try {
      await loyaltyApi.owner.deleteReward(rewardId)
      toast({
        title: 'Success',
        description: 'Reward deleted successfully',
      })
      fetchRewards()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward)
    setFormData({
      restaurantId: reward.restaurantId,
      name: reward.name,
      description: reward.description,
      pointsRequired: reward.pointsRequired,
      discountAmount: reward.discountAmount?.toString() || '',
      discountPercentage: reward.discountPercentage?.toString() || '',
      imageUrl: reward.imageUrl || '',
      startDate: reward.startDate ? new Date(reward.startDate).toISOString().slice(0, 16) : '',
      endDate: reward.endDate ? new Date(reward.endDate).toISOString().slice(0, 16) : '',
      maxRedemptions: reward.maxRedemptions?.toString() || '',
    })
    setDialogOpen(true)
  }

  const resetForm = () => {
    setEditingReward(null)
    setFormData({
      ...formData,
      name: '',
      description: '',
      pointsRequired: 1000,
      discountAmount: '',
      discountPercentage: '',
      imageUrl: '',
      startDate: '',
      endDate: '',
      maxRedemptions: '',
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Rewards Management</h1>
          <p className="text-muted-foreground">Create and manage loyalty rewards for your customers</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Reward
        </Button>
      </div>

      {/* Restaurant Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter Restaurant ID"
            value={formData.restaurantId}
            onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Enter your restaurant ID to manage its rewards
          </p>
        </CardContent>
      </Card>

      {/* Rewards List */}
      {formData.restaurantId && (
        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
            <CardDescription>Manage your restaurant's loyalty rewards</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rewards created yet. Create your first reward!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward) => (
                  <Card key={reward.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{reward.name}</CardTitle>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={reward.isActive ? 'default' : 'secondary'}>
                              {reward.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">{reward.pointsRequired} pts</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(reward)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(reward.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                      {(reward.discountAmount || reward.discountPercentage) && (
                        <div className="text-sm mb-2">
                          <strong>Discount: </strong>
                          {reward.discountAmount && `$${reward.discountAmount}`}
                          {reward.discountPercentage && `${reward.discountPercentage}%`}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Redeemed: {reward.currentRedemptions}
                        {reward.maxRedemptions && `/${reward.maxRedemptions}`}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? 'Edit Reward' : 'Create New Reward'}
            </DialogTitle>
            <DialogDescription>
              Configure the reward details and requirements
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Reward Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Free Appetizer, 20% Off"
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what the customer gets"
                rows={3}
              />
            </div>

            <div>
              <Label>Points Required *</Label>
              <Input
                type="number"
                value={formData.pointsRequired}
                onChange={(e) => setFormData({ ...formData, pointsRequired: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                  placeholder="10.00"
                />
              </div>
              <div>
                <Label>Discount Percentage (%)</Label>
                <Input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  placeholder="20"
                />
              </div>
            </div>

            <div>
              <Label>Image URL (Optional)</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Max Redemptions (Optional)</Label>
              <Input
                type="number"
                value={formData.maxRedemptions}
                onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : (editingReward ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

