import React from 'react'
import { css } from 'glamor'
import { settings as s } from 'boostly-ui'
export default (
  { size = '25px', onClick = _ => _, color = s.colors.textOnLight }
) => (
  <svg
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    x='0px'
    y='0px'
    width={size}
    height={size}
    viewBox='0 0 49 49'
    onClick={onClick}
    style={{ cursor: 'pointer' }}
    fill={color}
    {...css({ transition: '.25s', ':hover': { transform: `scale(1.05)` } })}
  >
    <g>
      <path
        d='M39.914,0H37.5h-28h-9v49h7h33h8V8.586L39.914,0z M35.5,2v14h-24V2H35.5z M9.5,47V28h29v19H9.5z M46.5,47h-6V26h-33v21h-5V2h7v16h28V2h1.586L46.5,9.414V47z'
      />
      <path
        d='M13.5,33h7c0.553,0,1-0.447,1-1s-0.447-1-1-1h-7c-0.553,0-1,0.447-1,1S12.947,33,13.5,33z'
      />
      <path
        d='M23.5,35h-10c-0.553,0-1,0.447-1,1s0.447,1,1,1h10c0.553,0,1-0.447,1-1S24.053,35,23.5,35z'
      />
      <path
        d='M25.79,35.29c-0.181,0.189-0.29,0.45-0.29,0.71s0.109,0.52,0.29,0.71C25.979,36.89,26.229,37,26.5,37c0.26,0,0.52-0.11,0.71-0.29c0.18-0.19,0.29-0.45,0.29-0.71s-0.11-0.521-0.29-0.71C26.84,34.92,26.16,34.92,25.79,35.29z'
      />
      <path d='M33.5,4h-6v10h6V4z M31.5,12h-2V6h2V12z' />
    </g>
  </svg>
)
