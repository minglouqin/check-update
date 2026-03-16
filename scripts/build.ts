import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build, type BuildOptions, type Format } from 'esbuild'
import vue from 'unplugin-vue/esbuild'
const __dirname = dirname(fileURLToPath(import.meta.url))

const buildBundle = () => {
  const getBuildLibOptions = (format: Format) => {
    const options: BuildOptions = {
      entryPoints: {
        'index': resolve(__dirname, '..', 'lib/index.ts')
      },
      outdir: resolve(__dirname, '..', 'dist/lib'),
      target: 'es2018',
      platform: 'neutral',
      plugins: [
        vue({ isProduction: true, sourceMap: false, template: { compilerOptions: { hoistStatic: false } }})
      ],
      bundle: true,
      format,
      minifySyntax: true,
      external: ['vue']
    }

    return options
  }

  const getBuildPluginsOptions = (format: Format) => {
    const options: BuildOptions = {
      entryPoints: {
        'index': resolve(__dirname, '..', 'plugins/index.ts')
      },
      outdir: resolve(__dirname, '..', 'dist/plugins'),
      target: ['node16'],
      external: ['fs', 'path'],
      platform: 'node',
      bundle: true,
      format,
      minifySyntax: true,
    }

    return options
  }

  const doBuild = async (minify: boolean) => {
    await Promise.all([
      build({
        ...getBuildLibOptions('esm'),
        entryNames: `[name]${minify ? '.min' : ''}`,
        minify
      }),
      build({
        ...getBuildLibOptions('cjs'),
        entryNames: `[name]${minify ? '.min' : ''}`,
        outExtension: { '.js': '.cjs' },
        minify
      }),
      build({
        ...getBuildPluginsOptions('esm'),
        entryNames: `[name]${minify ? '.min' : ''}`,
        minify
      }),
      build({
        ...getBuildPluginsOptions('cjs'),
        entryNames: `[name]${minify ? '.min' : ''}`,
        outExtension: { '.js': '.cjs' },
        minify
      }),
    ])
  }

  return doBuild(true)
}



buildBundle()