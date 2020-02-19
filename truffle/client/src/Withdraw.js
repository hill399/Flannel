
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Input, Label } from 'reactstrap';

import './App.css'

const Withdraw = (props) => {
  const [storeBalanceKey, setStoreBalanceKey] = useState(null)
  const [aaveBalanceKey, setAaveBalanceKey] = useState(null)
  const [topUpBalanceKey, setTopUpBalanceKey] = useState(null)

  const [activeTab, setActiveTab] = useState('1');

  const [withdrawKey, setWithdrawKey] = useState({
    withdrawParam: '',
    withdrawValue: '',
    rebalanceTo: '',
    rebalanceFrom: '',
    rebalanceAmount: ''
  })

  const [stackId, setStackID] = useState(null)

  const [isOpen, setIsOpen] = useState(true);

  const { drizzle, drizzleState } = props
  const { Flannel } = drizzleState.contracts

  useEffect(() => {
    const flannelContract = drizzle.contracts.Flannel;
    const storeBalanceKey = flannelContract.methods["storeBalance"].cacheCall()
    const aaveBalanceKey = flannelContract.methods["aaveBalance"].cacheCall()
    const topUpBalanceKey = flannelContract.methods["topUpBalance"].cacheCall()
    setStoreBalanceKey(storeBalanceKey)
    setAaveBalanceKey(aaveBalanceKey)
    setTopUpBalanceKey(topUpBalanceKey)
  }, [storeBalanceKey, aaveBalanceKey, topUpBalanceKey, drizzle.contracts.Flannel])

  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const updateField = e => {
    setWithdrawKey({
      ...withdrawKey,
      [e.target.name]: e.target.value
    });
  }

  const initiateWithdraw = (from, value) => {
    const contract = drizzle.contracts.Flannel;
    const fValue = props.formatData(false, value, "");
    const stackId = contract.methods["withdrawFromFlannel"].cacheSend(from, fValue, {
      from: drizzleState.accounts[0]
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }

  const initiateRebalance = (to, from, value) => {
    const contract = drizzle.contracts.Flannel;
    const fValue = props.formatData(false, value, "");
    const stackId = contract.methods["rebalance"].cacheSend(to, from, fValue, {
      from: drizzleState.accounts[0]
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }

  const toggle = () => setIsOpen(!isOpen);

  const storeBalance = Flannel.storeBalance[storeBalanceKey]
  const aaveBalance = Flannel.aaveBalance[aaveBalanceKey]
  const topUpBalance = Flannel.topUpBalance[topUpBalanceKey]

  return (
    <div className="section">
            <Card style={{ paddingLeft: '15px'}}>
      <div className="row">
        <div className="col" style={{ paddingTop: '15px' }}><h4> Withdraw & Rebalance </h4></div>
        <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
      </div>
      <Collapse isOpen={isOpen}>
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink onClick={() => { tabToggle('1'); }} >
                  Withdraw
          </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('2'); }} >
                  Rebalance
          </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <p></p>
                    <Input type="select" name="withdrawParam" id="withdrawParam" onClick={updateField}>
                      <option> From... </option>
                      <option value={0}> Store Balance  ({storeBalance && props.formatData(true, storeBalance.value, "LINK")}{' '} Available) </option>
                      <option value={1}> Aave Balance  ({aaveBalance && props.formatData(true, aaveBalance.value, "LINK")}{' '} Available) </option>
                      <option value={2}> Top-Up Balance ({topUpBalance && props.formatData(true, topUpBalance.value, "LINK")}{' '} Available)</option>
                    </Input>
                    <p></p>
                    <Input placeholder="Withdraw Amount" type="text" name="withdrawValue" onChange={updateField} />
                    <Button color="primary" style={{ marginTop: '15px' }}  onClick={() => initiateWithdraw(withdrawKey.storeWithdraw, 0)} > Withdraw </Button>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col sm="12">
                    <p></p>
                    <Form>
                      <FormGroup>
                        <Input type="select" name="rebalanceFrom" id="rebalanceFrom" onClick={updateField}>
                          <option > From... </option>
                          <option value={0}> Store Balance  ({storeBalance && props.formatData(true, storeBalance.value, "LINK")}{' '} Available) </option>
                          <option value={1}> Aave Balance  ({aaveBalance && props.formatData(true, aaveBalance.value, "LINK")}{' '} Available) </option>
                          <option value={2}> Top-Up Balance ({topUpBalance && props.formatData(true, topUpBalance.value, "LINK")}{' '} Available)</option>
                        </Input>
                        <p></p>
                        <Input type="select" name="rebalanceTo" id="rebalanceTo" onClick={updateField}>
                          <option > To...</option>
                          <option value={0}> Store Balance  ({storeBalance && props.formatData(true, storeBalance.value, "LINK")}{' '} Available) </option>
                          <option value={1}> Aave Balance  ({aaveBalance && props.formatData(true, aaveBalance.value, "LINK")}{' '} Available) </option>
                          <option value={2}> Top-Up Balance ({topUpBalance && props.formatData(true, topUpBalance.value, "LINK")}{' '} Available)</option>
                        </Input>
                        <p></p>
                        <Input placeholder="Rebalance Amount" type="text" name="rebalanceAmount" onChange={updateField} />
                        <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateRebalance(withdrawKey.rebalanceTo, withdrawKey.rebalanceFrom, withdrawKey.rebalanceAmount)}> Rebalance </Button>
                      </FormGroup>
                    </Form>
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

export default Withdraw;
