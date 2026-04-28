export const ADMIN_IDS = [
  'Welfare Council',
  'Academic Council',
  'Cultural Council',
  'Sports Council',
  'PDC Council',
  'IRP Council',
  'General Complaints',
]

const ADMIN_EMAIL_DOMAIN = 'grievance-portal.local'

export function normalizeAdminId(input) {
  return String(input || '').trim()
}

export function isAllowedAdminId(adminId) {
  const normalized = normalizeAdminId(adminId)
  return ADMIN_IDS.includes(normalized)
}

export function adminIdToScope(adminId) {
  const normalized = normalizeAdminId(adminId)
  return normalized === 'General Complaints' ? 'all' : normalized
}

function slugifyAdminId(adminId) {
  return normalizeAdminId(adminId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function adminIdToEmail(adminId) {
  const slug = slugifyAdminId(adminId)
  return `${slug}@${ADMIN_EMAIL_DOMAIN}`
}

export function emailToAdminId(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  if (!normalizedEmail) {
    return ''
  }

  const match = ADMIN_IDS.find((id) => adminIdToEmail(id).toLowerCase() === normalizedEmail)
  return match ? normalizeAdminId(match) : ''
}
