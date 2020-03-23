import React, { useEffect, useCallback } from "react";
import { Row, Col } from 'reactstrap';

import '../layout/App.css'

const Header = (props) => {
  const { drizzle, drizzleState, parameters, setBalances, setExtBalances, addressKey } = props;
  const { Flannel } = drizzleState.contracts;

  const nodeAddress = Flannel.getAddresses[addressKey];

  // Update Parameters
  useEffect(() => {
    const flannelContract = drizzle.contracts.Flannel
    const parametersKey = flannelContract.methods.userStoredParams.cacheCall()
    parameters(parametersKey)
  }, [])

  // Update Balances
  useEffect(() => {
    const flannelContract = drizzle.contracts.Flannel
    const topUpKey = flannelContract.methods["topUpBalance"].cacheCall();
    const storeKey = flannelContract.methods["storeBalance"].cacheCall();
    const earnKey = flannelContract.methods["aaveBalance"].cacheCall();

    setBalances({
      topUp: topUpKey,
      store: storeKey,
      earn: earnKey
    })
  }, [])

  const getExtBalances = useCallback(async () => {

    let oracleBal = await drizzle.contracts.Flannel.methods.getOracleWithdrawable().call()

    let node = (typeof nodeAddress !== 'undefined') ? await drizzle.web3.eth.getBalance(nodeAddress.value[1]) : '0'

    let aLinkBal = await drizzle.contracts.Flannel.methods.getALinkBalance().call();

    setExtBalances({
      oracle: oracleBal,
      node: node,
      aLink: aLinkBal
    })

  }, [drizzleState])

  // Update Balances
  useEffect(() => {

    getExtBalances();

  }, [drizzleState])

  const deployed = drizzle.contracts.Flannel.address;

  const shortAccount = () => {
    const connAccount = drizzleState.accounts[0];
    return (
      connAccount.slice(0, 8) + "..." + connAccount.slice(36)
    )
  }

  return (
    <div className="banner">
      <Row>
        <Col sm="12" style={{ paddingLeft: '25px' }}>
          <div className="row" >
            <div className="col" style={{ fontSize: "3" }} > </div>
            <div className="col-auto" style={{ marginRight: "20px", fontSize: "3" }}> <p> Account: {shortAccount()} </p> </div>
          </div>
          <h2> Flannel</h2>
          <h3> Chainlink Oracle Interface </h3>
        </Col>
        <Col sm="12" style={{ paddingLeft: '25px', paddingTop: '15px' }}>
          <p> Deployed Address: {deployed} </p>
        </Col>
      </Row>
    </div>
  )
}

export default Header;