import axios from "axios";
import { API_BASE_URL } from "./config";
import type { RoomStatusType, RoomTypeType } from "../constants";

export interface Room {
  room_id: string;
  room_number: string;
  room_type: RoomTypeType;
  price_per_night: number;
  status: RoomStatusType;
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

export interface CreateRoomData {
  room_number: string;
  room_type: RoomTypeType;
  price_per_night: number;
  status?: RoomStatusType;
}

export interface UpdateRoomData {
  room_number?: string;
  room_type?: RoomTypeType;
  price_per_night?: number;
  status?: RoomStatusType;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const getAllRooms = async (params?: {
  page?: number;
  per_page?: number;
  status?: string;
  room_type?: string;
}): Promise<Room[]> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.per_page)
    queryParams.append("per_page", params.per_page.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.room_type) queryParams.append("room_type", params.room_type);

  const url = `${API_BASE_URL}/rooms${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await axios.get<Room[] | PaginatedResponse<Room>>(url, {
    headers: getAuthHeaders(),
  });

  // Handle both paginated and non-paginated responses
  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data
  ) {
    return (response.data as PaginatedResponse<Room>).data;
  }
  return response.data as Room[];
};

export const getRoom = async (roomId: string): Promise<Room> => {
  const response = await axios.get<Room>(`${API_BASE_URL}/room/${roomId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const createRoom = async (roomData: CreateRoomData): Promise<Room> => {
  const response = await axios.post<Room>(`${API_BASE_URL}/room`, roomData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateRoom = async (
  roomId: string,
  roomData: UpdateRoomData
): Promise<Room> => {
  const response = await axios.put<Room>(
    `${API_BASE_URL}/room/${roomId}`,
    roomData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const deleteRoom = async (roomId: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/room/${roomId}`, {
    headers: getAuthHeaders(),
  });
};
