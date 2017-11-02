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
  Modal,
  CloseAction,
  CheckboxGroup,
  CheckboxOption,
  Textarea,
  settings as s
} from 'boostly-ui'
import { toMap } from 'utils'
import {
  selectors,
  getMenuEntity,
  updateMenuEntity,
  createMenuCategory,
  getMenuCategoryEntities,
  createOptionSetEntity,
  getOptionSetEntities,
  createOptionEntity,
  getOptionEntities,
  updateOptionEntity,
  updateOptionSetEntity,
  createMenuItemEntity,
  updateMenuItemEntity
} from './state'
import ListItem from 'App/shared/ListItem'
import Save from './Save'

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
const TextareaField = ({ ...rest, label, inputRef, width = '100%' }) => (
  <Flex column py={1} w={width}>
    <Label label={label} />
    <Box>
      <Textarea {...rest} />
    </Box>
  </Flex>
)
const SimpleForm = cc({
  propTypes: { onCreateRequest: pt.func },
  update (key) {
    return ({ target }) => this.setState(prev => ({ [key]: target.value }))
  },
  onCreate () {
    this.props.onCreateRequest(this.state)
  },
  render () {
    return (
      <Box p={2}>
        {this.props.children({ update: this.update })}
        <Box my={1} />
        <Button onClick={this.onCreate}>Create</Button>
      </Box>
    )
  }
})

const ManageMenu = cc({
  propTypes: { menuData: pt.object, orgId: pt.string },
  getInitialState () {
    return { selectedMenuItem: null, creatingNew: false, editing: false }
  },
  createCleanMenuItem () {
    return {
      name: '',
      description: '',
      optionSets: [],
      servingPortions: [ { name: 'Regular', price: '' } ]
    }
  },
  componentDidMount () {
    this.props.getMenuData()
  },
  componentWillReceiveProps (next) {
    this.setState(() => ({ ...next.menuData }))
  },
  changesWereMade () {
    this.setState({ changesWereMade: true })
  },
  createNew (itemObj) {
    this.props.createMenuItem(itemObj)
    this.setState(prev => ({ selectedMenuItem: null, creatingNew: false }))
  },
  createNewMenuItem () {
    this.setState(prev => ({
      selectedMenuItem: this.createCleanMenuItem(),
      creatingNew: true
    }))
  },
  editMenuItem (item) {
    return () =>
      this.setState(prev => ({ selectedMenuItem: item, editing: true }))
  },
  saveEdit (itemObj) {
    this.props.updateMenuItem(itemObj)
    this.setState(prev => ({ selectedMenuItem: null, editing: false }))
  },
  cancelMenuItemEdit () {
    this.setState(prev => ({ selectedMenuItem: null }))
  },
  renderHeading () {
    return this.state.selectedMenuItem
      ? <Flex p={2} justify='flex-end' align='center'>
        <CloseAction onClick={this.cancelMenuItemEdit} />
      </Flex>
      : <Flex p={2} align='center' justify='space-between'>
        <Title fontSize={4}>
          Manage {this.props.menuData.name} Details
        </Title>
      </Flex>
  },
  render () {
    const { selectedMenuItem } = this.state
    const { menuData } = this.props
    return (
      <Box pb={4}>
        {this.renderHeading()}
        {!selectedMenuItem && (
        <Flex>
          <ListItem onClick={this.createNewMenuItem}>
            <Title fontSize={6}>+</Title>
            <Title>Create</Title>
          </ListItem>
          {menuData.items.map(item => (
            <ListItem key={item.id} onClick={this.editMenuItem(item)}>
              <Title>{item.name}</Title>
            </ListItem>
                  ))}
        </Flex>
            )}
        {
          selectedMenuItem &&
            (
              <ManageMenuItem
                defaultItemInfo={selectedMenuItem}
                orgId={this.props.orgId}
                menuId={this.props.menuId}
                menuItemMischiefManaged={
                  this.state.creatingNew ? this.createNew : this.saveEdit
                }
              />
            )
        }
      </Box>
    )
  }
})

