let pendingCapability: string | null = null

if (typeof window !== 'undefined'
  && window.location.pathname === '/preview/landing'
  && window.location.search === '') {
  const match = /^#capability=([^&]*)$/.exec(window.location.hash)
  if (match) {
    window.history.replaceState(window.history.state, '', '/preview/landing')
    try {
      const capability = decodeURIComponent(match[1] ?? '')
      if (capability.length > 0 && capability.length <= 4_096) {
        pendingCapability = capability
      }
    } catch {
      pendingCapability = null
    }
  }
}

export const consumePreviewCapability = () => {
  const capability = pendingCapability
  pendingCapability = null
  return capability
}
