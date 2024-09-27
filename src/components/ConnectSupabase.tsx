import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ConnectSupabase() {
  return (
    <Link href="/api/auth/login">
      <Button>Connect Supabase</Button>
    </Link>
  );
}