import { addEntitiesToStore, docToEntity, orgRef } from 'App/state'

export const getLocationEntity = ({ orgId, locId }) =>
  dispatch =>
    orgRef
      .doc(orgId)
      .collection('locations')
      .doc(locId)
      .onSnapshot(
        doc => dispatch(addEntitiesToStore('locations', docToEntity(doc)))
      )

export const updateLocationEntity = ({ orgId, locId, locData }) =>
  dispatch =>
    console.log(locData) ||
      orgRef
        .doc(orgId)
        .collection('locations')
        .doc(locId)
        .set(locData)
        .then(() => console.log('yay!'))
