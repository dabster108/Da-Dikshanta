import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Github, Linkedin, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const ContactSection = () => {
  const { toast } = useToast();
  const { elementRef: sectionRef, isVisible: sectionVisible } = useScrollAnimation({ threshold: 0.2 });
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.3 });
  const { elementRef: formRef, isVisible: formVisible } = useScrollAnimation({ threshold: 0.3 });
  const { elementRef: infoRef, isVisible: infoVisible } = useScrollAnimation({ threshold: 0.3 });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "Thank you for your message. I'll get back to you soon.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "dikshanta108@gmail.com",
      href: "https://mail.google.com/mail/?view=cm&fs=1&to=dikshanta108@gmail.com"
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+977 9843410777",
      href: "facetime://dikshanta108@gmail.com"
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Budhanilkantha, Kathmandu",
      href: "https://maps.google.com/?q=Budhanilkantha,Kathmandu,Nepal"
    }
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/dabster108", label: "GitHub" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/dikshantachapagain/", label: "LinkedIn" },
    { icon: Twitter, href: "https://x.com/_savage108", label: "Twitter" }
  ];

  return (
    <section ref={sectionRef} id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div ref={headerRef} className={`text-center mb-16 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Get In <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Let's discuss your next AI project or just say hello
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card ref={formRef} className={`p-8 card-shadow hover:card-shadow-hover transition-all duration-1000 hover:scale-105 ${
              formVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}>
              <h3 className={`font-heading text-2xl font-semibold mb-6 transition-all duration-1000 delay-300 ${
                formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={`transition-all duration-1000 delay-500 ${
                    formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="transition-smooth focus:scale-105 hover:scale-[1.02]"
                      required
                    />
                  </div>
                  <div className={`transition-all duration-1000 delay-600 ${
                    formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="transition-smooth focus:scale-105 hover:scale-[1.02]"
                      required
                    />
                  </div>
                </div>

                <div className={`transition-all duration-1000 delay-700 ${
                  formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What's this about?"
                    className="transition-smooth focus:scale-105 hover:scale-[1.02]"
                    required
                  />
                </div>

                <div className={`transition-all duration-1000 delay-800 ${
                  formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your AI project..."
                    rows={5}
                    className="transition-smooth focus:scale-105 hover:scale-[1.02]"
                    required
                  />
                </div>

                <div className={`transition-all duration-1000 delay-900 ${
                  formVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}>
                  <Button type="submit" className="w-full hero-gradient hero-gradient-hover text-white hover:scale-105 transition-spring animate-glow">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </Card>

            {/* Contact Information */}
            <div ref={infoRef} className={`space-y-8 transition-all duration-1000 delay-300 ${
              infoVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}>
              <div>
                <h3 className={`font-heading text-2xl font-semibold mb-6 transition-all duration-1000 delay-500 ${
                  infoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>Contact Information</h3>
                <div className="space-y-4">
                  {contactInfo.map((item, index) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.label === "Email" || item.label === "Location" ? "_blank" : "_self"}
                      rel={item.label === "Email" || item.label === "Location" ? "noopener noreferrer" : ""}
                      className={`flex items-center space-x-4 p-4 rounded-lg hover:bg-accent transition-all group hover:scale-105 hover-lift ${
                        infoVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                      }`}
                      style={{ transitionDelay: `${600 + index * 150}ms`, transitionDuration: '700ms' }}
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-smooth group-hover:scale-110 animate-glow">
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

              {/* Social Links */}
              <div className={`transition-all duration-1000 delay-1000 ${
                infoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <h4 className="font-semibold mb-4">Follow Me</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <Button
                      key={social.label}
                      variant="outline"
                      size="icon"
                      asChild
                      className={`hover:scale-110 transition-all hover:bg-primary hover:text-primary-foreground ${
                        infoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                      }`}
                      style={{ 
                        transitionDelay: `${1100 + index * 100}ms`,
                        transitionDuration: '400ms'
                      }}
                    >
                      <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                        <social.icon className="h-5 w-5" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <Card className={`p-6 bg-gradient-to-br from-primary/5 to-primary-glow/5 border-primary/20 hover:scale-105 transition-all duration-1000 delay-1200 ${
                infoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <h4 className="font-semibold mb-2">Let's Work Together</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  I'm always excited to work on new projects and collaborate with 
                  amazing people. Whether you have a project in mind or just want 
                  to chat about technology, feel free to reach out!
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;