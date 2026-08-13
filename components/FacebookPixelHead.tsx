/**
 * Server-rendered Meta Pixel bootstrap so `fbq` exists in the first HTML response.
 * Meta Pixel Helper reads the page source — client-only Script can be missed or delayed.
 *
 * Set NEXT_PUBLIC_FB_PIXEL_ID (and/or FACEBOOK_PIXEL_ID) in Vercel → Redeploy.
 */
import { getPixelIdForServer } from '@/lib/pixel-config'

export default function FacebookPixelHead() {
  const id = getPixelIdForServer()
  const safeId = id.replace(/\D/g, '')
  if (!safeId) return null

  const snippet = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${safeId}');
fbq('track', 'PageView');
  `.trim()

  return (
    <script
      id="fb-pixel-bootstrap"
      dangerouslySetInnerHTML={{ __html: snippet }}
    />
  )
}
