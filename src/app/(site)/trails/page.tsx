import Link from 'next/link';

export const metadata = {
  title: 'Hiking Trails | Pine Valley',
  description: 'Explore beautiful hiking trails near Pine Valley and Dillard Mill in the Missouri Ozarks.',
};

export default function TrailsPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      {/* Header */}
      <div className="bg-[#3A2A1E] text-[#F4F1EB] py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Hiking Trails</h1>
          <p className="text-xl text-[#CBB8A3]">
            Discover scenic trails through the Missouri Ozarks
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Trail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* On-Site Trails */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#CBB8A3]">
            <h2 className="text-2xl font-bold text-[#3A2A1E] mb-4">On-Site Trails</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#9C5A3C] mb-2">Mill Creek Trail</h3>
              <div className="text-sm text-[#6F8291] mb-2">
                <span className="font-semibold">Distance:</span> 0.5 miles ·
                <span className="font-semibold ml-2">Difficulty:</span> Easy
              </div>
              <p className="text-[#2B2B2B]">
                Peaceful walk from Pine Valley to the historic Dillard Mill along the creek. Perfect for families.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#9C5A3C] mb-2">Ridge Loop</h3>
              <div className="text-sm text-[#6F8291] mb-2">
                <span className="font-semibold">Distance:</span> 1.2 miles ·
                <span className="font-semibold ml-2">Difficulty:</span> Moderate
              </div>
              <p className="text-[#2B2B2B]">
                Scenic loop trail with overlooks of the valley and mill. Great for wildlife watching.
              </p>
            </div>
          </div>

          {/* Nearby Trails */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[#CBB8A3]">
            <h2 className="text-2xl font-bold text-[#3A2A1E] mb-4">Nearby Trails</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#9C5A3C] mb-2">Mark Twain National Forest</h3>
              <div className="text-sm text-[#6F8291] mb-2">
                <span className="font-semibold">Distance:</span> 2 miles from Pine Valley
              </div>
              <p className="text-[#2B2B2B]">
                Extensive trail system with options ranging from easy nature walks to challenging backcountry routes.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#9C5A3C] mb-2">Ozark Trail</h3>
              <div className="text-sm text-[#6F8291] mb-2">
                <span className="font-semibold">Distance:</span> 5 miles from Pine Valley
              </div>
              <p className="text-[#2B2B2B]">
                Access point to Missouri's premier long-distance hiking trail through rugged Ozark terrain.
              </p>
            </div>
          </div>
        </div>

        {/* Trail Tips */}
        <div className="bg-[#6B7A5A]/10 border-2 border-[#6B7A5A]/30 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-[#3A2A1E] mb-4">Trail Tips</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#2B2B2B]">
            <li className="flex items-start gap-2">
              <span className="text-[#6B7A5A] text-xl">✓</span>
              <span>Wear sturdy hiking boots or shoes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6B7A5A] text-xl">✓</span>
              <span>Bring water and snacks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6B7A5A] text-xl">✓</span>
              <span>Check weather before heading out</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6B7A5A] text-xl">✓</span>
              <span>Watch for wildlife - deer, turkey, birds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6B7A5A] text-xl">✓</span>
              <span>Apply insect repellent in warm months</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#6B7A5A] text-xl">✓</span>
              <span>Stay on marked trails</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#F4F1EB] to-[#CBB8A3] rounded-lg p-8 text-center border-2 border-[#CBB8A3]">
          <h3 className="text-2xl font-bold text-[#3A2A1E] mb-4">Ready to Explore?</h3>
          <p className="text-[#2B2B2B] mb-6">
            Book your stay at Pine Valley and start your hiking adventure.
          </p>
          <Link
            href="/lodging"
            className="inline-block bg-gradient-to-r from-[#9C5A3C] to-[#7D4830] text-[#F4F1EB] px-8 py-4 rounded-lg font-bold text-lg hover:from-[#7D4830] hover:to-[#6B3825] transition-all shadow-lg"
          >
            View Lodging Options
          </Link>
        </div>
      </div>
    </div>
  );
}
