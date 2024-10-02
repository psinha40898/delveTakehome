'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { fetchMFAStatus, storeLogs, fetchLogs } from '@/app/actions'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Download } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

interface MFAStatus {
  session_id: string;
  user_id: string;
  aal: string;
  user_email: string;
  user_phone: string | null;
}

interface LogEntry {
  timestamp: string;
  action: string;
  result: any;
  type: 'RLS' | 'MFA' | 'PITR';
}

export function MFACheck({ projectRef, userId = 'default-user' }: { projectRef: string; userId?: string }) {
  const [queryResult, setQueryResult] = useState<MFAStatus[] | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchLogs(projectRef, userId).then(logs => {
      setLogs(logs.filter(log => log.type === 'MFA'))
    }).catch(console.error)
  }, [projectRef, userId])

  const addLog = async (action: string, result: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      action,
      result,
      type: 'MFA',
    }
    setLogs(prevLogs => [...prevLogs, newLog])
    await storeLogs(projectRef, [newLog], userId)
  }

  const handleCheckMFA = () => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await fetchMFAStatus(projectRef)
        console.log('MFA status result:', result)
        setQueryResult(result)
        result.forEach(user => {
          const status = user.aal === 'aal2' ? "MFA is enabled" : "MFA is not enabled"
          addLog('MFA Check', { user: user.user_email, status })
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        addLog('MFA Check Error', { error: err instanceof Error ? err.message : 'An unknown error occurred' })
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
    a.download = `mfa_check_${projectRef}_logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full">
      <Button 
        onClick={handleCheckMFA} 
        disabled={isPending}
        className="w-full bg-accent hover:bg-accent/80 text-white"
      >
        {isPending ? 'Checking...' : 'Check MFA Status'}
      </Button>
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
            {queryResult.some(user => user.aal !== 'aal2') ? (
              <Alert className="font-bold bg-red-500/10" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className='font-bold mb-2'>The following users do not have MFA enabled:
                </AlertTitle>
                <AlertDescription>
                  <ScrollArea className="w-full  h-80 p-2">
                    <ul className="space-y-4 pr-4">
                      {queryResult.filter(user => user.aal !== 'aal2').map((user) => (
                        <li key={user.session_id} className="text-sm">
                          <div className="flex flex-col space-y-1">
                            <span className="font-semibold">User ID: {user.user_id}</span>
                            <span>Email: {user.user_email}</span>
                            <span>Phone: {user.user_phone || 'Not provided'}</span>
                            <span>Current AAL: {user.aal}</span>
                          </div>

                        </li>
                    
                        
                      ))}
                    </ul>
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="default" className="bg-green-500/10 text-green-500 border-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>MFA Enabled for All Users</AlertTitle>
                <AlertDescription>
                  All users have MFA (Multi-Factor Authentication) enabled. Great job!
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
                <CardTitle className="text-xl font-bold">MFA Check Logs</CardTitle>
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