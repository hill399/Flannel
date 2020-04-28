
import React, { useState } from "react"
import { Collapse, CardBody, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, FormText, Spinner } from 'reactstrap';
import { Input, Text, Button, Loader, Flex, Box, Card, Radio, Field } from 'rimble-ui';

import '../layout/App.css'

const Parameters = (props) => {
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
  const { drizzle, drizzleState, addressKey, parameterKey, validateInput } = props
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
    setNewParams({
      ...newParams,
      [e.target.name]: e.target.value
    });
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

    let validInputFlag = true;

    Object.entries(newParams).forEach(([key, value]) => {
      if (validInputFlag) { validInputFlag = validateInput(value) }
    })

    if (validInputFlag) {
      const contract = drizzle.contracts.Flannel;

      if (parseInt(newParams.pcUntouched) + parseInt(newParams.pcAave) + parseInt(newParams.pcTopUp) === 100) {
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
    } else {
      alert('Invalid Parameter Values');
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
    <div>
      <Flex>
        <Box width={1 / 3}>
          <Card className="panel-col">
            <Text.p fontWeight={"bold"}> Oracle </Text.p>
            <Field label="Withdraw Threshold:">
              <Input placeholder="Withdraw Threshold" type="text" required={true} name="linkThreshold" value={newParams.linkThreshold} onChange={updateNewParameters} />
            </Field>
            <Text.p />
            <Field label="Withdraw to Store Allocation:">
              <Input placeholder="Store %" type="text" required={true} name="pcUntouched" value={newParams.pcUntouched} onChange={updateNewParameters} />
            </Field>
            <Text.p />
            <Field label="Withdraw to Earn Allocation:">
              <Input placeholder="Earn %" type="text" required={true} name="pcAave" value={newParams.pcAave} onChange={updateNewParameters} />
            </Field>
            <Text.p />
            <Field label="Withdraw to Top-Up Allocation:">
              <Input placeholder="Top-Up %" type="text" required={true} name="pcTopUp" value={newParams.pcTopUp} onChange={updateNewParameters} />
            </Field>
            <Text.p />
            <Text.p fontWeight={"bold"}> Top-Up </Text.p>
            <Field label="Node Balance Threshold:">
              <Input placeholder="Node Balance Threshold" type="text" required={true} name="ethThreshold" value={newParams.ethThreshold} onChange={updateNewParameters} />
            </Field>
            <Text.p />
            <Field label="Node Top-Up Amount:">
              <Input placeholder="Top-Up Amount" type="text" required={true} name="ethTopUp" value={newParams.ethTopUp} onChange={updateNewParameters} />
            </Field>
            <Text.p />
            <Text.p fontWeight={"bold"}> Earn </Text.p>
            <Field label="Deposit to Aave Threshold:">
              <Input placeholder="Earn Threshold" type="text" required={true} name="aaveThreshold" value={newParams.aaveThreshold} onChange={updateNewParameters} />
            </Field>
            <Text.p />
            <Button color="primary" onClick={initiateParameterUpdate} > Apply </Button>
            {getTxStatus(2)}
          </Card>
        </Box>
        <Box width={1 / 3}>
          <Card className="panel-col">
            <Text.p fontWeight={"bold"}> Oracle </Text.p>
            <Field label="Withdraw Threshold:">
              <Text.p required={true}> {(parameters && props.formatData(true, parameters.value[4], "LINK", true))}  </Text.p>
            </Field>
            <Text.p />
            <Field label="Withdraw to Store Allocation:">
              <Text.p required={true}> {(parameters && parameters.value[1])}%  </Text.p>
            </Field>
            <Text.p />
            <Field label="Withdraw to Earn Allocation:">
              <Text.p required={true}> {(parameters && parameters.value[2])}%  </Text.p>
            </Field>
            <Text.p />
            <Field label="Withdraw to Top-Up Allocation:">
              <Text.p required={true}> {(parameters && parameters.value[3])}% </Text.p>
            </Field>
            <Text.p />
            <Text.p fontWeight={"bold"}> Top-Up </Text.p>
            <Field label="Node Balance Threshold:">
              <Text.p required={true}> {(parameters && props.formatData(true, parameters.value[5], "ETH", true))}  </Text.p>
            </Field>
            <Text.p />
            <Field label="Node Top-Up Amount:">
              <Text.p required={true}> {(parameters && props.formatData(true, parameters.value[7], "LINK", true))}  </Text.p>
            </Field>
            <Text.p />
            <Text.p fontWeight={"bold"}> Earn </Text.p>
            <Field label="Deposit to Aave Threshold:">
              <Text.p required={true}> {(parameters && props.formatData(true, parameters.value[6], "LINK", true))}  </Text.p>
            </Field>
          </Card>
        </Box>
        <Box width={1 / 3}>
          <Card className="panel-col">
            <Text.p fontWeight={"bold"}> Modify Automatic Parameters </Text.p>
            <Text.p> Change how Flannels automated functions behave by modifying the parameters below. Change how deposits are split between functions,
                      how top-ups are triggered and the threshold in which to deposit LINK to generate interest-bearing aLINK. </Text.p>

          </Card>
        </Box>
      </Flex>

    </div >
  )
}

export default Parameters;

/*
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
                <Text.p fontWeight={"bold"}> Change Contract Addresses </Text.p>
                <Input placeholder="New Oracle Address" type="text" name="oracleAddress" value={newAddress.oracleAddress} onChange={updateField} />
                <Text.p> Current Oracle Address: {addresses && addresses.value[0]}  </Text.p>
                <p></p>
                <Input placeholder="New Node Address" type="text" name="nodeAddress" value={newAddress.nodeAddress} onChange={updateField} />
                <Text.p> Current Node Address: {addresses && addresses.value[1]}  </Text.p>
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
            <Text.p fontWeight={"bold"}> Revert Oracle Ownership </Text.p>
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
                  <Text.p fontWeight={"bold"}> Modify Automatic Parameters </Text.p>
                  <p> Change how Flannels automated functions behave by modifying the parameters below. Change how deposits are split between functions,
                      how top-ups are triggered and the threshold in which to deposit LINK to generate interest-bearing aLINK. </p>
                </Row>
                <Text.p fontWeight={"bold"}> Oracle </Text.p>
                <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                  <Input placeholder="Withdraw Threshold" type="text" name="linkThreshold" value={newParams.linkThreshold} onChange={updateNewParameters} />
                  <Text.p> Currently set to {(parameters && props.formatData(true, parameters.value[4], "LINK", true))}  </Text.p>
                </Row>
                <p></p>
                <Row >
                  <Col sm={4}>
                    <Input placeholder="Store %" type="text" name="pcUntouched" value={newParams.pcUntouched} onChange={updateNewParameters} />
                    <Text.p> Currently at {(parameters && parameters.value[1])}%  </Text.p>
                  </Col>
                  <Col sm={4}>
                    <Input placeholder="Earn %" type="text" name="pcAave" value={newParams.pcAave} onChange={updateNewParameters} />
                    <Text.p> Currently at {(parameters && parameters.value[2])}%  </Text.p>
                  </Col>
                  <Col sm={4}>
                    <Input placeholder="Top-Up %" type="text" name="pcTopUp" value={newParams.pcTopUp} onChange={updateNewParameters} />
                    <Text.p> Currently at {(parameters && parameters.value[3])}% </Text.p>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Text.p fontWeight={"bold"}> Top-Up </Text.p>
                <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                  <Input placeholder="Node Balance Threshold" type="text" name="ethThreshold" value={newParams.ethThreshold} onChange={updateNewParameters} />
                  <Text.p> Currently set at {(parameters && props.formatData(true, parameters.value[5], "ETH", true))}  </Text.p>
                </Row>
                <p></p>
                <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                  <Input placeholder="Top-Up Amount" type="text" name="ethTopUp" value={newParams.ethTopUp} onChange={updateNewParameters} />
                  <Text.p> Currently set at {(parameters && props.formatData(true, parameters.value[7], "LINK", true))}  </Text.p>
                </Row>
              </FormGroup>
              <FormGroup >
                <Text.p fontWeight={"bold"}> Earn </Text.p>
                <Row style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                  <Input placeholder="Earn Threshold" type="text" name="aaveThreshold" value={newParams.aaveThreshold} onChange={updateNewParameters} />
                  <Text.p> Currently set at {(parameters && props.formatData(true, parameters.value[6], "LINK", true))}  </Text.p>
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
</Card > */