'use client'

import { useEffect, useRef } from 'react'

export function BackLogoutGuard() {
  const loggingOut = useRef(false)

  useEffect(() => {
    async function logoutAndRedirect() {
      if (loggingOut.current) return
      loggingOut.current = true

      try {
        await fetch('/logout', { credentials: 'include', cache: 'no-store' })
      } finally {
        window.location.replace('/login?loggedOut=1')
      }
    }

    function handlePopState() {
      void logoutAndRedirect()
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) void logoutAndRedirect()
    }

    window.history.pushState({ protected: true }, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [])

  return null
}
