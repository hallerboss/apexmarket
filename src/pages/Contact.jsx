import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await base44.functions.invoke("sendContactInquiry", form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(
        err?.response?.data?.error ||
        err?.message ||
        "Something went wrong. Please try again."
      );
    }
  };

  const info = [
    { icon: Mail, label: "Email", value: "hello@wolmart.studio", href: "mailto:hello@wolmart.studio" },
    { icon: Phone, label: "Phone", value: "+1 (555) 028-2024", href: "tel:+15550282024" },
    { icon: MapPin, label: "Office", value: "221 Market Street, Suite 400, San Francisco, CA 94103" },
  ];

  return (
    <div>
      <div className="border-b hairline">
        <div className="container-bleed px-5 lg:px-10 py-12 lg:py-20">
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent font-semibold mb-4">Contact</p>
          <h1 className="display-text text-5xl lg:text-7xl">Get in touch</h1>
          <p className="serif-text text-muted-foreground mt-4 max-w-lg">
            Questions, partnerships, or press — we'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="container-bleed px-5 lg:px-10 py-12 lg:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-6">
          {info.map((i) => (
            <div key={i.label} className="flex gap-4">
              <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                <i.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-1">{i.label}</p>
                {i.href ? (
                  <a href={i.href} className="text-base text-foreground hover:text-accent transition-colors">{i.value}</a>
                ) : (
                  <p className="text-base text-foreground">{i.value}</p>
                )}
              </div>
            </div>
          ))}
          <div className="pt-6 border-t hairline">
            <p className="serif-text text-muted-foreground">Mon–Fri, 9am–6pm Pacific Time</p>
          </div>
        </div>

        <div>
          {status === "success" ? (
            <div className="border hairline p-8 text-center">
              <p className="serif-text text-2xl mb-2">Thank you.</p>
              <p className="text-muted-foreground">Your message has been sent. We'll reply within one business day.</p>
              <button onClick={() => setStatus("idle")} className="btn-mono-outline mt-6">Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border hairline px-4 py-3 text-sm bg-transparent focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border hairline px-4 py-3 text-sm bg-transparent focus:border-accent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Subject</label>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border hairline px-4 py-3 text-sm bg-transparent focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Message</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border hairline px-4 py-3 text-sm bg-transparent focus:border-accent outline-none resize-none" />
              </div>
              {status === "error" && <p className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={status === "sending"} className="btn-mono-solid w-full sm:w-auto disabled:opacity-50">
                {status === "sending" ? "Sending…" : <>Send Message <Send className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}