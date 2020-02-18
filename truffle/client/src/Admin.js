
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col } from 'reactstrap';

import './App.css'


const Admin = (props) => {
  const [stackId, setStackID] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  const [oracleKey, setOracleKey] = useState({
    oracleAddress: '',
    nodeAddress: ''
  });

  const [isOpen, setIsOpen] = useState(true);

  const { drizzle, drizzleState } = props

  useEffect(() => {
    const FlannelContract = drizzle.contracts.Flannel
    const oracleAddress = FlannelContract.methods.getAddresses.cacheCall(0);
    const nodeAddress = FlannelContract.methods.getAddresses.cacheCall(1);

    setOracleKey({
      oracleAddress: oracleAddress,
      nodeAddress: nodeAddress
    })
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

  return (
    // if it exists, then we display its value
    <div className="section">
      <div className="row">
        <div className="col" style={{ paddingTop: '15px' }}><h2> Admin </h2></div>
        <div className="col-auto"> <Button color="primary" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
      </div>
      <Collapse isOpen={isOpen}>
      <Card style={{ paddingLeft: '20px'}}>
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
                  <Col sm="12" >
                    <p></p>
                    <p> Oracle Address: {oracleKey.oracleAddress}</p>
                    <p> Node Balance: {oracleKey.nodeAddress}</p>
                    <p> Manual LINK Deposit: <input type="text" name="nodeAddress" onChange={updateField} /></p>
                    <p> Manual LINK Deposit: <input type="text" name="oracleAddress" onChange={updateField} /></p>
                    <Button color="primary" onClick={() => initiateAddressUpdate(oracleKey.oracleAddress, oracleKey.nodeAddress)} > Update </Button>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col sm="12">
                    <p></p>
                    <Button color="danger" onClick={initiateRevertOwnership} > Revert Ownership </Button>
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
