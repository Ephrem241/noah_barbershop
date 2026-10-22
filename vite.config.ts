import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { contentPaths } from './src/content/queries.ts'
import { restUrl } from './src/lib/supabaseUrls.ts'

const EARLY_CONTENT_MARKER = '<!--noah:early-content-->'

/**
 * The website's content (prices, barbers, reviews) comes from Supabase. On a slow phone connection, waiting for the
 * main JavaScript before asking for it costs a second or two, so index.html opens the connections and starts the
 * requests itself; src/content/rest.ts picks up the responses. The tags replace a marker that sits before the
 * stylesheet (an inline script after a stylesheet waits for it). Nothing is added without Supabase settings, and the
 * admin panel (which uses its own client) skips the requests.
 */
function earlyContent(url: string | undefined, key: string | undefined): Plugin {
  return {
    name: 'noah:early-content',
    transformIndexHtml(html) {
      if (!url || !key) return html.replace(EARLY_CONTENT_MARKER, '')
      const urls = Object.fromEntries(Object.values(contentPaths).map((path) => [path, restUrl(url, key, path)]))
      const tags = `<link rel="preconnect" href="${url}" crossorigin />
    <link rel="preconnect" href="${url}" />
    <script>
      if (!location.pathname.startsWith('/admin')) {
        window.__noahContent = {}
        for (const [path, url] of Object.entries(${JSON.stringify(urls)}))
          window.__noahContent[path] = fetch(url).then((res) => (res.ok ? res.json() : null), () => null)
      }
    </script>`
      return html.replace(EARLY_CONTENT_MARKER, tags)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // .env files plus the host's environment variables (Vercel)
  const env = loadEnv(mode, '.', 'VITE_')
  return {
    plugins: [react(), earlyContent(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY)],
    build: {
      rolldownOptions: {
        output: {
          // Libraries in their own long-cached chunks: a content or style change doesn't make returning visitors
          // re-download React or Supabase, and they load in parallel with the app code. (Supabase's client loads
          // with the admin panel only.)
          codeSplitting: {
            groups: [
              { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/, priority: 2 },
              { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/, priority: 2 },
              { name: 'vendor', test: /node_modules[\\/]/, priority: 1 },
            ],
          },
        },
      },
    },
  }
})
