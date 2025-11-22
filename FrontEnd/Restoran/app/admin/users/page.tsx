'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, UserX, UserCheck, Loader2, Shield, Plus, Trash2 } from 'lucide-react'
import { adminApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface User {
  id: string
  userName: string
  email: string
  isActive: boolean
  role: string
}

interface PaginatedResult {
  items: User[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<PaginatedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  
  // Role management states
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [availableRoles, setAvailableRoles] = useState<string[]>([])
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<string>('')
  const [roleLoading, setRoleLoading] = useState(false)

  useEffect(() => {
    fetchUsers(currentPage)
    fetchAvailableRoles()
  }, [currentPage, pageSize])

  const fetchUsers = async (page: number) => {
    setLoading(true)
    try {
      const data = await adminApi.getUsers(page, pageSize)
      setUsers(data)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Kullanıcılar yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableRoles = async () => {
    try {
      const data = await adminApi.getAllRoles()
      setAvailableRoles(data.roles)
    } catch (error: any) {
      console.error('Error fetching roles:', error)
    }
  }

  const fetchUserRoles = async (userId: string) => {
    setRoleLoading(true)
    try {
      const data = await adminApi.getUserRoles(userId)
      setUserRoles(data.roles)
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message || 'Kullanıcı rolleri yüklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setRoleLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setToggleLoading(userId)
    try {
      await adminApi.toggleUserStatus(userId)
      
      toast({
        title: 'Başarılı',
        description: `Kullanıcı ${currentStatus ? 'deaktif edildi' : 'aktif edildi'}`,
      })
      
      await fetchUsers(currentPage)
    } catch (error: any) {
      console.error('Error toggling user status:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Kullanıcı durumu güncellenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setToggleLoading(null)
    }
  }

  const handleOpenRoleDialog = async (user: User) => {
    setSelectedUser(user)
    setShowRoleDialog(true)
    await fetchUserRoles(user.id)
  }

  const handleAddRole = async () => {
    if (!selectedUser || !selectedRoleToAdd) return

    setRoleLoading(true)
    try {
      await adminApi.addRoleToUser(selectedUser.id, selectedRoleToAdd)
      toast({
        title: 'Başarılı',
        description: `Rol başarıyla eklendi`,
      })
      setSelectedRoleToAdd('')
      await fetchUserRoles(selectedUser.id)
      await fetchUsers(currentPage) // Refresh user list
    } catch (error: any) {
      console.error('Add role error:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Rol eklenirken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setRoleLoading(false)
    }
  }

  const handleRemoveRole = async (role: string) => {
    if (!selectedUser) return

    setRoleLoading(true)
    try {
      await adminApi.removeRoleFromUser(selectedUser.id, role)
      toast({
        title: 'Başarılı',
        description: `Rol başarıyla kaldırıldı`,
      })
      await fetchUserRoles(selectedUser.id)
      await fetchUsers(currentPage) // Refresh user list
    } catch (error: any) {
      console.error('Remove role error:', error)
      toast({
        title: 'Hata',
        description: error.message || 'Rol kaldırılırken bir hata oluştu',
        variant: 'destructive',
      })
    } finally {
      setRoleLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (users?.totalPages || 1)) {
      setCurrentPage(newPage)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'restaurantowner':
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'employee':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'customer':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const availableRolesToAdd = availableRoles.filter(role => !userRoles.includes(role))

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
        <p className="text-muted-foreground mt-2">Sistemdeki tüm kullanıcıları yönetin</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tüm Kullanıcılar ({users?.totalCount || 0})</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Göster:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="border rounded-md px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Kullanıcılar yükleniyor...</p>
            </div>
          ) : users && users.items.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Kullanıcı Adı</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[120px]">Rol</TableHead>
                      <TableHead className="w-[120px]">Durum</TableHead>
                      <TableHead className="w-[200px] text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.items.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.userName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge variant="default" className="gap-1 bg-green-600">
                              <UserCheck className="w-3 h-3" />
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <UserX className="w-3 h-3" />
                              Pasif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenRoleDialog(user)}
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              Roller
                            </Button>
                            <Button
                              size="sm"
                              variant={user.isActive ? "destructive" : "default"}
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                              disabled={toggleLoading === user.id}
                            >
                              {toggleLoading === user.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  İşleniyor...
                                </>
                              ) : user.isActive ? (
                                <>
                                  <UserX className="w-3 h-3 mr-1" />
                                  Deaktif Et
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Aktif Et
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {((users.pageNumber - 1) * users.pageSize) + 1} - {Math.min(users.pageNumber * users.pageSize, users.totalCount)} arası gösteriliyor (Toplam: {users.totalCount})
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!users.hasPreviousPage}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Önceki
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, users.totalPages) }, (_, i) => {
                      let pageNum
                      if (users.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= users.totalPages - 2) {
                        pageNum = users.totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={currentPage === pageNum ? "default" : "outline"}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!users.hasNextPage}
                  >
                    Sonraki
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <UserX className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Kullanıcı bulunamadı</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Management Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rol Yönetimi</DialogTitle>
            <DialogDescription>
              {selectedUser?.userName} kullanıcısının rollerini yönetin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {roleLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Roller yükleniyor...</p>
              </div>
            ) : (
              <>
                {/* Current Roles */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Mevcut Roller</h4>
                  {userRoles.length > 0 ? (
                    <div className="space-y-2">
                      {userRoles.map((role) => (
                        <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline" className={getRoleBadgeColor(role)}>
                              {role}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveRole(role)}
                            disabled={roleLoading || userRoles.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Bu kullanıcının rolü yok</p>
                  )}
                </div>

                {/* Add New Role */}
                {availableRolesToAdd.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Rol Ekle</h4>
                    <div className="flex items-center gap-2">
                      <Select value={selectedRoleToAdd} onValueChange={setSelectedRoleToAdd}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Rol seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRolesToAdd.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddRole}
                        disabled={!selectedRoleToAdd || roleLoading}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ekle
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
