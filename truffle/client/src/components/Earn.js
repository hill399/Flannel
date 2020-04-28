
import React, { useState, useEffect } from "react"
import { Collapse, CardBody, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, FormText } from 'reactstrap';
import { Card, Input, Text, Button, Loader, Flex, Box, Field, Table } from 'rimble-ui';

import '../layout/App.css'

const Earn = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(false);
  const [aLinkBal, setaLinkBal] = useState(null);

  // TX keys
  const [stackId, setStackID] = useState({
    burnId: '',
    mintId: ''
  })

  // User Input Keys
  const [aLinkInput, aLinkInputKey] = useState({
    aLinkDepositValue: '',
    aLinkBurnValue: ''
  })

  const [earnHistoryKey, setEarnHistoryKey] = useState({
    data: []
  })


  // Drizzle / Contract props
  const { drizzle, drizzleState, parameterKey, balanceKey, addressKey, validateInput } = props
  const { Flannel } = drizzleState.contracts

  // Update Balances
  useEffect(() => {
    const FlannelContract = drizzle.contracts.Flannel;
    const aLinkBalanceKey = FlannelContract.methods["getALinkBalance"].cacheCall();

    setaLinkBal(aLinkBalanceKey);
  }, [drizzle.contracts.Flannel])

  // Update effects
  useEffect(() => {
    setEarnHistoryKey(getEarnHistory())
  }, [])


  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {
    aLinkInputKey({
      ...aLinkInputKey,
      [e.target.name]: e.target.value
    });
  }


  const getEarnHistory = () => {
    let flannelAddress = drizzle.contracts.Flannel.address;

    let txArray = { data: [] }

    drizzle.web3.eth.getBlockNumber().then(function (endBlock) {
      for (let i = endBlock; i >= (endBlock - 50); i--) {
        drizzle.web3.eth.getBlock(i, true).then(function (block) {
          if (block != null && block.transactions != null) {
            block.transactions.forEach(function (e) {
              if (flannelAddress === e.to) {
                let newTx = { blockNumber: e.blockNumber, hash: e.hash, input: e.input };
                txArray.data.push(newTx);
              }
            })
          }
        })
      }
    })

    if (txArray.data.length < 4) {
      for (let i = txArray.data.length; i <= 4; i++) {
        txArray.data.push({ blockNumber: i, hash: '0', input: '0' })
      }
    }

    return txArray;
  }

  // Transaction alert functions

  const getTxStatus = (func) => {
    const { transactions, transactionStack } = drizzleState

    let txHash

    if (func === 0) {
      txHash = transactionStack[stackId.burnId]
    } else {
      txHash = transactionStack[stackId.mintId]
    }

    // otherwise, return the transaction status
    if (transactions[txHash] && transactions[txHash].status === "pending") {
      return (
        <Loader color="white" />
      )
    } else {
      switch (func) {
        case 0:
          return (
            <Button color="primary" onClick={() => initiateBurn(aLinkInput.aLinkBurnValue)} > Burn </Button>
          )
        case 1:
          return (
            <Button color="primary" onClick={() => initiateDeposit(aLinkInput.aLinkDepositValue)} > Deposit </Button>
          )
      }
    }
  }

  // Initiate a deposit to aLINK

  const initiateDeposit = value => {
    if (validateInput(value)) {
      const contract = drizzle.contracts.Flannel
      const fValue = props.formatData(false, value, "", false);

      if (fValue > aaveBalance.value) {
        alert('Deposit amount too high, not enough LINK allocated to function');
      } else {
        const stackId = contract.methods["manualDepositToAave"].cacheSend(fValue, {
          from: drizzleState.accounts[0],
          gas: 300000
        })
        setStackID({
          mintId: stackId
        })

        aLinkInputKey({
          ...aLinkInputKey,
          aLinkDepositValue: ''
        });
      }
    } else {
      alert('Invalid Deposit Amount');
    }
  }

  // Initiate a burn on aLINK

  const initiateBurn = value => {
    if (validateInput(value)) {
      const contract = drizzle.contracts.Flannel
      const fValue = props.formatData(false, value, "", false);

      if (fValue > aLink.value) {
        alert('Burn amount too high, not enough aLINK in Flannel');
      } else {
        const stackId = contract.methods["manualWithdrawFromAave"].cacheSend(fValue, {
          from: drizzleState.accounts[0],
          gas: 1000000
        })

        setStackID({
          burnId: stackId
        })

        aLinkInputKey({
          ...aLinkInputKey,
          aLinkBurnValue: ''
        });
      }
    } else {
      alert('Invalid Burn Amount');
    }
  }

  // Function to produce dynamic table elements

  const EarnHistory = (props) => {

    if (props.data.hash === 0) {

      let funcName;

      switch (props.data.input.slice(0, 10)) {
        case "0x746fa26e":
          funcName = "Deposit"
          break;
        case "0x9aee8f5b":
          funcName = "Burn";
          break;
      }

      let newLink = "https://ropsten.etherscan.io/tx/" + props.data.hash
      let shortHash = props.data.hash.slice(0, 8) + "..." + props.data.hash.slice(48)

      return (
        <tr>
          <td> {props.data.blockNumber} </td>
          <td> {funcName} </td>
          <td> <a href={newLink} target="_blank"> {shortHash} </a> </td>
        </tr>
      );

    } else {
      return (
        <tr>
          <th> </th>
          <td> </td>
          <td> </td>
        </tr>
      );
    }
  }

  // Variable to hold dynamic mapped JSX elements

  let txData = earnHistoryKey.data.map(tx => {
    return <EarnHistory key={tx.timestamp} data={tx} />
  })


  // Cachecall() lookup variables
  const aLink = Flannel.getALinkBalance[aLinkBal];
  const parameters = Flannel.userStoredParams[parameterKey]
  const aaveBalance = Flannel.aaveBalance[balanceKey.earn]

  return (
    <div style={{ marginTop: '10px' }}>
      <Flex>
        <Box width={7 / 12}>
          <Flex flexDirection="column" flexWrap="wrap">
            <Box height={1 / 2} height="100%" width="100%">
              <Flex flexDirection="row" flexWrap="wrap">
                <Box width={1 / 2} height="100%">
                  <Card className="balance-col">
                    <Text fontSize={26}> {(aaveBalance && props.formatData(true, aaveBalance.value, "", false))} </Text>
                    <Text.p />
                    <Text fontSize={16} > LINK </Text>
                    <Text fontSize={16} > EARN BALANCE </Text>
                  </Card>
                </Box>
                <Box width={1 / 2} height="100%">
                  <Card className="balance-col">
                    <Text fontSize={26}> {(aLink && props.formatData(true, aLink.value, "", false))} </Text>
                    <Text.p />
                    <Text fontSize={16} > aLINK </Text>
                    <Text fontSize={16} > FLANNEL BALANCE </Text>
                  </Card>
                </Box>
              </Flex>
            </Box>
            <Box height={1 / 2} height="100%" width="100%">
              <Flex flexDirection="row" flexWrap="wrap">
                <Box width={1 / 2} height="100%">
                  <Card className="balance-col">
                    <Text.p fontWeight={"bold"}> Deposit </Text.p>
                    <Text.p > This is a piece of text to inform the user of the use of the deposit function and where the funds are sent to. </Text.p>
                    <Input placeholder="Deposit Amount" name="aLinkDepositValue" value={aLinkInput.aLinkDepositValue} type="text" required={true} onChange={updateField} />
                    <Text.p />
                    {getTxStatus(1)}
                    <Text.p />
                  </Card>
                </Box>
                <Box width={1 / 2} height="100%">
                  <Card className="balance-col">
                    <Text.p fontWeight={"bold"}> Burn </Text.p>
                    <Text.p > This is a piece of text to inform the user of the use of the burn function and how redemptions are made </Text.p>
                    <Input placeholder="Burn Amount" name="aLinkBurnValue" value={aLinkInput.aLinkBurnValue} type="text" onChange={updateField} />
                    <Text.p />
                    {getTxStatus(0)}
                    <Text.p />
                  </Card>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>

        <Box width={5 / 12} height="100%">
          <Card className="balance-col">
            <Text fontSize={16} > RECENT EARN ACTIVITY </Text>
            <Text.p />
            <Table style={{ paddingRight: '10px' }} >
              <thead>
                <tr>
                  <th> Block No. </th>
                  <th> Function </th>
                  <th> Hash </th>
                </tr>
              </thead>
              <tbody>
                {txData}
              </tbody>
            </Table>
          </Card>
        </Box>
      </Flex>
      <Flex>
        <Box width={7 / 12} height="100%">
          <Card className="balance-col">
            <Text.p> This will be a card to explain to the user what the Aave network is </Text.p>
          </Card>
        </Box>
        <Box width={5 / 12} height="100%">
          <Card className="balance-col">
            <Text.p> I have no idea what to put on this card </Text.p>
            <Text.p> Maybe a chart of aLINK interest accrued </Text.p>
          </Card>
        </Box>
      </Flex>
    </div>
  )
}

