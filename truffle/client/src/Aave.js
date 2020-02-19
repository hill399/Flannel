
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Input, Alert} from 'reactstrap';

import './App.css'

const Aave = (props) => {
  const [aLinkBalanceKey, setaLinkBalanceKey] = useState(null)
  const [activeTab, setActiveTab] = useState('1');
  const [visibleAlert, setVisibleAlert] = useState(true);

  const [stackId, setStackID] = useState({
    burnId: '',
    mintId: ''
  })
  const [isOpen, setIsOpen] = useState(true);

  const { drizzle, drizzleState } = props
  const { AToken } = drizzleState.contracts

  const [aLinkInput, aLinkInputKey] = useState({
    aLinkDepositValue: '',
    aLinkBurnValue: ''
  })

  useEffect(() => {
    const ATokenContract = drizzle.contracts.AToken
    const aLinkBalanceKey = ATokenContract.methods.balanceOf.cacheCall(drizzle.contracts.Flannel.address)
    setaLinkBalanceKey(aLinkBalanceKey)
  }, [aLinkBalanceKey, drizzle.contracts.AToken, drizzle.contracts.Flannel])

  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const updateField = e => {
    aLinkInputKey({
      ...aLinkInputKey,
      [e.target.name]: e.target.value
    });
  }

  const onDismiss = () => setVisibleAlert(false);

  const getTxStatus = (func) => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = drizzleState

    let txHash

    if (func === 0) {
      txHash = transactionStack[stackId.burnId]
    } else {
      txHash = transactionStack[stackId.mintId]
    }

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    if (transactions[txHash] && transactions[txHash].status === "success") {
      return (
        <Alert color="success" isOpen={visibleAlert} toggle={onDismiss}>
          Transaction Success - Aave function complete!
        </Alert>
      )
    }
  }

  const initiateDeposit = value => {
    const contract = drizzle.contracts.Flannel
    const fValue = props.formatData(false, value, "");
    const stackId = contract.methods["manualDepositToAave"].cacheSend(fValue, {
      from: drizzleState.accounts[0],
      gas: 300000
    })
    // save the `stackId` for later reference
    setStackID({
      mintId: stackId
    })
  }

  const initiateBurn = value => {
    const contract = drizzle.contracts.Flannel
    const fValue = props.formatData(false, value, "");
    const stackId = contract.methods["manualWithdrawFromAave"].cacheSend(fValue, {
      from: drizzleState.accounts[0],
      gas: 1000000
    })
    // save the `stackId` for later reference
    setStackID({
      burnId: stackId
    })
  }

  const toggle = () => setIsOpen(!isOpen);

  const aLinkBalance = AToken.balanceOf[aLinkBalanceKey]

  return (
    <div className="section">
      <Card style={{ paddingLeft: '20px'}}>
      <div className="row">
        <div className="col" style={{ paddingTop: '15px' }}><h4> Aave Deposits </h4></div>
        <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
      </div>
      <Collapse isOpen={isOpen}>

          <CardBody>
            <p> aLINK Balance: {aLinkBalance && props.formatData(true, aLinkBalance.value, "aLINK")}</p>
            <Nav tabs>
              <NavItem>
                <NavLink onClick={() => { tabToggle('1'); }} >
                  Deposit
          </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('2'); }} >
                  Burn
          </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <p></p>
                    <Input placeholder="Deposit Amount" name="aLinkDepositValue" type="text" onChange={updateField} /> 
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
                    <Button color="primary" style={{ marginTop: '15px' }}  onClick={() => initiateBurn(aLinkInput.aLinkBurnValue)} > Burn </Button>
                  </Col>
                  <Col style={{ paddingTop: '5px', paddingRight: "30px" }}>
                    <div>{getTxStatus(0)}</div>
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

export default Aave;
