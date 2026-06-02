const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()

function isEnabled() {
  return Boolean(MEASUREMENT_ID && typeof window !== 'undefined')
}

/** Load GA4 script and config. Returns true if analytics is active. */
export function initAnalytics() {
  if (!isEnabled() || window.__givitGaInit) return false

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.__givitGaInit = true
  return true
}

/** Track a page view (SPA route change). */
export function trackPageView(path, title) {
  if (!isEnabled() || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
  })
}

/** Track a custom event, e.g. trackEvent('sign_up', { method: 'email' }). */
export function trackEvent(eventName, params = {}) {
  if (!isEnabled() || !window.gtag) return
  window.gtag('event', eventName, params)
}

export function isAnalyticsEnabled() {
  return isEnabled()
}
