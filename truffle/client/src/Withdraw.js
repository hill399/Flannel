
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Input } from 'reactstrap';

import './App.css'

const Withdraw = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(false);

  // TX keys
  const [stackId, setStackID] = useState({
    withdrawId: '',
    rebalanceId: ''
  })

  // User input keys
  const [withdrawKey, setWithdrawKey] = useState({
    withdrawParam: '',
    withdrawValue: '',
    rebalanceTo: '',
    rebalanceFrom: '',
    rebalanceAmount: ''
  })

  // Drizzle / Contract props
  const { drizzle, drizzleState, balanceKey } = props
  const { Flannel } = drizzleState.contracts

  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {
    setWithdrawKey({
      ...withdrawKey,
      [e.target.name]: e.target.value
    });
  }

  // Initiate a withdraw from Flannel contract

  const initiateWithdraw = (from, value) => {
    const contract = drizzle.contracts.Flannel;
    const fValue = props.formatData(false, value, "", false);
    const stackId = contract.methods["withdrawFromFlannel"].cacheSend(from, fValue, {
      from: drizzleState.accounts[0]
    })

    setStackID({
      withdrawId: stackId
    })
  }

  const initiateRebalance = (to, from, value) => {
    const contract = drizzle.contracts.Flannel;
    const fValue = props.formatData(false, value, "", false);
    const stackId = contract.methods["rebalance"].cacheSend(to, from, fValue, {
      from: drizzleState.accounts[0]
    })

    setStackID({
      rebalanceId: stackId
    })
  }

  // Cachecall() lookup variables
  const storeBalance = Flannel.storeBalance[balanceKey.store];
  const aaveBalance = Flannel.aaveBalance[balanceKey.earn];
  const topUpBalance = Flannel.topUpBalance[balanceKey.topUp];

  return (
    <div className="section">
      <Card style={{ paddingLeft: '15px' }}>
        <div className="row">
          <div className="col" style={{ paddingTop: '15px' }}><h4> Withdraw & Rebalance </h4></div>
          <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle}  className="button-sh" >&#709;</Button></div>
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
                      <option value={0}> Store Balance  ({storeBalance && props.formatData(true, storeBalance.value, "LINK", false)}{' '} Available) </option>
                      <option value={1}> Aave Balance  ({aaveBalance && props.formatData(true, aaveBalance.value, "LINK", false)}{' '} Available) </option>
                      <option value={2}> Top-Up Balance ({topUpBalance && props.formatData(true, topUpBalance.value, "LINK", false)}{' '} Available)</option>
                    </Input>
                    <p></p>
                    <Input placeholder="Withdraw Amount" type="text" name="withdrawValue" onChange={updateField} />
                    <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateWithdraw(withdrawKey.storeWithdraw, 0)} > Withdraw </Button>
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
                          <option value={0}> Store Balance  ({storeBalance && props.formatData(true, storeBalance.value, "LINK", false)}{' '} Available) </option>
                          <option value={1}> Aave Balance  ({aaveBalance && props.formatData(true, aaveBalance.value, "LINK", false)}{' '} Available) </option>
                          <option value={2}> Top-Up Balance ({topUpBalance && props.formatData(true, topUpBalance.value, "LINK", false)}{' '} Available)</option>
                        </Input>
                        <p></p>
                        <Input type="select" name="rebalanceTo" id="rebalanceTo" onClick={updateField}>
                          <option > To...</option>
                          <option value={0}> Store Balance  ({storeBalance && props.formatData(true, storeBalance.value, "LINK", false)}{' '} Available) </option>
                          <option value={1}> Aave Balance  ({aaveBalance && props.formatData(true, aaveBalance.value, "LINK", false)}{' '} Available) </option>
                          <option value={2}> Top-Up Balance ({topUpBalance && props.formatData(true, topUpBalance.value, "LINK", false)}{' '} Available)</option>
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
