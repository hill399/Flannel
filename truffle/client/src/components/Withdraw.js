
import React, { useState } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Spinner, Input } from 'reactstrap';

import '../layout/App.css'

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
  const { drizzle, drizzleState, balanceKey, validateInput } = props
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

  const getTxStatus = (func) => {
    const { transactions, transactionStack } = drizzleState

    let txHash

    if (func === 0) {
      txHash = transactionStack[stackId.withdrawId]
    } else {
      txHash = transactionStack[stackId.rebalanceId]
    }

    if (!txHash) return null;

    // otherwise, return the transaction status
    if (transactions[txHash] && transactions[txHash].status === "pending") {
      return (
        <Spinner color="primary" size="sm" style={{ marginLeft: '15px', marginTop: '5px' }} />
      )
    }
  }

  // Initiate a withdraw from Flannel contract

  const initiateWithdraw = (from, value) => {
    if (validateInput(value)) {
      const contract = drizzle.contracts.Flannel;
      const fValue = props.formatData(false, value, "", false);
      const stackId = contract.methods["withdrawFromFlannel"].cacheSend(from, fValue, {
        from: drizzleState.accounts[0]
      })

      setStackID({
        withdrawId: stackId
      })

      setWithdrawKey({
        ...withdrawKey,
        withdrawValue: ''
      });
    } else {
      alert('Invalid Withdraw Amount');
    }
  }

  const initiateRebalance = (to, from, value) => {
    if (validateInput(value)) {
      const contract = drizzle.contracts.Flannel;
      const fValue = props.formatData(false, value, "", false);
      const stackId = contract.methods["rebalance"].cacheSend(to, from, fValue, {
        from: drizzleState.accounts[0]
      })

      setStackID({
        rebalanceId: stackId
      })

      setWithdrawKey({
        ...withdrawKey,
        rebalanceAmount: ''
      });
    } else {
      alert('Invalid Rebalance Amount');
    }
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
          <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} className="button-sh" >&#709;</Button></div>
        </div>
        <Collapse isOpen={isOpen}>
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink onClick={() => { tabToggle('1'); }} style={parseInt(activeTab) === 1 ? { borderBottomColor: '#0b0bde', borderBottomWidth: '3px' } : null} >
                  Withdraw
              </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('2'); }} style={parseInt(activeTab) === 2 ? { borderBottomColor: '#0b0bde', borderBottomWidth: '3px' } : null} >
                  Rebalance
              </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Col sm="12" style={{ paddingRight: '30px', paddingBottom: '15px' }}>
                    <p></p>
                    <p><strong> Withdraw From Flannel </strong></p>
                    <p> Withdraw LINK from the Flannel contract directly to the owner. </p>
                    <Input type="select" name="withdrawParam" id="withdrawParam" onClick={updateField}>
                      <option> From... </option>
                      <option value={0}> Store Balance  ({storeBalance && props.formatData(true, storeBalance.value, "LINK", false)}{' '} Available) </option>
                      <option value={1}> Earn Balance  ({aaveBalance && props.formatData(true, aaveBalance.value, "LINK", false)}{' '} Available) </option>
                      <option value={2}> Top-Up Balance ({topUpBalance && props.formatData(true, topUpBalance.value, "LINK", false)}{' '} Available)</option>
                    </Input>
                    <p></p>
                    <Input placeholder="Withdraw Amount" type="text" name="withdrawValue" value={withdrawKey.withdrawValue} onChange={updateField} />
                  </Col>
                </Row>
                <Row>
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <Button color="primary" onClick={() => initiateWithdraw(withdrawKey.withdrawParam, withdrawKey.withdrawValue)} > Withdraw </Button>
                    {getTxStatus(0)}
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <p></p>
                    <p><strong> Rebalance Flannel Functions </strong></p>
                    <p> Reallocate LINK deposits between Flannel functions to better suit your requirements. </p>
                    <Form>
                      <FormGroup>
                        <Input type="select" name="rebalanceFrom" id="rebalanceFrom" onClick={updateField}>
                          <option > From... </option>
                          <option value={0}> Store Balance  ({storeBalance && props.formatData(true, storeBalance.value, "LINK", false)}{' '} Available) </option>
                          <option value={1}> Earn Balance  ({aaveBalance && props.formatData(true, aaveBalance.value, "LINK", false)}{' '} Available) </option>
                          <option value={2}> Top-Up Balance ({topUpBalance && props.formatData(true, topUpBalance.value, "LINK", false)}{' '} Available)</option>
                        </Input>
                        <p></p>
                        <Input type="select" name="rebalanceTo" id="rebalanceTo" onClick={updateField}>
                          <option > To...</option>
                          <option value={0}> Store Balance  ({storeBalance && props.formatData(true, storeBalance.value, "LINK", false)}{' '} Available) </option>
                          <option value={1}> Earn Balance  ({aaveBalance && props.formatData(true, aaveBalance.value, "LINK", false)}{' '} Available) </option>
                          <option value={2}> Top-Up Balance ({topUpBalance && props.formatData(true, topUpBalance.value, "LINK", false)}{' '} Available)</option>
                        </Input>
                        <p></p>
                        <Input placeholder="Rebalance Amount" type="text" name="rebalanceAmount" value={withdrawKey.rebalanceAmount} onChange={updateField} />
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>
                <Row>
                  <Col sm="12">
                    <Button color="primary" onClick={() => initiateRebalance(withdrawKey.rebalanceTo, withdrawKey.rebalanceFrom, withdrawKey.rebalanceAmount)}> Rebalance </Button>
                    {getTxStatus(1)}
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
