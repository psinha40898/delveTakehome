'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { fetchProjectTables } from '@/app/actions'

export function ProjectTables({ projectRef }: { projectRef: string }) {
  const [queryResult, setQueryResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchTables = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchProjectTables(projectRef)
      setQueryResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <Button onClick={handleFetchTables} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Tables'}
      </Button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {queryResult && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Query Result:</h3>
          <pre className="p-4 rounded-md overflow-auto">
            {JSON.stringify(queryResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}