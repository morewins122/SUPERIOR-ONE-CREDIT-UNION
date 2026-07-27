import { useEffect, useState } from "react";
import { CheckCircle2, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: ""
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isModalOpen]);

  function validateForm(values: FormData) {
    const nextErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usPhoneRegex = /^(?:\+1\s?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!values.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!values.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(values.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!values.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!usPhoneRegex.test(values.phone)) {
      nextErrors.phone = "Enter a valid US phone number (example: 614-555-0100).";
    }

    if (!values.password) {
      nextErrors.password = "Password is required.";
    } else if (!passwordRegex.test(values.password)) {
      nextErrors.password = "Password must be 8+ characters with uppercase, lowercase, and a number.";
    }

    return nextErrors;
  }

  function showSuccessModal() {
    setIsModalClosing(false);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
    }, 220);
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    showSuccessModal();
  };

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="text-3xl font-bold">Create Your Account</h1>
      <form onSubmit={handleSubmit} noValidate className="panel mt-6 grid gap-4 rounded-2xl p-6 md:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm">First name</label>
          <input
            id="firstName"
            className={`w-full rounded-xl border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-[#0f5f57] ${errors.firstName ? "border-red-500 ring-1 ring-red-300" : "border-slate-300"}`}
            value={formData.firstName}
            onChange={(event) => handleInputChange("firstName", event.target.value)}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName && <p id="firstName-error" className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm">Last name</label>
          <input
            id="lastName"
            className={`w-full rounded-xl border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-[#0f5f57] ${errors.lastName ? "border-red-500 ring-1 ring-red-300" : "border-slate-300"}`}
            value={formData.lastName}
            onChange={(event) => handleInputChange("lastName", event.target.value)}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName && <p id="lastName-error" className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="email" className="mb-1 block text-sm">Email</label>
          <input
            id="email"
            type="email"
            className={`w-full rounded-xl border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-[#0f5f57] ${errors.email ? "border-red-500 ring-1 ring-red-300" : "border-slate-300"}`}
            value={formData.email}
            onChange={(event) => handleInputChange("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm">Phone</label>
          <input
            id="phone"
            type="tel"
            className={`w-full rounded-xl border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-[#0f5f57] ${errors.phone ? "border-red-500 ring-1 ring-red-300" : "border-slate-300"}`}
            value={formData.phone}
            onChange={(event) => handleInputChange("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && <p id="phone-error" className="mt-1 text-xs text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm">Password</label>
          <input
            id="password"
            type="password"
            className={`w-full rounded-xl border px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-[#0f5f57] ${errors.password ? "border-red-500 ring-1 ring-red-300" : "border-slate-300"}`}
            value={formData.password}
            onChange={(event) => handleInputChange("password", event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && <p id="password-error" className="mt-1 text-xs text-red-600">{errors.password}</p>}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Create Account
          </button>
        </div>
      </form>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4" role="dialog" aria-modal="true" aria-labelledby="application-received-title">
          <div
            className={`w-full max-w-xl rounded-[20px] bg-white p-6 shadow-2xl transition-all duration-220 sm:p-8 ${
              isModalClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f5f0] text-[#0f5f57]">
                <Landmark size={20} />
              </div>
              <CheckCircle2 className="text-green-600" size={24} />
            </div>

            <h2 id="application-received-title" className="text-2xl font-bold text-slate-900">Application Received</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Thank you for your interest in Superior One Credit Union.
              <br />
              <br />
              Your information has been successfully received.
              <br />
              <br />
              To complete the account opening process, please visit your nearest Superior One Credit Union branch with a valid government-issued photo ID and any required supporting documents.
              <br />
              <br />
              A banking representative will verify your identity and assist you in opening your account.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  closeModal();
                  navigate("/contact#branch-locator");
                }}
                className="rounded-full bg-[#0f5f57] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0c4f48]"
              >
                Find a Branch
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
