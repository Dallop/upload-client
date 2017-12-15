import React from 'react'
import cc from 'create-react-class'
import pt from 'prop-types'
import { connect } from 'react-redux'
import Save from 'App/shared/Save'

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
import {
  getLocationEntity,
  updateLocationEntity,
  getPickUpScheduleEntities,
  createPickUpSchedule,
  updatePickUpSchedule,
  getMenuEntities
} from './actions'
import { getLocationData, getPickUpSchedules, getMenus } from './selectors'
import {
  indexToWeekDay,
  createNewDay,
  addAvailability,
  createTimestamp,
  createNewArray
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
      pickUpSchedule: null,
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
  onSave () {
    const {
      name,
      address,
      availableMethods,
      availableTimings,
      menuId
    } = this.state
    this.props.updateLocationData({
      name,
      address,
      availableMethods,
      availableTimings,
      menuId
    })
  },
  updateLocationPickUpSchedule (scheduleId) {
    this.props.updateLocationData({ pickUpSchedule: scheduleId })
  },
  onCreateNewScheduleRequest () {
    this.props.updateLocationData({ pickUpSchedule: null })
  },
  onMenuSelect ({ target }) {
    this.setState(() => ({ menuId: target.value }))
    this.changesWereMade()
  },
  render () {
    const {
      name,
      address,
      availableTimings,
      availableMethods,
      pickUpSchedule,
      changesWereMade,
      menuId,
      stripeCustomAccountId
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
            <Tab><Title>Pick Up Schedule</Title></Tab>
            <Tab><Title>Menu</Title></Tab>
            <Tab><Title>Stripe</Title></Tab>
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
                <CheckboxOption value='AjPpwlD4mW5haxJEJtIw'>
                  <Text>Now</Text>
                </CheckboxOption>
              </CheckboxGroup>
              <Box mt={2} />
              <Label label='Select Methods Available' />
              <CheckboxGroup
                selectedValue={availableMethods}
                onChange={this.onMethodChange}
              >
                <CheckboxOption value='4prfEmaexQMWiYcodPFh'>
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
                creatingNew={!pickUpSchedule}
                onCreateNewRequest={this.onCreateNewScheduleRequest}
                pickUpSchedule={pickUpSchedule}
                pickUpSchedules={this.props.pickUpSchedules}
                onNewScheduleSelect={this.updateLocationPickUpSchedule}
                createNewPickUpSchedule={this.props.createPickUpSchedule}
                updatePickUpSchedule={this.props.updatePickUpSchedule}
              />
            </TabPanel>
            <TabPanel>
              <Box w='70%'>
                {
                  this.props.menus.length
                    ? <Select value={menuId} onChange={this.onMenuSelect}>
                      <option>Pick a Menu</option>
                      {
                        this.props.menus.map((m, i) => (
                          <option value={m.id} key={i}>{m.name}</option>
                        ))
                      }
                    </Select>
                    : <Box>No Menu's Created Yet</Box>
                }
              </Box>
            </TabPanel>
            <TabPanel>
              <Text>Stripe Account Id: {stripeCustomAccountId}</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    )
  }
})

export default connect(
  (state, props) => ({
    locationData: getLocationData(props.match.params.locId)(state) || {},
    pickUpSchedules: getPickUpSchedules(props.match.params.orgId)(state) || [],
    menus: getMenus(props.match.params.orgId)(state)
  }),
  (dispatch, props) => {
    const docIds = props.match.params
    return {
      getLocationData: () => {
        dispatch(getMenuEntities(docIds))
        dispatch(getLocationEntity(docIds))
        dispatch(getPickUpScheduleEntities(docIds))
      },
      updateLocationData: locData =>
        dispatch(updateLocationEntity({ ...docIds, locData })),
      createPickUpSchedule: newSchedule =>
        dispatch(createPickUpSchedule(docIds)(newSchedule)),
      updatePickUpSchedule: newSchedule =>
        dispatch(updatePickUpSchedule(docIds)(newSchedule))
    }
  }
)(ManageLocation)

