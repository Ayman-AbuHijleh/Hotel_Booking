// Booking Status Constants
export const BookingStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type BookingStatusType =
  (typeof BookingStatus)[keyof typeof BookingStatus];

// Room Status Constants
export const RoomStatus = {
  AVAILABLE: "available",
  BOOKED: "booked",
} as const;

export type RoomStatusType = (typeof RoomStatus)[keyof typeof RoomStatus];

// Room Type Constants
export const RoomType = {
  SINGLE: "Single",
  DOUBLE: "Double",
  SUITE: "Suite",
} as const;

export type RoomTypeType = (typeof RoomType)[keyof typeof RoomType];

// User Role Constants
export const UserRole = {
  ADMIN: "admin",
  CUSTOMER: "customer",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Message Type Constants
export const MessageType = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type MessageTypeType = (typeof MessageType)[keyof typeof MessageType];

// Query Key Constants
export const QUERY_KEYS = {
  ROOMS: "rooms",
  ALL_BOOKINGS: "allBookings",
  USER_BOOKINGS: "userBookings",
} as const;

// Local Storage Key Constants
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
} as const;

// API Message Constants
export const API_MESSAGES = {
  BOOKING_CREATED: "Room booked successfully!",
  BOOKING_CANCELLED: "Booking cancelled successfully!",
  BOOKING_DELETED: "Booking deleted successfully!",
  BOOKING_CANCEL_FAILED: "Failed to cancel booking",
  BOOKING_DELETE_FAILED: "Failed to delete booking",
  BOOKING_CREATE_FAILED: "Failed to book room",
  ROOM_CREATED: "Room created successfully!",
  ROOM_UPDATED: "Room updated successfully!",
  ROOM_DELETED: "Room deleted successfully!",
  ROOM_CREATE_FAILED: "Failed to create room",
  ROOM_UPDATE_FAILED: "Failed to update room",
  ROOM_DELETE_FAILED: "Failed to delete room",
  ROOM_ALREADY_BOOKED: "This room is already booked",
  INVALID_DATES: "End date must be after start date",
  LOGIN_FAILED: "Failed to login. Please check your credentials.",
} as const;

// Confirmation Messages
export const CONFIRM_MESSAGES = {
  CANCEL_BOOKING: "Are you sure you want to cancel this booking?",
  DELETE_BOOKING: "Are you sure you want to delete this booking?",
  DELETE_ROOM: "Are you sure you want to delete this room?",
} as const;

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/",
  SIGNUP: "/signup",
  ROOMS: "/rooms",
  MY_BOOKINGS: "/my-bookings",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_ROOMS: "/admin/rooms",
  ADMIN_BOOKINGS: "/admin/bookings",
} as const;

// Filter Options
export const FILTER_OPTIONS = {
  ALL: "all",
  ACTIVE: BookingStatus.ACTIVE,
  COMPLETED: BookingStatus.COMPLETED,
  CANCELLED: BookingStatus.CANCELLED,
} as const;
