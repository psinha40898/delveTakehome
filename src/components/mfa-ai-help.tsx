'use client'

import { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, User, Bot, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export function AIChatButton(props:{query:string, title:string}) {
  const [open, setOpen] = useState(false)
  const [isInitialQuerySent, setIsInitialQuerySent] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'system-1',
        role: 'system',
        content: 'You are a helpful AI assistant that wants to explain how MFA, PITR, or RLS works in Supabase. You will emphasize whether or not programming is required to enable any of these features. If asked about MFA, emphasize that a programmatic flow most be implemented. If asked about RLS, emphasize that you can enable RLS and add policies without touching source code. If asked about PITR, emphasize you need to pay a subscription to Supabase to access that feature.',
      },
    ],
  })

  useEffect(() => {
    if (open && !isInitialQuerySent) {
      setIsInitialQuerySent(true)
      setInput(props.query)
      handleSubmit(new Event('submit') as any)
    }
  }, [open, isInitialQuerySent, setInput, handleSubmit, props.query])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-accent hover:bg-accent/80 text-white font-bold tracking-widest mt-4 w-full" >
          <MessageCircle className="w-4 h-8" />
          {props.title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] h-[80vh] p-0 gap-0 bg-zinc-900 text-white">
        <DialogHeader className="p-6 pb-2 flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Bot className="w-6 h-6" />
            Chat with AI
          </DialogTitle>
          {/* <DialogClose className="rounded-full p-2 hover:bg-zinc-800 transition-colors">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose> */}
        </DialogHeader>
        <ScrollArea className="flex-grow p-6 pt-0">
          {messages.slice(1).map((message) => (
            <div key={message.id} className="mb-6 last:mb-0">
              <p className="font-semibold mb-2 text-lg flex items-center gap-2">
                {message.role === 'user' ? (
                  <>
                    <User className="w-5 h-5" />
                    You:
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5" />
                    AI:
                  </>
                )}
              </p>
              <div className="prose prose-invert max-w-none text-base">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <p className="text-zinc-400 text-base flex items-center gap-2">
              <Bot className="w-5 h-5 animate-pulse" />
              AI is thinking...
            </p>
          )}
          {error && <p className="text-red-500 text-base">Error: {error.message}</p>}
        </ScrollArea>
        <form onSubmit={handleSubmit} className="p-6 flex items-center space-x-4">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 text-base py-3"
          />
          <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/80 font-bold text-base py-3 px-6 gap-2">
            <Send className="w-4 h-4" />
            Send
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}