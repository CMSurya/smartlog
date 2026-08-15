import { AuthForm } from "@/components/auth/AuthForm";
import { useLogin } from "@/hooks/useAuth";

export default function LoginPage() {
  const login = useLogin();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">Welcome back</h2>
      <AuthForm mode="login" onSubmit={(d) => login.mutate(d)} isPending={login.isPending} />
    </div>
  );
}
