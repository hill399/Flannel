import React, { useEffect } from "react";
import { Row, Col } from 'reactstrap';

import './App.css'

const Header = (props) => {
  const { drizzle, drizzleState, parameters, balances, addresses } = props;

  // Update Parameters
  useEffect(() => {
    const flannelContract = drizzle.contracts.Flannel
    const parametersKey = flannelContract.methods.userStoredParams.cacheCall()
    parameters(parametersKey)
  }, [drizzleState, drizzle.contracts.Flannel, parameters])

  // Update Balances
  useEffect(() => {
    const flannelContract = drizzle.contracts.Flannel
    const topUpKey = flannelContract.methods["topUpBalance"].cacheCall();
    const storeKey = flannelContract.methods["storeBalance"].cacheCall();
    const earnKey = flannelContract.methods["aaveBalance"].cacheCall();

    balances({
      topUp: topUpKey,
      store: storeKey,
      earn: earnKey
    })
  }, [drizzle.contracts.Flannel, balances])

  const deployed = drizzle.contracts.Flannel.address;
  const bn = drizzleState.currentBlock.number;
  const connAccount = drizzleState.accounts[0];

  return (
      <div className="banner">
        <Row>
          <Col sm="12" style={{ paddingLeft: '25px' }}>
            <div className="row" >
              <div className="col" style={{ fontSize: "3" }} ><p> Block: { bn } </p> </div>
              <div className="col-auto" style={{ marginRight: "20px", fontSize: "3" }}> <p> Account: {connAccount} </p> </div>
            </div>
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