import { weekModelToTimeObj } from './logic'

const timeObj = { hour: 12, minute: 0, meridiem: 'AM' }
const toWeekArray = weekMap => [
  weekMap[0],
  weekMap[1],
  weekMap[2],
  weekMap[3],
  weekMap[4],
  weekMap[5],
  weekMap[6]
]

// when the UI supports multiple time-periods we shouldn't need this
const unwrapFromArrays = weekModel => weekModel.map(day => {
  if (day[0]) {
    return day[0]
  } else {
    return { startTime: timeObj, endTime: timeObj }
  }
})

export const getLocationData = id => ({ entities }) => {
  const location = entities.locations[id]
  if (!location) return {}
  const pickUpScheduleObj = entities.pickUpSchedules[location.pickUpSchedule]
  return {
    ...location,
    pickUpSchedule: pickUpScheduleObj
      ? {
        ...pickUpScheduleObj,
        models: unwrapFromArrays(
          weekModelToTimeObj(toWeekArray(pickUpScheduleObj.models))
        )
      }
      : null
  }
}

export const getPickUpSchedules = orgId =>
  ({ entities, pickUpSchedules }) =>
    (pickUpSchedules[orgId] || []).map(id => entities.pickUpSchedules[id])
