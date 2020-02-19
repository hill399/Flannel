
import React, { useState, useEffect } from "react"
import { Alert, Collapse, Button, CardBody, Card, Input, Row, Col } from 'reactstrap';

import './App.css'

const Oracle = (props) => {
  const [withdrawLimitKey, setWithdrawLimitKey] = useState({
    oracleLinkBalance: '',
    autoWithdrawLimit: '',
    newLimit: ''
  })

  const [isOpen, setIsOpen] = useState(true);
  const [visibleAlert, setVisibleAlert] = useState(true);

  const [stackId, setStackID] = useState(null)

  const { drizzle, drizzleState } = props
  const { Flannel, LinkTokenInterface } = drizzleState.contracts

  useEffect(() => {
    const linkTokenContract = drizzle.contracts.LinkTokenInterface
    const flannelContract = drizzle.contracts.Flannel
    const oracleLinkBalanceKey = linkTokenContract.methods.balanceOf.cacheCall(drizzle.contracts.Oracle.address)
    const autoWithdrawLimitKey = flannelContract.methods.userStoredParams.cacheCall()

    setWithdrawLimitKey({
      ...withdrawLimitKey,
      oracleLinkBalance: oracleLinkBalanceKey,
      autoWithdrawLimit: autoWithdrawLimitKey
    })

  }, [withdrawLimitKey.oracleLinkBalance, drizzle.contracts.LinkTokenInterface, drizzle.contracts.Flannel])

  const updateField = e => {
    setWithdrawLimitKey({
      ...withdrawLimitKey,
      [e.target.name]: e.target.value
    });
  }

  const initiateUpdateLimit = (value) => {
    const contract = drizzle.contracts.Flannel;
    const fValue = props.formatData(false, value, "");
    const stackId = contract.methods["manualWithdrawFromOracle"].cacheSend(fValue, {
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
          Transaction Success - Balance has been distributed!
        </Alert>
      )
    }
  }

  const toggle = () => setIsOpen(!isOpen);

  const oracleLinkBalance = LinkTokenInterface.balanceOf[withdrawLimitKey.oracleLinkBalance]
  const flannelAutoWithdraw = Flannel.userStoredParams[withdrawLimitKey.autoWithdrawLimit]

  return (
    <div className="section">
      <Card style={{ paddingLeft: '20px' }}>
        <div className="row">
          <div className="col" style={{ paddingTop: '15px' }}><h4> Oracle </h4></div>
          <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
        </div>
        <Collapse isOpen={isOpen}>
          <CardBody>
            <Row>
              <Col sm="12" style={{ paddingRight: '30px' }}>
                <p> Current Oracle Balance: {oracleLinkBalance && props.formatData(true, oracleLinkBalance.value, "LINK")}</p>
                <p> Auto-Withdraw: {flannelAutoWithdraw && props.formatData(true, flannelAutoWithdraw.value[4], "LINK")}</p>
                <Input placeholder="Withdraw Amount" type="text" name="newLimit" onChange={updateField} />
                <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateUpdateLimit(withdrawLimitKey.newLimit)} > Withdraw </Button>
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

export default Oracle;
