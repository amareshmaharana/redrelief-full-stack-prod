import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const faqs = [
  {
    q: 'How often can I donate blood?',
    a: 'You can donate whole blood every 56 days (approximately 8 weeks). Platelet donations can be made every 7 days, up to 24 times a year.',
  },
  {
    q: 'Does donating blood hurt?',
    a: "You may feel a brief pinch when the needle is inserted. Most donors describe the sensation as mild and quick. The actual donation process is painless.",
  },
  {
    q: 'How long does the donation take?',
    a: 'The entire process from registration to refreshments takes about 45 minutes to 1 hour. The actual blood draw takes only 8–12 minutes.',
  },
  {
    q: 'Can I donate if I have a tattoo?',
    a: 'Yes, but you must wait at least 6 months after getting a tattoo. If the tattoo was applied in a licensed facility with sterile equipment, some centers may allow earlier donation.',
  },
  {
    q: 'What happens to my blood after donation?',
    a: 'Your blood is tested, typed, and separated into components (red cells, platelets, plasma). Each donation can save up to 3 lives. Components are stored and distributed to hospitals as needed.',
  },
  {
    q: 'Will I feel weak after donating?',
    a: "Most people feel fine after donating. It's recommended to rest for 15 minutes, drink extra fluids, and avoid heavy lifting for the rest of the day. Your body replaces the donated blood within 24–48 hours.",
  },
  {
    q: 'Is blood donation safe?',
    a: 'Absolutely. All equipment is sterile, single-use, and disposed of after each donation. There is no risk of contracting any disease through donating blood.',
  },
  {
    q: "Can I donate if I'm taking medication?",
    a: "It depends on the medication. Common medications like vitamins, birth control, and blood pressure medications usually don't prevent donation. Consult the medical staff at the donation center for specifics.",
  },
];

export function FAQsDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 border-0 rounded-lg">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 sm:p-8 text-primary-foreground">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
              <HelpCircle className="h-5 w-5" />
            </div>
            <DialogHeader className="space-y-0 text-left">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-primary-foreground">
                Frequently Asked Questions
              </DialogTitle>
            </DialogHeader>
          </div>
          <DialogDescription className="text-primary-foreground/80 mt-2">
            Everything you need to know about blood donation.
          </DialogDescription>
        </div>

        <div className="p-6 sm:p-8">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="rounded-xl border border-border bg-card px-5 shadow-sm data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-foreground hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
