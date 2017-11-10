import { addEntitiesToStore, docsToEntities, orgRef } from 'App/state/utils'

export const createNewLocation = orgId =>
  locationObj => (dispatch, getState) => {
    orgRef.doc(orgId).collection('locations').add(locationObj).then(doc => {
      orgRef
        .doc(orgId)
        .update({
          locations: [
            ...(getState().entities.orgs[orgId].locations || []),
            doc.id
          ]
        })
    })
  }

export const getLocationEntities = orgId =>
  dispatch =>
    orgRef
      .doc(orgId)
      .collection('locations')
      .onSnapshot(
        ({ docs }) =>
          dispatch(addEntitiesToStore('locations', docsToEntities(docs)))
      )

export const createNewMenu = orgId => menuObj => (dispatch, getState) => {
  orgRef.doc(orgId).collection('menus').add(menuObj).then(doc => {
    orgRef
      .doc(orgId)
      .update({
        menus: [ ...(getState().entities.orgs[orgId].menus || []), doc.id ]
      })
  })
}

export const getMenuEntities = orgId =>
  dispatch =>
    orgRef
      .doc(orgId)
      .collection('menus')
      .onSnapshot(
        ({ docs }) =>
          dispatch(addEntitiesToStore('menus', docsToEntities(docs)))
      )