const wrapAsEventObject = value => ({ target: { value } })
export default connect(
  (state, props) => ({
    // orgId/menuId
    ...props.match.params,
    menuData: selectors.getMenuData(props.match.params.menuId)(state)
  }),
  (dispatch, props) => ({
    getMenuData: () => dispatch(getMenuEntity(props.match.params)),
    updateMenuData: menuData =>
      dispatch(updateMenuEntity({ ...props.match.params, menuData })),
    createMenuItem: itemObj =>
      dispatch(createMenuItemEntity({ ...props.match.params })(itemObj)),
    updateMenuItem: itemObj =>
      dispatch(updateMenuItemEntity({ ...props.match.params })(itemObj))
  })
)(ManageMenu)

const ManageMenuItem = connect(
  (state, props) => ({
    menuCategories: selectors.getMenuCategories(props.menuId)(state),
    optionSets: selectors.getOptionSets(props.menuId)(state),
    options: selectors.getOptions(props.menuId)(state)
  }),
  (dispatch, props) => ({
    createMenuCategory: catObj => dispatch(createMenuCategory(props)(catObj)),
    getMenuCategories: () => dispatch(getMenuCategoryEntities(props)),
    createOptionSet: setObj => dispatch(createOptionSetEntity(props)(setObj)),
    getOptionSets: () => dispatch(getOptionSetEntities(props)),
    updateOptionSet: (id, setObj) =>
      dispatch(updateOptionSetEntity(props)(id, setObj)),
    createOption: optionObj => dispatch(createOptionEntity(props)(optionObj)),
    getOptions: () => dispatch(getOptionEntities(props)),
    updateOption: (id, opObj) => dispatch(updateOptionEntity(props)(id, opObj))
  })
)(
  cc({
    propTypes: { defaultItemInfo: pt.object, menuCategories: pt.array },
    getInitialState () {
      return {
        itemInfo: this.props.defaultItemInfo,
        showCreatePortionModal: false,
        showCreateCategoryModal: false
      }
    },
    componentDidMount () {
      this.props.getMenuCategories()
      this.props.getOptionSets()
      this.props.getOptions()
    },
    updateItemInfo (key) {
      return ({ target }) =>
        this.setState(prev => ({
          itemInfo: { ...prev.itemInfo, [key]: target.value }
        }))
    },
    updateServingPortion (i, key) {
      return ({ target }) => {
        let { servingPortions } = this.state.itemInfo
        const newVal = { ...servingPortions[i], [key]: target.value }
        servingPortions[i] = newVal
        this.updateItemInfo(
          'servingPortions'
        )(wrapAsEventObject(servingPortions))
      }
    },
    removeServingPortion (i) {
      return () => {
        let servingPortions = [ ...this.state.itemInfo.servingPortions ]
        servingPortions.splice(i, 1)
        this.updateItemInfo(
          'servingPortions'
        )(wrapAsEventObject(servingPortions))
      }
    },
    toggleCreateCategoryModal () {
      this.setState(prev => ({
        showCreateCategoryModal: !prev.showCreateCategoryModal
      }))
    },
    toggleCreatePortionModal () {
      this.setState(prev => ({
        showCreatePortionModal: !prev.showCreatePortionModal
      }))
    },
    onNewPortionCreate (newPortion) {
      const value = [ ...this.state.itemInfo.servingPortions, newPortion ]

      this.updateItemInfo('servingPortions')(wrapAsEventObject(value))
      this.toggleCreatePortionModal()
    },
    onNewCategoryCreate (newCategory) {
      this.props.createMenuCategory(newCategory)
      this.toggleCreateCategoryModal()
    },
    updateSelectedSets (optionSets) {
      this.updateItemInfo('optionSets')(wrapAsEventObject(optionSets))
    },
    onRequestSubmit () {
      const { itemInfo } = this.state
      if (!itemInfo.name) {
        return window.alert('Name Required!')
      } else if (!itemInfo.description) {
        return window.alert('Description Required!')
      } else if (!itemInfo.categoryId) {
        return window.alert('Category Required!')
      } else if (!itemInfo.description) {
        return window.alert('Description Required!')
      } else if (
        !itemInfo.servingPortions.length || !itemInfo.servingPortions[0].price
      ) {
        return window.alert('You need a price dummy!')
      }

      this.props.menuItemMischiefManaged(itemInfo)
    },
    render () {
      const {
        name,
        description,
        servingPortions,
        categoryId,
        optionSets
      } = this.state.itemInfo
      return (
        <Box>
          <Modal
            contentLabel='Create Serving Portion'
            isOpen={this.state.showCreatePortionModal}
            heading={<Title fontSize={3}>Create Serving Portion</Title>}
            onRequestClose={this.toggleCreatePortionModal}
          >
            <SimpleForm onCreateRequest={this.onNewPortionCreate}>
              {({ update }) => (
                <Box>
                  <InputField label='Name' onChange={update('name')} />
                  <InputField
                    label='Price'
                    onChange={update('price')}
                    type='number'
                    />
                </Box>
                )}
            </SimpleForm>
          </Modal>
          <Modal
            contentLabel='Create Category'
            isOpen={this.state.showCreateCategoryModal}
            heading={<Title fontSize={3}>Create Category</Title>}
            onRequestClose={this.toggleCreateCategoryModal}
          >
            <SimpleForm onCreateRequest={this.onNewCategoryCreate}>
              {
                ({ update }) => (
                  <InputField
                    autoFocus
                    label='Name'
                    onChange={update('name')}
                  />
                )
              }
            </SimpleForm>
          </Modal>
          <Flex
            wrap
            is='form'
            justify='space-between'
            onSubmit={this.onRequestSubmit}
          >
            <Box is='fieldset' w={[ 1, '48%' ]} column border={0}>
              <InputField
                label='Item Name'
                value={name}
                onChange={this.updateItemInfo('name')}
              />
              <TextareaField
                label='Description'
                value={description}
                onChange={this.updateItemInfo('description')}
              />
              <CategoryField
                onCategorySelect={this.updateItemInfo('categoryId')}
                onCreateCategoryRequest={this.toggleCreateCategoryModal}
                selectedCategory={categoryId}
                categories={this.props.menuCategories}
              />
              <Box mt={1}>
                <AdditiveLabel
                  label='Serving Portions'
                  onClick={this.toggleCreatePortionModal}
                />
                {servingPortions.map((sp, i) => (
                  <Flex key={i} align='center' mb={1} justify='space-between'>
                    <Box w='50%'>
                      <Input
                        value={sp.name}
                        onChange={this.updateServingPortion(i, 'name')}
                        />
                    </Box>
                    <Flex w='30%' align='center'>
                      <Text fontSize={3} pr={1}>$</Text>
                      <Input
                        type='number'
                        value={sp.price}
                        onChange={this.updateServingPortion(i, 'price')}
                        />
                    </Flex>
                    <CloseAction
                      onClick={this.removeServingPortion(i)}
                      color={s.colors.primaryCta}
                      size='15px'
                      />
                  </Flex>
                  ))}
              </Box>
            </Box>
            <Box is='fieldset' w={[ 1, '48%' ]} border={0}>
              <OptionSetForm
                selectedSets={optionSets}
                options={this.props.options}
                optionsMap={toMap('id', this.props.options)}
                optionSets={this.props.optionSets}
                optionSetMap={toMap('id', this.props.optionSets)}
                createOptionSet={this.props.createOptionSet}
                updateOptionSet={this.props.updateOptionSet}
                onSetSelectionChange={this.updateSelectedSets}
                createOption={this.props.createOption}
                updateOption={this.props.updateOption}
              />
            </Box>
          </Flex>
          <Box pt={2}>
            <Button onClick={this.onRequestSubmit}>Save Menu Item</Button>
          </Box>
        </Box>
      )
    }
  })
)

