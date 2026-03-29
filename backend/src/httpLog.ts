import type express from 'express'
import { logger, redactAuthHeader } from './logger'

function clientIp(req: express.Request): string {
  const xff = req.headers['x-forwarded-for']
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0]?.trim() ?? 'unknown'
  }
  if (Array.isArray(xff) && xff[0]) return xff[0]
  return req.socket.remoteAddress ?? 'unknown'
}

export function requestLogMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const started = Date.now()
  const method = req.method
  const path = req.originalUrl || req.url

  res.on('finish', () => {
    const ms = Date.now() - started
    const status = res.statusCode
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    const payload = {
      method,
      path,
      status,
      ms,
      ip: clientIp(req),
      ua: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'].slice(0, 160) : undefined,
      auth: redactAuthHeader(req.headers.authorization),
    }
    if (level === 'error') {
      logger.error('http_request', payload)
    } else if (level === 'warn') {
      logger.warn('http_request', payload)
    } else {
      logger.info('http_request', payload)
    }
  })

  next()
}
