
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Input, Spinner, FormText } from 'reactstrap';

import '../layout/App.css'

const Earn = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(false);
  const [aLinkBal, setaLinkBal] = useState(null);

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

  // Update Balances
  useEffect(() => {
    const FlannelContract = drizzle.contracts.Flannel;
    const aLinkBalanceKey = FlannelContract.methods["getALinkBalance"].cacheCall();

    setaLinkBal(aLinkBalanceKey);
  }, [drizzle.contracts.Flannel])


  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {

    const re = /^[0-9]{1,2}([.][0-9]{1,2})?$/;

    if (e.target.value === '' || re.test(e.target.value)) {
      aLinkInputKey({
        ...aLinkInputKey,
        [e.target.name]: e.target.value
      });
    }
  }

  // Transaction alert functions

  const getTxStatus = (func) => {
    const { transactions, transactionStack } = drizzleState

    let txHash

    if (func === 0) {
      txHash = transactionStack[stackId.burnId]
    } else {
      txHash = transactionStack[stackId.mintId]
    }

    if (!txHash) return null;

    // otherwise, return the transaction status
    if (transactions[txHash] && transactions[txHash].status === "pending") {
      return (
        <Spinner color="primary" size="sm" style={{ marginLeft: '15px', marginTop: '5px' }} />
      )
    }
  }

  // Initiate a deposit to aLINK

  const initiateDeposit = value => {
    const contract = drizzle.contracts.Flannel
    const fValue = props.formatData(false, value, "", false);

    if (fValue > aaveBalance.value) {
      alert('Deposit amount too high, not enough LINK allocated to function');
    } else {
      const stackId = contract.methods["manualDepositToAave"].cacheSend(fValue, {
        from: drizzleState.accounts[0],
        gas: 300000
      })
      setStackID({
        mintId: stackId
      })

      aLinkInputKey({
        ...aLinkInputKey,
        aLinkDepositValue: ''
      });
    }
  }

  // Initiate a burn on aLINK

  const initiateBurn = value => {
    const contract = drizzle.contracts.Flannel
    const fValue = props.formatData(false, value, "", false);

    if (fValue > aLink.value) {
      alert('Burn amount too high, not enough aLINK in Flannel');
    } else {
      const stackId = contract.methods["manualWithdrawFromAave"].cacheSend(fValue, {
        from: drizzleState.accounts[0],
        gas: 1000000
      })

      setStackID({
        burnId: stackId
      })

      aLinkInputKey({
        ...aLinkInputKey,
        aLinkBurnValue: ''
      });
    }
  }


  // Cachecall() lookup variables
  const aLink = Flannel.getALinkBalance[aLinkBal];
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
                  <FormGroup className="oracle-col">
                    <p> When Earn balance is greater than <strong>{parameters && props.formatData(true, parameters.value[6], "LINK", true)}</strong>,
                        deposit to Aave to generate interest. </p>
                  </FormGroup>
                </Form>
              </TabPane>
              <TabPane tabId="2">
                <Form style={{ paddingTop: '10px' }}>
                  <Row form >
                    <Col md={6}>
                      <FormGroup className="earn-col">
                        <Row>
                          <Col sm="12" style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '15px' }}>
                            <p><strong> Deposit </strong></p>
                            <p> Deposit LINK to mint interest-bearing aLINK, and earn passive income from lending on the Aave network.</p>
                            <Input placeholder="Deposit Amount" name="aLinkDepositValue" value={aLinkInput.aLinkDepositValue} type="text" onChange={updateField} />
                            <FormText color="muted"> Deposit in LINK </FormText>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm="12" style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '10px' }}>
                            <Button color="primary" onClick={() => initiateDeposit(aLinkInput.aLinkDepositValue)} > Deposit </Button>
                            {getTxStatus(1)}
                          </Col>
                        </Row>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="earn-col">
                        <Row>
                          <Col sm="12" style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '15px' }}>
                            <p><strong> Burn </strong></p>
                            <p> Burn aLINK to return LINK tokens to the Flannel contract, and redeem any interest earned from your deposits. </p>
                            <Input placeholder="Burn Amount" name="aLinkBurnValue" value={aLinkInput.aLinkBurnValue} type="text" onChange={updateField} />
                            <FormText color="muted" > Burn in aLINK </FormText>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm="12" style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '10px' }}>
                            <Button color="primary" onClick={() => initiateBurn(aLinkInput.aLinkBurnValue)} > Burn </Button>
                            {getTxStatus(0)}
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