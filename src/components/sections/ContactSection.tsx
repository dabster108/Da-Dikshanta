import React, { useState, useRef } from "react";
import { useScrollAnimation, useStaggeredScrollAnimation } from "@/hooks/use-scroll-animation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { app, database } from "@/lib/firebase";
import { ref as dbRef, push as dbPush } from "firebase/database";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";

export default function ContactSection(): JSX.Element {
  const { toast } = useToast();
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
  const { containerRef: gridRef, visibleItems } = useStaggeredScrollAnimation(3, { threshold: 0.2 });
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const contactsRef = dbRef(database, "contacts_table");
  await dbPush(contactsRef, form);
  toast({ title: "Message sent!", description: "Thank you for your message. I'll get back to you soon." });
      setForm({ name: "", email: "", subject: "", message: "" });
      if (formRef.current) formRef.current.reset();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error while sending message:", error);
      toast({ title: "Error", description: "Failed to send your message. Please try again later.", variant: "destructive" as any });
    }
  };

  

  const contactItems = [
    { icon: Mail, label: "Email", value: "dikshanta108@gmail.com", href: "https://mail.google.com/mail/?view=cm&fs=1&to=dikshanta108@gmail.com" },
    { icon: Phone, label: "Phone", value: "+977 9843410777", href: "facetime://dikshanta108@gmail.com" },
    { icon: MapPin, label: "Location", value: "Budhanilkantha, Kathmandu", href: "https://maps.google.com/?q=Budhanilkantha,Kathmandu,Nepal" },
  ];

  const social = [
    { icon: Github, href: "https://github.com/dabster108", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/dikshantachapagain/", label: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/_savage108", label: "Twitter" },
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div ref={headerRef} className="text-center mb-16">
            <h2 className={`font-heading text-4xl md:text-5xl font-bold mb-4 transition-all duration-1000 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Get In <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Touch</span></h2>
            <p className={`text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-1000 delay-200 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>Let's discuss your next AI project or just say hello</p>
          </div>

          <div ref={gridRef} className="grid lg:grid-cols-2 gap-12">
            {/* Left: Form */}
            <div className={`p-8 card-shadow hover:card-shadow-hover transition-all duration-1000 hover:scale-105 rounded-lg border-2 border-primary ${visibleItems[0] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} style={{ transitionDelay: visibleItems[0] ? '0ms' : undefined }}>
              <h3 className="font-heading text-2xl font-semibold mb-6">Send a Message</h3>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={handleChange} placeholder="your.email@example.com" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" required />
                </div>

                <div className="relative">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" value={form.message} onChange={handleChange} placeholder="Tell me about your AI project..." rows={5} required />
                  
                </div>

                <div>
                  <Button type="submit" className="w-full hero-gradient hero-gradient-hover text-white">Send Message</Button>
                </div>
              </form>
            </div>

            {/* Right: Contact info, socials, callout */}
            <div className={`space-y-8 ${visibleItems[1] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`} style={{ transitionDelay: visibleItems[1] ? '200ms' : undefined }}>
              <div>
                <h3 className="font-heading text-2xl font-semibold mb-6">Contact Information</h3>
                <div className="space-y-4">
                  {contactItems.map((item, idx) => (
                    <a key={idx} href={item.href} target={item.label === "Email" || item.label === "Location" ? "_blank" : "_self"} rel={item.label === "Email" || item.label === "Location" ? "noopener noreferrer" : undefined} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-accent transition-all group hover:scale-105 hover-lift">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-muted-foreground">{item.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Follow Me</h4>
                <div className="flex space-x-4">
                  {social.map((s, i) => (
                    <Button key={i} variant="outline" size="icon" asChild className="hover:scale-110 transition-all">
                      <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                        <s.icon className="h-5 w-5" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>

              <div className={`p-6 bg-gradient-to-br from-primary/5 to-primary-glow/5 border-primary/20 transition-all ${visibleItems[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: visibleItems[2] ? '400ms' : undefined }}>
                <h4 className="font-semibold mb-2">Let's Work Together</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">I'm always excited to work on new projects and collaborate with amazing people. Whether you have a project in mind or just want to chat about technology, feel free to reach out!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}