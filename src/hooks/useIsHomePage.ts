import { useMatch } from 'react-router-dom'

/** The homepage renders on every public path except /barbers (unknown paths fall back to it). */
export const useIsHomePage = () => useMatch('/barbers') === null
