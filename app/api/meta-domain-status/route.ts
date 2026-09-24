import { NextResponse } from 'next/server'
import { resolveDomainVerification } from '@/lib/site-settings'
import { fetchSettings } from '@/lib/site-settings-server'

export const dynamic = 'force-dynamic'

/** Debug endpoint: open /api/meta-domain-status on the LIVE domain before clicking Verify in Meta */
export async function GET() {
  const settings = await fetchSettings(['domain_verification_content'])
  const fromDb = resolveDomainVerification(settings)
  const fromEnv = resolveDomainVerification({})
  const code = fromEnv || fromDb

  return NextResponse.json({
    ok: Boolean(code),
    code_preview: code ? `${code.slice(0, 6)}…${code.slice(-4)}` : null,
    code_length: code.length,
    source: fromEnv ? 'env' : fromDb ? 'database' : 'none',
    meta_tag: code
      ? `<meta name="facebook-domain-verification" content="${code}" />`
      : null,
    instructions: [
      '1. Le code doit être non vide (ok: true).',
      '2. Ouvrez https://VOTRE-DOMAINE/ et Afficher le code source — cherchez facebook-domain-verification.',
      '3. Meta ne vérifie PAS localhost — déployez d’abord.',
      '4. Le domaine dans Meta doit être exact (avec ou sans www).',
      '5. Alternative fiable: DNS TXT — facebook-domain-verification=CODE',
    ],
  })
}
