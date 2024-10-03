import { perplexity } from '@/app/lib/perplexity'
import { streamText } from 'ai'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: perplexity('llama-3.1-sonar-small-128k-online'),
    messages,
  })

  return result.toDataStreamResponse()
}