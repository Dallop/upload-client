export const getMenuData = id => state => {
  const menu = state.entities.menus[id]
  if (!menu) return {}
  return { ...menu }
}
