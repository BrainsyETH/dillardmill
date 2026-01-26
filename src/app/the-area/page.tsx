export default function AreaPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Explore the Area</h1>
      <p className="text-lg text-gray-600 mb-12">
        Discover the beauty and attractions near Pine Valley, from historic sites
        to outdoor adventures in the Missouri Ozarks.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dillard Mill */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-stone-200" />
          <div className="p-6">
            <div className="text-sm text-stone-600 mb-2">Walking Distance</div>
            <h2 className="text-2xl font-semibold mb-3">Dillard Mill State Historic Site</h2>
            <p className="text-gray-700 mb-4">
              A restored gristmill from 1908 located on Huzzah Creek. One of Missouri's
              best-preserved gristmills with original machinery intact. Visitors can
              fish, hike, and picnic along the scenic Ozark waterway.
            </p>
          </div>
        </div>

        {/* Mark Twain Forest */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-stone-200" />
          <div className="p-6">
            <div className="text-sm text-stone-600 mb-2">On Property</div>
            <h2 className="text-2xl font-semibold mb-3">Mark Twain National Forest</h2>
            <p className="text-gray-700 mb-4">
              Expansive forest system offering extensive outdoor recreation with over
              750 miles of trails for hiking, horseback riding, mountain biking, and
              motorized use with varying difficulty levels.
            </p>
          </div>
        </div>

        {/* Huzzah River */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-stone-200" />
          <div className="p-6">
            <div className="text-sm text-stone-600 mb-2">0.5 Miles (trail from entrance)</div>
            <h2 className="text-2xl font-semibold mb-3">Huzzah River</h2>
            <p className="text-gray-700 mb-4">
              A clearwater stream approximately 100 miles from St. Louis that eventually
              joins the Meramec River. Perfect for floating, fishing, and enjoying
              Missouri's natural beauty.
            </p>
          </div>
        </div>

        {/* Viburnum Country Club */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-stone-200" />
          <div className="p-6">
            <div className="text-sm text-stone-600 mb-2">Nearby</div>
            <h2 className="text-2xl font-semibold mb-3">Viburnum Country Club</h2>
            <p className="text-gray-700 mb-4">
              Golf facility north of Viburnum featuring multiple tee lengths and scenic
              terrain suitable for both beginners and experienced players.
            </p>
          </div>
        </div>
      </div>

      {/* On Property Section */}
      <div className="mt-16 bg-stone-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6">On the Property</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Hiking Trails</h3>
            <p className="text-gray-700">
              Explore 1.5-2 miles of private hiking trails winding through our 43 acres.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Fishing Ponds</h3>
            <p className="text-gray-700">
              Two ponds stocked for fishing, perfect for a relaxing afternoon.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Campfire Areas</h3>
            <p className="text-gray-700">
              Multiple designated campfire spots with seating for evening gatherings.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-12 bg-stone-800 text-white rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Plan Your Visit</h2>
        <p className="text-xl text-stone-200 mb-6">
          Experience all that Pine Valley and the Missouri Ozarks have to offer.
        </p>
        <a
          href="/lodging"
          className="inline-block bg-white text-stone-800 px-8 py-3 rounded-lg font-semibold hover:bg-stone-100 transition-colors"
        >
          View Accommodations
        </a>
      </div>
    </div>
  );
}
