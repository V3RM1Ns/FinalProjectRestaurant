"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { OwnerApi } from "@/lib/owner-api"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  subtotal: number
  notes?: string
  menuItemId: string
  menuItemName: string
  orderId: string
}

interface Order {
  id: string
  orderDate: string
  totalAmount: number
  status: string
  type: string
  specialRequests?: string
  paymentMethod: string
  completedAt?: string
  customerId: string
  customerName: string
  restaurantId: string
  restaurantName: string
  deliveryAddress?: string
  tableId?: string
  orderItems: OrderItem[]
}

interface PaginatedResponse {
  items: Order[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export default function RestaurantOrdersPage() {
  const params = useParams()
  const router = useRouter()
  const { hasRole } = useAuth()
  const restaurantId = params.restaurantId as string
  const [data, setData] = useState<PaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const pageSize = 10

  useEffect(() => {
    if (!hasRole(UserRole.Owner)) {
      router.push("/unauthorized")
      return
    }
    fetchOrders()
  }, [restaurantId, currentPage, selectedStatus, hasRole])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let response: PaginatedResponse
      
      if (selectedStatus === "all") {
        response = await OwnerApi.getOrders(restaurantId, currentPage, pageSize)
      } else {
        response = await OwnerApi.getOrdersByStatus(restaurantId, selectedStatus, currentPage, pageSize)
      }
      
      setData(response)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await OwnerApi.updateOrderStatus(parseInt(orderId), newStatus)
      fetchOrders()
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      Pending: { variant: "secondary", icon: Clock },
      Confirmed: { variant: "default", icon: CheckCircle },
      Preparing: { variant: "default", icon: Package },
      Ready: { variant: "default", icon: CheckCircle },
      OutForDelivery: { variant: "default", icon: Truck },
      Completed: { variant: "outline", icon: CheckCircle },
      Cancelled: { variant: "destructive", icon: XCircle },
    }

    const config = statusConfig[status] || statusConfig.Pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const getOrderTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      Delivery: "bg-blue-100 text-blue-800",
      DineIn: "bg-green-100 text-green-800",
      TakeAway: "bg-purple-100 text-purple-800",
    }

    return (
      <Badge variant="outline" className={colors[type] || ""}>
        {type}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/owner/dashboard`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            <ShoppingBag className="mr-2" />
            Orders
          </h1>
          {data && (
            <p className="text-sm text-muted-foreground mt-1">
              Total: {data.totalCount} order{data.totalCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Preparing">Preparing</SelectItem>
            <SelectItem value="Ready">Ready</SelectItem>
            <SelectItem value="OutForDelivery">Out For Delivery</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!data || data.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground">
              {selectedStatus !== "all"
                ? `No orders with status "${selectedStatus}"`
                : "Orders will appear here when customers place them"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {data.items.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        {new Date(order.orderDate).toLocaleString("tr-TR")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(order.status)}
                      {getOrderTypeBadge(order.type)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-medium">
                        ₺{order.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="font-medium">{order.orderItems.length} item(s)</p>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Delivery Address</p>
                      <p className="font-medium">{order.deliveryAddress}</p>
                    </div>
                  )}

                  {order.specialRequests && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Special Requests</p>
                      <p className="font-medium">{order.specialRequests}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Order Items:</p>
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.menuItemName}
                            {item.notes && (
                              <span className="text-muted-foreground italic"> ({item.notes})</span>
                            )}
                          </span>
                          <span className="font-medium">
                            ₺{item.subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/owner/restaurants/${restaurantId}/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                    {order.status !== "Completed" && order.status !== "Cancelled" && (
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Confirmed">Confirmed</SelectItem>
                          <SelectItem value="Preparing">Preparing</SelectItem>
                          <SelectItem value="Ready">Ready</SelectItem>
                          <SelectItem value="OutForDelivery">Out For Delivery</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={!data.hasPreviousPage}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!data.hasNextPage}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

