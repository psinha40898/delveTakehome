import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('supabaseAccessToken')?.value;
  return NextResponse.json({ tokenExists: !!token });
}