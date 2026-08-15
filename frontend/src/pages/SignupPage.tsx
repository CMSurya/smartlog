import { AuthForm } from "@/components/auth/AuthForm";
import { useSignup } from "@/hooks/useAuth";

export default function SignupPage() {
  const signup = useSignup();

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">Create your account</h2>
      <AuthForm mode="signup" onSubmit={(d) => signup.mutate(d)} isPending={signup.isPending} />
    </div>
  );
}
