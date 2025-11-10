import axios from "axios";
import { API_BASE_URL } from "./config";

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    email: string;
    name: string;
    phone: string;
    role: "admin" | "customer";
    user_id: string;
  };
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(
    `${API_BASE_URL}/user/login`,
    {
      email,
      password,
    }
  );
  return response.data;
};

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface RegisterResponse {
  email: string;
  name: string;
  phone?: string;
  user_id: string;
}

export const registerUser = async (
  userData: RegisterData
): Promise<RegisterResponse> => {
  try {
    const response = await axios.post<RegisterResponse>(
      `${API_BASE_URL}/user/register`,
      userData
    );
    return response.data;
  } catch (error: any) {
    console.error("Error in registerUser API call:", error.response?.data);
    throw error;
  }
};
