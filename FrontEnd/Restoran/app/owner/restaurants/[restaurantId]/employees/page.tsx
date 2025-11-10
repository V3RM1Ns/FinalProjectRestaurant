'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Mail, Phone, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Employee {
  id: string
  fullName: string
  email: string
  phone: string
  profileImageUrl?: string
  employerRestaurantId: string
  restaurantName: string
  createdAt: string
  isActive: boolean
}

interface PaginatedResponse {
  items: Employee[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export default function RestaurantEmployeesPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    fetchEmployees()
  }, [params.restaurantId, currentPage])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const url = `${API_BASE_URL}/api/Owner/restaurants/${params.restaurantId}/employees?pageNumber=${currentPage}&pageSize=${pageSize}`
      console.log('Fetching employees from:', url)
      console.log('Token:', token ? 'exists' : 'missing')
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('Employees data:', responseData)
        setData(responseData)
      } else if (response.status === 401) {
        console.error('Unauthorized - redirecting to login')
        router.push('/login')
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousPage = () => {
    if (data?.hasPreviousPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (data?.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push(`/owner/restaurants/${params.restaurantId}/dashboard`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="mr-2" />
            Employees
          </h1>
          <p className="text-muted-foreground">
            {data?.restaurantName || 'Manage your restaurant employees'}
          </p>
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              Total: {data.totalCount} employee{data.totalCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button onClick={() => router.push(`/owner/restaurants/${params.restaurantId}/employees/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {!data || data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No employees yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first employee
            </p>
            <Button onClick={() => router.push(`/owner/restaurants/${params.restaurantId}/employees/new`)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Employee
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{employee.fullName}</CardTitle>
                      <CardDescription>{employee.restaurantName}</CardDescription>
                    </div>
                    <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>{employee.phone}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined: {new Date(employee.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2 pt-3 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => router.push(`/owner/restaurants/${params.restaurantId}/employees/${employee.id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push(`/owner/restaurants/${params.restaurantId}/employees/${employee.id}/edit`)}
                    >
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((data.pageNumber - 1) * data.pageSize) + 1} to{' '}
                    {Math.min(data.pageNumber * data.pageSize, data.totalCount)} of{' '}
                    {data.totalCount} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={!data.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm px-4">
                      Page {data.pageNumber} of {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!data.hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

