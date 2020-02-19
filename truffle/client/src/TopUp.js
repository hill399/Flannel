
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, Label, Input, Row, Col, Alert } from 'reactstrap';

import './App.css'

const TopUp = (props) => {
  const [stackId, setStackID] = useState(null)
  const [isOpen, setIsOpen] = useState(true);
  const [visibleAlert, setVisibleAlert] = useState(true);

  const [exchangeKey, setExchangeKey] = useState(0);

  const [topUpKey, setTopUpKey] = useState(null);

  const { drizzle, drizzleState } = props
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
  }, [topUpKey])

  const updateField = e => {
    setTopUpKey(e.target.value);
  }

  const initiateUniswapTopUp = value => {
    const contract = drizzle.contracts.Flannel;
    const fValue = props.formatData(false, value, "");
    const stackId = contract.methods["manualLinkToEthTopUp"].cacheSend(fValue, {
      from: drizzleState.accounts[0],
      gas: 300000
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }

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

  const toggle = () => setIsOpen(!isOpen);

  const exchange = Flannel.getLinkToEthPrice[exchangeKey];

  return (
    <div className="section">
      <Card style={{ paddingLeft: '20px' }}>
        <div className="row">
          <div className="col" style={{ paddingTop: '15px' }}><h4> Node Top-Up </h4></div>
          <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
        </div>
        <Collapse isOpen={isOpen}>
          <CardBody>
            <Row>
              <Col md={6} sm="12" >
                <Input placeholder="Manual Top-Up" type="text" onChange={updateField} />
                <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateUniswapTopUp(topUpKey)} > Convert </Button>
              </Col>
              <Col md={6} style={{ paddingRight: '30px' }}>
                <Input placeholder="ETH Value" type="text" value={exchange && props.formatData(true, exchange.value, "ETH")} readOnly/>
              </Col>
              <Col style={{ paddingTop: '5px', paddingRight: "30px" }}>
                <div>{getTxStatus()}</div>
              </Col>
            </Row>
          </CardBody>
        </Collapse>
      </Card>
    </div>
  )
}

export default TopUp;
