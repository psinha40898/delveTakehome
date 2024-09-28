'use server'

import { cookies } from 'next/headers'
import { SupabaseManagementAPI } from 'supabase-management-js'

export async function fetchProjectTables(projectRef: string) {
  const accessToken = cookies().get('supabaseAccessToken')?.value

  if (!accessToken) {
    throw new Error('No access token found')
  }

  if (!projectRef) {
    throw new Error('Project reference is required')
  }

  try {
    const client = new SupabaseManagementAPI({ accessToken })
    const query = `
      SELECT 
        c.relname AS table_name
      FROM 
        pg_class c
      JOIN 
        pg_namespace n ON n.oid = c.relnamespace
      WHERE 
        c.relkind = 'r' -- Only include regular tables
        AND n.nspname = 'public' -- Only public schema
        AND c.relrowsecurity = false -- RLS is disabled
      ORDER BY 
        c.relname;
    `

    const result = await client.runQuery(projectRef, query)

    console.log('Query result:', JSON.stringify(result, null, 2))

    if (result.error) {
      throw new Error(result.error.message || 'An error occurred while running the query')
    }

    return result
  } catch (error) {
    console.error('Error fetching tables:', error)
    throw new Error('Failed to fetch tables')
  }
}