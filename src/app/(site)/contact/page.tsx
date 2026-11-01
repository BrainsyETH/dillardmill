import Link from "next/link";
import { GuestMessageForm } from "@/components/forms/GuestMessageForm";
export const metadata = {
  title: "Contact your hosts | Pine Valley",
  description:
    "Questions about Pine Valley, access, pets, or a group stay? Get in touch with your hosts.",
};
export default function Contact() {
  return (
    <div className="page-shell section-space grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-24">
      <div>
        <p className="eyebrow mb-4">A note to your hosts</p>
        <h1 className="page-title mb-7">Let’s talk.</h1>
        <p className="text-lg leading-relaxed max-w-sm">
          Ask us about the stays, bringing your dog, or getting everyone
          together. We’re happy to help you work out the details.
        </p>
        <div className="mt-8 space-y-3">
          <a className="text-link block w-fit" href="tel:+13148434321">
            (314) 843-4321
          </a>
          <a
            className="text-link block w-fit break-all"
            href="mailto:pinevalley@dillardmill.com"
          >
            pinevalley@dillardmill.com
          </a>
          <p className="pt-5">
            126 Dillard Mill Road
            <br />
            Davisville, Missouri 65456
          </p>
          <Link href="/map" className="text-link inline-block">
            Find us ↗
          </Link>
        </div>
        <p className="mt-8 text-sm">
          Planning a group weekend?{" "}
          <Link
            href="/booking-request?unit=book-the-farm"
            className="underline underline-offset-4"
          >
            Tell us about your dates and group.
          </Link>
        </p>
      </div>
      <div className="lg:pt-8">
        <GuestMessageForm />
      </div>
    </div>
  );
}