const meridiems = [ 'am', 'pm' ]
const hours = [ 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
const minutes = [ '00', 15, 30, 45 ]
const timeObj = { hour: 12, minute: 0, meridiem: 'AM' }
const defaultPickUpSchedule = {
  models: createNewArray(7, { startTime: timeObj, endTime: timeObj })
}
const Scheduling = cc({
  propTypes: { schedule: pt.array },
  getInitialState () {
    return {
      pickUpSchedule: this.props.pickUpSchedule || defaultPickUpSchedule,
      changesWereMade: false,
      editingExisting: false
    }
  },
  componentWillReceiveProps (next) {
    this.setState(prev => ({
      pickUpSchedule: next.pickUpSchedule || defaultPickUpSchedule
    }))
  },
  onValueUpdate (dayIndex, isStartTime, propValueUpdated) {
    return ({ target }) => {
      const { pickUpSchedule } = this.state
      const schedule = pickUpSchedule.models
      const periodName = isStartTime ? 'startTime' : 'endTime'
      const day = schedule[dayIndex]
      const updatedDay = {
        ...day,
        [periodName]: { ...day[periodName], [propValueUpdated]: target.value }
      }

      this.setState({
        pickUpSchedule: {
          ...pickUpSchedule,
          models: [
            ...schedule.slice(0, dayIndex),
            updatedDay,
            ...schedule.slice(dayIndex + 1, schedule.length)
          ]
        },
        changesWereMade: true,
        editingExisting: !this.props.creatingNew
      })
    }
  },
  onScheduleSelect ({ target }) {
    if (target.value === 'new') {
      this.props.onCreateNewRequest()
    } else {
      this.props.onNewScheduleSelect(target.value)
    }
  },
  onNameUpdate ({ target }) {
    this.setState(prev => ({
      pickUpSchedule: { ...prev.pickUpSchedule, name: target.value },
      changesWereMade: true
    }))
  },
  savePickUpHours () {
    if (!this.state.pickUpSchedule.name) {
      return window.alert('Schedule Needs a Name')
    }
    const action = this.props.creatingNew
      ? this.props.createNewPickUpSchedule
      : this.props.updatePickUpSchedule

    const blankDay = createNewDay()
    action({
      ...this.state.pickUpSchedule,
      models: toMap(
        this.state.pickUpSchedule.models.map(
          day =>
            addAvailability({
              day: blankDay,
              startStamp: createTimestamp(day.startTime),
              endStamp: createTimestamp(day.endTime)
            })
        )
      )
    })
    this.setState(prev => ({ changesWereMade: false }))
  },
  render () {
    const { pickUpSchedules } = this.props
    return (
      <Box>
        <Flex justify='space-between' px={2} py={2}>
          <Box w='70%'>
            {
              pickUpSchedules.length
                ? <Select
                  value={this.state.pickUpSchedule.id}
                  onChange={this.onScheduleSelect}
                >
                  <option value='new'>Create New Schedule</option>
                  {
                    pickUpSchedules.map((c, i) => (
                      <option value={c.id} key={i}>{c.name}</option>
                    ))
                  }
                </Select>
                : <Box height='40px' />
            }
          </Box>
          {
            (this.props.creatingNew || this.state.editingExisting) &&
              this.state.changesWereMade
              ? <Save size='30px' onClick={this.savePickUpHours} />
              : <Box height='30px' />
          }
        </Flex>
        <Box>
          <InputField
            label='Schedule Name'
            onChange={this.onNameUpdate}
            value={
              this.state.pickUpSchedule.id || this.state.pickUpSchedule.name
                ? this.state.pickUpSchedule.name
                : ''
            }
          />
        </Box>
        {this.state.pickUpSchedule.models.map((day, dayIndex) => (
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
                                  this.state.pickUpSchedule.models[dayIndex][label][props.valueName]
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
