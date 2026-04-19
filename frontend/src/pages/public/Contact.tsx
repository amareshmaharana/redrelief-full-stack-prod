import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    // Simulate submission (no backend endpoint for contact)
    setTimeout(() => {
      toast.success(
        "Message sent successfully! We'll get back to you shortly.",
      );
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground py-20 md:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.5),transparent_50%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
              <MessageSquare className="h-4 w-4" /> Get in Touch
            </span>
            <h1 className="mt-6 font-display text-3xl font-extrabold text-white sm:text-4xl md:text-5xl lg:text-6xl">
              We'd Love to
              <br />
              <span className="text-primary">Hear From You</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-white/60">
              Questions about donating, requesting blood, or partnering with us?
              Our team is ready to help.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact cards strip */}
      <section className="-mt-10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Phone,
                title: "Call Us",
                value: "1800-XXX-XXXX",
                sub: "24/7 Blood Helpline",
                accent: "from-red-500 to-rose-600",
              },
              {
                icon: Mail,
                title: "Email Us",
                value: "support@redrelief.org",
                sub: "Reply within 24 hours",
                accent: "from-orange-500 to-red-500",
              },
              {
                icon: MapPin,
                title: "Visit Us",
                value: "Mumbai, India",
                sub: "RedRelief Headquarter",
                accent: "from-rose-500 to-pink-600",
              },
              {
                icon: Clock,
                title: "Working Hours",
                value: "Mon - Sat",
                sub: "9:00 AM - 6:00 PM",
                accent: "from-pink-500 to-red-600",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} shadow-lg transition-transform group-hover:scale-110`}
                >
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.title}
                </h3>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {item.value}
                </p>
                <p className="text-sm text-muted-foreground">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-start gap-12 lg:grid-cols-5">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl border bg-card p-8 shadow-card md:p-10">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Send a Message
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Fill out the form and we'll get back to you shortly
                  </p>
                </div>

                <div className="space-y-5">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Full Name *
                        </Label>
                        <Input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Rahul Sharma"
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Email *
                        </Label>
                        <Input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@email.com"
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Phone
                        </Label>
                        <Input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Subject *
                        </Label>
                        <Input
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          placeholder="How can we help?"
                          className="h-12 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Message *
                      </Label>
                      <Textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us more about your inquiry..."
                        className="rounded-xl resize-none"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-xl text-base"
                      disabled={submitting}
                    >
                      <Send className="mr-2 h-4 w-4" />{" "}
                      {submitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Right sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 lg:col-span-2"
            >
              {/* Map placeholder */}
              <div className="overflow-hidden rounded-2xl border shadow-card">
                <div className="relative h-56 bg-muted">
                  <iframe
                    title="BDMS Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1709900000000"
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Red<span className="text-red-800">Relief</span> Headquarters
                  </p>
                  <p className="text-xs text-muted-foreground">
                    123 Healthcare Avenue, Mumbai, Maharashtra 400001
                  </p>
                </div>
              </div>

              {/* FAQ quick links */}
              <div className="rounded-2xl border bg-card p-6 shadow-card">
                <h3 className="font-display text-lg font-bold text-foreground">
                  Frequently Asked
                </h3>
                <Accordion type="single" collapsible className="mt-4">
                  {[
                    {
                      q: "Who can donate blood?",
                      a: "Any healthy individual between 18–65 years of age, weighing at least 45 kg, can donate blood. You should not have any chronic illnesses or infections at the time of donation.",
                    },
                    {
                      q: "How often can I donate?",
                      a: "You can donate whole blood every 56 days (about 8 weeks). Platelet donors can give every 7 days, up to 24 times a year.",
                    },
                    {
                      q: "Is blood donation safe?",
                      a: "Absolutely. All equipment used is sterile and disposable. The process is conducted by trained medical professionals following strict safety protocols.",
                    },
                    {
                      q: "How to request blood?",
                      a: "Register as a recipient on BDMS, submit a blood request with your required blood group and units, upload necessary documents, and track your request status in real-time.",
                    },
                  ].map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`faq-${index}`}
                      className="border-b-0 mb-2"
                    >
                      <AccordionTrigger className="rounded-xl border bg-background px-4 py-3 text-sm font-medium text-foreground hover:no-underline hover:border-primary/30 hover:bg-primary/5 [&[data-state=open]]:rounded-b-none [&[data-state=open]]:border-primary/30 [&[data-state=open]]:bg-primary/5">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="rounded-b-xl border border-t-0 border-primary/30 bg-primary/5 px-4 pb-4 pt-2 text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Emergency CTA */}
              <div className="rounded-2xl bg-gradient-to-br from-primary to-red-700 p-6 text-center text-white shadow-lg">
                <Phone className="mx-auto h-8 w-8" />
                <p className="mt-3 text-sm font-medium text-white/80">
                  Emergency Blood Helpline
                </p>
                <p className="mt-1 text-2xl font-extrabold">1800-XXX-XXXX</p>
                <p className="mt-1 text-xs text-white/60">
                  Available 24/7 — Toll Free
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
