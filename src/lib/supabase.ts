import { createClient } from '@supabase/supabase-js'
import { createServerClient as createSSRServerClient, createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Use placeholders at build time — API routes only execute at request time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'placeholder-service-key'

// Admin client — bypasses RLS, server-side only
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'kpi' },
  auth: { autoRefreshToken: false, persistSession: false },
})

// Server client for App Router Server Components (reads cookies)
export async function createServerClient() {
  const cookieStore = await cookies()
  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'kpi' },
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, value, options as any),
          )
        } catch {
          // Ignore in read-only Server Components
        }
      },
    },
  })
}

// Browser singleton
export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'kpi' },
})
