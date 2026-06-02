import { useState } from 'react'
import { Eye, EyeOff, CheckCircle2, AlertCircle, Copy, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { validateConnection } from '@/lib/notion'
import type { Settings } from '@/hooks/useSettings'

const WORKER_CODE = `export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Notion-Version',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    const url = new URL(request.url);
    const notionUrl = \`https://api.notion.com\${url.pathname}\${url.search}\`;
    const headers = new Headers(request.headers);
    headers.set('Notion-Version', '2022-06-28');
    const response = await fetch(notionUrl, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    });
    const respHeaders = new Headers(response.headers);
    respHeaders.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, { status: response.status, headers: respHeaders });
  },
};`

interface Props {
  onComplete: (settings: Settings) => void
}

export function Onboarding({ onComplete }: Props) {
  const [step, setStep]           = useState<1 | 2 | 3>(1)
  const [workerUrl, setWorkerUrl] = useState('')
  const [token, setToken]         = useState('')
  const [showToken, setShowToken] = useState(false)
  const [testing, setTesting]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [copied, setCopied]       = useState(false)

  function copyCode() {
    void navigator.clipboard.writeText(WORKER_CODE).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleConnect() {
    if (!workerUrl.trim() || !token.trim()) return
    setTesting(true)
    setError(null)
    try {
      await validateConnection(workerUrl.trim(), token.trim())
      onComplete({ token: token.trim(), workerUrl: workerUrl.trim() })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed'
      setError(`Could not connect: ${msg}. Check both values and try again.`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[var(--bg)]">
      <div className="max-w-lg mx-auto w-full px-5 py-10 space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--fg)]">Notion Loom</h1>
            <p className="text-sm text-[var(--fg3)] mt-1">iOS Reminders, powered by Notion</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-6 bg-[var(--primary)]' : s < step ? 'w-2 bg-[var(--primary)]' : 'w-2 bg-[var(--surface2)]'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Deploy Worker */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--fg)]">Step 1: Deploy a Proxy</h2>
              <p className="text-sm text-[var(--fg2)] mt-1">
                Notion's API doesn't allow direct browser requests. You need a tiny Cloudflare Worker that relays them. It's free and takes about 3 minutes.
              </p>
            </div>

            <ol className="space-y-2 text-sm text-[var(--fg2)]">
              <li className="flex gap-2"><span className="text-[var(--primary)] font-semibold">1.</span> Go to <strong>workers.cloudflare.com</strong> and sign in (free account).</li>
              <li className="flex gap-2"><span className="text-[var(--primary)] font-semibold">2.</span> Click <strong>Create Worker</strong>, then <strong>Deploy</strong>.</li>
              <li className="flex gap-2"><span className="text-[var(--primary)] font-semibold">3.</span> Click <strong>Edit code</strong>, replace everything with the code below, and <strong>Save &amp; Deploy</strong>.</li>
              <li className="flex gap-2"><span className="text-[var(--primary)] font-semibold">4.</span> Copy the worker URL (e.g. <code className="text-xs bg-[var(--surface2)] px-1 rounded">my-worker.workers.dev</code>).</li>
            </ol>

            <div className="relative">
              <pre className="text-xs bg-[var(--surface2)] rounded-xl p-4 overflow-x-auto text-[var(--fg2)] leading-relaxed">
                {WORKER_CODE}
              </pre>
              <button
                onClick={copyCode}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-[var(--card)] shadow text-[var(--fg3)] hover:text-[var(--fg)] transition-colors"
                aria-label="Copy code"
              >
                {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
              </button>
            </div>

            <Button className="w-full" onClick={() => setStep(2)}>
              I've deployed the Worker <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {/* Step 2: Worker URL */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--fg)]">Step 2: Worker URL</h2>
              <p className="text-sm text-[var(--fg2)] mt-1">
                Paste the URL of the Worker you just deployed.
              </p>
            </div>
            <Input
              value={workerUrl}
              onChange={(e) => setWorkerUrl(e.target.value)}
              placeholder="https://my-worker.workers.dev"
              type="url"
              autoFocus
              autoCapitalize="none"
              autoComplete="off"
            />
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} disabled={!workerUrl.trim()} className="flex-1">
                Continue <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Notion token */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--fg)]">Step 3: Notion Token</h2>
              <p className="text-sm text-[var(--fg2)] mt-1">
                Create an integration at <strong>notion.so/my-integrations</strong>, give it access to your databases, then paste the token below. It's stored only on this device.
              </p>
            </div>

            <div className="relative">
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                type={showToken ? 'text' : 'password'}
                placeholder="secret_…"
                autoFocus
                autoCapitalize="none"
                autoComplete="off"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg3)]"
                onClick={() => setShowToken((v) => !v)}
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-[var(--destructive)] bg-[rgba(255,59,48,0.08)] rounded-xl px-3 py-2.5">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button
                onClick={() => { void handleConnect() }}
                disabled={!token.trim() || testing}
                className="flex-1"
              >
                {testing ? 'Connecting…' : 'Connect'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
