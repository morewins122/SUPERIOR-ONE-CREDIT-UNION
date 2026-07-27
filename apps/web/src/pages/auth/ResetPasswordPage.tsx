import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";

const schema = z.object({
  token: z.string().min(4),
  newPassword: z.string().min(8)
});

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    const { data } = await api.post<{ message: string }>("/auth/reset-password", values);
    setMessage(data.message);
  };

  return (
    <section className="mx-auto max-w-md">
      <h1 className="text-3xl font-bold">Reset Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="panel mt-6 space-y-4 rounded-2xl p-6">
        <div>
          <label className="mb-1 block text-sm">Reset token</label>
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("token")} />
          {errors.token && <p className="text-xs text-red-500">{errors.token.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm">New password</label>
          <input type="password" className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("newPassword")} />
          {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
        </div>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Update Password</button>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
      </form>
    </section>
  );
}
