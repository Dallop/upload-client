import React from 'react'
import cc from 'create-react-class'
import pt from 'prop-types'
import { connect } from 'react-redux'

import {
  Flex,
  Box,
  Title,
  Input,
  Text,
  Button,
  Select,
  CheckboxGroup,
  CheckboxOption,
  settings as s
} from 'boostly-ui'
import { getLocationEntity, updateLocationEntity } from './actions'
import { getLocationData } from './selectors'
import {
  indexToWeekDay,
  createNewDay,
  addAvailability,
  createTimestamp
} from './logic'
import { Tab, Tabs, TabList, TabPanels } from 'App/shared/TabComponents'

const TabPanel = ({ children }) => <div>{children}</div>
const Label = ({ label, children }) => (
  <Flex pr={2} pb={1} align='center'>
    <Text>{label || children}</Text>
  </Flex>
)
const InputField = ({ ...rest, label, inputRef, width = '100%' }) => (
  <Flex column py={1} w={width}>
    <Label label={label} />
    <Box>
      <Input {...rest} />
    </Box>
  </Flex>
)

const toMap = array =>
  array.reduce(
    (map, arrayValue, index) => ({ ...map, [index]: arrayValue }),
    {}
  )

const ManageLocation = cc({
  propTypes: { locationData: pt.object, locationId: pt.string },
  getInitialState () {
    return {
      name: '',
      address: { line1: '', zip: '', state: '', city: '' },
      availableMethods: [],
      availableTimings: [],
      pickUpHours: [],
      changesWereMade: false
    }
  },
  componentDidMount () {
    this.props.getLocationData()
  },
  componentWillReceiveProps (next) {
    this.setState(() => ({ ...next.locationData }))
  },
  changesWereMade () {
    this.setState({ changesWereMade: true })
  },
  onNameChange ({ target }) {
    this.setState(() => ({ name: target.value }))
    this.changesWereMade()
  },
  onAddressChange (key) {
    return ({ target }) => {
      this.setState(prev => ({
        address: { ...prev.address, [key]: target.value }
      }))
      this.changesWereMade()
    }
  },
  onMethodChange (value) {
    this.setState(() => ({ availableMethods: value }))
    this.changesWereMade()
  },
  onTimingChange (value) {
    this.setState(() => ({ availableTimings: value }))
    this.changesWereMade()
  },
  onPickUpHoursChange (newSchedule) {
    this.setState(() => ({ pickUpHours: newSchedule }))
    this.changesWereMade()
  },
  onSave () {
    const {
      name,
      address,
      availableMethods,
      availableTimings,
      pickUpHours
    } = this.state
    const blankDay = createNewDay()
    this.props.updateLocationData({
      name,
      address,
      availableMethods,
      availableTimings,
      pickUpHours: {
        models: toMap(
          pickUpHours.map(
            day =>
              addAvailability({
                day: blankDay,
                startStamp: createTimestamp(day.startTime),
                endStamp: createTimestamp(day.endTime)
              })
          )
        )
      }
    })
  },
  render () {
    const {
      name,
      address,
      availableTimings,
      availableMethods,
      pickUpHours,
      changesWereMade
    } = this.state
    return (
      <Box pb={4}>
        <Flex p={2} align='center' justify='space-between'>
          <Title fontSize={4}>
            Manage {this.props.locationData.name} Details
          </Title>
          <Box w='200px'>
            <Button onClick={this.onSave} disabled={!changesWereMade}>
              Save Changes
            </Button>
          </Box>
        </Flex>
        <Tabs>
          <TabList>
            <Tab><Title>Name & Address</Title></Tab>
            <Tab><Title>Timing & Method</Title></Tab>
            <Tab><Title>Availability</Title></Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <InputField
                autoFocus
                label='Location Name'
                value={name}
                onChange={this.onNameChange}
              />
              <InputField
                label='Address Line 1'
                value={address.line1}
                onChange={this.onAddressChange('line1')}
              />
              <InputField
                label='City'
                value={address.city}
                onChange={this.onAddressChange('city')}
              />
              <Flex>
                <InputField
                  width='55%'
                  label='State'
                  value={address.state}
                  onChange={this.onAddressChange('state')}
                />
                <Box w='5%' />
                <InputField
                  label='Zip'
                  width='40%'
                  value={address.zip}
                  onChange={this.onAddressChange('zip')}
                />
              </Flex>
            </TabPanel>
            <TabPanel>
              <Label label='Select Timings Available' />
              <CheckboxGroup
                selectedValue={availableTimings}
                onChange={this.onTimingChange}
              >
                <CheckboxOption value='NOW'>
                  <Text>Now</Text>
                </CheckboxOption>
                <Box mt={1} />
                <CheckboxOption value='LATER'>
                  <Text>Later</Text>
                </CheckboxOption>
              </CheckboxGroup>
              <Box mt={2} />
              <Label label='Select Methods Available' />
              <CheckboxGroup
                selectedValue={availableMethods}
                onChange={this.onMethodChange}
              >
                <CheckboxOption value='PICK_UP'>
                  <Text>Pick Up</Text>
                </CheckboxOption>
                <Box mt={1} />
                <CheckboxOption value='DELIVERY'>
                  <Text>Delivery</Text>
                </CheckboxOption>
              </CheckboxGroup>
            </TabPanel>
            <TabPanel>
              <Scheduling
                schedule={pickUpHours}
                onScheduleUpdate={this.onPickUpHoursChange}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    )
  }
})

