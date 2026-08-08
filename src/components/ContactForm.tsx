import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { CONTACT } from "@/data/site";

/**
 * The contact form posts straight to the site's existing `/api/contact`
 * endpoint (Express locally via dev-server.js, a Vercel function in prod —
 * see api/contact.js). It already sends real mail through nodemailer with
 * SMTP credentials configured server-side, so there's no client-side mail
 * service or exposed key to add here.
 */

type Status = "idle" | "sending" | "success" | "error";

const FIXED_SUBJECT = "New message from the portfolio contact form";

export const ContactForm = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [showMessage, setShowMessage] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — real users never fill this

  const formRef = useRef<HTMLFormElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const checkPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (status !== "success") return;
    if (checkPathRef.current) {
      const length = checkPathRef.current.getTotalLength();
      gsap.set(checkPathRef.current, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(checkPathRef.current, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" });
    }
    gsap.fromTo(
      btnRef.current,
      { boxShadow: "0 0 0 0 hsl(var(--accent) / 0)" },
      {
        boxShadow: "0 0 32px 4px hsl(var(--accent) / 0.35)",
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      },
    );
    const id = setTimeout(() => {
      if (formRef.current) {
        gsap.to(formRef.current, {
          opacity: 0,
          y: -8,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => setShowMessage(true),
        });
      } else {
        setShowMessage(true);
      }
    }, 1800);
    return () => clearTimeout(id);
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    if (website.trim()) {
      // A bot filled the honeypot. Don't call the backend — just pretend
      // it worked so nothing tips it off.
      setStatus("success");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject: FIXED_SUBJECT, message }),
      });
      const data = await response.json().catch(() => ({ success: false }));
      if (response.ok && data.success) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        throw new Error(data.message || "Failed to send");
      }
    } catch {
      setStatus("error");
      if (btnRef.current) {
        gsap.fromTo(
          btnRef.current,
          { x: 0 },
          { keyframes: { x: [-6, 6, -4, 4, 0] }, duration: 0.4, ease: "power1.inOut" },
        );
      }
    }
  };

  if (showMessage) {
    return (
      <p className="body-lg btn-fade" aria-live="polite">
        Message sent — I'll get back to you soon.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-busy={status === "sending"}
      className="mx-auto flex w-full max-w-md flex-col gap-8 text-left"
    >
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div data-contact-line className="field">
        <input
          id="contact-name"
          type="text"
          placeholder=" "
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === "sending"}
        />
        <label htmlFor="contact-name">Name</label>
        <span className="field-underline" aria-hidden />
      </div>

      <div data-contact-line className="field">
        <input
          id="contact-email"
          type="email"
          placeholder=" "
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "sending"}
        />
        <label htmlFor="contact-email">Email</label>
        <span className="field-underline" aria-hidden />
      </div>

      <div data-contact-line className="field">
        <textarea
          id="contact-message"
          placeholder=" "
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === "sending"}
        />
        <label htmlFor="contact-message">Message</label>
        <span className="field-underline" aria-hidden />
      </div>

      <div data-contact-line className="flex flex-col items-center gap-4">
        <button
          ref={btnRef}
          type="submit"
          disabled={status === "sending"}
          className="btn-magnetic min-w-[180px] justify-center disabled:cursor-wait"
        >
          {status === "idle" || status === "error" ? (
            <span key="idle" className="btn-fade inline-flex items-center gap-2">
              Send message <span className="arrow" aria-hidden>→</span>
            </span>
          ) : status === "sending" ? (
            <span key="sending" className="btn-fade inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Sending…
            </span>
          ) : (
            <span key="success" className="btn-fade inline-flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  ref={checkPathRef}
                  d="M5 12.5 10 17.5 19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sent
            </span>
          )}
        </button>

        <div aria-live="polite">
          {status === "error" && (
            <p className="label-mono text-center opacity-70">
              Something went wrong — try emailing directly instead:{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">
                {CONTACT.email}
              </a>
            </p>
          )}
        </div>
      </div>
    </form>
  );
};
