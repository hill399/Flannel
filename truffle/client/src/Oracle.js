
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Input, Alert, FormText } from 'reactstrap';

import './App.css'

const Oracle = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(true);
  const [visibleAlert, setVisibleAlert] = useState(true);

  // Contract variable keys
  const [withdrawLimitKey, setWithdrawLimitKey] = useState({
    oracleLinkBalance: '',
    newLimit: ''
  })

  // TX keys
  const [stackId, setStackID] = useState(null);

  // Drizzle / Contract props
  const { drizzle, drizzleState, parameterKey } = props
  const { Flannel, LinkTokenInterface } = drizzleState.contracts

  // Update effects
  useEffect(() => {
    const linkTokenContract = drizzle.contracts.LinkTokenInterface
    const oracleLinkBalanceKey = linkTokenContract.methods.balanceOf.cacheCall(drizzle.contracts.Oracle.address)

    setWithdrawLimitKey({
      ...withdrawLimitKey,
      oracleLinkBalance: oracleLinkBalanceKey,
    })

  }, [drizzleState, drizzle.contracts.Oracle.address, drizzle.contracts.LinkTokenInterface])

  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {
    setWithdrawLimitKey({
      ...withdrawLimitKey,
      [e.target.name]: e.target.value
    });
  }

  // Transaction alert functions
  const onDismiss = () => setVisibleAlert(false);

  const getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = drizzleState

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[stackId]

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    if (transactions[txHash] && transactions[txHash].status === "success") {
      return (
        <Alert color="success" isOpen={visibleAlert} toggle={onDismiss}>
          Transaction Success - Balance has been distributed!
        </Alert>
      )
    }
  }

  // Initiate an withdrawal from Oracle contract

  const initiateUpdateLimit = (value) => {
    const contract = drizzle.contracts.Flannel;
    const fValue = props.formatData(false, value, "", false);
    const stackId = contract.methods["manualWithdrawFromOracle"].cacheSend(fValue, {
      from: drizzleState.accounts[0],
      gas: 300000
    })
    setStackID(stackId)
  }


  // Cachecall() lookup variables
  const oracleLinkBalance = LinkTokenInterface.balanceOf[withdrawLimitKey.oracleLinkBalance]
  const parameters = Flannel.userStoredParams[parameterKey]

  return (
    <div className="section">
      <Card style={{ paddingLeft: '15px' }}>
        <div className="row">
          <div className="col" style={{ paddingTop: '15px' }}><h4> Oracle </h4> <p> {(oracleLinkBalance && props.formatData(true, oracleLinkBalance.value, "LINK", true))} </p></div>
          <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} className="button-sh" >&#709;</Button></div>
        </div>
        <Collapse isOpen={isOpen}>
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink onClick={() => { tabToggle('1'); }} >
                  Auto
              </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('2'); }} >
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
                <Row style={{ paddingTop: '10px' }}>
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <Input placeholder="Withdraw Amount" type="text" name="newLimit" onChange={updateField} />
                    <FormText color="muted"> Withdraw in LINK </FormText>
                    <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateUpdateLimit(withdrawLimitKey.newLimit)} > Withdraw </Button>
                  </Col>
                  <Col style={{ paddingTop: '5px', paddingRight: "30px" }}>
                    <div>{getTxStatus()}</div>
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
