import axios from "axios";
import { API_BASE_URL } from "./config";
import type { BookingStatusType } from "../constants";

export interface Booking {
  booking_id: string;
  user_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  status: BookingStatusType;
  total_price: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export interface CreateBookingData {
  room_id: string;
  start_date: string;
  end_date: string;
}

export interface UpdateBookingData {
  room_id?: string;
  start_date?: string;
  end_date?: string;
  status?: BookingStatusType;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getAllBookings = async (params?: {
  page?: number;
  per_page?: number;
  status?: string;
}): Promise<Booking[]> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.per_page)
    queryParams.append("per_page", params.per_page.toString());
  if (params?.status) queryParams.append("status", params.status);

  const url = `${API_BASE_URL}/bookings${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await axios.get<Booking[] | PaginatedResponse<Booking>>(
    url,
    {
      headers: getAuthHeaders(),
    }
  );

  // Handle both paginated and non-paginated responses
  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data
  ) {
    return (response.data as PaginatedResponse<Booking>).data;
  }
  return response.data as Booking[];
};

export const getUserBookings = async (
  userId: string,
  params?: {
    page?: number;
    per_page?: number;
    status?: string;
  }
): Promise<Booking[]> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.per_page)
    queryParams.append("per_page", params.per_page.toString());
  if (params?.status) queryParams.append("status", params.status);

  const url = `${API_BASE_URL}/user/${userId}/bookings${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await axios.get<Booking[] | PaginatedResponse<Booking>>(
    url,
    {
      headers: getAuthHeaders(),
    }
  );

  // Handle both paginated and non-paginated responses
  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data
  ) {
    return (response.data as PaginatedResponse<Booking>).data;
  }
  return response.data as Booking[];
};

export const getBooking = async (bookingId: string): Promise<Booking> => {
  const response = await axios.get<Booking>(
    `${API_BASE_URL}/booking/${bookingId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const createBooking = async (
  bookingData: CreateBookingData
): Promise<{ message: string; booking_id: string }> => {
  const response = await axios.post<{ message: string; booking_id: string }>(
    `${API_BASE_URL}/booking`,
    bookingData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const updateBooking = async (
  bookingId: string,
  bookingData: UpdateBookingData
): Promise<{ message: string }> => {
  const response = await axios.put<{ message: string }>(
    `${API_BASE_URL}/booking/${bookingId}`,
    bookingData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const cancelBooking = async (
  bookingId: string
): Promise<{ message: string }> => {
  const response = await axios.post<{ message: string }>(
    `${API_BASE_URL}/booking/${bookingId}/cancel`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/booking/${bookingId}`, {
    headers: getAuthHeaders(),
  });
};
