import './style'
import React from 'react'
import { Route, Link } from 'react-router-dom'
import { Flex, Box, Title, settings as s } from 'boostly-ui'
import { OrgList, ManageOrg, ManageLocation, ManageMenu } from './views'

const navHeight = '50px'
const Navigation = () => (
  <Box height={navHeight} bg={s.colors.primaryCta}>
    <Flex maxWidth={s.primaryContainerWidth} margin='0 auto'>
      <Link to='/organizations'>
        <Flex align='center'>
          <img src='/assets/squid.jpg' height={navHeight} />
          <Title ml={2} fontSize={4} onDark>Boostly</Title>
        </Flex>
      </Link>
    </Flex>
  </Box>
)
const App = () => (
  <Box height='100%'>
    <Navigation />
    <Box maxWidth={s.primaryContainerWidth} margin='0 auto' py={1}>
      <Route path='/organizations' component={OrgList} />
      <Route path='/manage-org/:id' exact component={ManageOrg} />
      <Route
        path='/manage-org/:orgId/manage-location/:locId'
        component={ManageLocation}
      />
      <Route
        path='/manage-org/:orgId/manage-menu/:menuId'
        component={ManageMenu}
      />
    </Box>
  </Box>
)

export default App
