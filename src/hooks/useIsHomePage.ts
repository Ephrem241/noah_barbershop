import { useMatch } from 'react-router-dom'

/** True on the homepage ("/"); /barbers and unknown paths (the not-found page) have no homepage sections. */
export const useIsHomePage = () => useMatch('/') !== null
