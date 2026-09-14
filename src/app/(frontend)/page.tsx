import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

import config from '@/payload.config'
import CategoryExplorer from '@/components/category/CategoryExplorer'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [{ docs: rawCategories }, settings, siteCountResult] = await Promise.all([
    payload.find({
      collection: 'categories',
      limit: 1000,
      depth: 1,
    }),
    payload.findGlobal({ slug: 'settings', depth: 0 }),
    payload.find({ collection: 'sites', depth: 0, limit: 1 }),
  ])

  const getId = (value: unknown): string | null => {
    if (typeof value === 'string') {
      return value
    }

    if (typeof value === 'object' && value !== null && 'id' in value) {
      return String(value.id)
    }

    return null
  }

  const categories = rawCategories.map((category) => ({
    id: String(category.id),
    name: category.Nom,
    imageUrl: typeof category.image === 'object' && category.image?.url ? category.image.url : null,
    parentIds: Array.isArray(category.parents)
      ? category.parents.map((parent) => getId(parent)).filter((id): id is string => Boolean(id))
      : [],
  }))

  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const categorySites = await payload.find({
        collection: 'sites',
        depth: 0,
        limit: 1,
        where: {
          categories: {
            contains: category.id,
          },
        },
      })

    const childCount = categories.filter((child) => child.parentIds.includes(category.id)).length
      const siteCount = categorySites.totalDocs

      return { ...category, childCount, siteCount }
    }),
  )

  const sitesPerCategory = Number(settings.sitesPerCategory) || 6

  return (
    <main>
      <CategoryExplorer
        categories={categoriesWithCounts}
        sites={[]}
        sitesPerCategory={sitesPerCategory}
        totalSites={siteCountResult.totalDocs}
      />
    </main>
  )
}
