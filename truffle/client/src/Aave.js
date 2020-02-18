
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Input } from 'reactstrap';

import './App.css'

const Aave = (props) => {
  const [aLinkBalanceKey, setaLinkBalanceKey] = useState(null)
  const [activeTab, setActiveTab] = useState('1');

  const [stackId, setStackID] = useState(null)
  const [isOpen, setIsOpen] = useState(true);

  const { drizzle, drizzleState } = props
  const { AToken } = drizzleState.contracts

  const [aLinkInput, aLinkInputKey] = useState({
    aLinkDepositValue: '',
    aLinkBurnValue: ''
  })

  useEffect(() => {
    const ATokenContract = drizzle.contracts.AToken
    const aLinkBalanceKey = ATokenContract.methods.balanceOf.cacheCall(drizzle.contracts.Flannel.address)
    setaLinkBalanceKey(aLinkBalanceKey)
  }, [aLinkBalanceKey, drizzle.contracts.AToken, drizzle.contracts.Flannel])

  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const updateField = e => {
    aLinkInputKey({
      ...aLinkInputKey,
      [e.target.name]: e.target.value
    });
  }

  const formatData = (data, symbol) => {
    return (
      String(data / 1e18) + " " + (symbol)
    )
  }

  const initiateDeposit = value => {
    const contract = drizzle.contracts.Flannel
    const stackId = contract.methods["manualDepositToAave"].cacheSend(value, {
      from: drizzleState.accounts[0],
      gas: 300000
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }

  const initiateBurn = value => {
    const contract = drizzle.contracts.Flannel
    const stackId = contract.methods["manualWithdrawFromAave"].cacheSend(value, {
      from: drizzleState.accounts[0],
      gas: 1000000
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }

  const toggle = () => setIsOpen(!isOpen);

  const aLinkBalance = AToken.balanceOf[aLinkBalanceKey]

  return (
    <div className="section">
      <Card style={{ paddingLeft: '20px'}}>
      <div className="row">
        <div className="col" style={{ paddingTop: '15px' }}><h2> Aave Deposits </h2></div>
        <div className="col-auto"> <Button color="primary" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
      </div>
      <Collapse isOpen={isOpen}>

          <CardBody>
            <p> aLINK Balance: {aLinkBalance && formatData(aLinkBalance.value, "aLINK")}</p>
            <Nav tabs>
              <NavItem>
                <NavLink onClick={() => { tabToggle('1'); }} >
                  Deposit
          </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('2'); }} >
                  Burn
          </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Col sm="12">
                    <p></p>
                    <Input placeholder="Deposit Amount" name="aLinkDepositValue" type="text" onChange={updateField} /> 
                    <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateDeposit(aLinkInput.aLinkDepositValue)} > Deposit </Button>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col sm="12">
                    <p></p>
                    <Input placeholder="Burn Amount" name="aLinkBurnValue" type="text" onChange={updateField} /> 
                    <Button color="primary" style={{ marginTop: '15px' }}  onClick={() => initiateBurn(aLinkInput.aLinkBurnValue)} > Burn </Button>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </CardBody>
      </Collapse>
      </Card>
    </div>
  )
}

export default Aave;
