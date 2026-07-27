import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { usePortalUX } from "@/context/PortalUXContext";
import { getDemoState } from "@/data/bankDemoData";

const notificationSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  weeklySummary: z.boolean()
});

type NotificationForm = z.infer<typeof notificationSchema>;

export function ProfilePage() {
  const { showToast } = usePortalUX();
  const { register: registerNotification, handleSubmit: submitNotification, reset: resetNotification } =
    useForm<NotificationForm>({
      resolver: zodResolver(notificationSchema),
      defaultValues: { email: true, sms: false, push: true, weeklySummary: true }
    });
  useEffect(() => {
    void (async () => {
      const { data } = await api.get<{
        notificationPreferences?: NotificationForm;
      }>("/profile");
      if (data.notificationPreferences) {
        resetNotification(data.notificationPreferences);
      }
    })();
  }, [resetNotification]);

  const onNotificationSubmit = async (values: NotificationForm) => {
    await api.put("/profile/notifications", values);
    showToast("Profile updated.", "success");
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Profile & Security</h1>

      <article className="panel rounded-2xl p-5">
        <h2 className="text-lg font-semibold">Customer Information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { label: "Name", value: getDemoState().customer.fullName },
            { label: "DOB", value: "10/28/1986" },
            { label: "Member Since", value: getDemoState().customer.memberSince },
            { label: "Customer ID", value: getDemoState().customer.customerId },
            { label: "Email", value: getDemoState().customer.email },
            { label: "Address", value: getDemoState().customer.address.join("\n") }
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
              <p className="mt-2 whitespace-pre-line text-sm font-medium text-slate-900 dark:text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>
      </article>

      <form className="panel grid gap-2 rounded-2xl p-5 sm:grid-cols-2" onSubmit={submitNotification(onNotificationSubmit)}>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...registerNotification("email")} /> Email</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...registerNotification("sms")} /> SMS</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...registerNotification("push")} /> Push</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...registerNotification("weeklySummary")} /> Weekly summary</label>
        <div className="sm:col-span-2">
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Save Notification Preferences</button>
        </div>
      </form>
    </section>
  );
}
