# webpack-plugin-issuer

A Webpack plugin for finding which modules import a matched file or package.

It is useful when you want to answer questions like:

- Why is this package included in my bundle?
- Which file imports this CSS file?
- What is the issuer chain for a matched module?

## Install

```bash
npm install webpack-plugin-issuer --save-dev
```

## Usage

```js
const IssuerPlugin = require('webpack-plugin-issuer')

module.exports = {
  plugins: [
    new IssuerPlugin({
      reg: /lodash|some-file\.css/,
      output: 'issuer.html'
    })
  ]
}
```

After Webpack finishes compiling, the plugin writes a report to `issuer.html` by default.

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `reg` | `RegExp` | required | Match module identifiers from Webpack stats. |
| `output` | `string` | `issuer.html` | Report output path, relative to `process.cwd()`. |
| `format` | `'html' \| 'json' \| 'text'` | `'html'` | Report format. |

## HTML report

The default HTML report groups results by matched module and displays the issuer path as a readable chain.

```js
new IssuerPlugin({
  reg: /antd/,
  output: 'issuer.html'
})
```

## JSON report

```js
new IssuerPlugin({
  reg: /antd/,
  output: 'issuer.json',
  format: 'json'
})
```

Example output:

```json
[
  {
    "identifier": "./node_modules/antd/es/button/index.js",
    "issuers": [
      "./src/App.jsx",
      "./src/index.jsx"
    ]
  }
]
```

## Text report

```js
new IssuerPlugin({
  reg: /antd/,
  output: 'issuer.txt',
  format: 'text'
})
```
