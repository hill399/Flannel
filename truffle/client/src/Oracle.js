
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, Input } from 'reactstrap';

import './App.css'

const Oracle = (props) => {
  const [oracleLinkBalanceKey, setOracleLinkBalanceKey] = useState(null)
  const [flannelAutoWithdrawKey, setFlannelAutoWithdrawKey] = useState(null)

  const [withdrawLimitKey, setWithdrawLimitKey] = useState({
    oracleLinkBalance: '',
    autoWithdrawLimit: '',
    newLimit: ''
  })

  const [isOpen, setIsOpen] = useState(true);

  const [stackId, setStackID] = useState(null)

  const { drizzle, drizzleState } = props
  const { Flannel, LinkTokenInterface } = drizzleState.contracts

  useEffect(() => {
    const linkTokenContract = drizzle.contracts.LinkTokenInterface
    const flannelContract = drizzle.contracts.Flannel
    const oracleLinkBalanceKey = linkTokenContract.methods.balanceOf.cacheCall(drizzle.contracts.Oracle.address)
    const autoWithdrawLimitKey = flannelContract.methods.userStoredParams.cacheCall()

    setWithdrawLimitKey({
      ...withdrawLimitKey,
      oracleLinkBalance: oracleLinkBalanceKey,
      autoWithdrawLimit: autoWithdrawLimitKey
    })

  }, [withdrawLimitKey.oracleLinkBalance, drizzle.contracts.LinkTokenInterface, drizzle.contracts.Flannel])

  const updateField = e => {
    setWithdrawLimitKey({
      ...withdrawLimitKey,
      [e.target.name]: e.target.value
    });
  }

  const formatData = (data, symbol) => {
    return (
      String(data / 1e18) + " " + (symbol)
    )
  }

  const initiateUpdateLimit = (value) => {
    const contract = drizzle.contracts.Flannel;
    const stackId = contract.methods["manualWithdrawFromOracle"].cacheSend(value, {
      from: drizzleState.accounts[0],
      gas: 300000
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }

  const toggle = () => setIsOpen(!isOpen);

  const oracleLinkBalance = LinkTokenInterface.balanceOf[withdrawLimitKey.oracleLinkBalance]
  const flannelAutoWithdraw = Flannel.userStoredParams[withdrawLimitKey.autoWithdrawLimit]

  return (
    // if it exists, then we display its value
    <div className="section">
    <Card style={{ paddingLeft: '20px'}}>
      <div className="row">
        <div className="col" style={{ paddingTop: '15px' }}><h2> Oracle </h2></div>
        <div className="col-auto"> <Button color="primary" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
      </div>
      <Collapse isOpen={isOpen}>
          <CardBody>
            <p> Current Oracle Balance: {oracleLinkBalance && formatData(oracleLinkBalance.value, "LINK")}</p>
            <p> Auto-Withdraw: {flannelAutoWithdraw && formatData(flannelAutoWithdraw.value[4], "LINK")}</p>
            <Input placeholder="Withdraw Amount" type="text" name="newLimit" onChange={updateField} />
            <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateUpdateLimit(withdrawLimitKey.newLimit)} > Withdraw </Button>
          </CardBody>
      </Collapse>
      </Card>
    </div>
  )
}

export default Oracle;
