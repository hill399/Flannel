
import React, { useState } from "react"
import { Collapse, Card, CardBody, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Spinner, FormText } from 'reactstrap';
import { Input, Text, Button, Loader, Flex, Box } from 'rimble-ui';

import '../layout/App.css'

const Oracle = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(true);

  // Contract variable keys
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // TX keys
  const [stackId, setStackID] = useState(null);

  // Drizzle / Contract props
  const { drizzle, drizzleState, parameterKey, extBalances, validateInput } = props
  const { Flannel } = drizzleState.contracts

  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {
    setWithdrawAmount(e.target.value);
  }

  const buttonStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = drizzleState

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[stackId]

    // otherwise, return the transaction status
    if (transactions[txHash] && transactions[txHash].status === "pending") {
      return (
        <Button>
          <Loader color="white" />
        </Button>
      )
    } else {
      return (
        <Button color="primary" style={{ marginLeft: "5px" }} onClick={() => initiateManualWithdraw(withdrawAmount)} > Withdraw </Button>
      )
    }
  }

  // Initiate an withdrawal from Oracle contract

  const initiateManualWithdraw = (value) => {
    if (validateInput(value)) {
      const fValue = props.formatData(false, value, "", false);
      const contract = drizzle.contracts.Flannel;

      if (fValue > oracleLinkBalance) {
        alert('Withdraw amount too high, not enough LINK in Oracle contract');
      } else {
        const stackId = contract.methods["manualWithdrawFromOracle"].cacheSend(fValue, {
          from: drizzleState.accounts[0],
          gas: 300000
        })
        setStackID(stackId);

        setWithdrawAmount('');
      }
    } else {
      alert('Invalid Withdraw Amount');
    }
  }

  // Cachecall() lookup variables
  const oracleLinkBalance = extBalances.oracle;
  const parameters = Flannel.userStoredParams[parameterKey]

  return (
    <div className="section">
      <Card style={{ paddingLeft: '20px' }}>
        <div className="row">
        <div className="col" style={{ paddingTop: '15px' }}><Text fontSize={28}>Oracle </Text> <Text.p>{props.formatData(true, oracleLinkBalance, "LINK", true)} </Text.p></div>
          <div className="col-auto"> <Button.Outline onClick={toggle} size={"small"} className="button-sh" icon="ArrowDropDown" icononly /></div>
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
                  <FormGroup className="oracle-col" >
                    <Text.p>Oracle Withdrawals will trigger when <strong> {parameters && props.formatData(true, parameters.value[4], "LINK", false)} </strong> has been earned </Text.p>
                  </FormGroup>
                  <Row form >
                    <Col md={4}>
                      <FormGroup className="oracle-col">
                        <Text.p>STORE</Text.p>
                        <Text.p fontWeight={"bold"}> {parameters && parameters.value[1]} % </Text.p>
                        <Text.p></Text.p>
                        <Text.p> Store LINK within Flannel </Text.p>
                        <Text.p></Text.p>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="oracle-col">
                        <Text.p>EARN</Text.p>
                        <Text.p fontWeight={"bold"}>  {parameters && parameters.value[2]} % </Text.p>
                        <Text.p></Text.p>
                        <Text.p> Allocate LINK to generate interest </Text.p>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="oracle-col">
                        <Text.p>TOP-UP</Text.p>
                        <Text.p fontWeight={"bold"}> {parameters && parameters.value[3]} % </Text.p>
                        <Text.p></Text.p>
                        <Text.p> Keep your node topped-up </Text.p>
                      </FormGroup>
                    </Col>
                  </Row>
                </Form>
              </TabPane>
              <TabPane tabId="2">
                <Text.p></Text.p>
                <Text.p fontWeight={"bold"}> Manual Oracle Withdraw </Text.p>
                <Text.p> Initiate a withdrawal from your Oracle contract, to distribute within Flannel and access its additional features. </Text.p>
                <Row >
                  <Flex>
                  <Box p={3} width={1 / 2} >
                  <Input placeholder="Withdraw Amount" type="text" name="withdrawAmount" value={withdrawAmount} onChange={updateField} />
                  <FormText color="muted"> Withdraw in LINK </FormText>
                  </Box>
                  <Box p={3} width={1 / 2} >
                  {buttonStatus()}
                  </Box>
                  </Flex>
                </Row>
              </TabPane>
            </TabContent>
          </CardBody>
        </Collapse>
      </Card>
    </div>
  )
}

export default Oracle;
