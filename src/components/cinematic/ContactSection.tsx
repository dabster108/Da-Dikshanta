import { TextReveal, MagneticButton } from "@/motion/primitives";

/**
 * Contact — everything decelerates. The neural background fades to near-zero
 * (handled by the parent dimming on this section's intersection), the
 * background dims, and a final CTA appears via the text-reveal token.
 */
export const ContactSection = () => (
  <section
    id="contact"
    className="relative flex min-h-screen flex-col items-center justify-center px-6 py-32"
  >
    <div className="relative z-10 flex flex-col items-center text-center">
      <span className="label-mono-accent mb-6 block">08 — Contact</span>
      <TextReveal as="h2" split className="display-xl text-foreground">
        Let's build it.
      </TextReveal>
      <TextReveal as="p" delay={0.2} className="mt-6 max-w-lg body-lg">
        If you're working on something at the edge of perception, decision, or
        control — I'd like to hear about it.
      </TextReveal>
      <div className="mt-10">
        <MagneticButton
          href="mailto:dikshanta@example.com"
          className="rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground transition-shadow hover:shadow-[0_0_50px_-8px_hsl(214_100%_62%)]"
          ariaLabel="Send an email"
        >
          dikshanta@example.com
        </MagneticButton>
      </div>
      <div className="mt-16 flex gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        <a href="#" className="hover:text-foreground">linkedin</a>
        <a href="#" className="hover:text-foreground">github</a>
        <a href="#" className="hover:text-foreground">resume</a>
      </div>
    </div>
  </section>
);
