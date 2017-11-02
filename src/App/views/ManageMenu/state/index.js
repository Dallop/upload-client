import { createReducer } from 'state/utils'
import {
  addEntitiesToStore,
  docsToEntities,
  docToEntity,
  orgRef
} from 'App/state'

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

// const pushItemToMenuCategory = ({ orgId, menuId, catId, itemId }) =>
//   (dispatch, getState) =>
//     orgRef
//       .doc(orgId)
//       .collection('menus')
//       .doc(menuId)
//       .collection('categories')
//       .doc(catId)
//       .update({
//         items: [ ...(getState().entities.categories.items || []), itemId ]
//       })
const makeMenuEntitiesGetter = ({ collectionName, action }) =>
  ({ orgId, menuId }) =>
    dispatch =>
      orgRef
        .doc(orgId)
        .collection('menus')
        .doc(menuId)
        .collection(collectionName)
        .onSnapshot(snapshot => {
          dispatch(
            addEntitiesToStore(collectionName, docsToEntities(snapshot.docs))
          )
          dispatch(action({ menuId, ids: snapshot.docs.map(doc => doc.id) }))
        })

const UPDATE_MENU_ITEMS = 'UPDATE_MENU_ITEMS'
const addMenuItemsToList = ({ menuId, ids }) => ({
  type: UPDATE_MENU_ITEMS,
  payload: { menuId, ids }
})
export const getMenuItemEntities = makeMenuEntitiesGetter({
  collectionName: 'menuItems',
  action: addMenuItemsToList
})
export const getMenuEntity = ({ orgId, menuId }) => dispatch => {
  orgRef
    .doc(orgId)
    .collection('menus')
    .doc(menuId)
    .onSnapshot(doc => dispatch(addEntitiesToStore('menus', docToEntity(doc))))
  dispatch(getMenuItemEntities({ orgId, menuId }))
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

const UPDATE_CATEGORIES = 'UPDATE_CATEGORIES'
const addCategoriesToList = ({ menuId, ids }) => ({
  type: UPDATE_CATEGORIES,
  payload: { menuId, ids }
})

export const getMenuCategoryEntities = makeMenuEntitiesGetter({
  collectionName: 'categories',
  action: addCategoriesToList
})

const UPDATE_OPTION_SETS = 'UPDATE_OPTION_SETS'
const addOptionSetToList = ({ menuId, ids }) => ({
  type: UPDATE_OPTION_SETS,
  payload: { menuId, ids }
})

export const createOptionSetEntity = ({ orgId, menuId }) =>
  setObj =>
    dispatch =>
      orgRef
        .doc(orgId)
        .collection('menus')
        .doc(menuId)
        .collection('optionSets')
        .add(setObj)

export const getOptionSetEntities = makeMenuEntitiesGetter({
  collectionName: 'optionSets',
  action: addOptionSetToList
})

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

const UPDATE_OPTIONS = 'UPDATE_OPTIONS'
const addOptionsToList = ({ menuId, ids }) => ({
  type: UPDATE_OPTIONS,
  payload: { menuId, ids }
})

export const createOptionEntity = ({ orgId, menuId }) =>
  optionObj =>
    dispatch =>
      orgRef
        .doc(orgId)
        .collection('menus')
        .doc(menuId)
        .collection('options')
        .add(optionObj)

export const getOptionEntities = makeMenuEntitiesGetter({
  collectionName: 'options',
  action: addOptionsToList
})

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

const makeEntityListReducer = type =>
  createReducer({}, {
    [type]: (state, { payload }) => ({
      ...state,
      [payload.menuId]: payload.ids
    })
  })

export default {
  menuCategories: makeEntityListReducer(UPDATE_CATEGORIES),
  optionSets: makeEntityListReducer(UPDATE_OPTION_SETS),
  options: makeEntityListReducer(UPDATE_OPTIONS),
  menuItems: makeEntityListReducer(UPDATE_MENU_ITEMS)
}
