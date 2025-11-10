import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../services/user.api";
import type { UseMutationResult } from "@tanstack/react-query";
import type { RegisterData, RegisterResponse } from "../services/user.api";
export const useRegister = (): UseMutationResult<
  RegisterResponse,
  unknown,
  RegisterData,
  unknown
> => {
  return useMutation<RegisterResponse, unknown, RegisterData>({
    mutationFn: registerUser,
  });
};
