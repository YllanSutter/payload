import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { importExportPlugin } from '@payloadcms/plugin-import-export'

import { Users } from './collections/Users'
import { Sites } from './collections/Sites'
import { ScreenshotSettings } from './collections/ScreenshotsSettings'
import { Media } from './collections/Media'
import { Category } from './collections/Category'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseURL = process.env.DATABASE_URL
const usePostgres = /^postgres(?:ql)?:\/\//i.test(databaseURL ?? '')
const databaseTarget = usePostgres
  ? (() => {
      const url = new URL(databaseURL ?? '')
      return `${url.hostname}${url.pathname}`
    })()
  : databaseURL || 'file:./payload.db'

console.info(`[Base de données] ${usePostgres ? 'PostgreSQL' : 'SQLite'} — ${databaseTarget}`)

export default buildConfig({
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,

    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Sites, Category, Media],
  globals: [ScreenshotSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: usePostgres
    ? postgresAdapter({
        pool: { connectionString: databaseURL },
        migrationDir: './src/migrations',
      })
    : sqliteAdapter({
        client: { url: databaseURL || 'file:./payload.db' },
        migrationDir: './src/migrations',
      }),
  sharp,
  plugins: [
    nestedDocsPlugin({
      collections: [],
    }),
    importExportPlugin({
      collections: [{ slug: 'users' }, { slug: 'sites' }, { slug: 'media' }, { slug: 'categories' }],
      // see below for a list of available options
    }),
  ],
})
