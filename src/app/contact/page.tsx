export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="text-lg text-gray-600 mb-8">
        Questions about lodging, camping, or events? We'd love to hear from you!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-xl font-semibold mb-4">Get In Touch</h2>
          <div className="space-y-3">
            <p>
              <span className="font-semibold">Email:</span>{' '}
              <a
                href="mailto:pinevalley@dillardmill.com"
                className="text-stone-700 hover:underline"
              >
                pinevalley@dillardmill.com
              </a>
            </p>
            <p>
              <span className="font-semibold">Phone:</span>{' '}
              <a
                href="tel:+13148434321"
                className="text-stone-700 hover:underline"
              >
                (314) 843-4321
              </a>
            </p>
            <p className="text-gray-600 mt-4">
              126 Dillard Mill Road
              <br />
              Davisville, MO 65456
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Book Our Accommodations</h2>
          <p className="text-gray-600 mb-4">
            Reserve through Airbnb or Hipcamp:
          </p>
          <div className="space-y-2">
            <p>
              <a
                href="https://www.airbnb.com/users/show/309588444"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-700 hover:underline font-semibold"
              >
                View on Airbnb →
              </a>
            </p>
            <p>
              <a
                href="https://www.hipcamp.com/en-US/land/missouri-pine-valley-at-dillard-mill-5x5heyxd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-700 hover:underline font-semibold"
              >
                View on Hipcamp →
              </a>
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Follow Us</h3>
            <div className="space-y-2">
              <p>
                <a
                  href="https://instagram.com/pinevalleydm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-700 hover:underline"
                >
                  Instagram: @pinevalleydm
                </a>
              </p>
              <p>
                <a
                  href="https://facebook.com/pinevalley"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-700 hover:underline"
                >
                  Facebook
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Group Bookings & Events</h3>
        <p className="text-gray-700">
          Interested in booking the entire farm for your group or event? Contact
          us directly for availability and custom arrangements.
        </p>
      </div>
    </div>
  );
}
