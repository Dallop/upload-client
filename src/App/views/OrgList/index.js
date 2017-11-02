import React from 'react'
import cc from 'create-react-class'
import pt from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Flex, Box, Title, Modal, Input, Button } from 'boostly-ui'
import { createNewOrg, getOrgEntities } from 'App/state'
import ListItem from 'App/shared/ListItem'

const OrgList = cc({
  propTypes: { dispatch: pt.func, orgs: pt.array },
  getInitialState () {
    return { showCreateModal: false, newOrgName: '' }
  },
  componentDidMount () {
    this.props.dispatch(getOrgEntities())
  },
  toggleCreateModal () {
    this.setState({ showCreateModal: !this.state.showCreateModal })
  },
  onOrgNameChange ({ target }) {
    this.setState({ newOrgName: target.value })
  },
  createNew () {
    this.props.dispatch(createNewOrg({ name: this.state.newOrgName }))
    this.toggleCreateModal()
  },
  render () {
    return (
      <Box>
        <Box p={2}>
          <Title fontSize={4}>Organizations</Title>
        </Box>
        <Modal
          contentLabel='holla'
          isOpen={this.state.showCreateModal}
          onRequestClose={this.toggleCreateModal}
        >
          <Box is='form' onSubmit={this.createNew}>
            <Box px={3} pb={2}>
              <Title>Organization Name</Title>
              <Box pb={1} />
              <Input
                value={this.state.newOrgName}
                onChange={this.onOrgNameChange}
              />
            </Box>
            <Box p={2}>
              <Button type='submit'>Create Now</Button>
            </Box>
          </Box>
        </Modal>
        <Flex wrap>
          <ListItem onClick={this.toggleCreateModal}>
            <Title fontSize={6}>+</Title>
            <Title>Create</Title>
          </ListItem>
          {this.props.orgs.map((org, i) => (
            <Link to={`/manage-org/${org.id}`}>
              <ListItem key={i}>
                <Title>{org.name}</Title>
              </ListItem>
            </Link>
            ))}
        </Flex>
      </Box>
    )
  }
})

export default connect(({ entities }) => ({
  orgs: Object.keys(entities.orgs).map(key => entities.orgs[key])
}))(OrgList)
