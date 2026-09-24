/**
 * Server-rendered Meta Pixel in <head> so Events Manager / Test Events / Pixel Helper
 * see the snippet in the first HTML response (not only after hydration).
 */
export default function FacebookPixelHead({
  pixelId,
  testEventCode,
}: {
  pixelId: string
  testEventCode?: string
}) {
  const safeId = String(pixelId || '').replace(/\D/g, '')
  if (!safeId) return null

  const snippet = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${safeId}');
fbq('track','PageView');
${testEventCode ? `window.__META_TEST_EVENT_CODE=${JSON.stringify(testEventCode)};` : ''}
`.trim()

  return (
    <script
      id="fb-pixel-bootstrap"
      dangerouslySetInnerHTML={{ __html: snippet }}
    />
  )
}
