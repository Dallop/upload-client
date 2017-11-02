import { createNewArray, weekModelToTimeObj } from './logic'

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

export const getLocationData = id => state => {
  const location = state.entities.locations[id]
  if (!location) return {}
  return {
    ...location,
    pickUpHours: location.pickUpHours
      ? unwrapFromArrays(
        weekModelToTimeObj(toWeekArray(location.pickUpHours.models))
      )
      : createNewArray(7, { startTime: timeObj, endTime: timeObj })
  }
}