const AdditiveLabel = ({ label, onClick }) => (
  <Label>
    <Flex align='center'>
      <Text>{label}</Text>
      <Box cursor='pointer'>
        <Title fontSize={4} pl={2} onClick={onClick}>+</Title>
      </Box>
    </Flex>
  </Label>
)

const CategoryField = (
  { selectedCategory, categories, onCategorySelect, onCreateCategoryRequest }
) => (
  <Box>
    <AdditiveLabel label='Category' onClick={onCreateCategoryRequest} />
    {
      categories.length
        ? <Select value={selectedCategory} onChange={onCategorySelect}>
          {!selectedCategory && <option>Select a Category</option>}
          {
            categories.map((c, i) => (
              <option value={c.id} key={i}>{c.name}</option>
            ))
          }
        </Select>
        : <Box height='40px' />
    }
  </Box>
)

const OptionSetForm = cc({
  propTypes: {
    optionSets: pt.array,
    optionSetMap: pt.object,
    onSetSelectionChange: pt.func,
    createOptionSet: pt.func
  },
  getInitialState () {
    return {
      showSetCreationModal: false,
      selectedSets: this.props.selectedSets || [],
      selectedSet: null,
      unsavedEdits: false
    }
  },
  componentWillReceiveProps (next) {
    this.setState(prev => ({ selectedSets: next.selectedSets }))
  },
  toggleCreateSetModal () {
    this.setState(prev => ({
      showSetCreationModal: !prev.showSetCreationModal
    }))
  },
  saveSetEdits () {
    const { selectedSet } = this.state
    this.props.updateOptionSet(selectedSet.id, selectedSet)
    this.selectSet(null)
  },
  cancelSetEdits () {
    this.selectSet(null)
  },
  selectSet (setId) {
    this.setState(prev => ({
      unsavedEdits: false,
      selectedSet: this.props.optionSetMap[setId]
    }))
  },
  updateSelectedSet (key) {
    return ({ target }) =>
      this.setState(prev => ({
        unsavedEdits: true,
        selectedSet: { ...prev.selectedSet, [key]: target.value }
      }))
  },
  updateSelectedSets (selectedSets) {
    this.setState(
      prev => ({ selectedSets }),
      () => this.props.onSetSelectionChange(this.state.selectedSets)
    )
  },
  addSelection (setId) {
    this.updateSelectedSets([ ...this.state.selectedSets, setId ])
  },
  onNewSetCreate (setObj) {
    this.props.createOptionSet(setObj)
    this.toggleCreateSetModal()
  },
  removeSet (i) {
    return () => {
      let sets = [ ...this.state.selectedSets ]
      sets.splice(i, 1)
      this.updateSelectedSets(sets)
    }
  },
  addOption (opId) {
    const { selectedSet } = this.state
    this.updateSelectedSet(
      'options'
    )(wrapAsEventObject([ ...(selectedSet.options || []), opId ]))
  },
  removeOption (i) {
    const selectedSet = this.state.selectedSet
    selectedSet.options.splice(i, 1)
    this.updateSelectedSet('options')(wrapAsEventObject(selectedSet.options))
  },
  render () {
    const { selectedSet } = this.state
    return (
      <Box>
        <Modal
          contentLabel='Create Option Set'
          isOpen={this.state.showSetCreationModal}
          heading={<Title fontSize={3}>Create Option Set</Title>}
          onRequestClose={this.toggleCreateSetModal}
        >
          <SimpleForm onCreateRequest={this.onNewSetCreate}>
            {
              ({ update }) => (
                <InputField autoFocus label='Name' onChange={update('name')} />
              )
            }
          </SimpleForm>
        </Modal>
        <OptionSetField
          optionSets={this.props.optionSets}
          onCreateOptionSetRequest={this.toggleCreateSetModal}
          onSetSelect={this.addSelection}
        />
        <Box mt={1} px={1}>
          {this.state.selectedSets.map((setId, i) => {
            const set = this.props.optionSetMap[setId]
            if (!set) return
            return (
              <Flex key={setId} align='center' mb={1} justify='space-between'>
                <Box
                  w='50%'
                  cursor='pointer'
                  color={
                      setId === (selectedSet && selectedSet.id)
                        ? s.colors.success
                        : s.colors.textOnLight
                    }
                  onClick={() => this.selectSet(setId)}
                  >
                  {set.name}
                </Box>
                <CloseAction
                  onClick={() => {
                    this.selectSet(null)
                    this.removeSet(i)()
                  }}
                  color={s.colors.primaryCta}
                  size='15px'
                  />
              </Flex>
            )
          })}
        </Box>
        {selectedSet && (
        <Box>
          {
                  this.state.unsavedEdits
                    ? <Flex align='center' justify='flex-end' pt={2} mb='-12px'>
                      <Box onClick={this.saveSetEdits} mr={1}>
                        <Save size='27px' color={s.colors.success} />
                      </Box>
                      <CloseAction
                        onClick={this.cancelSetEdits}
                        color={s.colors.primaryCta}
                      />
                    </Flex>
                    : <Box height='47px' mb='-12px' />
                }
          <InputField
            label='Name'
            value={selectedSet.name}
            onChange={this.updateSelectedSet('name')}
                />
          <Flex justify='space-between'>
            <Box w={[ '25%' ]}>
              <InputField
                label='Min'
                type='number'
                value={selectedSet.min || ''}
                onChange={this.updateSelectedSet('min')}
                    />
            </Box>
            <Box w={[ '25%' ]}>
              <InputField
                label='Max'
                type='number'
                value={selectedSet.max || ''}
                onChange={this.updateSelectedSet('max')}
                    />
            </Box>
          </Flex>
          <Box py={2}>
            <CheckboxGroup
              onChange={
                      val =>
                        this.updateSelectedSet('optionsAreDefaults')(
                          wrapAsEventObject(val[0])
                        )
                    }
                  >
              <CheckboxOption
                checked={selectedSet.optionsAreDefaults}
                value
                    >
                <Box textAlign='center'>
                        Default Options To Selected
                      </Box>
              </CheckboxOption>
            </CheckboxGroup>
          </Box>
          <Box>
            <OptionsForm
              addOption={this.addOption}
              removeOption={this.removeOption}
              availableOptions={this.props.options}
              availableOptionsMap={this.props.optionsMap}
              selectedOptionIds={selectedSet.options || []}
              createOption={this.props.createOption}
              updateOption={this.props.updateOption}
                  />
          </Box>
        </Box>
            )}
      </Box>
    )
  }
})

