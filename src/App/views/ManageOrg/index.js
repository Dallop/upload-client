import React from 'react'
import cc from 'create-react-class'
import pt from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { getOrgEntity } from 'App/state'
import {
  Flex,
  Box,
  Title,
  Modal,
  Input,
  Text,
  Button,
  CheckboxGroup,
  CheckboxOption
} from 'boostly-ui'
import {
  createNewLocation,
  getLocationEntities,
  createNewMenu,
  getMenuEntities
} from './actions'
import { getOrgData } from './selectors'
import ListItem from 'App/shared/ListItem'

const Label = ({ label }) => (
  <Flex pr={2} pb={1} align='center'>
    <Text>{label}</Text>
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

const CreateLocationForm = cc({
  getInitialState () {
    return {
      phaseIndex: 0,
      finalPhase: false,
      name: '',
      address: { line1: '', city: '', zip: '', state: '' },
      availableMethods: [],
      availableTimings: []
    }
  },
  phaseConfig: [
    { renderMethod: 'renderNameForm' },
    { renderMethod: 'renderAddressForm' },
    { renderMethod: 'renderLogisticsForm' },
    { renderMethod: 'renderConfirmation' }
  ],
  renderNameForm () {
    return (
      <InputField
        autoFocus
        label='Name'
        value={this.state.name}
        onChange={this.onNameChange}
      />
    )
  },
  renderConfirmation () {
    const { name, address, availableTimings, availableMethods } = this.state
    return (
      <Box>
        <Flex>
          <Title>Name: </Title><Text> {name}</Text>
        </Flex>
        <Box>
          <Title>Address: </Title>
          <Box>
            <Text>{address.line1}</Text>
          </Box>
          <Text>{address.city}, {address.state} {address.zip}</Text>
        </Box>
        <Box>
          <Title>Timings: </Title>{availableTimings.map((t, i) => (
            <Box key={i}>
              <Text>* {t}</Text>
            </Box>
            ))}
        </Box>
        <Box>
          <Title>Methods: </Title>{availableMethods.map((m, i) => (
            <Box key={i}>
              <Text>* {m}</Text>
            </Box>
            ))}
        </Box>
      </Box>
    )
  },
  renderLogisticsForm () {
    return (
      <Box py={1}>
        <Label label='Select Timings Available' />
        <CheckboxGroup
          selectedValue={this.state.availableTimings}
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
          selectedValue={this.state.availableMethods}
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
      </Box>
    )
  },
  renderAddressForm () {
    return (
      <Box>
        <InputField
          autoFocus
          label='Address Line 1'
          value={this.state.address.line1}
          onChange={this.onAddressChange('line1')}
        />
        <InputField
          label='City'
          value={this.state.address.city}
          onChange={this.onAddressChange('city')}
        />
        <Flex>
          <InputField
            width='55%'
            label='State'
            value={this.state.address.state}
            onChange={this.onAddressChange('state')}
          />
          <Box w='5%' />
          <InputField
            label='Zip'
            width='40%'
            value={this.state.address.zip}
            onChange={this.onAddressChange('zip')}
          />
        </Flex>
      </Box>
    )
  },
  addressFields: [
    { label: 'Address Line 1', key: 'line1' },
    { label: 'City (Utah not UT)', key: 'city' },
    { label: 'State', key: 'state' },
    { label: 'Zip', key: 'zip' }
  ],
  onNameChange ({ target }) {
    this.setState(() => ({ name: target.value }))
  },
  onAddressChange (key) {
    return ({ target }) =>
      this.setState(prev => ({
        address: { ...prev.address, [key]: target.value }
      }))
  },
  onMethodChange (value) {
    this.setState(() => ({ availableMethods: value }))
  },
  onTimingChange (value) {
    this.setState(() => ({ availableTimings: value }))
  },
  handleFormFlow (e) {
    e.preventDefault()
    const { phaseIndex } = this.state
    if (phaseIndex < this.phaseConfig.length - 1) {
      const nextPhaseIndex = phaseIndex + 1
      this.setState(prev => ({
        phaseIndex: nextPhaseIndex,
        finalPhase: nextPhaseIndex === this.phaseConfig.length - 1
      }))
    } else {
      this.props.onSubmit({
        name: this.state.name,
        address: this.state.address,
        availableMethods: this.state.availableMethods,
        availableTimings: this.state.availableTimings
      })
    }
  },
  phaseBack () {
    this.setState(prev => ({
      phaseIndex: prev.phaseIndex - 1,
      finalPhase: prev.phaseIndex + 1 === this.phaseConfig.length - 1
    }))
  },
  render () {
    return (
      <Box is='form' onSubmit={this.handleFormFlow}>
        <Box px={3} pb={2}>
          <Box>
            <Title fontSize={3}>New Location</Title>
          </Box>
          {this[this.phaseConfig[this.state.phaseIndex].renderMethod]()}
        </Box>
        <Flex justify='space-between'>
          <Box
            pr={1}
            pl={2}
            py={2}
            visibility={this.state.phaseIndex > 0 ? 'block' : 'hidden'}
            w='50%'
          >
            <Button type='button' onClick={this.phaseBack}>
              Back
            </Button>
          </Box>
          <Box pl={1} pr={2} py={2} w='50%'>
            <Button type='submit' theme='secondary'>
              {this.state.finalPhase ? 'Create' : 'Next'}
            </Button>
          </Box>
        </Flex>
      </Box>
    )
  }
})

const CreateMenuForm = cc({
  getInitialState () {
    return { name: '' }
  },
  onNameChange ({ target }) {
    this.setState(prev => ({ name: target.value }))
  },
  onSubmitRequest (e) {
    e.preventDefault()
    this.props.onSubmit({ name: this.state.name })
  },
  render () {
    return (
      <Box is='form' onSubmit={this.onSubmitRequest}>
        <Box px={3} pb={2}>
          <Title fontSize={3}>New Menu</Title>
          <Box pb={1} />
          <InputField
            autoFocus
            label='Menu Name'
            value={this.state.name}
            onChange={this.onNameChange}
          />
        </Box>
        <Box p={2}>
          <Button type='submit' theme='secondary'>Create</Button>
        </Box>
      </Box>
    )
  }
})

const ManageOrg = cc({
  propTypes: { orgData: pt.object },
  getInitialState () {
    return { showCreateLocationModal: false, showCreateMenuModal: false }
  },
  componentDidMount () {
    const {
      orgId,
      getOrgEntity,
      getLocationEntities,
      getMenuEntities
    } = this.props
    getOrgEntity(orgId)
    getLocationEntities(orgId)
    getMenuEntities(orgId)
  },
  toggleCreationModal (modalName) {
    return () => {
      switch (modalName) {
        case 'createLocation':
          this.setState(prev => ({
            showCreateLocationModal: !prev.showCreateLocationModal
          }))
          break
        case 'createMenu':
          this.setState(prev => ({
            showCreateMenuModal: !prev.showCreateMenuModal
          }))
          break
      }
    }
  },
  onCreateLocationSubmit (locationObj) {
    this.props.createLocation(locationObj)
    this.toggleCreationModal('createLocation')()
  },
  onCreateMenuSubmit (menuObj) {
    this.props.createMenu(menuObj)
    this.toggleCreationModal('createMenu')()
  },
  getModalProps () {
    const { showCreateLocationModal, showCreateMenuModal } = this.state
    const openModalName = showCreateLocationModal
      ? 'createLocation'
      : showCreateMenuModal ? 'createMenu' : ''

    return {
      modalIsOpen: !!openModalName,
      onRequestClose: this.toggleCreationModal(openModalName),
      onFormSubmit: openModalName === 'createLocation'
        ? this.onCreateLocationSubmit
        : this.onCreateMenuSubmit,
      ModalChild: openModalName === 'createLocation'
        ? CreateLocationForm
        : openModalName === 'createMenu' ? CreateMenuForm : CreateMenuForm
    }
  },
  render () {
    const {
      modalIsOpen,
      onRequestClose,
      ModalChild,
      onFormSubmit
    } = this.getModalProps()
    const { name, locations, menus } = this.props.orgData
    return (
      <Box>
        <Box p={2}>
          <Title fontSize={4}>
            Manage Your Org Man: {name}
          </Title>
        </Box>
        <Modal
          contentLabel='modal'
          isOpen={modalIsOpen}
          onRequestClose={onRequestClose}
        >
          <Box>
            <ModalChild onSubmit={onFormSubmit} />
          </Box>
        </Modal>
        <Box>
          <Title fontSize={3}>Locations</Title>
          <Flex wrap>
            <ListItem onClick={this.toggleCreationModal('createLocation')}>
              <Title fontSize={6}>+</Title>
              <Title>Create</Title>
            </ListItem>
            {locations && locations.map((loc, i) => (
              <Link
                to={`${this.props.match.url}/manage-location/${loc.id}`}
                  >
                <ListItem key={i}>
                  <Title>{loc.name}</Title>
                </ListItem>
              </Link>
                ))}
          </Flex>
        </Box>
        <Box mt={1}>
          <Title fontSize={3}>Menus</Title>
          <Flex wrap>
            <ListItem onClick={this.toggleCreationModal('createMenu')}>
              <Title fontSize={6}>+</Title>
              <Title>Create</Title>
            </ListItem>
            {menus && menus.map((menu, i) => (
              <Link to={`${this.props.match.url}/manage-menu/${menu.id}`}>
                <ListItem key={i}>
                  <Title>{menu.name}</Title>
                </ListItem>
              </Link>
                ))}
          </Flex>
        </Box>
      </Box>
    )
  }
})

export default connect(
  (state, props) => ({
    orgData: getOrgData(props.match.params.id)(state),
    orgId: props.match.params.id
  }),
  (dispatch, props) => ({
    getOrgEntity: id => dispatch(getOrgEntity(id)),
    getLocationEntities: orgId => dispatch(getLocationEntities(orgId)),
    getMenuEntities: orgId => dispatch(getMenuEntities(orgId)),
    createLocation: locationObj =>
      dispatch(createNewLocation(props.match.params.id)(locationObj)),
    createMenu: menuObj =>
      dispatch(createNewMenu(props.match.params.id)(menuObj))
  })
)(ManageOrg)
