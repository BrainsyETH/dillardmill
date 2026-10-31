import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rejectCrossSite } from '@/lib/admin/guard';
import { createBlock, deleteBlock } from '@/lib/db/availability';
import { isIsoDate } from '@/lib/booking/dates';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  unitId: z.string().min(1),
  start: z.string().refine(isIsoDate),
  end: z.string().refine(isIsoDate),
  note: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.end <= parsed.data.start) {
    return NextResponse.json({ error: 'Choose a start date before the end date.' }, { status: 400 });
  }
  const { unitId, start, end, note } = parsed.data;
  await createBlock(unitId, start, end, note || null);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const blocked = rejectCrossSite(request);
  if (blocked) return blocked;
  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await deleteBlock(id);
  return NextResponse.json({ ok: true });
}
