"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types"
import { DeliveryApiService } from "@/lib/delivery-api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  customerId: string
  customerName: string
  restaurantId: string
  restaurantName: string
  deliveryAddress?: string
  orderItems: OrderItem[]
}

interface PaginatedResponse {
  items: Order[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export default function DeliveryDashboardPage() {
  const router = useRouter()
  const { hasRole } = useAuth()
  const { toast } = useToast()
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 5

  useEffect(() => {
    if (!hasRole(UserRole.Delivery)) {
      router.push("/unauthorized")
      return
    }
    loadData()
  }, [hasRole, currentPage])

  const loadData = async () => {
    try {
      setLoading(true)
      const [availableRes, myOrdersRes] = await Promise.all([
        DeliveryApiService.getAvailableOrders(currentPage, pageSize),
        DeliveryApiService.getMyOrders(1, 10),
      ])
      setAvailableOrders(availableRes.items)
      setTotalPages(availableRes.totalPages)
      setMyOrders(myOrdersRes.items)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await DeliveryApiService.acceptOrder(orderId)
      toast({
        title: "Success",
        description: "Order accepted successfully!",
      })
      loadData()
    } catch (error) {
      console.error("Error accepting order:", error)
      toast({
        title: "Error",
        description: "Failed to accept order. It may already be taken.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await DeliveryApiService.updateOrderStatus(orderId, status as any)
      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      })
      loadData()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      Ready: { variant: "default", icon: Package },
      OutForDelivery: { variant: "default", icon: Truck },
      Completed: { variant: "outline", icon: CheckCircle },
    }

    const config = statusConfig[status] || { variant: "secondary", icon: Clock }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Truck className="w-8 h-8" />
          Delivery Dashboard
        </h1>
        <p className="text-muted-foreground">Manage your deliveries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Available Orders</CardTitle>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{availableOrders.length}</div>
            <p className="text-sm text-muted-foreground">Ready for pickup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Active Deliveries</CardTitle>
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {myOrders.filter((o) => o.status === "OutForDelivery").length}
            </div>
            <p className="text-sm text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Completed Today</CardTitle>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {myOrders.filter((o) => o.status === "Completed").length}
            </div>
            <p className="text-sm text-muted-foreground">Deliveries completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Orders Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Available Orders (Ready for Delivery)</h2>
          <Button onClick={() => loadData()} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        {availableOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No available orders</h3>
              <p className="text-muted-foreground">Check back later for new delivery orders</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {availableOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.restaurantName}</CardTitle>
                        <CardDescription>Order #{order.id.slice(0, 8)}</CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
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
                        <p className="font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />₺
                          {order.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment</p>
                        <p className="font-medium">{order.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Items</p>
                        <p className="font-medium">{order.orderItems.length} item(s)</p>
                      </div>
                    </div>

                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2 text-sm bg-muted p-3 rounded-md">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Delivery Address:</p>
                          <p className="text-muted-foreground">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={() => handleAcceptOrder(order.id)}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Accept Order
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* My Active Deliveries Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">My Active Deliveries</h2>

        {myOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active deliveries</h3>
              <p className="text-muted-foreground">Accept an order to start delivering</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {myOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.restaurantName}</CardTitle>
                      <CardDescription>Order #{order.id.slice(0, 8)}</CardDescription>
                    </div>
                    {getStatusBadge(order.status)}
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
                      <p className="font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />₺
                        {order.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment</p>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="font-medium">{order.orderItems.length} item(s)</p>
                    </div>
                  </div>

                  {order.deliveryAddress && (
                    <div className="flex items-start gap-2 text-sm bg-muted p-3 rounded-md">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Delivery Address:</p>
                        <p className="text-muted-foreground">{order.deliveryAddress}</p>
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Order Items:</p>
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.menuItemName}
                          </span>
                          <span className="font-medium">
                            ₺{item.subtotal.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.status === "OutForDelivery" && (
                    <Button
                      className="w-full"
                      onClick={() => handleUpdateStatus(order.id, "Completed")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
