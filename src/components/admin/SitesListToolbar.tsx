'use client'

import BulkCreateSites from './BulkCreateSites'
import GenerateScreenshotsBulk from './GenerateScreenshotsBulk'
import EditCategoryFromSites from './EditCategoryFromSites'

export default function SitesListToolbar() {
  return (
    <div className="sites-list-toolbar gutter gutter--left gutter--right collection-list__wrap">
      <div className="sites-list-toolbar__actions">
        <BulkCreateSites />

        <div className="flex mt-[20px] gap-4">
          <GenerateScreenshotsBulk />

          <EditCategoryFromSites />
        </div>
      </div>
    </div>
  )
}
