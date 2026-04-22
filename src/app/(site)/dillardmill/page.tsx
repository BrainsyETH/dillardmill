import Link from 'next/link';

export const metadata = {
  title: 'Dillard Mill State Historic Site | Pine Valley',
  description: 'Learn about the historic Dillard Mill, our neighbor at Pine Valley in the Missouri Ozarks.',
};

export default function DillardMillPage() {
  return (
    <div className="min-h-screen bg-[#F4F1EB]">
      {/* Header */}
      <div className="bg-[#3A2A1E] text-[#F4F1EB] py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Dillard Mill State Historic Site</h1>
          <p className="text-xl text-[#CBB8A3]">
            A beautifully preserved 1900s water-powered grist mill, just steps from Pine Valley
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-[#3A2A1E] mb-6">About the Mill</h2>

          <div className="prose prose-lg max-w-none text-[#2B2B2B]">
            <p className="mb-4">
              The Dillard Mill is one of the most picturesque mills in Missouri. Built around 1900,
              this water-powered grist mill still retains its original equipment and structure.
            </p>

            <p className="mb-4">
              The mill sits beside a crystal-clear creek in a beautiful wooded valley, creating one of
              the most photographed scenes in the Missouri State Park system.
            </p>

            <h3 className="text-2xl font-bold text-[#3A2A1E] mt-8 mb-4">Visiting the Mill</h3>
            <ul className="space-y-2 text-[#2B2B2B]">
              <li><strong>Distance:</strong> 0.1 miles from Pine Valley (walking distance)</li>
              <li><strong>Season:</strong> Open year-round</li>
              <li><strong>Tours:</strong> Self-guided tours available</li>
              <li><strong>Cost:</strong> Free admission</li>
            </ul>

            <h3 className="text-2xl font-bold text-[#3A2A1E] mt-8 mb-4">Things to Do</h3>
            <ul className="space-y-2 text-[#2B2B2B]">
              <li>• Tour the historic mill building</li>
              <li>• Photography at the mill and waterwheel</li>
              <li>• Hiking trails along the creek</li>
              <li>• Picnicking in the park</li>
              <li>• Wildlife watching</li>
              <li>• Swimming in the creek (seasonal)</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#F4F1EB] to-[#CBB8A3] rounded-lg p-8 text-center border-2 border-[#CBB8A3]">
          <h3 className="text-2xl font-bold text-[#3A2A1E] mb-4">Stay at Pine Valley</h3>
          <p className="text-[#2B2B2B] mb-6">
            Experience the historic mill from your doorstep. Book your stay at Pine Valley today.
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
