import React from "react"

import './App.css'

const Header = (props) => {
  const { drizzle } = props;

  const deployed = drizzle.contracts.Flannel.address;

  return (
    <div className="banner">
      <h1> Flannel</h1>
      <h2> Chainlink Oracle Management Interface </h2>
      <h3> Deployed Address: {deployed} </h3>
    </div>
  )
}

export default Header;