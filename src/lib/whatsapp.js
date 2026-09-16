// Fallback number used only if site_settings hasn't been filled in yet via the admin dashboard.
// This is a PLACEHOLDER — replace via Admin > Settings once the real Duchess WhatsApp number is confirmed.
export const FALLBACK_WHATSAPP_NUMBER = '2340000000000'

// Build a wa.me link. `number` should be digits only, country code first, no + or spaces.
export function buildWhatsAppLink(number, message) {
  const clean = (number || FALLBACK_WHATSAPP_NUMBER).replace(/[^\d]/g, '')
  const text = encodeURIComponent(message)
  return `https://wa.me/${clean}?text=${text}`
}

export function buildOrderMessage({ items, branchName }) {
  const lines = ["Hello Duchess, I'd like to order:", '']
  items.forEach((item) => {
    lines.push(`${item.qty} × ${item.name}`)
  })
  lines.push('')
  lines.push(`Branch: ${branchName || '[Not selected]'}`)
  return lines.join('\n')
}

export function buildCustomOrderMessage(form) {
  return [
    'Hello Duchess, I would like to request a custom order:',
    '',
    `Name: ${form.name}`,
    `WhatsApp/Phone: ${form.phone}`,
    `Type of order: ${form.type}`,
    `Preferred date: ${form.date}`,
    `Location: ${form.location}`,
    `Details: ${form.details}`,
  ].join('\n')
}
