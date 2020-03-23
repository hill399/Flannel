
import React, { useState } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Input, Spinner, FormText } from 'reactstrap';

import '../layout/App.css'

const Oracle = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(true);

  // Contract variable keys
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // TX keys
  const [stackId, setStackID] = useState(null);

  // Drizzle / Contract props
  const { drizzle, drizzleState, parameterKey, extBalances, validateInput } = props
  const { Flannel } = drizzleState.contracts

  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {
    setWithdrawAmount(e.target.value);
  }

  const getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = drizzleState

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[stackId]

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    if (transactions[txHash] && transactions[txHash].status === "pending") {
      return (
        <Spinner color="primary" size="sm" style={{ marginLeft: '15px', marginTop: '5px' }} />
      )
    }
  }

  // Initiate an withdrawal from Oracle contract

  const initiateManualWithdraw = (value) => {
    if (validateInput(value)) {
      const fValue = props.formatData(false, value, "", false);
      const contract = drizzle.contracts.Flannel;

      if (fValue > oracleLinkBalance) {
        alert('Withdraw amount too high, not enough LINK in Oracle contract');
      } else {
        const stackId = contract.methods["manualWithdrawFromOracle"].cacheSend(fValue, {
          from: drizzleState.accounts[0],
          gas: 300000
        })
        setStackID(stackId);

        setWithdrawAmount('');
      }
    } else {
      alert('Invalid Withdraw Amount');
    }
  }

  // Cachecall() lookup variables
  const oracleLinkBalance = extBalances.oracle;
  const parameters = Flannel.userStoredParams[parameterKey]

  return (
    <div className="section">
      <Card style={{ paddingLeft: '15px' }}>
        <div className="row">
          <div className="col" style={{ paddingTop: '15px' }}><h4> Oracle </h4> <p> {props.formatData(true, oracleLinkBalance, "LINK", true)} </p></div>
          <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} className="button-sh" >&#709;</Button></div>
        </div>
        <Collapse isOpen={isOpen}>
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink onClick={() => { tabToggle('1'); }} style={parseInt(activeTab) === 1 ? { borderBottomColor: '#0b0bde', borderBottomWidth: '3px' } : null} >
                  Auto
              </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('2'); }} style={parseInt(activeTab) === 2 ? { borderBottomColor: '#0b0bde', borderBottomWidth: '3px' } : null} >
                  Manual
              </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Form style={{ paddingTop: '10px' }}>
                  <FormGroup className="oracle-col" >
                    <p>Oracle Withdrawals will trigger when <strong> {parameters && props.formatData(true, parameters.value[4], "LINK", false)} </strong> has been earned </p>
                  </FormGroup>
                  <Row form >
                    <Col md={4}>
                      <FormGroup className="oracle-col">
                        <p>STORE</p>
                        <strong> {parameters && parameters.value[1]} % </strong>
                        <p></p>
                        <p> Store LINK within Flannel </p>
                        <p></p>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="oracle-col">
                        <p>EARN</p>
                        <strong> {parameters && parameters.value[2]} % </strong>
                        <p></p>
                        <p> Allocate LINK to generate interest </p>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="oracle-col">
                        <p>TOP-UP</p>
                        <strong> {parameters && parameters.value[3]} % </strong>
                        <p></p>
                        <p> Keep your node topped-up </p>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </TabPane>
              <TabPane tabId="2">
                <p></p>
                <p><strong> Manual Oracle Withdraw </strong></p>
                <p> Initiate a withdrawal from your Oracle contract, to distribute within Flannel and access its additional features. </p>
                <Row >
                  <Col sm="12" style={{ paddingRight: '30px', paddingBottom: '15px' }}>
                    <Input placeholder="Withdraw Amount" type="text" name="withdrawAmount" value={withdrawAmount} onChange={updateField} />
                    <FormText color="muted"> Withdraw in LINK </FormText>
                  </Col>
                </Row>
                <Row >
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <Button color="primary" onClick={() => initiateManualWithdraw(withdrawAmount)} > Withdraw </Button>
                    {getTxStatus()}
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

export default Oracle;
