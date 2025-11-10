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

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<PaginatedResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  roles?: string[]

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  const fetchUsers = async (page: number) => {
    setLoading(true)
    try {
      const data = await api.get<PaginatedResult>(`/admin/users?pageNumber=${page}&pageSize=${pageSize}`)
      console.log('Users data:', data)
      setUsers(data)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const [allRoles, setAllRoles] = useState<string[]>([])
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [roleActionLoading, setRoleActionLoading] = useState(false)
    } finally {
      setLoading(false)
    }
  }
    fetchAllRoles()
  const totalPages = users ? Math.ceil(users.totalCount / pageSize) : 0

  const fetchAllRoles = async () => {
    try {
      const data = await api.get<{ roles: string[] }>('/admin/roles')
      setAllRoles(data.roles)
    } catch (error: any) {
      console.error('Error fetching roles:', error)
    }
  }

          <CardTitle>All Users ({users?.totalCount || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
      
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
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
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

