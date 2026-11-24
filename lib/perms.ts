// Autorisations disponibles (modifiables par l'admin pour chaque compte)
export const PERMS = {
  'dashboard.view': 'Voir le dashboard',
  'map.view': 'Voir la carte',
  'sites.view': 'Voir les sites',
  'sites.edit': 'Gérer les sites / placer sur la carte',
  'devices.view': 'Voir les appareils',
  'devices.edit': 'Gérer les appareils',
  'metrics.view': 'Voir les paramètres',
  'metrics.edit': 'Gérer les paramètres',
  'studio.use': 'Studio graphes',
  'users.manage': 'Gérer les comptes',
} as const
export type Perm = keyof typeof PERMS
export const ROLES = ['admin', 'owner', 'tech', 'consultant'] as const
export type Role = (typeof ROLES)[number]
const V: Perm[] = ['dashboard.view', 'map.view', 'sites.view', 'metrics.view']
// Autorisations proposées par défaut à la création selon le rôle
export const ROLE_PERMS: Record<Role, Perm[]> = {
  admin: Object.keys(PERMS) as Perm[],
  owner: [...V, 'devices.view'],
  tech: [...V, 'devices.view', 'devices.edit', 'metrics.edit'],
  consultant: V,
}
