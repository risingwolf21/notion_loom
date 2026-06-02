/**
 * Notion CORS Proxy — deploy this to Cloudflare Workers.
 *
 * This worker relays requests from the browser to api.notion.com,
 * adding the required CORS headers so the browser can talk to Notion.
 *
 * The user's Notion token travels from the browser to this Worker
 * over HTTPS and is never stored here.
 *
 * Deploy: https://workers.cloudflare.com
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Notion-Version',
  'Access-Control-Max-Age': '86400',
}

export default {
  async fetch(request: Request): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    const notionUrl = `https://api.notion.com${url.pathname}${url.search}`

    const headers = new Headers(request.headers)
    headers.set('Notion-Version', '2022-06-28')
    // Remove host header to avoid confusing Notion's server
    headers.delete('host')

    const response = await fetch(notionUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    })

    const respHeaders = new Headers(response.headers)
    Object.entries(CORS_HEADERS).forEach(([k, v]) => respHeaders.set(k, v))

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: respHeaders,
    })
  },
}
