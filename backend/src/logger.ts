export type LogLevel = 'info' | 'warn' | 'error'

function out(level: LogLevel, msg: string, meta?: Record<string, unknown>) {
  const line = {
    ts: new Date().toISOString(),
    level,
    msg,
    service: 'wend-api',
    ...meta,
  }
  const text = JSON.stringify(line)
  if (level === 'error') {
    console.error(text)
  } else if (level === 'warn') {
    console.warn(text)
  } else {
    console.log(text)
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => out('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => out('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => out('error', msg, meta),
}

export function redactAuthHeader(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  if (raw.startsWith('Bearer ') && raw.length > 15) {
    return `Bearer …${raw.slice(-6)}`
  }
  return '[redacted]'
}
