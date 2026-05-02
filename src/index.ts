import * as fs from 'fs'
import * as path from 'path'

import webpack = require('webpack')

interface IssuerPluginOptions {
  reg: RegExp;
  output?: string;
  format?: 'html' | 'json' | 'text';
}

interface IssuerItem {
  identifier: string;
  issuers: string[];
}

const DEFAULT_OUTPUT = 'issuer.html'
const DEFAULT_FORMAT = 'html'

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const renderText = (items: IssuerItem[]): string => {
  return items.map((item): string => {
    return [item.identifier].concat(item.issuers).join('\n')
  }).join('\n\n')
}

const renderJson = (items: IssuerItem[]): string => {
  return JSON.stringify(items, null, 2)
}

const renderHtml = (items: IssuerItem[]): string => {
  const cards = items.map((item): string => {
    const issuers = item.issuers.length
      ? item.issuers.map((issuer, index): string => {
        return `<li><span class="index">${index + 1}</span><code>${escapeHtml(issuer)}</code></li>`
      }).join('')
      : '<li class="empty">No issuer path found.</li>'

    return `
      <section class="card">
        <h2>Matched module</h2>
        <code class="module">${escapeHtml(item.identifier)}</code>
        <h3>Issuer path</h3>
        <ol>${issuers}</ol>
      </section>`
  }).join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Webpack Issuer Report</title>
  <style>
    body { margin: 0; padding: 32px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f8fa; color: #24292f; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    .summary { margin: 0 0 24px; color: #57606a; }
    .card { margin-bottom: 20px; padding: 20px; border: 1px solid #d0d7de; border-radius: 8px; background: #fff; }
    h2, h3 { margin: 0 0 12px; font-size: 16px; }
    h3 { margin-top: 20px; }
    code { padding: 2px 5px; border-radius: 4px; background: #f6f8fa; font-family: SFMono-Regular, Consolas, "Liberation Mono", monospace; font-size: 13px; word-break: break-all; }
    .module { display: block; padding: 12px; }
    ol { margin: 0; padding-left: 0; list-style: none; }
    li { display: flex; gap: 8px; align-items: flex-start; margin: 8px 0; }
    .index { flex: 0 0 auto; min-width: 22px; height: 22px; border-radius: 999px; background: #0969da; color: #fff; font-size: 12px; line-height: 22px; text-align: center; }
    .empty { color: #57606a; }
  </style>
</head>
<body>
  <h1>Webpack Issuer Report</h1>
  <p class="summary">Matched modules: ${items.length}</p>
  ${cards || '<p>No modules matched.</p>'}
</body>
</html>`
}

const renderReport = (items: IssuerItem[], format: IssuerPluginOptions['format']): string => {
  if (format === 'json') return renderJson(items)
  if (format === 'text') return renderText(items)
  return renderHtml(items)
}

class IssuerPlugin {
  private options: IssuerPluginOptions

  public constructor(options: IssuerPluginOptions) {
    this.options = Object.assign({
      output: DEFAULT_OUTPUT,
      format: DEFAULT_FORMAT
    }, options)
  }

  public apply(compiler: webpack.Compiler): void {
    compiler.hooks.done.tap('IssuerPlugin', (stats): void => {
      const statsData = stats.toJson().modules || []
      const items = statsData
        .filter((data): boolean => this.options.reg.test(data.identifier))
        .map((data): IssuerItem => {
          return {
            identifier: data.identifier,
            issuers: (data.issuerPath || []).map((issuer): string => issuer.identifier)
          }
        })

      const outputPath = path.join(process.cwd(), this.options.output || DEFAULT_OUTPUT)
      fs.writeFileSync(outputPath, renderReport(items, this.options.format), 'utf8')
    })
  }
}

exports.default = IssuerPlugin
module.exports = exports.default
