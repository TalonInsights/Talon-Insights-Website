import { useRef, useState } from "react";

/* B11 — the booking form (island, form mechanics per 21st import I3).
   The catalog candidate needed seven npm dependencies, so per §7's own rule
   (>2 → hand-roll) the state machine is built here instead, keeping its
   verified a11y wiring: aria-invalid, error ids on aria-describedby, and
   focus moved to the first failed field on submit.

   Defaulted decisions in force (§12):
   D2 — phone OR email must validate; never both required.
   D3 — honeypot field `company_website`; any value drops the submission
        silently (the bot sees success, nothing sends).

   SLOT (§6/B11): paste the Formspree endpoint below to connect the form,
   e.g. "https://formspree.io/f/xxxxxxxx". The CSP already allows it. */
// The old site's working Formspree connection, restored 28 Aug (owner) —
// endpoint xrpzjjzg, delivering to taloninsights@gmail.com. The CSP's
// connect-src already admits formspree.io (that groundwork survived the
// rebuild), and the _subject below identifies the source the way the old
// contact form did.
const ENDPOINT = "https://formspree.io/f/xrpzjjzg";

type Errors = Partial<Record<"name" | "phone" | "email" | "reach" | "send", string>>;

const PHONE_CHARS_RE = /^[+()\-.\s\d]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const phoneLooksComplete = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return PHONE_CHARS_RE.test(phone) && digits.length >= 10 && digits.length <= 15;
};

export default function BookingForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const validate = (data: FormData): Errors => {
    const next: Errors = {};
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    if (!name) next.name = "I need a name to ask for.";
    if (phone && !phoneLooksComplete(phone))
      next.phone = "That phone number looks incomplete — check the digits.";
    if (email && !EMAIL_RE.test(email))
      next.email = "That email address doesn’t look right — check it.";
    if (!phone && !email)
      next.reach = "Leave a phone number or an email — one is enough.";
    return next;
  };

  const focusFirstError = (next: Errors) => {
    if (next.name) nameRef.current?.focus();
    else if (next.phone || next.reach) phoneRef.current?.focus();
    else if (next.email) emailRef.current?.focus();
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // D3 — the honeypot. A filled field means a bot: drop silently.
    if (String(data.get("company_website") ?? "").trim() !== "") {
      setDone(true);
      return;
    }

    const next = validate(data);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      focusFirstError(next);
      return;
    }

    if (!ENDPOINT) {
      setErrors({ send: "Nothing sent — the form isn’t connected yet. Call 07742 082423 instead." });
      return;
    }

    setSending(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!res.ok) throw new Error(String(res.status));
      setDone(true);
    } catch {
      setErrors({ send: "That didn’t send — try again, or call 07742 082423." });
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <p className="form-success" role="status">
        REQUEST RECEIVED — I’LL CALL WITHIN ONE WORKING DAY.
      </p>
    );
  }

  return (
    <form className="bform" onSubmit={onSubmit} noValidate>
      <div className="bform-grid">
        <div className="bfield">
          <label className="bloc" htmlFor="bf-name">Your name</label>
          <input
            ref={nameRef}
            id="bf-name"
            name="name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "bf-name-err" : undefined}
          />
          {errors.name && <p className="berr" id="bf-name-err">{errors.name}</p>}
        </div>
        <div className="bfield">
          <label className="bloc" htmlFor="bf-business">Business name</label>
          <input id="bf-business" name="business" type="text" autoComplete="organization" />
        </div>
        <div className="bfield">
          <label className="bloc" htmlFor="bf-phone">Phone number</label>
          <input
            ref={phoneRef}
            id="bf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!(errors.phone || errors.reach)}
            aria-describedby={errors.phone ? "bf-phone-err" : errors.reach ? "bf-reach-err" : undefined}
          />
          {errors.phone && <p className="berr" id="bf-phone-err">{errors.phone}</p>}
        </div>
        <div className="bfield">
          <label className="bloc" htmlFor="bf-email">Email</label>
          <input
            ref={emailRef}
            id="bf-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!(errors.email || errors.reach)}
            aria-describedby={errors.email ? "bf-email-err" : errors.reach ? "bf-reach-err" : undefined}
          />
          {errors.email && <p className="berr" id="bf-email-err">{errors.email}</p>}
        </div>
      </div>

      <input type="hidden" name="_subject" value="New enquiry from taloninsights.co.uk" />
      {/* D3 — honeypot: hidden from people, irresistible to bots. */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="bf-company-website">Company website</label>
        <input
          id="bf-company-website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {errors.reach && <p className="berr" id="bf-reach-err">{errors.reach}</p>}
      {errors.send && <p className="berr" role="alert">{errors.send}</p>}

      <button className="btn btn-primary bform-submit" type="submit" disabled={sending}>
        {sending ? "Sending…" : "Request a visit"}
      </button>
    </form>
  );
}