export default Earn;

/*
<div className="section">
            <Card style={{ paddingLeft: '20px' }}>
              <div className="row">
                <div className="col" style={{ paddingTop: '15px' }}><Text fontSize={28}> Earn </Text> <Text.p> {(aaveBalance && props.formatData(true, aaveBalance.value, "LINK", true))} </Text.p></div>
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
                        <FormGroup className="oracle-col">
                          <Text.p> When Earn balance is greater than <strong>{parameters && props.formatData(true, parameters.value[6], "LINK", true)} </strong>
                deposit to Aave to generate interest. </Text.p>
                        </FormGroup>
                      </Form>
                    </TabPane>
                    <TabPane tabId="2">
                      <Form style={{ paddingTop: '10px' }}>
                        <Row form >
                          <Col md={6}>
                            <FormGroup className="earn-col">
                              <Row>
                                <Col sm="12" style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '15px' }}>
                                  <Text.p fontWeight={"bold"}> Deposit </Text.p>
                                  <Text.p> Deposit LINK to mint interest-bearing aLINK, and earn passive income from lending on the Aave network.</Text.p>
                                  <Input placeholder="Deposit Amount" name="aLinkDepositValue" value={aLinkInput.aLinkDepositValue} type="text" onChange={updateField} />
                                  <FormText color="muted"> Deposit in LINK </FormText>
                                </Col>
                              </Row>
                              <Row>
                                <Col sm="12" style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '10px' }}>
                                  {getTxStatus(1)}
                                </Col>
                              </Row>
                            </FormGroup>
                          </Col>
                          <Col md={6}>
                            <FormGroup className="earn-col">
                              <Row>
                                <Col sm="12" style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '15px' }}>
                                  <Text.p fontWeight={"bold"}> Burn </Text.p>
                                  <Text.p> Burn aLINK to return LINK tokens to the Flannel contract, and redeem any interest earned from your deposits. </Text.p>
                                  <Input placeholder="Burn Amount" name="aLinkBurnValue" value={aLinkInput.aLinkBurnValue} type="text" onChange={updateField} />
                                  <FormText color="muted" > Burn in aLINK </FormText>
                                </Col>
                              </Row>
                              <Row>
                                <Col sm="12" style={{ paddingLeft: '30px', paddingRight: '30px', paddingBottom: '10px' }}>
                                  {getTxStatus(0)}
                                </Col>
                              </Row>
                            </FormGroup>
                          </Col>
                        </Row>
                      </Form>
                    </TabPane>
                  </TabContent>
                </CardBody>
              </Collapse>
            </Card> */