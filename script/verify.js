const fs = require('fs')
const path = require('path')
const os = require('os')
const assert = require('assert')

const IssuerPlugin = require('../lib')

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'issuer-plugin-'))
const cwd = process.cwd()

const modules = [
  {
    identifier: './node_modules/antd/es/button/index.js',
    issuerPath: [
      { identifier: './src/App.jsx' },
      { identifier: './src/index.jsx' }
    ]
  },
  {
    identifier: './src/unused.js',
    issuerPath: []
  }
]

const createCompiler = () => {
  return {
    hooks: {
      done: {
        tap: (name, callback) => {
          callback({
            toJson: () => ({ modules })
          })
        }
      }
    }
  }
}

const runPlugin = (options) => {
  const plugin = new IssuerPlugin(options)
  plugin.apply(createCompiler())
}

try {
  process.chdir(tmpDir)

  runPlugin({ reg: /antd/, output: 'issuer.html' })
  const html = fs.readFileSync(path.join(tmpDir, 'issuer.html'), 'utf8')
  assert(html.includes('Webpack Issuer Report'))
  assert(html.includes('./node_modules/antd/es/button/index.js'))
  assert(html.includes('./src/App.jsx'))
  assert(!html.includes('./src/unused.js'))

  runPlugin({ reg: /antd/, output: 'issuer.json', format: 'json' })
  const json = JSON.parse(fs.readFileSync(path.join(tmpDir, 'issuer.json'), 'utf8'))
  assert.strictEqual(json.length, 1)
  assert.strictEqual(json[0].identifier, './node_modules/antd/es/button/index.js')
  assert.deepStrictEqual(json[0].issuers, ['./src/App.jsx', './src/index.jsx'])

  runPlugin({ reg: /antd/, output: 'issuer.txt', format: 'text' })
  const text = fs.readFileSync(path.join(tmpDir, 'issuer.txt'), 'utf8')
  assert(text.includes('./node_modules/antd/es/button/index.js'))
  assert(text.includes('./src/App.jsx'))
  assert(!text.includes('./src/unused.js'))

  console.log('IssuerPlugin verification passed.')
} finally {
  process.chdir(cwd)
  fs.rmSync(tmpDir, { recursive: true, force: true })
}
