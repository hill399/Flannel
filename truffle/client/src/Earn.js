
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Input, Alert, FormText } from 'reactstrap';

import './App.css'

const Earn = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [activeTabTwo, setActiveTabTwo] = useState('1');
  const [isOpen, setIsOpen] = useState(false);
  const [visibleAlert, setVisibleAlert] = useState(true);

  // TX keys
  const [stackId, setStackID] = useState({
    burnId: '',
    mintId: ''
  })

  // User Input Keys
  const [aLinkInput, aLinkInputKey] = useState({
    aLinkDepositValue: '',
    aLinkBurnValue: ''
  })

  // Drizzle / Contract props
  const { drizzle, drizzleState, parameterKey, balanceKey } = props
  const { Flannel } = drizzleState.contracts


  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const tabToggleTwo = tab => {
    if (activeTabTwo !== tab) setActiveTabTwo(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {
    aLinkInputKey({
      ...aLinkInputKey,
      [e.target.name]: e.target.value
    });
  }

  // Transaction alert functions

  const onDismiss = () => setVisibleAlert(false);

  const getTxStatus = (func) => {
    const { transactions, transactionStack } = drizzleState

    let txHash

    if (func === 0) {
      txHash = transactionStack[stackId.burnId]
    } else {
      txHash = transactionStack[stackId.mintId]
    }

    if (!txHash) return null;

    if (transactions[txHash] && transactions[txHash].status === "success") {
      return (
        <Alert color="success" isOpen={visibleAlert} toggle={onDismiss}>
          Transaction Success - Aave function complete!
        </Alert>
      )
    }
  }

  // Initiate a deposit to aLINK

  const initiateDeposit = value => {
    const contract = drizzle.contracts.Flannel
    const fValue = props.formatData(false, value, "", false);
    const stackId = contract.methods["manualDepositToAave"].cacheSend(fValue, {
      from: drizzleState.accounts[0],
      gas: 300000
    })

    setStackID({
      mintId: stackId
    })
  }

  // Initiate a burn on aLINK

  const initiateBurn = value => {
    const contract = drizzle.contracts.Flannel
    const fValue = props.formatData(false, value, "", false);
    const stackId = contract.methods["manualWithdrawFromAave"].cacheSend(fValue, {
      from: drizzleState.accounts[0],
      gas: 1000000
    })

    setStackID({
      burnId: stackId
    })
  }


  // Cachecall() lookup variables
  const parameters = Flannel.userStoredParams[parameterKey]
  const aaveBalance = Flannel.aaveBalance[balanceKey.earn]

  return (
    <div className="section">
      <Card style={{ paddingLeft: '20px' }}>
        <div className="row">
          <div className="col" style={{ paddingTop: '15px' }}><h4> Earn </h4> <p> {(aaveBalance && props.formatData(true, aaveBalance.value, "LINK", true))} </p></div>
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
                  <FormGroup className="oracle-col">
                    <p> When Earn balance is greater than <strong>{parameters && props.formatData(true, parameters.value[6], "LINK", true)}</strong>,
                        deposit to Aave to generate interest. </p>
                  </FormGroup>
                </Form>
              </TabPane>
              <TabPane tabId="2">
                <Form>
                  <Row form >
                    <Col md={6}>
                      <FormGroup className="earn-col">
                        <Row>
                          <Col sm="12" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                            <p><strong> Deposit </strong></p>
                            <Input placeholder="Deposit Amount" name="aLinkDepositValue" type="text" onChange={updateField} />
                            <FormText color="muted"> Deposit in LINK </FormText>
                            <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateDeposit(aLinkInput.aLinkDepositValue)} > Deposit </Button>
                          </Col>
                          <Col style={{ paddingTop: '5px', paddingRight: "30px" }}>
                            <div>{getTxStatus(1)}</div>
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="earn-col">
                        <Row>
                          <Col sm="12" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                            <p><strong> Burn </strong></p>
                            <Input placeholder="Burn Amount" name="aLinkBurnValue" type="text" onChange={updateField} />
                            <FormText color="muted" > Burn in aLINK </FormText>
                            <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateBurn(aLinkInput.aLinkBurnValue)} > Burn </Button>
                          </Col>
                          <Col style={{ paddingTop: '5px', paddingRight: "30px" }}>
                            <div>{getTxStatus(0)}</div>
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </TabPane>
            </TabContent>
          </CardBody>
        </Collapse>
      </Card>
    </div>
  )
}

export default Earn;


/* <div className="section">
  <Card style={{ paddingLeft: '20px' }}>
    <div className="row">
      <div className="col" style={{ paddingTop: '15px' }}><h4> Earn </h4> <p> {(aaveBalance && props.formatData(true, aaveBalance.value, "LINK", true))} </p></div>
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
              <FormGroup className="oracle-col">
                <p> When Earn balance is greater than <strong>{parameters && props.formatData(true, parameters.value[6], "LINK", true)}</strong>,
                  deposit to Aave to generate interest. </p>
              </FormGroup>
            </Form>
          </TabPane>
          <TabPane tabId="2">
            <Nav tabs>
              <NavItem>
                <NavLink onClick={() => { tabToggleTwo('1'); }} >
                  Deposit
              </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggleTwo('2'); }} >
                  Burn
              </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTabTwo}>
              <TabPane tabId="1">
                <Row>
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <p></p>
                    <Input placeholder="Deposit Amount" name="aLinkDepositValue" type="text" onChange={updateField} />
                    <FormText color="muted"> Deposit in LINK </FormText>
                    <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateDeposit(aLinkInput.aLinkDepositValue)} > Deposit </Button>
                  </Col>
                  <Col style={{ paddingTop: '5px', paddingRight: "30px" }}>
                    <div>{getTxStatus(1)}</div>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <p></p>
                    <Input placeholder="Burn Amount" name="aLinkBurnValue" type="text" onChange={updateField} />
                    <FormText color="muted"> Burn in aLINK </FormText>
                    <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateBurn(aLinkInput.aLinkBurnValue)} > Burn </Button>
                  </Col>
                  <Col style={{ paddingTop: '5px', paddingRight: "30px" }}>
                    <div>{getTxStatus(0)}</div>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </TabPane>
        </TabContent>
      </CardBody>
    </Collapse>
  </Card>
</div> */