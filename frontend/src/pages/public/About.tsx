import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Heart, Shield, Users, Award, Droplets, Clock, MapPin, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const benefits = [
  { icon: Heart, title: 'Save Lives', desc: 'One donation can save up to 3 lives. Your generosity directly impacts patients in critical need.' },
  { icon: Shield, title: 'Free Health Check', desc: 'Every donation includes a mini health screening — blood pressure, hemoglobin, and pulse check.' },
  { icon: Users, title: 'Join the Community', desc: 'Become part of a network of 1,000+ active donors committed to making a difference.' },
  { icon: Award, title: 'Earn Recognition', desc: 'Receive donor certificates, milestone badges, and invitations to exclusive appreciation events.' },
];

const stats = [
  { value: '10,000+', label: 'Lives Saved', icon: Heart },
  { value: '5,000+', label: 'Active Donors', icon: Users },
  { value: '120+', label: 'Camps Organized', icon: MapPin },
  { value: '24/7', label: 'Emergency Support', icon: Clock },
];

const eligibility = [
  'Age between 18–65 years',
  'Weight above 45 kg (99 lbs)',
  'Hemoglobin level above 12.5 g/dL',
  'No major illness in the last 6 months',
  'Not donated blood in the last 3 months',
  'No tattoo or piercing in the last 6 months',
];

const process = [
  { step: '01', title: 'Registration', desc: 'Fill a simple form with your basic details and medical history.' },
  { step: '02', title: 'Health Screening', desc: 'A quick check of your blood pressure, pulse, temperature, and hemoglobin.' },
  { step: '03', title: 'Donation', desc: 'The actual donation takes only 8-10 minutes. You will donate about 350-450 ml of blood.' },
  { step: '04', title: 'Refreshments', desc: 'Rest for 10–15 minutes and enjoy light snacks and beverages.' },
];

const faqs = [
  { q: 'Is blood donation safe?', a: 'Absolutely. Sterile, single-use equipment is used for every donation. There is zero risk of contracting any disease from donating blood.' },
  { q: 'How long does the process take?', a: 'The entire process takes about 30–45 minutes, including registration and rest. The actual blood draw takes only 8–10 minutes.' },
  { q: 'How often can I donate blood?', a: 'Men can donate every 3 months (90 days) and women every 4 months (120 days). This gives your body enough time to replenish the donated blood.' },
  { q: 'Will I feel weak after donating?', a: 'Most donors feel perfectly fine. Your body replaces the fluid within 24 hours and the red blood cells within 4–6 weeks. Stay hydrated and eat well.' },
  { q: 'Can I donate if I have a medical condition?', a: 'It depends on the condition. Common colds, allergies under control, and well-managed conditions like thyroid are usually fine. Consult our team during screening.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(0_72%_51%/0.15),transparent_60%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              About Us
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl md:text-5xl">
              Every Drop Counts.<br />
              <span className="text-primary">Every Donor Matters.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-primary-foreground/60">
              We connect generous donors with patients in need through a transparent, technology-driven blood donation ecosystem.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="border-none bg-card shadow-elevated text-center">
                  <CardContent className="p-4 sm:p-6">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 sm:mb-3 sm:h-12 sm:w-12">
                      <stat.icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                    </div>
                    <p className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Donate */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Why Donate Blood</span>
            <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">Benefits of Donating Blood</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Donating blood is one of the simplest yet most impactful ways to make a difference.</p>
          </motion.div>
          <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {benefits.map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="group h-full border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-elevated">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Process */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">How It Works</span>
            <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">The Donation Process</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Simple, safe, and rewarding — here's what to expect.</p>
          </motion.div>
          <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {process.map((item, i) => (
              <motion.div key={item.step} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="relative rounded-2xl border bg-card p-6 shadow-card">
                  <span className="font-display text-4xl font-extrabold text-primary/10">{item.step}</span>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">Before You Donate</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">Eligibility Criteria</h2>
              <p className="mt-3 max-w-md text-muted-foreground">Ensure you meet these basic requirements before scheduling your donation.</p>
            </motion.div>
            <div className="grid gap-3 sm:grid-cols-2">
              {eligibility.map((item, i) => (
                <motion.div key={item} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                    <Activity className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</span>
            <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">Frequently Asked Questions</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border bg-card px-5 data-[state=open]:border-primary/30 data-[state=open]:bg-primary/5">
                  <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-foreground p-8 text-center sm:rounded-3xl sm:p-12 md:p-16"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(0_72%_51%/0.2),transparent_70%)]" />
            <div className="relative">
              <Droplets className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-4 font-display text-2xl font-bold text-primary-foreground sm:mt-6 sm:text-3xl md:text-4xl">Ready to Save a Life?</h2>
              <p className="mx-auto mt-4 max-w-lg text-primary-foreground/60">
                Your single donation can save up to three lives. Join our community of heroes today.
              </p>
              <a href="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Heart className="h-4 w-4" /> Become a Donor
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
