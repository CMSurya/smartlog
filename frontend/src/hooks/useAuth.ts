import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-client";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { useSettingsStore } from "@/store/settings-store";
import type { UserLogin, UserSignup } from "@/types/api";

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const setProfile = useSettingsStore((s) => s.setProfile);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: UserLogin) => authApi.login(data),
    onSuccess: (tokenRes, vars) => {
      login(tokenRes.access_token, {
        id: vars.email,
        email: vars.email,
      });
      setProfile({ displayName: vars.email.split("@")[0] ?? "", emailNotifications: true });
      toast.success("Welcome back!");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Login failed")),
  });
}

export function useSignup() {
  const login = useAuthStore((s) => s.login);
  const setProfile = useSettingsStore((s) => s.setProfile);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: UserSignup) => authApi.signup(data),
    onSuccess: async (user, vars) => {
      const tokenRes = await authApi.login({ email: vars.email, password: vars.password });
      login(tokenRes.access_token, user);
      setProfile({
        displayName: vars.email.split("@")[0] ?? "",
        emailNotifications: true,
      });
      toast.success("Account created!");
      navigate("/dashboard");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Signup failed")),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return () => {
    logout();
    toast.success("Signed out");
    navigate("/login");
  };
}
