import { RentalPage } from "@/components/units/RentalPage";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <RentalPage slug={(await params).slug} />;
}
