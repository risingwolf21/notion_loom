import { useState } from 'react'
import { Eye, EyeOff, CheckCircle2, Copy, Check, ChevronRight, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
    <div className="flex-1 flex flex-col justify-center overflow-y-auto bg-background px-5 py-10">
      <div className="max-w-sm mx-auto w-full space-y-6">
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <CheckCircle2 size={30} className="text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Notion Loom</h1>
            <p className="text-sm text-muted-foreground mt-0.5">iOS Reminders, powered by Notion</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="gap-1.5 py-1 px-2.5">
                <Zap size={11} />
                Proxy pre-configured
              </Badge>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Shield size={13} className="text-muted-foreground" />
                Notion Integration Token
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Go to <strong className="text-foreground">notion.so/my-integrations</strong>, create
                an integration, give it access to your databases, and paste the token here.
                It's stored only on this device.
              </p>
              <div className="relative mt-2">
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void connect()}
                  type={showToken ? 'text' : 'password'}
                  placeholder="secret_…"
                  autoFocus
                  autoCapitalize="none"
                  autoComplete="off"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowToken(v => !v)}
                  aria-label={showToken ? 'Hide token' : 'Show token'}
                >
                  {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}

            <Button
              className="w-full"
              onClick={() => void connect()}
              disabled={!token.trim() || testing}
            >
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

  const stepTitles = ['Deploy proxy', 'Worker URL', 'Notion token']

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-background">
      <div className="max-w-lg mx-auto w-full px-5 py-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <CheckCircle2 size={30} className="text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Notion Loom</h1>
            <p className="text-sm text-muted-foreground mt-0.5">iOS Reminders, powered by Notion</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-primary'
                  : s < step
                    ? 'w-4 bg-primary opacity-40'
                    : 'w-4 bg-border'
              }`}
            />
          ))}
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                {step}
              </span>
              <h2 className="text-base font-semibold text-foreground">{stepTitles[step - 1]}</h2>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Notion's API blocks browser requests. Deploy a free Cloudflare Worker as a proxy — it takes about 3 minutes.
                </p>
                <ol className="space-y-2.5 text-sm text-muted-foreground">
                  {[
                    <>Go to <strong className="text-foreground">workers.cloudflare.com</strong> and sign in (free account).</>,
                    <>Click <strong className="text-foreground">Create Worker</strong> → <strong className="text-foreground">Deploy</strong>.</>,
                    <>Click <strong className="text-foreground">Edit code</strong>, replace everything with the code below, then <strong className="text-foreground">Save &amp; Deploy</strong>.</>,
                    <>Copy the Worker URL shown on the dashboard.</>,
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="size-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <pre className="text-[11px] bg-muted p-4 overflow-x-auto text-muted-foreground leading-relaxed whitespace-pre font-mono">
                    {WORKER_CODE}
                  </pre>
                  <button
                    onClick={copyCode}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-card shadow-sm text-muted-foreground hover:text-foreground transition-colors border border-border"
                    aria-label="Copy code"
                  >
                    {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                  </button>
                </div>
                <Button className="w-full" onClick={() => setStep(2)}>
                  Worker deployed <ChevronRight size={15} />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Paste the URL Cloudflare gave your Worker (e.g.{' '}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">my-worker.workers.dev</code>).
                </p>
                <Input
                  value={workerUrl}
                  onChange={(e) => setWorkerUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && workerUrl.trim() && setStep(3)}
                  placeholder="https://my-worker.workers.dev"
                  type="url"
                  autoFocus
                  autoCapitalize="none"
                  autoComplete="off"
                />
                <div className="flex gap-2 pt-1">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button onClick={() => setStep(3)} disabled={!workerUrl.trim()} className="flex-1">
                    Continue <ChevronRight size={15} />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Go to <strong className="text-foreground">notion.so/my-integrations</strong>, create
                  an integration, give it access to your databases, and paste the token below.
                  It's stored only on this device.
                </p>
                <div className="relative">
                  <Input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void handleConnect()}
                    type={showToken ? 'text' : 'password'}
                    placeholder="secret_…"
                    autoFocus
                    autoCapitalize="none"
                    autoComplete="off"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowToken(v => !v)}
                    aria-label={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {error && <Alert variant="destructive">{error}</Alert>}
                <div className="flex gap-2 pt-1">
                  <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">Back</Button>
                  <Button
                    onClick={() => void handleConnect()}
                    disabled={!token.trim() || testing}
                    className="flex-1"
                  >
                    {testing ? 'Connecting…' : 'Connect'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground px-4 pb-4">
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
