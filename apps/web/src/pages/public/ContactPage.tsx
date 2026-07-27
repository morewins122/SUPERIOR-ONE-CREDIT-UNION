import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10)
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful }
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = (data: ContactForm) => {
    // eslint-disable-next-line no-console
    console.log("Contact request:", data);
  };

  return (
    <section className="max-w-2xl">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">Reach our support team for account questions and service assistance.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="panel mt-6 space-y-4 rounded-2xl p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Message</label>
          <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2" rows={5} {...register("message")} />
          {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
        </div>

        <button type="submit" className="rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white">
          Send Message
        </button>

        {isSubmitSuccessful && <p className="text-sm text-emerald-600">Your message has been submitted.</p>}
      </form>
    </section>
  );
}
