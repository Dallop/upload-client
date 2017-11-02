import React from 'react'
import cc from 'create-react-class'
import { settings as s } from 'boostly-ui'

export const Tab = ({ onClick, isDisabled, isActive, children }) => {
  const tabStyles = {
    display: 'inline-block',
    padding: 10,
    margin: 10,
    cursor: 'pointer',
    color: s.colors.textOnLight
  }

  const styles = {
    tab: tabStyles,
    activeTab: {
      ...tabStyles,
      borderRadius: '3px',
      backgroundColor: s.colors.base
    },
    disabledTab: { ...tabStyles, opacity: 0.25, cursor: 'default' }
  }

  return (
    <div
      {...{
        onClick: isDisabled ? null : onClick,
        style: isDisabled
          ? styles.disabledTab
          : isActive ? styles.activeTab : styles.tab
      }}
    >
      {children}
    </div>
  )
}

export const TabList = ({ children, activeIndex, onActivate }) => (
  <div>
    {
      React.Children.map(
        children,
        (child, index) =>
          React.cloneElement(child, {
            isActive: index === activeIndex,
            onClick: () => onActivate(index)
          })
      )
    }
  </div>
)

export const TabPanels = ({ children, activeIndex }) => (
  <div>
    {children[activeIndex]}
  </div>
)

export const Tabs = cc({
  getInitialState () {
    return { activeIndex: 0 }
  },
  render () {
    const { props: { children }, state: { activeIndex } } = this

    return (
      <div>
        {
          React.Children.map(
            children,
            (child, index) =>
              child.type === TabPanels
                ? React.cloneElement(child, { activeIndex: activeIndex })
                : child.type === TabList
                  ? React.cloneElement(child, {
                    activeIndex: activeIndex,
                    onActivate: activeIndex => this.setState({ activeIndex })
                  })
                  : child
          )
        }
      </div>
    )
  }
})
