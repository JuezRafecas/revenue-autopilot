import { NextResponse } from 'next/server';

/**
 * TODO (hackathon): read all visits, call classifyGuests() + calculateRFM(),
 * upsert into guest_profiles, return the computed segment distribution.
 */
export async function POST() {
  return NextResponse.json(
    {
      status: 'not_implemented',
      message: 'Implementar durante el hackathon: lib/segmentation.ts → classifyGuests',
    },
    { status: 501 }
  );
}
