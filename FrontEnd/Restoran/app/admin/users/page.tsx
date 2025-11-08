'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, UserX, UserCheck, Shield, Plus, X } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
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

interface User {
  id: string
  userName: string
  email: string
  isActive: boolean
  role: string
  roles?: string[]
}

interface PaginatedResult {
  items: User[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<PaginatedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const [allRoles, setAllRoles] = useState<string[]>([])
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [roleActionLoading, setRoleActionLoading] = useState(false)
  const pageSize = 10

  useEffect(() => {
    fetchUsers(currentPage)
    fetchAllRoles()
  }, [currentPage])

  const fetchAllRoles = async () => {
    try {
      const data = await api.get<{ roles: string[] }>('/admin/roles')
      setAllRoles(data.roles)
    } catch (error: any) {
      console.error('Error fetching roles:', error)
    }
  }

  const fetchUsers = async (page: number) => {
    setLoading(true)
    try {
      const data = await api.get<PaginatedResult>(`/admin/users?pageNumber=${page}&pageSize=${pageSize}`)
      console.log('Users data:', data)
      
      // Her kullanıcı için rolleri getir
      const usersWithRoles = await Promise.all(
        data.items.map(async (user) => {
          try {
            const rolesData = await api.get<{ roles: string[] }>(`/admin/users/${user.id}/roles`)
            return { ...user, roles: rolesData.roles }
          } catch (error) {
            console.error(`Error fetching roles for user ${user.id}:`, error)
            return { ...user, roles: [user.role] }
          }
        })
      )
      
      setUsers({ ...data, items: usersWithRoles })
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      })
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setToggleLoading(userId)
    try {
      await api.post(`/admin/users/${userId}/toggle-status`, {})
      
      toast({
        title: 'Success',
        description: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      })
      
      // Sayfayı yenile
      await fetchUsers(currentPage)
    } catch (error: any) {
      console.error('Error toggling user status:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user status',
        variant: 'destructive',
      })
    } finally {
      setToggleLoading(null)
    }
  }

  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setSelectedRole('')
    setRoleDialogOpen(true)
  }

  const handleAddRole = async () => {
    if (!selectedUser || !selectedRole) return
    
    setRoleActionLoading(true)
    try {
      await api.post(`/admin/users/${selectedUser.id}/roles`, { role: selectedRole })
      
      toast({
        title: 'Success',
        description: `Role '${selectedRole}' added successfully`,
      })
      
      setRoleDialogOpen(false)
      await fetchUsers(currentPage)
    } catch (error: any) {
      console.error('Error adding role:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to add role',
        variant: 'destructive',
      })
    } finally {
      setRoleActionLoading(false)
    }
  }

  const handleRemoveRole = async (userId: string, role: string) => {
    if (!confirm(`Are you sure you want to remove the '${role}' role?`)) return
    
    try {
      await api.delete(`/admin/users/${userId}/roles/${role}`)
      
      toast({
        title: 'Success',
        description: `Role '${role}' removed successfully`,
      })
      
      await fetchUsers(currentPage)
    } catch (error: any) {
      console.error('Error removing role:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove role',
        variant: 'destructive',
      })
    }
  }

  const totalPages = users ? Math.ceil(users.totalCount / pageSize) : 0

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage all users in the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : users && users.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.userName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap items-center">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role, index) => (
                              <Badge key={index} variant="outline" className="gap-1">
                                <Shield className="w-3 h-3" />
                                {role}
                                <button
                                  onClick={() => handleRemoveRole(user.id, role)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">No roles</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRoleDialog(user)}
                            className="h-6 px-2"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="default" className="gap-1">
                            <UserCheck className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <UserX className="w-3 h-3" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={user.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          disabled={toggleLoading === user.id}
                        >
                          {toggleLoading === user.id ? (
                            'Loading...'
                          ) : user.isActive ? (
                            <>
                              <UserX className="w-4 h-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          )}
        </CardContent>
      </Card>

      {/* Role Management Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role to {selectedUser?.userName}</DialogTitle>
            <DialogDescription>
              Select a role to add to this user
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {allRoles
                  .filter(role => !selectedUser?.roles?.includes(role))
                  .map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={roleActionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRole}
              disabled={!selectedRole || roleActionLoading}
            >
              {roleActionLoading ? 'Adding...' : 'Add Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
