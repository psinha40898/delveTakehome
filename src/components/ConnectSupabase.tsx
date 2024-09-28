import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ConnectSupabase() {
  return (
    <Link href="/api/auth/login">
                    <Button 
                size="lg" 
                className="p-16 bg-accent hover:bg-[#f18068] text-accent-foreground rounded-2xl px-8 py-6 text-lg font-medium shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              >Connect Supabase</Button>
    </Link>
  );
}