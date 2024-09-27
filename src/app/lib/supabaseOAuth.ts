export const config = {
    clientId: process.env.SUPABASE_CLIENT_ID!,
    clientSecret: process.env.SUPABASE_CLIENT_SECRET!,
    authorizationEndpoint: 'https://api.supabase.com/v1/oauth/authorize',
    tokenEndpoint: 'https://api.supabase.com/v1/oauth/token',
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`,
  };