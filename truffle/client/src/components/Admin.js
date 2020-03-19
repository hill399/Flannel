
import React, { useState } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Input, FormText, Spinner } from 'reactstrap';

import '../layout/App.css'

const Admin = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(false);

  // TX keys
  const [stackId, setStackID] = useState({
    addressId: '',
    revokeId: '',
    updateId: ''
  })

  // User input keys
  const [newAddress, setNewAddress] = useState({
    oracleAddress: '',
    nodeAddress: ''
  });

  const [newParams, setNewParams] = useState({
    pcUntouched: '',
    pcAave: '',
    pcTopUp: '',
    linkThreshold: '',
    ethThreshold: '',
    aaveThreshold: '',
    ethTopUp: ''
  })

  // Drizzle / Contract props
  const { drizzle, drizzleState, addressKey, parameterKey } = props
  const { Flannel } = drizzleState.contracts

  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {
    setNewAddress({
      ...newAddress,
      [e.target.name]: e.target.value
    });
  }

  // New parameter update
  const updateNewParameters = e => {

    const re = /^[0-9]{1,2}([.][0-9]{1,2})?$/;

    if (e.target.value === '' || re.test(e.target.value)) {
      setNewParams({
        ...newParams,
        [e.target.name]: Number(e.target.value)
      });
    }
  }

  // Initiate address update on contract

  const initiateAddressUpdate = (oracleAddress, nodeAddress) => {
    const contract = drizzle.contracts.Flannel;
    const stackId = contract.methods["configureOracleSetup"].cacheSend(oracleAddress, nodeAddress, {
      from: drizzleState.accounts[0]
    })
    // save the `stackId` for later reference
    setStackID({
      ...stackId,
      addressId: stackId
    })

    setNewAddress({
      oracleAddress: '',
      nodeAddress: ''
    });
  }

  // Revert ownership of Oracle to owner

  const initiateRevertOwnership = () => {
    const contract = drizzle.contracts.Flannel;
    const stackId = contract.methods["revertOracleOwnership"].cacheSend({
      from: drizzleState.accounts[0]
    })

    setStackID({
      ...stackId,
      revokeId: stackId
    })
  }

  const initiateParameterUpdate = () => {
    const contract = drizzle.contracts.Flannel;

    if (newParams.pcUntouched + newParams.pcAave + newParams.pcTopUp === 100) {
      const stackId = contract.methods["createNewAllowance"].cacheSend(
        "Default",
        newParams.pcUntouched,
        newParams.pcAave,
        newParams.pcTopUp,
        newParams.linkThreshold * 1e18,
        newParams.ethThreshold * 1e18,
        newParams.aaveThreshold * 1e18,
        newParams.ethTopUp * 1e18,
        {
          from: drizzleState.accounts[0]
        })

      setStackID({
        ...stackId,
        updateId: stackId
      })

      setNewParams({
        pcUntouched: '',
        pcAave: '',
        pcTopUp: '',
        linkThreshold: '',
        ethThreshold: '',
        aaveThreshold: '',
        ethTopUp: ''
      });

    } else {
      alert('Invalid Parameter Set - Check Percentage Input')
    }
  }

  // Transaction alert functions

  const getTxStatus = (func) => {
    const { transactions, transactionStack } = drizzleState

    let txHash;

    switch (func) {
      case 0:
        txHash = transactionStack[stackId.addressId];
        break;
      case 1:
        txHash = transactionStack[stackId.revokeId];
        break;
      case 2:
        txHash = transactionStack[stackId.updateId];
        break;
      default:
        txHash = null;
        break;
    }

    if (!txHash) return null;

    // otherwise, return the transaction status
    if (transactions[txHash] && transactions[txHash].status === "pending") {
      return (
        <Spinner color="primary" size="sm" style={{ marginLeft: '15px', marginTop: '5px' }} />
      )
    }
  }

  // Cachecall() lookup variables
  const addresses = Flannel.getAddresses[addressKey];
  const parameters = Flannel.userStoredParams[parameterKey];

  return (
    <div className="section">
      <Card style={{ paddingLeft: '20px' }}>
        <div className="row">
          <div className="col" style={{ paddingTop: '15px' }}><h4> Admin </h4></div>
          <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} className="button-sh" >&#709;</Button></div>
        </div>
        <Collapse isOpen={isOpen}>
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink onClick={() => { tabToggle('1'); }} style={parseInt(activeTab) === 1 ? { borderBottomColor: '#0b0bde', borderBottomWidth: '3px' } : null} >
                  Contracts
          </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('2'); }} style={parseInt(activeTab) === 2 ? { borderBottomColor: '#0b0bde', borderBottomWidth: '3px' } : null} >
                  Ownership
          </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('3'); }} style={parseInt(activeTab) === 3 ? { borderBottomColor: '#0b0bde', borderBottomWidth: '3px' } : null} >
                  Auto Parameters
              </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <p></p>
                    <Form>
                      <FormGroup>
                        <p><strong> Change Contract Addresses </strong></p>
                        <Input placeholder="New Oracle Address" type="text" name="oracleAddress" value={newAddress.oracleAddress} onChange={updateField} />
                        <FormText color="muted"> Current Oracle Address: {addresses && addresses.value[0]}  </FormText>
                        <p></p>
                        <Input placeholder="New Node Address" type="text" name="nodeAddress" value={newAddress.nodeAddress} onChange={updateField} />
                        <FormText color="muted"> Current Node Address: {addresses && addresses.value[1]}  </FormText>
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>
                <Row style={{ marginBottom: '10px' }}>
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <Button color="primary" onClick={() => initiateAddressUpdate(newAddress.oracleAddress, newAddress.nodeAddress)} > Update </Button>
                    {getTxStatus(0)}
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col sm="12" >
                    <p></p>
                    <p><strong> Revert Oracle Ownership </strong></p>
                    <p> Pass the ownership of your Oracle contract back to the owner of Flannel, useful if you wish to upgrade/remove Flannel functionality.</p>
                  </Col>
                </Row>
                <Row>
                  <Col sm="12">
                    <Button color="danger" onClick={() => initiateRevertOwnership()}> Revert Ownership </Button>
                    {getTxStatus(1)}
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="3">
                <Row>
                  <Col sm="12">
                    <p></p>
                    <Form style={{ paddingTop: '10px' }}>
                      <FormGroup>
                        <Row style={{ paddingLeft: '15px', paddingRight: '70px' }}>
                          <p><strong> Modify Automatic Parameters </strong></p>
                          <p> Change how Flannels automated functions behave by modifying the parameters below. Change how deposits are split between functions,
                              the top-up threshold and amount of LINK to be converted for top-up and the threshold in which to deposit LINK to generate interest-bearing
                            aLINK. </p>
                        </Row>
                        <p><strong> Oracle </strong></p>
                        <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Input placeholder="Withdraw Threshold" type="text" name="linkThreshold" value={newParams.linkThreshold} onChange={updateNewParameters} />
                          <FormText color="muted"> Currently set to {(parameters && props.formatData(true, parameters.value[4], "LINK", true))}  </FormText>
                        </Row>
                        <p></p>
                        <Row >
                          <Col sm={4}>
                            <Input placeholder="Store %" type="text" name="pcUntouched" value={newParams.pcUntouched} onChange={updateNewParameters} />
                            <FormText color="muted"> Currently at {(parameters && parameters.value[1])}%  </FormText>
                          </Col>
                          <Col sm={4}>
                            <Input placeholder="Earn %" type="text" name="pcAave" value={newParams.pcAave} onChange={updateNewParameters} />
                            <FormText color="muted"> Currently at {(parameters && parameters.value[2])}%  </FormText>
                          </Col>
                          <Col sm={4}>
                            <Input placeholder="Top-Up %" type="text" name="pcTopUp" value={newParams.pcTopUp} onChange={updateNewParameters} />
                            <FormText color="muted"> Currently at {(parameters && parameters.value[3])}% </FormText>
                          </Col>
                        </Row>
                      </FormGroup>
                      <FormGroup>
                        <p><strong> Top-Up </strong></p>
                        <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Input placeholder="Node Balance Threshold" type="text" name="ethThreshold" value={newParams.ethThreshold} onChange={updateNewParameters} />
                          <FormText color="muted"> Currently set at {(parameters && props.formatData(true, parameters.value[5], "ETH", true))}  </FormText>
                        </Row>
                        <p></p>
                        <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Input placeholder="Top-Up Amount" type="text" name="ethTopUp" value={newParams.ethTopUp} onChange={updateNewParameters} />
                          <FormText color="muted"> Currently set at {(parameters && props.formatData(true, parameters.value[7], "LINK", true))}  </FormText>
                        </Row>
                      </FormGroup>
                      <FormGroup >
                        <p><strong> Earn </strong></p>
                        <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Input placeholder="Earn Threshold" type="text" name="aaveThreshold" value={newParams.aaveThreshold} onChange={updateNewParameters} />
                          <FormText color="muted"> Currently set at {(parameters && props.formatData(true, parameters.value[6], "LINK", true))}  </FormText>
                        </Row>
                      </FormGroup>
                      <FormGroup className="blank-col">
                        <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Button color="primary" onClick={initiateParameterUpdate} > Apply </Button>
                          {getTxStatus(2)}
                        </Row>
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </CardBody>
        </Collapse >
      </Card >
    </div >
  )
}

export default Admin;
