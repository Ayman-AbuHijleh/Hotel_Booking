import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../services/user.api";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/user/userSlice";
import type { AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUser(email, password),
    onSuccess: (data) => {
      dispatch(loginSuccess(data));
      localStorage.setItem("token", data.token);

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/rooms");
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};
