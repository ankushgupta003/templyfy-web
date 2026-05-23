import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import Button from "../../components/Button";
import Logo from "../../components/Logo";
import { useAuth } from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../lib/api";
import { setPageMeta } from "../../lib/utils";
import { loginSchema } from "../../lib/validation";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setPageMeta("Admin Login", "Secure admin access for managing Templyfy products, content, and orders.");
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-cloud px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="section-block-dark p-6 sm:p-8">
          <Logo light />
          <div className="mt-6 section-title text-cyan-200">Templyfy Admin</div>
          <h1 className="mt-2 text-3xl font-bold text-white">Run products, orders, content, and secure delivery from one panel</h1>
          <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
            <p>Sign in to manage the protected digital catalog, monitor verified orders, resend delivery emails, and publish content.</p>
            <p>The admin area is backend-connected and protected with JWT authentication.</p>
          </div>
        </div>

        <div className="section-block p-6 sm:p-8">
          <div className="section-title">Protected access</div>
          <h2 className="mt-2 text-2xl font-bold">Admin login</h2>
          <form
            className="mt-6 space-y-5"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await login(values);
                navigate("/admin");
              } catch (error) {
                form.setError("root", {
                  message: getApiErrorMessage(error),
                });
              }
            })}
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input {...form.register("email")} placeholder="admin@example.com" />
              {form.formState.errors.email ? <p className="mt-2 text-sm text-red-600">{form.formState.errors.email.message}</p> : null}
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input type="password" {...form.register("password")} placeholder="Enter password" />
              {form.formState.errors.password ? (
                <p className="mt-2 text-sm text-red-600">{form.formState.errors.password.message}</p>
              ) : null}
            </div>
            {form.formState.errors.root ? (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {form.formState.errors.root.message}
              </div>
            ) : null}
            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
              <LogIn className="mr-2 h-4 w-4" />
              {form.formState.isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
