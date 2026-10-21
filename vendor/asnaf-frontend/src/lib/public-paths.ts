export function isPublicSessionPath(pathname: string) {
  return (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/impersonate') ||
    pathname.startsWith('/pay/')
  )
}
