import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/app/lib/supabaseOAuth';

export async function GET(request: NextRequest) {
  console.log('Callback route hit');
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const codeVerifier = request.cookies.get('codeVerifier')?.value;

  console.log('Code:', code);
  console.log('State:', state);
  console.log('Code Verifier:', codeVerifier);

  if (!code || !state || !codeVerifier) {
    console.log('Missing parameters');
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const tokenResponse = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${config.clientId}:${config.clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    console.log('Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token response error:', errorText);
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received:', tokens);

    const response = NextResponse.redirect(new URL('/projects', request.url));
    response.cookies.set('supabaseAccessToken', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
      path: '/',
    });

    console.log('Access token set in cookie');
    return response;
  } catch (error) {
    console.error('Error in callback:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}