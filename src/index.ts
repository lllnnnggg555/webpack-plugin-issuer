import webpack from 'webpack'

const fs = require('fs')
const path = require('path')

interface IssuerPluginOptions {
  reg: RegExp;
  output: string;
}

class IssuerPlugin {
  private options: IssuerPluginOptions

  public constructor(options: IssuerPluginOptions) {
    this.options = options
  }

  public apply(compiler: webpack.Compiler): void {
    compiler.hooks.done.tapAsync('IssuerPlugin', (stats): void => {
      const statsData = stats.toJson().modules
      const file = fs.createWriteStream(path.join(process.cwd(), this.options.output || 'issuer.txt'))
      statsData.forEach((data): void => {
        if (this.options.reg.test(data.identifier)) {
          file.write(`${data.identifier}\n${data.issuerPath.map((issuer): string => { return issuer.identifier }).join('\n')}\n\n`)
        }
      })
    })
  }
}

module.exports = IssuerPlugin
