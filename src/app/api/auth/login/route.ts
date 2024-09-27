import { NextResponse } from 'next/server';
import * as oauth from 'oauth4webapi';
import { config } from '@/app/lib/supabaseOAuth';

export async function GET() {
  const authorizationUrl = new URL(config.authorizationEndpoint);
  const codeVerifier = oauth.generateRandomCodeVerifier();
  const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);
  const state = oauth.generateRandomState();

  const params = new URLSearchParams({
    client_id: config.clientId,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: config.redirectUri,
    response_type: 'code',
    state,
  });

  authorizationUrl.search = params.toString();

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set('codeVerifier', codeVerifier, { httpOnly: true, secure: true });
  response.cookies.set('state', state, { httpOnly: true, secure: true });

  return response;
}