'use client'

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-cookie-settings'))}
      className="text-tl-gold hover:underline cursor-pointer bg-transparent border-0 p-0 font-inherit text-sm"
    >
      Cookie Settings
    </button>
  )
}
