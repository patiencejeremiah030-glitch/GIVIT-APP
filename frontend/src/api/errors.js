/** Parse DRF / GIVIT wrapped API errors into a readable string. */
export function parseApiError(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data
  if (!data) return fallback

  const payload = data.errors ?? data

  if (typeof payload === 'string') return payload
  if (payload.detail) {
    return typeof payload.detail === 'string'
      ? payload.detail
      : JSON.stringify(payload.detail)
  }

  const messages = []
  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value)) {
      messages.push(`${key}: ${value.join(' ')}`)
    } else if (typeof value === 'string') {
      messages.push(key === 'non_field_errors' ? value : `${key}: ${value}`)
    }
  }
  return messages.length ? messages.join(' · ') : fallback
}

export function getResults(data) {
  return data?.results ?? data ?? []
}
