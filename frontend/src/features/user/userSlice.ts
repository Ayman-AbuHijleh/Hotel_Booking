import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS, type UserRoleType } from "../../constants";

interface User {
  email: string;
  name: string;
  phone: string;
  role: UserRoleType;
  user_id?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

interface LoginPayload {
  token: string;
  user: User;
}

const initialState: AuthState = {
  token: localStorage.getItem(STORAGE_KEYS.TOKEN) || null,
  user: localStorage.getItem(STORAGE_KEYS.USER)
    ? JSON.parse(localStorage.getItem(STORAGE_KEYS.USER)!)
    : null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.TOKEN),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(action.payload.user)
      );
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
