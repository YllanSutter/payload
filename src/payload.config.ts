// import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'

import { Users } from './collections/Users'
import { Sites } from './collections/Sites'
import { ScreenshotSettings } from './collections/ScreenshotsSettings'
import { Media } from './collections/Media'
import { Category } from './collections/Category'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URL || '',
  // }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    migrationDir: './src/migrations',
  }),
  sharp,
  plugins: [
    nestedDocsPlugin({
      collections: [],
    }),
  ],
})
