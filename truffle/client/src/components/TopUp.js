
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Input, Spinner, FormText } from 'reactstrap';

import '../layout/App.css'

const TopUp = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(false);

  // Contract variable keys
  const [exchangeKey, setExchangeKey] = useState(0);

  // TX keys
  const [stackId, setStackID] = useState(null)

  // User input keys
  const [topUpKey, setTopUpKey] = useState(0);

  // Drizzle / Contract props
  const { drizzle, drizzleState, parameterKey, balanceKey } = props
  const { Flannel } = drizzleState.contracts

  useEffect(() => {
    const flannelContract = drizzle.contracts.Flannel;
    if (isNaN(topUpKey) || topUpKey === 0 || topUpKey === '') {
      setExchangeKey(0);
    } else {
      const exchangeVal = flannelContract.methods.getLinkToEthPrice.cacheCall(topUpKey * 1e18);
      setExchangeKey(exchangeVal);
    }
  }, [drizzle.contracts.Flannel, exchangeKey, topUpKey])

  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {
    setTopUpKey(e.target.value);
  }

  // Transaction alert functions

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

  // Initiate LINK - ETH Uniswap conversion
  const initiateUniswapTopUp = value => {
    const contract = drizzle.contracts.Flannel;
    const fValue = props.formatData(false, value, "", false);

    if(fValue > topUpBalance.value){
      alert('Top-Up amount too high, not enough LINK allocated to function');
    } else {
      const stackId = contract.methods["manualLinkToEthTopUp"].cacheSend(fValue, {
        from: drizzleState.accounts[0],
        gas: 300000
      })
      setStackID(stackId)
    }
  }

  // Cachecall() lookup parameters
  const exchange = Flannel.getLinkToEthPrice[exchangeKey];
  const parameters = Flannel.userStoredParams[parameterKey];
  const topUpBalance = Flannel.topUpBalance[balanceKey.topUp];

  return (
    <div className="section">
      <Card style={{ paddingLeft: '20px' }}>
        <div className="row">
          <div className="col" style={{ paddingTop: '15px' }}><h4> Top-Up </h4> <p> {(topUpBalance && props.formatData(true, topUpBalance.value, "LINK", true))} </p></div>
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
                    <p> When Chainlink node is below <strong> {parameters && props.formatData(true, parameters.value[5], "ETH", false)} </strong>,
                        convert enough LINK to top-up by <strong> {parameters && props.formatData(true, parameters.value[6], "ETH", false)} </strong> </p>
                  </FormGroup>
                </Form>
              </TabPane>
              <TabPane tabId="2">
                  <p></p>
                  <p><strong> Manual Top-Up </strong></p>
                  <p> Convert earned LINK funds to top-up your running Chainlink node with ETH, which is needed to send transactions and fulfill oracle requests.</p>
                <Row>
                  <Col md={6} sm="12" style={{ paddingBottom: '15px' }} >
                    <Input placeholder="LINK Value" type="text" onChange={updateField} />
                  </Col>
                  <Col md={6} style={{ paddingRight: '30px' }}>
                    <Input placeholder="ETH Value" type="text" value={(exchange && props.formatData(true, exchange.value, "ETH", false)) || ''} readOnly />
                    <FormText color="muted"> Uniswap LINK-ETH conversion rate </FormText>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} sm="12" >
                    <Button color="primary" onClick={() => initiateUniswapTopUp(topUpKey)} > Convert </Button>
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

export default TopUp;
