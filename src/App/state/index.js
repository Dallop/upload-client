import db from 'config/api'
import { combineReducers } from 'redux'
export const orgRef = db.collection('orgs')

const initialEntityState = {
  orgs: {},
  locations: {},
  menus: {},
  categories: {},
  optionSets: {},
  options: {},
  menuItems: {}
}
const createReducerFn = name =>
  (state = initialEntityState[name], { payload }) =>
    payload && payload.entities && payload.entities[name]
      ? { ...state, ...payload.entities[name] }
      : state

const entities = combineReducers({
  orgs: createReducerFn('orgs'),
  locations: createReducerFn('locations'),
  menus: createReducerFn('menus'),
  categories: createReducerFn('categories'),
  optionSets: createReducerFn('optionSets'),
  options: createReducerFn('options'),
  menuItems: createReducerFn('menuItems')
})

export const createNewOrg = orgObj => dispatch => orgRef.add(orgObj)

export const addEntitiesToStore = (entityType, entities) => ({
  type: 'ADD_ENTITIES',
  payload: { entities: { [entityType]: entities } }
})

export const docToEntity = doc => ({ [doc.id]: { id: doc.id, ...doc.data() } })
export const docsToEntities = docs =>
  docs.reduce((entities, doc) => ({ ...entities, ...docToEntity(doc) }), {})

export const getOrgEntity = id =>
  dispatch =>
    orgRef
      .doc(id)
      .onSnapshot(
        doc => dispatch(addEntitiesToStore('orgs', docToEntity(doc)))
      )

export const getOrgEntities = () =>
  dispatch =>
    orgRef.onSnapshot(
      ({ docs }) => dispatch(addEntitiesToStore('orgs', docsToEntities(docs)))
    )

export default combineReducers({
  entities,
  ...require('App/views/ManageMenu/state').default
})
