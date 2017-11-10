import { combineReducers } from 'redux'
import {
  orgRef,
  addEntitiesToStore,
  docToEntity,
  docsToEntities
} from './utils'

const initialEntityState = {
  orgs: {},
  locations: {},
  menus: {},
  categories: {},
  optionSets: {},
  options: {},
  menuItems: {},
  pickUpSchedules: {}
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
  menuItems: createReducerFn('menuItems'),
  pickUpSchedules: createReducerFn('pickUpSchedules')
})

export const createNewOrg = orgObj => dispatch => orgRef.add(orgObj)

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
  ...require('App/views/ManageMenu/state').default,
  ...require('App/views/ManageLocation/actions').default
})
