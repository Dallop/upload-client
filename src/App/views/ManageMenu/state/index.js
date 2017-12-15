import { createReducer } from 'state/utils'
import {
  addEntitiesToStore,
  makeEntityDux,
  docToEntity,
  orgRef
} from 'App/state/utils'

const getMenuData = id => state => {
  const menu = state.entities.menus[id]
  const items = (state.menuItems[id] || []).map(
    id => state.entities.menuItems[id]
  )
  if (!menu) return { items: [] }
  return { ...menu, items }
}

const makeEntityListSelector = (entityName, listName) =>
  menuId =>
    state =>
      (state[listName || entityName][menuId] || []).map(
        id => state.entities[entityName][id]
      )

export const selectors = {
  getMenuData,
  getMenuCategories: makeEntityListSelector('categories', 'menuCategories'),
  getOptionSets: makeEntityListSelector('optionSets'),
  getOptions: makeEntityListSelector('options')
}

export const createMenuItemEntity = ({ orgId, menuId }) =>
  itemObj =>
    dispatch =>
      orgRef
        .doc(orgId)
        .collection('menus')
        .doc(menuId)
        .collection('menuItems')
        .add(itemObj)

export const updateMenuItemEntity = ({ orgId, menuId }) =>
  itemObj =>
    dispatch =>
      orgRef
        .doc(orgId)
        .collection('menus')
        .doc(menuId)
        .collection('menuItems')
        .doc(itemObj.id)
        .update(itemObj)

const entityDux = makeEntityDux('menus')([
  { name: 'categories' },
  { name: 'optionSets' },
  { name: 'options' },
  { name: 'menuItems' }
])

export const getMenuItemEntities = entityDux.menuItems.getter
export const getMenuEntity = ({ orgId, menuId }) => dispatch => {
  orgRef
    .doc(orgId)
    .collection('menus')
    .doc(menuId)
    .onSnapshot(doc => dispatch(addEntitiesToStore('menus', docToEntity(doc))))
  dispatch(getMenuItemEntities({ orgId, id: menuId }))
}

export const updateMenuEntity = ({ orgId, menuId, menuData }) =>
  dispatch =>
    orgRef
      .doc(orgId)
      .collection('menus')
      .doc(menuId)
      .update(menuData)
      .then(() => console.log('yay menu updated!'))

export const createMenuCategory = ({ orgId, menuId }) =>
  catObj =>
    dispatch =>
      orgRef
        .doc(orgId)
        .collection('menus')
        .doc(menuId)
        .collection('categories')
        .add(catObj)

export const getMenuCategoryEntities = entityDux.categories.getter

export const createOptionSetEntity = ({ orgId, id }) =>
  setObj =>
    dispatch =>
      console.log(setObj, id) ||
        orgRef
          .doc(orgId)
          .collection('menus')
          .doc(id)
          .collection('optionSets')
          .add(setObj)

export const getOptionSetEntities = entityDux.optionSets.getter
export const updateOptionSetEntity = ({ orgId, menuId }) =>
  (id, setObj) =>
    dispatch =>
      orgRef
        .doc(orgId)
        .collection('menus')
        .doc(menuId)
        .collection('optionSets')
        .doc(id)
        .set(setObj)

export const createOptionEntity = ({ orgId, menuId }) =>
  optionObj =>
    dispatch =>
      orgRef
        .doc(orgId)
        .collection('menus')
        .doc(menuId)
        .collection('options')
        .add(optionObj)

export const getOptionEntities = entityDux.options.getter

export const updateOptionEntity = ({ orgId, menuId }) =>
  (id, opObj) =>
    dispatch =>
      orgRef
        .doc(orgId)
        .collection('menus')
        .doc(menuId)
        .collection('options')
        .doc(id)
        .set(opObj)

export default {
  menuCategories: entityDux.categories.reducer,
  optionSets: entityDux.optionSets.reducer,
  options: entityDux.options.reducer,
  menuItems: entityDux.menuItems.reducer
}
