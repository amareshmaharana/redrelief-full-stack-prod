import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileText, Scale, AlertTriangle, RefreshCw, Ban, Handshake, Mail } from 'lucide-react';

const sections = [
  {
    icon: Handshake,
    title: 'Acceptance of Terms',
    paragraphs: [
      'By accessing or using the Blood Donation Management System (BDMS), you agree to be bound by these Terms of Service and all applicable laws and regulations.',
      'If you do not agree with any part of these terms, you must not use our platform. We reserve the right to update these terms at any time, and continued use constitutes acceptance of changes.',
    ],
  },
  {
    icon: Scale,
    title: 'User Responsibilities',
    paragraphs: [
      'You must provide accurate, current, and complete information during registration and maintain the accuracy of such information.',
      'You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.',
      'You must not provide false medical or health information, as this could endanger the safety of blood recipients.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Medical Disclaimer',
    paragraphs: [
      'BDMS provides a platform to connect donors, recipients, and healthcare institutions. We do not provide medical advice, diagnosis, or treatment.',
      'All medical decisions, including eligibility for blood donation, are made by qualified healthcare professionals at donation sites.',
      'The eligibility guide and health information on our platform are for educational purposes only and should not replace professional medical consultation.',
    ],
  },
  {
    icon: Ban,
    title: 'Prohibited Activities',
    paragraphs: [
      'Misrepresenting your identity, health status, or eligibility for blood donation.',
      'Attempting to sell, trade, or commercially exploit donated blood or blood products through our platform.',
      'Using the platform to harass, spam, or send unsolicited communications to other users.',
      'Attempting to gain unauthorized access to other user accounts or system infrastructure.',
    ],
  },
  {
    icon: RefreshCw,
    title: 'Service Availability',
    paragraphs: [
      'We strive to maintain uninterrupted access to BDMS but do not guarantee 100% uptime. Scheduled maintenance and unexpected outages may occur.',
      'We reserve the right to modify, suspend, or discontinue any feature of the platform with reasonable notice to users.',
      'In emergency situations (e.g., natural disasters), service modifications may be made without prior notice to prioritize critical blood supply operations.',
    ],
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-foreground via-foreground/95 to-foreground/90 pt-32 pb-16 sm:pt-36 sm:pb-20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30 mb-6">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Terms of Service</h1>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">
            Please read these terms carefully before using the Blood Donation Management System.
          </p>
          <p className="mt-3 text-sm text-white/40">Effective: March 8, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, sIdx) => (
            <div
              key={section.title}
              className="group rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <section.icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {sIdx + 1}. {section.title}
                </h2>
              </div>
              <div className="space-y-3">
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed pl-1">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Contact */}
          <div className="rounded-2xl bg-accent/50 border border-border p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Questions about these terms?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Reach out to our legal team at <span className="text-primary font-medium">legal@bdms.org</span> or call <span className="text-primary font-medium">1800-XXX-XXXX</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
