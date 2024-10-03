# Delve Takehome Assignment

## Overview

This is my submission for Delve's takehome assignment. It is a Supabase integration that checks for RLS, MFA, and PITR.

## Live Deployment at
https://delve-takehome.vercel.app/

## Features

- Checks for Row Level Security (RLS), Multi-Factor Authentication (MFA), and Point-in-Time Recovery (PITR)
- All actions are logged with timestamps
- All checks are paired with an option to query Perplexity for more information
- For RLS, there are options to enable it, or enable it with some boilerplate simple policies

## How to Run Locally

To run this project locally, follow these steps:

1. Clone the repository to your local machine.

2. Create a `.env` file in the root directory with the following content:
```bash
SUPABASE_CLIENT_ID=Your_Supabase_Oauth_Client_ID_goes_here
SUPABASE_CLIENT_SECRET=Your_Supabase_Oauth_Client_Secret_goes_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
PERPLEXITY_API_KEY=Your_perplexity_API_key_goes_here
```

3. Navigate to the root directory of the project in your terminal.

4. To install the dependencies and run the project locally, use the following commands:

```bash
npm install
npm run build
npm run start
```


Alternatively, there is a live deployment at

https://delve-takehome.vercel.app/