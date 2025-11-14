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
import { Gift, Copy, CheckCircle, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface LoyaltyCode {
  id: string
  code: string
  pointValue: number
  description?: string
  isActive: boolean
  maxUses?: number
  currentUses: number
  createdAt: string
  expiryDate?: string
  isUsed: boolean
}

const POINT_PRESETS = [200, 500, 1000, 2000, 5000]

export default function AdminLoyaltyPage() {
  const { toast } = useToast()
  const [codes, setCodes] = useState<LoyaltyCode[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    pointValue: 500,
    description: '',
    maxUses: 1,
    expiryDate: '',
  })

  useEffect(() => {
    fetchCodes()
  }, [])

  const fetchCodes = async () => {
    setLoading(true)
    try {
      const data = await loyaltyApi.admin.getAllCodes()
      setCodes(data)
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

  const handleGenerateCode = async () => {
    if (!formData.pointValue || formData.pointValue < 1) {
      toast({
        title: 'Error',
        description: 'Please enter a valid point value',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const result = await loyaltyApi.admin.generateCode({
        pointValue: formData.pointValue,
        description: formData.description || undefined,
        maxUses: formData.maxUses || undefined,
        expiryDate: formData.expiryDate || undefined,
      })
      
      setGeneratedCode(result)
      setDialogOpen(true)
      fetchCodes()
      
      // Reset form
      setFormData({
        pointValue: 500,
        description: '',
        maxUses: 1,
        expiryDate: '',
      })
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

  const handleDeactivate = async (codeId: string) => {
    if (!confirm('Are you sure you want to deactivate this code?')) return

    try {
      await loyaltyApi.admin.deactivateCode(codeId)
      toast({
        title: 'Success',
        description: 'Code deactivated successfully',
      })
      fetchCodes()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard',
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Loyalty Point Management</h1>
        <p className="text-muted-foreground">Generate and manage loyalty point codes</p>
      </div>

      {/* Generate Code Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Generate New Loyalty Code
          </CardTitle>
          <CardDescription>Create a new code that customers can redeem for loyalty points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Point Value</Label>
              <div className="flex gap-2 mt-2">
                {POINT_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    variant={formData.pointValue === preset ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, pointValue: preset })}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                value={formData.pointValue}
                onChange={(e) => setFormData({ ...formData, pointValue: parseInt(e.target.value) || 0 })}
                className="mt-2"
                placeholder="Or enter custom value"
              />
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., New Year Special, Summer Bonus"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Uses (Optional)</Label>
                <Input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || undefined })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={handleGenerateCode} disabled={loading} className="w-full">
              {loading ? 'Generating...' : 'Generate Code'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Codes</CardTitle>
          <CardDescription>All loyalty codes created by admin</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && codes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No codes generated yet</div>
          ) : (
            <div className="space-y-3">
              {codes.map((code) => (
                <div key={code.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-lg font-mono font-bold bg-muted px-3 py-1 rounded">
                          {code.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Badge variant={code.isActive ? 'default' : 'secondary'}>
                          {code.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{code.pointValue} Points</Badge>
                      </div>
                      {code.description && (
                        <p className="text-sm text-muted-foreground mb-2">{code.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Uses: {code.currentUses}{code.maxUses ? `/${code.maxUses}` : ''}</span>
                        <span>Created: {new Date(code.createdAt).toLocaleDateString()}</span>
                        {code.expiryDate && (
                          <span>Expires: {new Date(code.expiryDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    {code.isActive && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeactivate(code.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Code Generated Successfully!
            </DialogTitle>
            <DialogDescription>
              Share this code with customers to let them redeem loyalty points
            </DialogDescription>
          </DialogHeader>
          {generatedCode && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <code className="text-2xl font-mono font-bold">{generatedCode.code}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(generatedCode.code)}
                  className="ml-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p><strong>Point Value:</strong> {generatedCode.pointValue}</p>
                {generatedCode.description && (
                  <p><strong>Description:</strong> {generatedCode.description}</p>
                )}
                {generatedCode.expiryDate && (
                  <p><strong>Expires:</strong> {new Date(generatedCode.expiryDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

