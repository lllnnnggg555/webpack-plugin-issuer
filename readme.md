# webpack-plugin-issuer

## Install

```bash
npm install webpack-plugin-issuer --save-dev
```

## How to use

```javascript
const Issuer = require('webpack-plugin-issuer')

module.exports = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [
    new Issuer({
      reg: /lodash/, // packages you wanna to find 
      output: './issuer.txt' // output file
    })
  ]
}
```