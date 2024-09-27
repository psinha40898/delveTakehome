import ConnectSupabase from '@/components/ConnectSupabase'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-4">Connect to Supabase</h1>
      <ConnectSupabase />
    </main>
  )
}