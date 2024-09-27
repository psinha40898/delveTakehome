import { NextRequest, NextResponse } from 'next/server';
import { SupabaseManagementAPI } from 'supabase-management-js';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('supabaseAccessToken')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token found' }, { status: 401 });
  }

  try {
    const client = new SupabaseManagementAPI({ accessToken });
    const projects = await client.getProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}