'use server'

import { cookies } from 'next/headers'
import { SupabaseManagementAPI } from 'supabase-management-js'
import fs from 'fs/promises'
import path from 'path'
import { config } from './lib/supabaseOAuth'


interface LogEntry {
  timestamp: string;
  action: string;
  result: any;
  type: 'RLS' | 'MFA' | 'PITR';
}

interface UserLogs {
  userId: string;
  logs: LogEntry[];
}

export async function storeLogs(projectRef: string, logs: LogEntry[]) {
  try {
    const logDir = path.join(process.cwd(), 'logs')
    await fs.mkdir(logDir, { recursive: true })

    const logPath = path.join(logDir, `${projectRef}_logs.json`)
    
    // Read existing logs
    let existingLogs: UserLogs[] = []
    try {
      const existingData = await fs.readFile(logPath, 'utf-8')
      existingLogs = JSON.parse(existingData)
    } catch (error) {
      // File doesn't exist or is empty, which is fine for new projects
    }

    // Find or create user logs
    let userLogs = existingLogs.find(ul => ul.userId === config.clientId)
    if (!userLogs) {
      userLogs = { userId: config.clientId, logs: [] }
      existingLogs.push(userLogs)
    }

    // Append new logs
    userLogs.logs.push(...logs)

    // Write updated logs back to file
    await fs.writeFile(logPath, JSON.stringify(existingLogs, null, 2))

    return { success: true, message: 'Logs stored successfully' }
  } catch (error) {
    console.error('Error storing logs:', error)
    return { success: false, message: 'Error storing logs' }
  }
}

export async function fetchLogs(projectRef: string) {
  try {
    const logPath = path.join(process.cwd(), 'logs', `${projectRef}_logs.json`)
    const logContent = await fs.readFile(logPath, 'utf-8')
    const allLogs: UserLogs[] = JSON.parse(logContent)
    const userLogs = allLogs.find(ul => ul.userId === config.clientId)
    return userLogs ? userLogs.logs : []
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    console.error('Error reading logs:', error)
    throw new Error('Failed to read logs')
  }
}

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

    if (result?.error) {
      throw new Error(result.error || 'An error occurred while running the query')
    }

    return result
  } catch (error) {
    console.error('Error fetching tables:', error)
    throw new Error('Failed to fetch tables')
  }
}

export async function fetchMFAStatus(projectRef: string) {
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
      WITH RankedSessions AS (
        SELECT 
          s.id AS session_id,
          s.user_id,
          s.aal,
          u.email AS user_email,
          u.phone AS user_phone,
          ROW_NUMBER() OVER (PARTITION BY s.user_id ORDER BY s.created_at DESC) AS rn
        FROM 
          auth.sessions s
        JOIN 
          auth.users u ON s.user_id = u.id
        WHERE 
          s.aal != 'aal2'
      )
      SELECT 
        session_id,
        user_id,
        aal,
        user_email,
        user_phone
      FROM 
        RankedSessions
      WHERE 
        rn = 1;
    `

    const result = await client.runQuery(projectRef, query)

    console.log('MFA status query result:', JSON.stringify(result, null, 2))

    if (result?.error) {
      throw new Error(result.error || 'An error occurred while checking MFA status')
    }

    return result
  } catch (error) {
    console.error('Error checking MFA status:', error)
    throw new Error('Failed to check MFA status')
  }
}

export async function enableRLS(projectRef: string, tableName: string) {
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
      ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;
    `

    const result = await client.runQuery(projectRef, query)

    console.log('Enable RLS result:', JSON.stringify(result, null, 2))

    if (result?.error) {
      throw new Error(result.error || 'An error occurred while enabling RLS')
    }

    return { success: true, message: `RLS enabled for table ${tableName}` }
  } catch (error) {
    console.error('Error enabling RLS:', error)
    throw new Error(`Failed to enable RLS for table ${tableName}`)
  }
}


export async function grantReadPermission(projectRef: string, tableName: string) {
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
      -- Enable RLS
      ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

      -- Create read policy
      CREATE POLICY "Allow authenticated users to read" ON ${tableName}
      FOR SELECT
      USING (auth.role() = 'authenticated');
    `

    const result = await client.runQuery(projectRef, query)

    console.log('Grant read permission result:', JSON.stringify(result, null, 2))

    if (result?.error) {
      throw new Error(result.error || 'An error occurred while granting read permission')
    }

    return { success: true, message: `RLS enabled and read permission granted for authenticated users on table ${tableName}` }
  } catch (error) {
    console.error('Error granting read permission:', error)
    throw new Error(`Failed to grant read permission for table ${tableName}`)
  }
}

export async function grantReadWritePermission(projectRef: string, tableName: string) {
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
      -- Enable RLS
      ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

      -- Create read and write policy
      CREATE POLICY "Allow authenticated users to read and write" ON ${tableName}
      FOR ALL
      USING (auth.role() = 'authenticated');
    `

    const result = await client.runQuery(projectRef, query)

    console.log('Grant read/write permission result:', JSON.stringify(result, null, 2))

    if (result?.error) {
      throw new Error(result.error || 'An error occurred while granting read/write permission')
    }

    return { success: true, message: `RLS enabled and read/write permission granted for authenticated users on table ${tableName}` }
  } catch (error) {
    console.error('Error granting read/write permission:', error)
    throw new Error(`Failed to grant read/write permission for table ${tableName}`)
  }
}
export async function fetchPITRStatus(projectRef: string) {
  const accessToken = cookies().get('supabaseAccessToken')?.value

  if (!accessToken) {
    throw new Error('No access token found')
  }

  if (!projectRef) {
    throw new Error('Project reference is required')
  }

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/backups`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    console.log('PITR status response:', JSON.stringify(data, null, 2))

    if (!data) {
      throw new Error('No data received from the API')
    }

    return data
  } catch (error) {
    console.error('Error fetching PITR status:', error)
    throw new Error('Failed to fetch PITR status')
  }
}

export async function getPerplexityResponse(question: string) {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) {
    throw new Error('Perplexity API key is not set')
  }

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        { role: "system", content: "You are a helpful assistant that provides information about Supabase MFA implementation." },
        { role: "user", content: question }
      ],
      temperature: 0.2,
      top_p: 0.9,
      return_citations: true,
      search_domain_filter: ["perplexity.ai"],
      return_images: false,
      return_related_questions: false,
      search_recency_filter: "month",
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1
    })
  };

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', options)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Perplexity API Error:', response.status, errorText)
      throw new Error(`Failed to get response from Perplexity API: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error in getPerplexityResponse:', error)
    throw new Error('Failed to get response from Perplexity API: ' + (error instanceof Error ? error.message : String(error)))
  }
}