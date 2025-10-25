// Domain Models based on C# backend
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt?: string
  isDeleted: boolean
}

export interface AppUser extends BaseEntity {
  fullName: string
  email: string
  phoneNumber?: string
  address?: string
  profileImageUrl?: string
  employerRestaurantId?: string
  roles: UserRole[]
}

export enum UserRole {
  Admin = "Admin",
  Owner = "RestaurantOwner",
  Employee = "Employee",
  Customer = "Customer",
  Delivery = "Delivery",
}

export interface Restaurant extends BaseEntity {
  name: string
  address: string
  phoneNumber: string
  email?: string
  website?: string
  description: string
  ownerId: string
  latitude?: number
  longitude?: number
  category?: string
  rating?: number
  imageUrl?: string
}

export interface Menu extends BaseEntity {
  name: string
  description: string
  restaurantId: string
  menuItems: MenuItem[]
}

export interface MenuItem extends BaseEntity {
  name: string
  description: string
  price: number
  isAvailable: boolean
  imageUrl?: string
  category?: string
  menuId: string
}

export interface Order extends BaseEntity {
  orderDate: string
  totalAmount: number
  taxAmount?: number
  discountAmount?: number
  status: OrderStatus
  type: OrderType
  specialRequests?: string
  paymentMethod?: string
  completedAt?: string
  customerId?: string
  restaurantId: string
  tableId?: string
  deliveryAddress?: string
  deliveryPersonId?: string
  orderItems: OrderItem[]
}

export enum OrderStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Preparing = "Preparing",
  Ready = "Ready",
  Served = "Served",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export enum OrderType {
  DineIn = "DineIn",
  Takeout = "Takeout",
  Delivery = "Delivery",
}

export interface OrderItem extends BaseEntity {
  quantity: number
  unitPrice: number
  subtotal: number
  notes?: string
  menuItemId: string
  orderId: string
  menuItem: MenuItem
}

export interface OwnershipApplication extends BaseEntity {
  userId: string
  businessName: string
  businessDescription: string
  businessAddress: string
  businessPhone: string
  businessEmail?: string
  category: string
  additionalNotes?: string
  status: ApplicationStatus
  applicationDate: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  user?: AppUser
  reviewer?: AppUser
}

export enum ApplicationStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface Table extends BaseEntity {
  tableNumber: number
  capacity: number
  status: TableStatus
  location?: string
  restaurantId: string
}

export enum TableStatus {
  Available = "Available",
  Occupied = "Occupied",
  Reserved = "Reserved",
  OutOfService = "OutOfService",
}

export interface Reservation extends BaseEntity {
  reservationDate: string
  numberOfGuests: number
  status: ReservationStatus
  specialRequests?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerId?: string
  restaurantId: string
  tableId: string
}

export enum ReservationStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Cancelled = "Cancelled",
  Completed = "Completed",
}

export interface OwnerDashboardDto {
  restaurantId: string
  totalRevenue: number
  todayRevenue: number
  totalOrders: number
  todayOrders: number
  activeReservations: number
  menuItemCount: number
  employeeCount: number
  topSellingItems: TopSellingItemDto[]
}

export interface TopSellingItemDto {
  menuItemId: string
  menuItemName: string
  quantitySold: number
}

export interface CartItem {
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export interface AuthResponse {
  token: string
  user: AppUser
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "order" | "reservation" | "chat" | "system"
  isRead: boolean
  timestamp: string
  relatedId?: string
}

export interface Review extends BaseEntity {
  restaurantId: string
  customerId: string
  customerName: string
  rating: number
  comment: string
  status: ReviewStatus
  adminResponse?: string
}

export enum ReviewStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface JobPosting extends BaseEntity {
  restaurantId: string
  title: string
  description: string
  requirements: string
  salary?: string
  workingHours?: string
  status: JobPostingStatus
  applicationDeadline?: string
}

export enum JobPostingStatus {
  Active = "Active",
  Closed = "Closed",
  Draft = "Draft",
}

export interface JobApplication extends BaseEntity {
  jobPostingId: string
  applicantId: string
  applicantName: string
  applicantEmail: string
  applicantPhone?: string
  coverLetter: string
  resumeUrl?: string
  status: JobApplicationStatus
  appliedDate: string
  reviewedAt?: string
  reviewNotes?: string
}

export enum JobApplicationStatus {
  Pending = "Pending",
  Reviewed = "Reviewed",
  Accepted = "Accepted",
  Rejected = "Rejected",
}