export default connect(
  (state, props) => ({
    locationData: getLocationData({ id: props.match.params.locId })(state) || {}
  }),
  (dispatch, props) => ({
    getLocationData: () => dispatch(getLocationEntity(props.match.params)),
    updateLocationData: locData =>
      console.log(locData) ||
        dispatch(updateLocationEntity({ ...props.match.params, locData }))
  })
)(ManageLocation)

const meridiems = [ 'am', 'pm' ]
const hours = [ 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11 ]
const minutes = [ '00', 15, 30, 45 ]
const Scheduling = cc({
  propTypes: { schedule: pt.array, onScheduleUpdate: pt.func },
  onValueUpdate (dayIndex, isStartTime, propValueUpdated) {
    return ({ target }) => {
      const { schedule, onScheduleUpdate } = this.props
      const periodName = isStartTime ? 'startTime' : 'endTime'
      const day = schedule[dayIndex]
      const updatedDay = {
        ...day,
        [periodName]: { ...day[periodName], [propValueUpdated]: target.value }
      }

      onScheduleUpdate([
        ...schedule.slice(0, dayIndex),
        updatedDay,
        ...schedule.slice(dayIndex + 1, schedule.length)
      ])
    }
  },
  render () {
    return (
      <Box>
        {this.props.schedule.map((day, dayIndex) => (
          <Box
            mb={2}
            bg={
                dayIndex % 2 ? s.colors.lightBase : s.colors.lightBaseHighlight
              }
            p={1}
            >
            <Box>
              <Label>
                <Title fontSize={3}>{indexToWeekDay[dayIndex]}</Title>
              </Label>
            </Box>
            <Flex wrap justify='space-between'>
              {[ 'startTime', 'endTime' ].map((label, timeIndex) => (
                <Box
                  w={[ 1, 1 / 2 ]}
                  pr={[ 0, timeIndex % 2 ? 0 : 2 ]}
                  pl={[ 0, timeIndex % 2 ? 2 : 0 ]}
                  mt={[ timeIndex > 0 ? 2 : 0, 0 ]}
                    >
                  <Label>
                    {label === 'startTime' ? 'Start Time' : 'End Time'}
                  </Label>
                  <Flex mt={1}>
                    {
                          [
                            { values: hours, valueName: 'hour' },
                            { values: minutes, valueName: 'minute' },
                            { values: meridiems, valueName: 'meridiem' }
                          ].map((props, i) => (
                            <Box w='33%' ml={i > 0 ? 1 : 0}>
                              <Select
                                value={
                                  this.props.schedule[dayIndex][label][props.valueName]
                                }
                                onChange={
                                  this.onValueUpdate(
                                    dayIndex,
                                    label === 'startTime',
                                    props.valueName
                                  )
                                }
                              >
                                {
                                  props.values.map((o, key) => (
                                    <option key={key} value={o}>{o}</option>
                                  ))
                                }
                              </Select>
                            </Box>
                          ))
                        }
                  </Flex>
                </Box>
                  ))}
            </Flex>
          </Box>
          ))}
      </Box>
    )
  }
})
