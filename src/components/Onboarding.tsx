import { useState } from 'react'
import { Eye, EyeOff, Copy, Check, ChevronRight, Shield, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { validateConnection } from '@/lib/notion'
import { FIXED_WORKER_URL } from '@/lib/config'
import type { Settings } from '@/hooks/useSettings'

const WORKER_CODE = `export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Notion-Version',
        },
      });
    }
    const url = new URL(request.url);
    const notionUrl = \`https://api.notion.com\${url.pathname}\${url.search}\`;
    const headers = new Headers(request.headers);
    headers.set('Notion-Version', '2022-06-28');
    const resp = await fetch(notionUrl, {
      method: request.method,
      headers,
      body: ['GET','HEAD'].includes(request.method) ? null : request.body,
    });
    const out = new Headers(resp.headers);
    out.set('Access-Control-Allow-Origin', '*');
    return new Response(resp.body, { status: resp.status, headers: out });
  },
};`

interface Props {
  onComplete: (settings: Settings) => void
}

function SimpleOnboarding({ onComplete }: Props) {
  const [token, setToken]         = useState('')
  const [showToken, setShowToken] = useState(false)
  const [testing, setTesting]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function connect() {
    if (!token.trim()) return
    setTesting(true)
    setError(null)
    try {
      await validateConnection(FIXED_WORKER_URL!, token.trim())
      onComplete({ token: token.trim(), workerUrl: FIXED_WORKER_URL! })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed. Check your token and try again.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Notion Loom</h1>
          <p className="text-sm text-muted-foreground">Your Notion databases as task lists</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <Alert variant="info" className="py-2">
              Proxy is pre-configured — just add your token.
            </Alert>

            <div className="space-y-1.5">
              <Label htmlFor="token" className="flex items-center gap-1.5">
                <Shield size={12} className="text-muted-foreground" />
                Integration Token
              </Label>
              <p className="text-xs text-muted-foreground">
                Create an integration at <strong className="text-foreground font-medium">notion.so/my-integrations</strong> and paste the token here. Stored only on this device.
              </p>
              <div className="relative">
                <Input
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void connect()}
                  type={showToken ? 'text' : 'password'}
                  placeholder="secret_…"
                  autoFocus
                  autoCapitalize="none"
                  autoComplete="off"
                  className="pr-9"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowToken(v => !v)}
                  aria-label={showToken ? 'Hide token' : 'Show token'}
                >
                  {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}

            <Button className="w-full" onClick={() => void connect()} disabled={!token.trim() || testing}>
              {testing ? 'Connecting…' : 'Connect to Notion'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FullOnboarding({ onComplete }: Props) {
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
      setError(err instanceof Error ? err.message : 'Connection failed. Check both values and try again.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-sm space-y-6">
        {/* Title */}
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Notion Loom</h1>
          <p className="text-sm text-muted-foreground">Your Notion databases as task lists</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1.5">
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                s === step ? 'w-6 bg-foreground' : s < step ? 'w-3 bg-foreground/30' : 'w-3 bg-border'
              }`}
            />
          ))}
        </div>

        <Card>
          <CardHeader className="pb-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Step {step} of 3
            </p>
          </CardHeader>

          <CardContent className="pt-3 space-y-4">
            {step === 1 && (
              <>
                <div>
                  <p className="text-sm font-medium text-foreground">Deploy a Cloudflare Worker</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Notion's API blocks browsers. A free Cloudflare Worker acts as a proxy — takes about 3 minutes.
                  </p>
                </div>

                <ol className="space-y-2 text-sm text-muted-foreground">
                  {[
                    <>Sign in at <strong className="text-foreground font-medium">workers.cloudflare.com</strong> (free account).</>,
                    <>Click <strong className="text-foreground font-medium">Create Worker</strong> → Deploy.</>,
                    <>Click <strong className="text-foreground font-medium">Edit code</strong>, replace everything with the code below, then Save &amp; Deploy.</>,
                    <>Copy the Worker URL from the dashboard.</>,
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="size-4 rounded-full bg-secondary text-foreground text-[10px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>

                <div className="relative rounded-md overflow-hidden border border-border">
                  <pre className="text-[11px] bg-muted/60 p-3 overflow-x-auto text-muted-foreground leading-relaxed whitespace-pre font-mono">
                    {WORKER_CODE}
                  </pre>
                  <button
                    onClick={copyCode}
                    className="absolute top-2 right-2 p-1.5 rounded bg-background border border-border text-muted-foreground hover:text-foreground transition-colors shadow-sm"
                    aria-label="Copy code"
                  >
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  </button>
                </div>

                <Button className="w-full" onClick={() => setStep(2)}>
                  Done — Worker is deployed <ChevronRight size={14} />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="worker-url" className="flex items-center gap-1.5 mb-1.5">
                    <Link2 size={12} className="text-muted-foreground" />
                    Worker URL
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    Paste the URL Cloudflare assigned your Worker (e.g.{' '}
                    <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">my-worker.workers.dev</code>).
                  </p>
                  <Input
                    id="worker-url"
                    value={workerUrl}
                    onChange={(e) => setWorkerUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && workerUrl.trim() && setStep(3)}
                    placeholder="https://my-worker.workers.dev"
                    type="url"
                    autoFocus
                    autoCapitalize="none"
                    autoComplete="off"
                  />
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button onClick={() => setStep(3)} disabled={!workerUrl.trim()} className="flex-1">
                    Continue <ChevronRight size={14} />
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label htmlFor="token" className="flex items-center gap-1.5 mb-1.5">
                    <Shield size={12} className="text-muted-foreground" />
                    Integration Token
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    Create an integration at <strong className="text-foreground font-medium">notion.so/my-integrations</strong>, give it access to your databases, and paste the token below. Stored only on this device.
                  </p>
                  <div className="relative">
                    <Input
                      id="token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && void handleConnect()}
                      type={showToken ? 'text' : 'password'}
                      placeholder="secret_…"
                      autoFocus
                      autoCapitalize="none"
                      autoComplete="off"
                      className="pr-9"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowToken(v => !v)}
                      aria-label={showToken ? 'Hide token' : 'Show token'}
                    >
                      {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {error && <Alert variant="destructive">{error}</Alert>}

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                  <Button onClick={() => void handleConnect()} disabled={!token.trim() || testing} className="flex-1">
                    {testing ? 'Connecting…' : 'Connect'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Your token is stored only on this device and sent exclusively to your own Worker.
        </p>
      </div>
    </div>
  )
}

export function Onboarding({ onComplete }: Props) {
  return FIXED_WORKER_URL
    ? <SimpleOnboarding onComplete={onComplete} />
    : <FullOnboarding onComplete={onComplete} />
}