const OptionSetField = cc({
  getInitialState () {
    return { selectedValue: '' }
  },
  onSelectionChange ({ target }) {
    this.setState(prev => ({ selectedValue: target.value }))
  },
  render () {
    const { optionSets, onSetSelect, onCreateOptionSetRequest } = this.props
    return (
      <Box>
        <AdditiveLabel
          label='Menu Options'
          onClick={onCreateOptionSetRequest}
        />
        <Flex align='center'>
          <Box w='70%'>
            {
              optionSets.length
                ? <Select
                  value={this.state.selectedValue}
                  onChange={this.onSelectionChange}
                >
                  {
                    !this.state.selectedValue &&
                      <option>Pick an Option Set</option>
                  }
                  {
                    optionSets.map((c, i) => (
                      <option value={c.id} key={i}>{c.name}</option>
                    ))
                  }
                </Select>
                : <Box height='40px' />
            }
          </Box>
          <Box textAlign='center' w='30%' cursor='pointer'>
            <Title
              onClick={
                this.state.selectedValue
                  ? () => onSetSelect(this.state.selectedValue)
                  : _ => _
              }
            >
              Add
            </Title>
          </Box>
        </Flex>
      </Box>
    )
  }
})

const OptionsForm = cc({
  getInitialState () {
    return {
      showOptionCreationModal: false,
      selectedOptions: this.getSelectedOptionsMap(this.props),
      optionBeingEdited: false
    }
  },
  componentWillReceiveProps (next) {
    this.setState(prev => ({
      selectedOptions: {
        ...prev.selectedOptions,
        ...this.getSelectedOptionsMap(next)
      }
    }))
  },
  getSelectedOptionsMap (props) {
    return props.selectedOptionIds.reduce(
      (map, id) => ({ ...map, [id]: props.availableOptionsMap[id] }),
      {}
    )
  },
  updateOption (id, key) {
    return ({ target }) =>
      this.setState(prev => ({
        optionBeingEdited: id,
        selectedOptions: {
          ...prev.selectedOptions,
          [id]: { ...prev.selectedOptions[id], [key]: target.value }
        }
      }))
  },
  cancelEdit (id) {
    this.setState(prev => ({
      optionBeingEdited: false,
      selectedOptions: {
        ...prev.selectedOptions,
        [id]: this.props.availableOptionsMap[id]
      }
    }))
  },
  saveOptionEdit (id) {
    this.props.updateOption(id, this.state.selectedOptions[id])
    this.setState(prev => ({ optionBeingEdited: false }))
  },
  removeOption (i) {
    this.props.removeOption(i)
    this.setState(prev => ({ optionBeingEdited: false }))
  },
  toggleCreateOptionModal () {
    this.setState(prev => ({
      showOptionCreationModal: !prev.showOptionCreationModal
    }))
  },
  onCreateOptionRequest (optionObj) {
    this.props.createOption(optionObj)
    this.toggleCreateOptionModal()
  },
  render () {
    return (
      <Box>
        <OptionField
          options={this.props.availableOptions}
          onOptionSelect={this.props.addOption}
          onCreateOptionRequest={this.toggleCreateOptionModal}
        />
        <Box pt={2}>
          {this.props.selectedOptionIds.map((opId, i) => {
            const op = this.state.selectedOptions[opId]
            return (
              <Flex key={opId} align='center' mb={1} justify='space-between'>
                <Box w='50%'>
                  <Input
                    value={op.name}
                    onChange={this.updateOption(opId, 'name')}
                    />
                </Box>
                <Flex w='30%' align='center'>
                  <Text fontSize={3} pr={1}>$</Text>
                  <Input
                    type='number'
                    value={Number(op.cost)}
                    onChange={this.updateOption(opId, 'cost')}
                    />
                </Flex>
                {
                    this.state.optionBeingEdited === opId
                      ? <Flex column align='center' justify='center'>
                        <Save
                          size='15px'
                          onClick={() => this.saveOptionEdit(opId)}
                        />
                        <Box p='2px' />
                        <CloseAction
                          onClick={() => this.cancelEdit(opId)}
                          size='15px'
                        />
                      </Flex>
                      : <CloseAction
                        color={s.colors.primaryCta}
                        size='15px'
                        onClick={() => this.removeOption(i)}
                      />
                  }
              </Flex>
            )
          })}
        </Box>
        <Modal
          contentLabel='Option Creation Modal'
          isOpen={this.state.showOptionCreationModal}
          onRequestClose={this.toggleCreateOptionModal}
          heading={<Title fontSize={3}>Create Option</Title>}
        >
          <SimpleForm onCreateRequest={this.onCreateOptionRequest}>
            {({ update }) => (
              <Box>
                <InputField
                  autoFocus
                  label='Name'
                  onChange={update('name')}
                  />
                <InputField
                  label='Cost'
                  type='number'
                  onChange={update('cost')}
                  />
              </Box>
              )}
          </SimpleForm>
        </Modal>
      </Box>
    )
  }
})

const OptionField = cc({
  getInitialState () {
    return { selectedValue: '' }
  },
  onSelectionChange ({ target }) {
    this.setState(prev => ({ selectedValue: target.value }))
  },
  onOptionSelectRequest () {
    this.onSelectionChange(wrapAsEventObject(''))
    this.props.onOptionSelect(this.state.selectedValue)
  },
  render () {
    const { options, onCreateOptionRequest } = this.props
    const selectField = options.length ? <Flex align='center'>
      <Box w='70%'>
        {(
          <Select
            value={this.state.selectedValue}
            onChange={this.onSelectionChange}
              >
            {!this.state.selectedValue && <option>Pick an Option</option>}
            {
                  options.map((c, i) => (
                    <option value={c.id} key={i}>{c.name}</option>
                  ))
                }
          </Select>
            )}
      </Box>
      <Box textAlign='center' w='30%' cursor='pointer'>
        <Title
          onClick={
              this.state.selectedValue ? this.onOptionSelectRequest : _ => _
            }
          >
            Add
          </Title>
      </Box>
    </Flex> : <Box height='40px' />
    return (
      <Box>
        <AdditiveLabel label='Options' onClick={onCreateOptionRequest} />
        {selectField}
      </Box>
    )
  }
})
