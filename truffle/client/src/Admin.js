
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Input, Label, FormText } from 'reactstrap';

import './App.css'


const Admin = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(false);

  // TX keys
  const [stackId, setStackID] = useState(null);

  // User input keys
  const [oracleKey, setOracleKey] = useState({
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
  const { drizzle, drizzleState, addressKey } = props
  const { Flannel } = drizzleState.contracts

  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {
    setOracleKey({
      ...oracleKey,
      [e.target.name]: e.target.value
    });
  }

  // New parameter update
  const updateNewParameters = e => {
    setNewParams({
      ...newParams,
      [e.target.name]: Number(e.target.value)
    });
  }
  

  // Initiate address update on contract

  const initiateAddressUpdate = (oracleAddress, nodeAddress) => {
    const contract = drizzle.contracts.Flannel;
    const stackId = contract.methods["configureOracleSetup"].cacheSend(oracleAddress, nodeAddress, {
      from: drizzleState.accounts[0]
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }

  // Revert ownership of Oracle to owner

  const initiateRevertOwnership = () => {
    const contract = drizzle.contracts.Flannel;
    const stackId = contract.methods["revertOracleOwnership"].cacheSend({
      from: drizzleState.accounts[0]
    })

    setStackID(stackId)
  }

  const initiateParameterUpdate = () => {
    const contract = drizzle.contracts.Flannel;

    if (newParams.pcUntouched + newParams.pcAave + newParams.pcTopUp === 100){
      const stackId = contract.methods["createNewAllowance"].cacheSend(
        "Default",
        newParams.pcUntouched,
        newParams.pcAave,
        newParams.pcTopUp,
        props.formatData(false, newParams.linkThreshold, "", false),
        props.formatData(false, newParams.ethThreshold, "", false),
        props.formatData(false, newParams.aaveThreshold, "", false),
        props.formatData(false, newParams.ethTopUp, "", false),      
        {
          from: drizzleState.accounts[0]
       })
  
      setStackID(stackId)
    } else {
      console.log("Bad percents");
    }
  }


  // Cachecall() lookup variables
  const addresses = Flannel.getAddresses[addressKey];

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
                <NavLink onClick={() => { tabToggle('1'); }} >
                  Contracts
          </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('2'); }} >
                  Ownership
          </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('3'); }} >
                  Auto Parameters
              </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Row style={{ marginBottom: '10px' }}>
                  <Col sm="12" style={{ paddingRight: '30px' }}>
                    <p></p>
                    <Form>
                      <FormGroup>
                        <p> Oracle Address: {addresses && addresses.value[0]}</p>
                        <p> Node Address: {addresses && addresses.value[1]}</p>
                        <Input placeholder="New Oracle Address" type="text" name="oracleAddress" onChange={updateField} />
                        <p></p>
                        <Input placeholder="New Node Address" type="text" name="nodeAddress" onChange={updateField} />
                        <Button color="primary" style={{ marginTop: '15px' }} onClick={() => initiateAddressUpdate(oracleKey.oracleAddress, oracleKey.nodeAddress)} > Update </Button>
                      </FormGroup>
                    </Form>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col sm="12">
                    <p></p>
                    <Button color="danger" style={{ marginTop: '15px' }} onClick={() => initiateRevertOwnership()}> Revert Ownership </Button>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="3">
                <Row>
                  <Col sm="12">
                    <p></p>
                    <Form style={{ paddingTop: '10px' }}>
                      <FormGroup>
                        <p><strong> Oracle </strong></p>
                        <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Input placeholder="Withdraw Threshold" type="text" name="linkThreshold" onChange={updateNewParameters} />
                          <FormText color="muted"> Threshold in LINK </FormText>
                        </Row>
                        <p></p>
                        <Row >
                          <Col sm={4}>
                            <Input placeholder="Store %" type="text" name="pcUntouched" onChange={updateNewParameters} />
                          </Col>
                          <Col sm={4}>
                            <Input placeholder="Earn %" type="text" name="pcAave" onChange={updateNewParameters} />
                          </Col>
                          <Col sm={4}>
                            <Input placeholder="Top-Up %" type="text" name="pcTopUp" onChange={updateNewParameters} />
                          </Col>
                        </Row>
                      </FormGroup>
                      <FormGroup>
                        <p><strong> Top-Up </strong></p>
                        <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Input placeholder="Node Balance Threshold" type="text" name="ethThreshold" onChange={updateNewParameters} />
                        </Row>
                        <p></p>
                        <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Input placeholder="Top-Up Amount" type="text" name="ethTopUp" onChange={updateNewParameters} />
                        </Row>
                      </FormGroup>
                      <FormGroup >
                        <p><strong> Earn </strong></p>
                        <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Input placeholder="Earn Threshold" type="text" name="aaveThreshold" onChange={updateNewParameters} />
                        </Row>
                      </FormGroup>
                      <FormGroup className="blank-col">
                        <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Button color="primary" onClick={ initiateParameterUpdate } > Apply </Button>
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
