import fs from 'node:fs'
import path from 'node:path'

interface Options {
  rootPath?: string
  outDir?: string
}

export function genVersionPlugin(options?: Options) {
  const { rootPath = process.cwd(), outDir = 'dist' } = options || {}

  return {
    name: 'gen-version-plugin',
    closeBundle() {
      const versionInfo = {
        hash: Date.now().toString()
      }

      const dirPath = path.resolve(rootPath, outDir)
      const filePath = path.join(dirPath, 'version.json')

      // 关键修复点 👇
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }

      fs.writeFileSync(filePath, JSON.stringify(versionInfo, null, 2), 'utf-8')
    }
  }
}
