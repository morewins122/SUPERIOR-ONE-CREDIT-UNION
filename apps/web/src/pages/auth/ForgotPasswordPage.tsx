import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [token, setToken] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    const { data } = await api.post<{ mockResetToken: string }>("/auth/forgot-password", values);
    setToken(data.mockResetToken);
  };

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Forgot Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="panel mt-6 space-y-4 rounded-2xl p-6">
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <button type="submit" className="rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-white">Send Reset Link</button>
        {token && <p className="text-sm text-emerald-600">Mock reset token: {token}</p>}
      </form>
    </section>
  );
}
