import React from 'react'
import Logo from '../img/logo.png'

const Footer = () => {
  return (
    <footer>
      <img src={Logo} alt="Logo" />
      <span className='copyright'>© Copyright 2025 Yash. All rights reserved.</span>
    </footer>
  )
}

export default Footer