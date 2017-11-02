import { css } from 'glamor'
import Downshift from 'downshift'
import { settings as s } from 'boostly-ui'
const border = `solid 1px ${s.colors.darkBase}`
const Dropdown = ({ items, ...rest }) => (
  <Downshift {...rest}>
    {
      (
        {
          getLabelProps,
          getInputProps,
          getButtonProps,
          getItemProps,
          getRootProps,
          isOpen,
          toggleMenu,
          clearSelection,
          selectedItem,
          inputValue,
          highlightedIndex
        }
      ) => (
        <div>
          <div
            onClick={toggleMenu}
            data-toggle='dropdown'
            aria-haspopup='true'
            aria-expanded={isOpen}
            {...css({
              display: 'flex',
              alignItems: 'center',
              border: border,
              height: '40px',
              borderRadius: '6px',
              borderBottomLeftRadius: isOpen ? 0 : '6px',
              borderBottomRightRadius: isOpen ? 0 : '6px',
              paddingLeft: '10px'
            })}
          >
            <span {...css({ verticalAlign: 'middle' })}>{selectedItem}</span>
          </div>
          {
            isOpen
              ? <div
                {...css({
                  backgroundColor: s.colors.lightBaseHighlight,
                  borderBottomLeftRadius: '6px',
                  borderBottomRightRadius: '6px',
                  borderLeft: border,
                  borderRight: border,
                  borderBottom: border
                })}
              >
                {items.map((item, i) => (
                  <div
                    key={item}
                    {...getItemProps({ item })}
                    {...css({
                      cursor: 'pointer',
                      padding: '4px',
                      paddingLeft: '10px',
                      backgroundColor: i === highlightedIndex
                          ? s.colors.lightBaseHighlight
                          : 'transparent',
                      borderBottomRightRadius: i === items.length - 1
                          ? '6px'
                          : 0,
                      borderBottomLeftRadius: i === items.length - 1
                          ? '6px'
                          : 0
                    })}
                    >
                    {item}
                  </div>
                  ))}
              </div>
              : null
          }
        </div>
      )
    }
  </Downshift>
)

export default Dropdown
