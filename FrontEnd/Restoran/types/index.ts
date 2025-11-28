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

export enum RestaurantCategory {
  Turkish = 1,
  Italian = 2,
  Japanese = 3,
  Chinese = 4,
  Mexican = 5,
  Indian = 6,
  American = 7,
  French = 8,
  Mediterranean = 9,
  FastFood = 10,
  Seafood = 11,
  Steakhouse = 12,
  Vegetarian = 13,
  Vegan = 14,
  Cafe = 15,
  Dessert = 16,
  Other = 17
}

// Helper function to get category name in Turkish
export function getCategoryName(category: string | number | undefined): string {
  if (!category) return 'Kategori Yok';
  
  const categoryNum = typeof category === 'string' ? parseInt(category) : category;
  
  const categoryNames: Record<number, string> = {
    1: 'Türk Mutfağı',
    2: 'İtalyan Mutfağı',
    3: 'Japon Mutfağı',
    4: 'Çin Mutfağı',
    5: 'Meksika Mutfağı',
    6: 'Hint Mutfağı',
    7: 'Amerikan Mutfağı',
    8: 'Fransız Mutfağı',
    9: 'Akdeniz Mutfağı',
    10: 'Fast Food',
    11: 'Deniz Ürünleri',
    12: 'Steakhouse',
    13: 'Vejetaryen',
    14: 'Vegan',
    15: 'Kafe',
    16: 'Tatlı',
    17: 'Diğer'
  };
  
  return categoryNames[categoryNum] || category.toString();
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
  OutForDelivery = "OutForDelivery",
  Delivered = "Delivered",
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

export enum TableLocation {
  IcMekan = "IcMekan",
  PencereKenari = "PencereKenari",
  Disari = "Disari",
}

// Location labels for display
export const TableLocationLabels: Record<TableLocation, string> = {
  [TableLocation.IcMekan]: "İç Mekan",
  [TableLocation.PencereKenari]: "Pencere Kenarı",
  [TableLocation.Disari]: "Dışarı",
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
  restaurantName?: string
  title: string
  description: string
  requirements: string
  position: string
  salary?: number
  employmentType: string
  postedDate: string
  expiryDate?: string
  isActive: boolean
  applicationCount?: number
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
  applicantPhone: string
  coverLetter: string
  resumeUrl?: string
  status: JobApplicationStatus
  appliedAt: string
  reviewedAt?: string
  interviewDate?: string
  rejectionReason?: string
}

export enum JobApplicationStatus {
  Pending = "Pending",
  UnderReview = "UnderReview",
  InterviewScheduled = "InterviewScheduled",
  Accepted = "Accepted",
  Rejected = "Rejected",
}
