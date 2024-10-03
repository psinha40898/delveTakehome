import { NextRequest, NextResponse } from 'next/server';
import { SupabaseManagementAPI } from 'supabase-management-js';

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('supabaseAccessToken')?.value;
  const { projectRef } = await request.json();

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token found' }, { status: 401 });
  }

  if (!projectRef) {
    return NextResponse.json({ error: 'Project reference is required' }, { status: 400 });
  }

  try {
    const client = new SupabaseManagementAPI({ accessToken });
    const query = `
      SELECT 
        table_schema, 
        table_name, 
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM 
        information_schema.tables t
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name;
    `;

    const result = await client.runQuery(projectRef, query);

    // Log the entire result for debugging
    console.log('Query result:', JSON.stringify(result, null, 2));

    if (result?.error) {
      throw new Error(result.error || 'An error occurred while running the query');
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}