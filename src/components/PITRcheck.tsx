'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { fetchPITRStatus, storeLogs, fetchLogs } from '@/app/actions'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { config } from '@/app/lib/supabaseOAuth'
import { AIChatButton } from './mfa-ai-help'

interface PITRStatus {
  region: string;
  pitr_enabled: boolean;
  walg_enabled: boolean;
  backups: any[];
  physical_backup_data: any;
}

interface LogEntry {
  timestamp: string;
  action: string;
  result: any;
  type: 'RLS' | 'MFA' | 'PITR';
}

type FetchPITRStatusResult = PITRStatus | { [key: string]: never } | undefined;

export function PITRCheck({ projectRef }: { projectRef: string }) {
  const [queryResult, setQueryResult] = useState<PITRStatus | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchLogs(projectRef).then(logs => {
      setLogs(logs.filter(log => log.type === 'PITR'))
    }).catch(console.error)
  }, [projectRef])

  const addLog = async (action: string, result: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      action,
      result,
      type: 'PITR',
    }
    setLogs(prevLogs => [...prevLogs, newLog])
    await storeLogs(projectRef, [newLog])
  }
  const handleCheckPITR = () => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await fetchPITRStatus(projectRef) as FetchPITRStatusResult
        console.log('PITR status result:', result)
        if (result && 'pitr_enabled' in result) {
          setQueryResult(result as PITRStatus)
          addLog('PITR Check', {
            pitr_enabled: result.pitr_enabled,
            walg_enabled: result.walg_enabled,
            region: result.region,
            backups_count: result.backups.length,
          })
        } else {
          setQueryResult(null)
          addLog('PITR Check', { error: 'Unexpected result format' })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        addLog('PITR Check Error', { error: err instanceof Error ? err.message : 'An unknown error occurred' })
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
    a.download = `pitr_check_${projectRef}_logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full">
      <Button 
        onClick={handleCheckPITR} 
        disabled={isPending}
        className="w-full bg-accent hover:bg-accent/80 text-white"
      >
        {isPending ? 'Checking...' : 'Check PITR Status'}
      </Button>
      <div className="mt-4">
          <AIChatButton query='What is PITR and how do I enable it in my Supabase application?' title='PITR Help' />
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
            {!queryResult.pitr_enabled ? (
              <Alert className="font-bold bg-red-500/10" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className='font-bold mb-2'>PITR is not enabled for this project. See the following details:
                </AlertTitle>
                <AlertDescription>
                <ScrollArea className="w-full h-80">
      <div className="min-w-full p-2">
        <div className="space-y-4 pr-4">
          <p>Point-in-Time Recovery (PITR) is not enabled for this project. Consider enabling it for better data protection.</p>
          <ul className="space-y-2">
            <li><span className="font-semibold">Region:</span> {queryResult.region}</li>
            <li><span className="font-semibold">WAL-G Enabled:</span> {queryResult.walg_enabled ? 'Yes' : 'No'}</li>
            <li><span className="font-semibold">Number of Backups:</span> {queryResult.backups.length}</li>
          </ul>
        </div>

      </div>
      <ScrollBar orientation="vertical" />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="bg-green-500/10 text-green-500 border-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>PITR Enabled</AlertTitle>
                <AlertDescription>
                  <ScrollArea className="w-full h-80 p-2">
                    <div className="space-y-4 pr-4">
                      <p>Point-in-Time Recovery (PITR) is enabled for this project. Great job!</p>
                      <h4 className="font-semibold">Project Details:</h4>
                      <ul className="space-y-2">
                        <li><span className="font-semibold">Region:</span> {queryResult.region}</li>
                        <li><span className="font-semibold">WAL-G Enabled:</span> {queryResult.walg_enabled ? 'Yes' : 'No'}</li>
                        <li><span className="font-semibold">Number of Backups:</span> {queryResult.backups.length}</li>
                        <li>
                          <span className="font-semibold">Physical Backup Data:</span>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(queryResult.physical_backup_data, null, 2)}
                          </pre>
                        </li>
                      </ul>
                    </div>
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
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
                <CardTitle className="text-xl font-bold">PITR Check Logs</CardTitle>
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