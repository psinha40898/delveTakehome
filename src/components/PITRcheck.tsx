'use client'

import { useState, useTransition } from 'react'
import { Button } from "@/components/ui/button"
import { fetchPITRStatus } from '@/app/actions'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PITRStatus {
  region: string;
  pitr_enabled: boolean;
  walg_enabled: boolean;
  backups: any[];
  physical_backup_data: any;
}

export function PITRCheck({ projectRef }: { projectRef: string }) {
  const [queryResult, setQueryResult] = useState<PITRStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleCheckPITR = () => {
    setError(null)
    startTransition(async () => {
      try {
        const result = await fetchPITRStatus(projectRef)
        console.log('PITR status result:', result)
        setQueryResult(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      }
    })
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
            {queryResult.pitr_enabled ? (
              <Alert variant="default" className="bg-green-500/10 text-green-500 border-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>PITR Enabled</AlertTitle>
                <AlertDescription>
                  Point-in-Time Recovery (PITR) is enabled for this project. Great job!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="font-bold bg-red-500/10" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className='font-bold mb-2'>PITR is not enabled
                </AlertTitle>
                <AlertDescription>
                  Point-in-Time Recovery (PITR) is not enabled for this project. Consider enabling it for better data protection.
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}