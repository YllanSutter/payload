import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

import config from '@/payload.config'
import CategoryExplorer from '@/components/category/CategoryExplorer'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [{ docs: rawCategories }, { docs: rawSites }] = await Promise.all([
    payload.find({
      collection: 'categories',
      limit: 1000,
      depth: 1,
    }),

    payload.find({
      collection: 'sites',
      limit: 1000,
      depth: 1,
    }),
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

  const sites = rawSites.map((site) => ({
    id: String(site.id),
    title: site.Titre,
    url: site.siteUrl,
    imageUrl: typeof site.image === 'object' && site.image?.url ? site.image.url : null,
    categoryIds: Array.isArray(site.categories)
      ? site.categories.map((category) => getId(category)).filter((id): id is string => Boolean(id))
      : [],
  }))

  const categoriesWithCounts = categories.map((category) => {
    const childCount = categories.filter((child) => child.parentIds.includes(category.id)).length

    const siteCount = sites.filter((site) => site.categoryIds.includes(category.id)).length

    return {
      ...category,
      childCount,
      siteCount,
    }
  })

  return (
    <main>
      <CategoryExplorer categories={categoriesWithCounts} sites={sites} />
    </main>
  )
}
