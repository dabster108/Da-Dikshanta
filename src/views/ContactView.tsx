import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Terminal as TerminalIcon } from "lucide-react";
import ScrambleText from "@/components/ScrambleText";

/**
 * Contact — the final region.
 *
 * The world quiets down. Each system goes offline in turn, the environment
 * recedes, and a small terminal remains: SYSTEM READY → connection.open() →
 * the channels (EMAIL, GITHUB, LINKEDIN). The form still posts to /api/contact
 * — reframed as "transmit" — but the sequence is the point.
 */

const SHUTDOWN = [
  { id: "ai", label: "AI · neural process" },
  { id: "robotics", label: "ROBOTICS · arm idle" },
  { id: "crypto", label: "CRYPTO · keys zeroed" },
  { id: "software", label: "SOFTWARE · services stopped" },
  { id: "vr", label: "VR · spatial off" },
];

const social = [
  { icon: Github, href: "https://github.com/dabster108", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/dikshantachapagain/", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/_savage108", label: "Twitter" },
];

const contactItems = [
  { icon: Mail, label: "Email", value: "dikshanta108@gmail.com", href: "https://mail.google.com/mail/?view=cm&fs=1&to=dikshanta108@gmail.com", external: true },
  { icon: Phone, label: "Phone", value: "+977 9843410777", href: "facetime://dikshanta108@gmail.com", external: false },
  { icon: MapPin, label: "Location", value: "Budhanilkantha, Kathmandu", href: "https://maps.google.com/?q=Budhanilkantha,Kathmandu,Nepal", external: true },
];

const ContactView = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [ready, setReady] = useState(false);

  // Staged shutdown — one system goes offline every 500ms, then SYSTEM READY.
  useEffect(() => {
    const timers: number[] = [];
    SHUTDOWN.forEach((_, i) => {
      timers.push(window.setTimeout(() => setOfflineCount(i + 1), 400 + i * 420));
    });
    timers.push(window.setTimeout(() => setReady(true), 400 + SHUTDOWN.length * 420 + 200));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast({ title: "Transmitting…", description: "Sending your message." });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: "Received.", description: "I'll get back to you soon." });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(data.message || "Failed");
      }
    } catch {
      toast({ title: "Error", description: "Failed to send. Please try again later.", variant: "destructive" as any });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-32">
      {/* Shutdown sequence */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary-glow/80">08 — Contact</p>
        <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
          <ScrambleText text="SYSTEM SHUTDOWN." speed={18} />
        </h1>
      </motion.div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-card/40 p-6 font-mono text-xs backdrop-blur-sm sm:p-8">
        {SHUTDOWN.map((s, i) => {
          const off = i < offlineCount;
          return (
            <div key={s.id} className="flex items-center gap-3 py-1">
              <span className={`h-1.5 w-1.5 rounded-full transition-colors ${off ? "bg-white/20" : "bg-primary-glow"}`} />
              <span className={off ? "text-muted-foreground/40 line-through" : "text-muted-foreground"}>
                {s.label}
              </span>
              <span className={off ? "text-muted-foreground/40" : "text-primary-glow/60"}>
                {off ? "offline" : "running"}
              </span>
            </div>
          );
        })}

        <AnimatePresence>
          {ready && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="mt-5 border-t border-white/10 pt-5">
              <p className="text-primary-glow">
                <ScrambleText text="SYSTEM READY" speed={28} />
              </p>
              <p className="mt-1 text-foreground">
                <span className="text-muted-foreground/60">{"> "}</span>
                <ScrambleText text="connection.open()" speed={24} delay={400} />
              </p>
              <p className="mt-1 text-emerald-300/80">
                <ScrambleText text="// channels live — pick one" speed={14} delay={900} />
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Channels — the final state. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <div className="space-y-3">
          {contactItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-4 rounded-xl border border-white/8 bg-card/30 p-4 transition-colors hover:border-primary-glow/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary-glow">
                <item.icon className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</span>
                <span className="text-sm text-foreground">{item.value}</span>
              </span>
            </a>
          ))}
          <div className="flex gap-3 pt-1">
            {social.map((s) => (
              <Button key={s.label} variant="outline" size="icon" asChild>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <s.icon className="h-4 w-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>

        {/* Transmit form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-card/40 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <TerminalIcon className="h-3.5 w-3.5 text-primary-glow" />
            transmit
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" required />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" value={form.message} onChange={handleChange} placeholder="Tell me about your project…" rows={4} required />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full border border-primary/40 bg-primary/15 text-foreground hover:bg-primary/25">
            {isSubmitting ? "Transmitting…" : "Transmit message"}
          </Button>
        </form>
      </motion.div>
    </section>
  );
};

export default ContactView;
