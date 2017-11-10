import {
  addEntitiesToStore,
  docToEntity,
  orgRef,
  makeEntityDuck
} from 'App/state/utils'

export const getLocationEntity = ({ orgId, locId }) =>
  dispatch =>
    orgRef
      .doc(orgId)
      .collection('locations')
      .doc(locId)
      .onSnapshot(
        doc => dispatch(addEntitiesToStore('locations', docToEntity(doc)))
      )

const pickUpSchedule = makeEntityDuck({ collectionName: 'pickUpSchedules' })

export const getPickUpScheduleEntities = pickUpSchedule.getter

export const updateLocationEntity = ({ orgId, locId, locData }) =>
  dispatch =>
    orgRef
      .doc(orgId)
      .collection('locations')
      .doc(locId)
      .update(locData)
      .then(() => console.log('yay!'))

export const createPickUpSchedule = ({ orgId, locId }) =>
  schedule =>
    dispatch =>
      orgRef
        .doc(orgId)
        .collection('pickUpSchedules')
        .add(schedule)
        .then(doc => {
          dispatch(
            updateLocationEntity({
              orgId,
              locId,
              locData: { pickUpSchedule: doc.id }
            })
          )
        })

export const updatePickUpSchedule = ({ orgId }) =>
  schedule =>
    dispatch =>
      console.log(schedule) ||
        orgRef
          .doc(orgId)
          .collection('pickUpSchedules')
          .doc(schedule.id)
          .update(schedule)

export default { pickUpSchedules: pickUpSchedule.reducer }
