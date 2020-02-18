
import React, { useState } from "react"
import { Collapse, Button, CardBody, Card, Label, Input } from 'reactstrap';

import './App.css'

const TopUp = (props) => {
  const [stackId, setStackID] = useState(null)
  const [isOpen, setIsOpen] = useState(true);

  const [topUpKey, setTopUpKey] = useState(null);

  const { drizzle, drizzleState } = props

  const updateField = e => {
    setTopUpKey(e.target.value);
  }

  const initiateUniswapTopUp = value => {
    const contract = drizzle.contracts.Flannel
    const stackId = contract.methods["manualLinkToEthTopUp"].cacheSend(value, {
      from: drizzleState.accounts[0],
      gas: 300000
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }

  const toggle = () => setIsOpen(!isOpen);

  return (
    // if it exists, then we display its value
    <div className="section">
    <Card style={{ paddingLeft: '20px'}}>
      <div className="row">
        <div className="col" style={{ paddingTop: '15px' }}><h2> Node Top-Up </h2></div>
        <div className="col-auto"> <Button color="primary" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
      </div>
      <Collapse isOpen={isOpen}>
          <CardBody>
            <Input placeholder="Top-Up Amount" type="text" onChange={updateField} /> 
            <Button color="primary" style={{ marginTop: '15px' }}  onClick={() => initiateUniswapTopUp(topUpKey)} > Convert </Button>
          </CardBody>
      </Collapse>
    </Card>
    </div>
  )
}

export default TopUp;
