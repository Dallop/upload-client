import React from 'react'
import { Flex, settings as s } from 'boostly-ui'

const ListItem = ({ children, onClick }) => (
  <Flex
    onClick={onClick}
    border={`solid 4px ${s.colors.primaryCta}`}
    w='183px'
    height='120px'
    align='center'
    justify='center'
    textAlign='center'
    column
    p={1}
    m={1}
    cursor='pointer'
    transition='.25s'
    hover={{ border: `solid 4px ${s.colors.secondaryCta}`, transform: 'scale(1.01)' }}
  >
    {children}
  </Flex>
)

export default ListItem
