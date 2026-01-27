/**
 * JSON-LD Component
 * 
 * Renders structured data as JSON-LD script tags for SEO.
 * Use this component to add schema.org markup to pages.
 * 
 * Example:
 * <JsonLd data={generateVacationRentalSchema(...)} />
 */

interface JsonLdProps {
  data: object;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
