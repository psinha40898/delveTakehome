'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { fetchProjectTables, enableRLS, grantReadPermission, grantReadWritePermission, storeLogs, fetchLogs } from '@/app/actions'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { AIChatButton } from './mfa-ai-help'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface TableResult {
  table_name: string;
  rls_enabled: boolean;
}

interface LogEntry {
  timestamp: string;
  action: string;
  result: any;
  type: 'RLS' | 'MFA' | 'PITR';
}

type FetchProjectTablesResult = TableResult[] | { [key: string]: never } | undefined;

export function ProjectTables({ projectRef }: { projectRef: string }) {
  const [queryResult, setQueryResult] = useState<TableResult[] | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchLogs(projectRef).then(logs => {
      setLogs(logs.filter(log => log.type === 'RLS'))
    }).catch(console.error)
  }, [projectRef])

  const addLog = async (action: string, result: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      action,
      result,
      type: 'RLS',
    }
    setLogs(prevLogs => [...prevLogs, newLog])
    await storeLogs(projectRef, [newLog])
  }

  const handleCheckRLS = () => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await fetchProjectTables(projectRef) as FetchProjectTablesResult
        if (Array.isArray(result)) {
          setQueryResult(result)
          result.forEach(table => {
            const status = table.rls_enabled ? "RLS was already enabled" : "RLS was found to be disabled"
            addLog('RLS Check', { table: table.table_name, status })
          })
        } else {
          setQueryResult(null)
          addLog('RLS Check', { error: 'Unexpected result format' })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        addLog('RLS Check Error', { error: err instanceof Error ? err.message : 'An unknown error occurred' })
      }
    })
  }

  const handleEnableRLS = (tableName: string) => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await enableRLS(projectRef, tableName)
        addLog('Enable RLS', { table: tableName, ...result })
        handleCheckRLS() // Refresh the table list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        addLog('Enable RLS Error', { table: tableName, error: err instanceof Error ? err.message : 'An unknown error occurred' })
      }
    })
  }

  const handleGrantReadPermission = (tableName: string) => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await grantReadPermission(projectRef, tableName)
        addLog('Grant Read Permission', { table: tableName, ...result })
        handleCheckRLS() // Refresh the table list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        addLog('Grant Read Permission Error', { table: tableName, error: err instanceof Error ? err.message : 'An unknown error occurred' })
      }
    })
  }

  const handleGrantReadWritePermission = (tableName: string) => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await grantReadWritePermission(projectRef, tableName)
        addLog('Grant Read/Write Permission', { table: tableName, ...result })
        handleCheckRLS() // Refresh the table list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        addLog('Grant Read/Write Permission Error', { table: tableName, error: err instanceof Error ? err.message : 'An unknown error occurred' })
      }
    })
  }

  const handleDownloadLogs = () => {
    const formattedLogs = logs.map((log) => 
      `[${new Date(log.timestamp).toLocaleString()}]\nAction: ${log.action}\nType: ${log.type}\nResult: ${JSON.stringify(log.result, null, 2)}\n\n`
    ).join('')
    
    const blob = new Blob([formattedLogs], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rls_check_${projectRef}_logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full">
      <Button 
        onClick={handleCheckRLS} 
        disabled={isPending}
        className="w-full bg-accent hover:bg-accent/80 text-white"
      >
        {isPending ? 'Checking...' : 'Check RLS Status'}
      </Button>
      <div className="mt-4">
          <AIChatButton query='What is RLS and How do I enable it in my Supabase Application?' title='RLS Help' />
        </div>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        {queryResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {queryResult.some(table => !table.rls_enabled) ? (
              <Alert className="font-bold bg-red-500/10" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className='font-bold mb-2'>The following tables do not have RLS enabled:
                </AlertTitle>
                <AlertDescription>
                <ScrollArea className="w-full h-80">
      <div className="min-w-full p-2">
        <ul className="space-y-4 pr-4">
          {queryResult.filter(table => !table.rls_enabled).map((table) => (
            <li key={table.table_name} className="text-sm">
              <div className="flex flex-col space-y-1">
                <span className="font-semibold">Table Name: {table.table_name}</span>
                <span>RLS Status: Disabled</span>
                <HoverCard closeDelay={100} openDelay={200}>
                  <HoverCardTrigger asChild>
                    <Button
                      onClick={() => handleEnableRLS(table.table_name)}
                      className="bg-accent hover:bg-accent/80 text-white font-semibold rounded-md text-xs w-full"
                    >
                      Enable RLS
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent side="top"  className="w-80">
                                        <p>Only enables RLS</p>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard closeDelay={100} openDelay={200}>
                  <HoverCardTrigger asChild>
                    <Button
                      onClick={() => handleGrantReadPermission(table.table_name)}
                      className="bg-accent hover:bg-accent/80 text-white font-semibold rounded-md text-xs w-full"
                    >
                      Grant Read
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent side="top"  className="w-80">
                    <p>Grants read permissions to all authenticated users through RLS</p>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard closeDelay={100} openDelay={200}>
                  <HoverCardTrigger asChild>
                    <Button
                      onClick={() => handleGrantReadWritePermission(table.table_name)}
                      className="bg-accent hover:bg-accent/80 text-white font-semibold rounded-md text-xs w-full"
                    >
                      Grant Read/Write
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent side="top"  className="w-80">
                    <p>Grants read/write permissions to all authenticated users through RLS</p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="bg-green-500/10 text-green-500 border-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>RLS Enabled for All Tables</AlertTitle>
                <AlertDescription>
                  All tables have Row Level Security (RLS) enabled. Great job!
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        )}
        {logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <Card className="w-full bg-blue-950 text-blue-100">
              <CardHeader>
                <CardTitle className="text-xl font-bold">RLS Check Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full rounded-md border border-blue-800 p-4">
                  <div className="w-[600px] min-w-full">
                    <pre className="text-xs whitespace-pre-wrap">
                      {logs.map((log, index) => (
                        <div key={index} className="mb-4">
                          <span className="text-blue-300">{`[${new Date(log.timestamp).toLocaleString()}]`}</span>
                          <br />
                          <span className="font-semibold">Action: </span>{log.action}
                          <br />
                          <span className="font-semibold">Result: </span>
                          <br />
                          {JSON.stringify(log.result, null, 2)}
                        </div>
                      ))}
                    </pre>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleDownloadLogs}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Logs
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}