export const getOrgData = orgId => ({ entities }) => {
  const org = entities.orgs[orgId] || {}
  return {
    ...org,
    locations: (org.locations || []).map(id => entities.locations[id] || {}),
    menus: (org.menus || []).map(id => entities.menus[id] || {})
  }
}
