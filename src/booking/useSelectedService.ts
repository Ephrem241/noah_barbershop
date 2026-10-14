import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useServices } from '../content/hooks'
import { SERVICE_PARAM, serviceSlug } from './context'

/**
 * The service picked from the menu (/barbers?service=<slug>), once the services have loaded. A value that matches no
 * service (renamed or removed since the link was made) is simply ignored.
 */
export function useSelectedService() {
  const [params, setParams] = useSearchParams()
  const { data: services } = useServices()
  const slug = params.get(SERVICE_PARAM)
  const service = slug ? services.find((s) => serviceSlug(s.title) === slug) : undefined

  const clear = useCallback(
    () =>
      setParams(
        (p) => {
          p.delete(SERVICE_PARAM)
          return p
        },
        { replace: true },
      ),
    [setParams],
  )

  return { service, clear }
}
