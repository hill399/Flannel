
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Input, Form, FormGroup } from 'reactstrap';

import './App.css'


const Admin = (props) => {
  const [stackId, setStackID] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  const [addressKey, setAddressKey] = useState(null);

  const [oracleKey, setOracleKey] = useState({
    oracleAddress: '',
    nodeAddress: ''
  });

  const [isOpen, setIsOpen] = useState(true);

  const { drizzle, drizzleState } = props
  const { Flannel } = drizzleState.contracts

  useEffect(() => {
    const FlannelContract = drizzle.contracts.Flannel
    const addressKey = FlannelContract.methods.getAddresses.cacheCall();

    setAddressKey(addressKey);
  }, [])

  const updateField = e => {
    setOracleKey({
      ...oracleKey,
      [e.target.name]: e.target.value
    });
  }

  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }


  const initiateAddressUpdate = (oracleAddress, nodeAddress) => {
    const contract = drizzle.contracts.Flannel;
    const stackId = contract.methods["configureOracleSetup"].cacheSend(oracleAddress, nodeAddress, {
      from: drizzleState.accounts[0]
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }

  const initiateRevertOwnership = () => {
    const contract = drizzle.contracts.Flannel;
    const stackId = contract.methods["revertOracleOwnership"].cacheSend({
      from: drizzleState.accounts[0]
    })
    // save the `stackId` for later reference
    setStackID(stackId)
  }


  const toggle = () => setIsOpen(!isOpen);

  const addresses = Flannel.getAddresses[addressKey];

  return (
    <div className="section">
      <Collapse isOpen={isOpen}>
        <Card style={{ paddingLeft: '20px' }}>
          <div className="row">
            <div className="col" style={{ paddingTop: '15px' }}><h4> Admin </h4></div>
            <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
          </div>
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
            </TabContent>
          </CardBody>
        </Card>
      </Collapse>
    </div>
      )
    }
    
    export default Admin;
