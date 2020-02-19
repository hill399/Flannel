import React from "react";
import { Row, Col, Input } from 'reactstrap';


import './App.css'

const Header = (props) => {
  const { drizzle } = props;

  const deployed = drizzle.contracts.Flannel.address;

  return (
    <div className="banner">


      <Row>
        <Col sm="12" style={{ paddingLeft: '25px' }}>
          <h2> Flannel</h2>
          <h3> Chainlink Oracle Management Interface </h3>
        </Col>
        <Col sm="12" style={{ paddingLeft: '25px', paddingTop: '15px' }}>
          <p> Deployed Address: {deployed} </p>
        </Col>
      </Row>

    </div>
  )
}

export default Header;