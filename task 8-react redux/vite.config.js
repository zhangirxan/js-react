import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? listFiles(path) : [path]
  })
}

// After the build: put the list of app files into sw.js and give it a version.
// The version is a hash of those files, so every new build = new version = new cache.
function serviceWorkerPlugin() {
  return {
    name: 'automarket-service-worker',
    apply: 'build',
    closeBundle() {
      const dist = 'dist'
      const files = listFiles(dist)
        .map((file) => relative(dist, file).replaceAll('\\', '/'))
        // the API is cached at runtime, not ahead of time
        .filter((file) => !file.startsWith('api/') && file !== 'sw.js')

      const hash = createHash('md5')
      files.forEach((file) => hash.update(readFileSync(join(dist, file))))
      const version = hash.digest('hex').slice(0, 8)

      const precache = files.map((file) => `./${file}`)
      const code = readFileSync('sw/sw.js', 'utf8')
        .replace('__VERSION__', version)
        .replace('__PRECACHE__', JSON.stringify(precache, null, 2))

      writeFileSync(join(dist, 'sw.js'), code)
      console.log(`service worker: version ${version}, ${precache.length} files precached`)
    },
  }
}

export default defineConfig({
  plugins: [react(), serviceWorkerPlugin()],
  base: './',
})
