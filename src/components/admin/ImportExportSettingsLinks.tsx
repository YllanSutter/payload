import Link from 'next/link'

export default function ImportExportSettingsLinks() {
  return (
    <div className="flex flex-wrap gap-3 doc-tabs__tabs">
      <Link
        href="/admin/collections/imports"
        className="btn doc-tab doc-tab--active btn--icon-style-without-border btn--size-medium btn--withoutPopup btn--no-margin btn--style-tab btn--withoutPopup"
      >
        Ouvrir les imports
      </Link>
      <Link
        href="/admin/collections/exports"
        className="btn doc-tab doc-tab--active btn--icon-style-without-border btn--size-medium btn--withoutPopup btn--no-margin btn--style-tab btn--withoutPopup"
      >
        Ouvrir les exports
      </Link>
    </div>
  )
}