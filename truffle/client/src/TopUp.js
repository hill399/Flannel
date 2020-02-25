
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Input, Alert } from 'reactstrap';

import './App.css'

const TopUp = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(true);
  const [visibleAlert, setVisibleAlert] = useState(true);

  // Contract variable keys
  const [exchangeKey, setExchangeKey] = useState(0);

  // TX keys
  const [stackId, setStackID] = useState(null)

  // User input keys
  const [topUpKey, setTopUpKey] = useState(null);

  // Drizzle / Contract props
  const { drizzle, drizzleState, parameterKey, balanceKey } = props
  const { Flannel } = drizzleState.contracts

  useEffect(() => {
    const flannelContract = drizzle.contracts.Flannel;
    if (isNaN(topUpKey) || topUpKey === 0) {
      console.log(exchangeKey)
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
          Transaction Success - Node has been topped-up!
        </Alert>
      )
    }
  }

  // Initiate LINK - ETH Uniswap conversion
  const initiateUniswapTopUp = value => {
    const contract = drizzle.contracts.Flannel;
    const fValue = props.formatData(false, value, "");
    const stackId = contract.methods["manualLinkToEthTopUp"].cacheSend(fValue, {
      from: drizzleState.accounts[0],
      gas: 300000
    })

    setStackID(stackId)
  }

  // Cachecall() lookup parameters
  const exchange = Flannel.getLinkToEthPrice[exchangeKey];
  const parameters = Flannel.userStoredParams[parameterKey];
  const topUpBalance = Flannel.topUpBalance[balanceKey.topUp];

  return (
    <div className="section">
      <Card style={{ paddingLeft: '20px' }}>
        <div className="row">
        <div className="col" style={{ paddingTop: '15px' }}><p><h4> Top-Up </h4> {(topUpBalance && props.formatData(true, topUpBalance.value, "LINK"))} </p></div>
          <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
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
                    <p> When Chainlink node is below <strong> {parameters && props.formatData(true, parameters.value[5], "ETH")} </strong>,
                        convert enough LINK to top-up by <strong> {parameters && props.formatData(true, parameters.value[6], "ETH")} </strong> </p>
                  </FormGroup>
                </Form>
              </TabPane>
              <TabPane tabId="2">
                <Row style={{ paddingTop: '10px' }}>
                  <Col md={6} sm="12" >
                    <Input placeholder="Manual Top-Up" type="text" onChange={updateField} />
                    <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateUniswapTopUp(topUpKey)} > Convert </Button>
                  </Col>
                  <Col md={6} style={{ paddingRight: '30px' }}>
                    <Input placeholder="ETH Value" type="text" value={exchange && props.formatData(true, exchange.value, "ETH")} readOnly />
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

export default TopUp;
