import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Explicitly load Next.js local env file
dotenv.config({ path: '.env.local' })

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1) return null
  return process.argv[idx + 1] ?? null
}

const email = getArg('email')
const password = getArg('password') ?? crypto.randomBytes(12).toString('base64url')
const name = getArg('name') ?? 'Admin'

if (!email) {
  console.error('Missing --email. Example: npm run create-admin -- --email admin@electrotunisie.tn')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !/^https?:\/\//i.test(url)) {
  console.error('Missing or invalid NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}
if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// 1) Create auth user (or fetch if exists)
let userId = null
const { data: created, error: createErr } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { name },
})

if (createErr) {
  // If already exists, locate and reset password
  const { data: users, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 2000 })
  if (listErr) {
    console.error('Failed to create user and failed to list users:', createErr.message, listErr.message)
    process.exit(1)
  }
  const existing = users?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (!existing) {
    console.error('Failed to create user:', createErr.message)
    process.exit(1)
  }
  userId = existing.id
  const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  })
  if (updErr) {
    console.error('User exists but password reset failed:', updErr.message)
    process.exit(1)
  }
} else {
  userId = created.user.id
}

// 2) Upsert admin_users row
const { error: adminErr } = await supabase.from('admin_users').upsert({
  id: userId,
  email,
  name,
  role: 'admin',
})

if (adminErr) {
  console.error('Created auth user but failed to upsert admin_users:', adminErr.message)
  process.exit(1)
}

console.log('Admin user ready:')
console.log('  email:', email)
console.log('  password:', password)
console.log('  login:', 'http://localhost:3000/admin/login')

