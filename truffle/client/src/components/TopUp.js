
import React, { useState, useEffect } from "react"
import { Collapse, CardBody, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, FormText } from 'reactstrap';
import { Input, Text, Button, Loader, Flex, Box, Card, Label, Table } from 'rimble-ui';

import '../layout/App.css'

const TopUp = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(false);

  // Contract variable keys
  const [exchangeKey, setExchangeKey] = useState(0);

  // TX keys
  const [stackId, setStackID] = useState(null)

  // User input keys
  const [topUpKey, setTopUpKey] = useState(0);


  const [nodeHistoryKey, setNodeHistoryKey] = useState({
    data: []
  })

  // Drizzle / Contract props
  const { drizzle, drizzleState, parameterKey, balanceKey, validateInput, addressKey, extBalances } = props
  const { Flannel } = drizzleState.contracts

  useEffect(() => {
    const flannelContract = drizzle.contracts.Flannel;
    if (isNaN(topUpKey) || topUpKey === 0 || topUpKey === '') {
      setExchangeKey(0);
    } else {
      const exchangeVal = flannelContract.methods.getLinkToEthPrice.cacheCall(topUpKey * 1e18);
      setExchangeKey(exchangeVal);
    }
  }, [drizzle.contracts.Flannel, exchangeKey, topUpKey])

  // Update effects
  useEffect(() => {
    setNodeHistoryKey(getNodeHistory())
  }, [])


  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {

    if (parseInt(e.target.value) > 999) {
      alert('Maximum allowance of 999 LINK');
      e.target.value = 999;
    } else {
      setTopUpKey(e.target.value);
    }
  }

  const getNodeHistory = () => {
    let account = nodeAddress.value[1];

    let txArray = { data: [] }

    drizzle.web3.eth.getBlockNumber().then(function (endBlock) {
      for (let i = endBlock; i >= (endBlock - 50); i--) {
        drizzle.web3.eth.getBlock(i, true).then(function (block) {
          if (block != null && block.transactions != null) {
            block.transactions.forEach(function (e) {
              if (account === e.from) {
                let newTx = { blockNumber: e.blockNumber, hash: e.hash };
                txArray.data.push(newTx);
              }
            })
          }
        })
      }
    })

    if (txArray.data.length < 8) {
      for (let i = txArray.data.length; i <= 7; i++) {
        txArray.data.push({ timestamp: i, from: '0', input: '0', hash: '0' })
      }
    }

    return txArray;
  }


  // Transaction alert functions

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
        <Button color="primary" onClick={() => initiateUniswapTopUp(topUpKey)} > Convert </Button>
      )
    }
  }

  // Initiate LINK - ETH Uniswap conversion
  const initiateUniswapTopUp = value => {
    if (validateInput(value)) {
      const contract = drizzle.contracts.Flannel;
      const fValue = props.formatData(false, value, "", false);

      if (fValue > topUpBalance.value) {
        alert('Top-Up amount too high, not enough LINK allocated to function');
      } else {
        const stackId = contract.methods["manualLinkToEthTopUp"].cacheSend(fValue, {
          from: drizzleState.accounts[0],
          gas: 300000
        })
        setStackID(stackId)

        setTopUpKey('');
      }
    } else {
      alert('Invalid Top-Up Amount');
    }
  }

  // Cachecall() lookup parameters
  const exchange = Flannel.getLinkToEthPrice[exchangeKey];
  const parameters = Flannel.userStoredParams[parameterKey];
  const topUpBalance = Flannel.topUpBalance[balanceKey.topUp];

  const nodeAddress = Flannel.getAddresses[addressKey];
  const nodeBal = extBalances.node;


  // Function to produce dynamic table elements

  const NodeHistory = (props) => {

    if (props.data.hash === 0) {
      let newLink = "https://ropsten.etherscan.io/tx/" + props.data.hash
      let shortHash = props.data.hash.slice(0, 8) + "..." + props.data.hash.slice(48)

      return (
        <tr>
          <td> {props.data.blockNumber} </td>
          <td> <a href={newLink} target="_blank"> {shortHash} </a> </td>
        </tr>
      );

    } else {

      return (
        <tr>
          <td> </td>
          <td> </td>
        </tr>
      );
    }
  }

  // Variable to hold dynamic mapped JSX elements

  let txData = nodeHistoryKey.data.map(tx => {
    return <NodeHistory key={tx.timestamp} data={tx} />
  })

  return (
    <div style={{ marginTop: '10px' }}>
      <Flex>
        <Box width={4 / 6}>
          <Card className="balance-col">
            <Text fontSize={26}> {nodeAddress.value[1]} </Text>
            <Text.p />
            <Text fontSize={16} > NODE ADDRESS </Text>
          </Card>
        </Box>
        <Box width={2 / 6}>
          <Card className="balance-col">
            <Text fontSize={26}> {props.formatData(true, nodeBal, "", false)} </Text>
            <Text.p />
            <Text fontSize={16} > ETH </Text>
          </Card>
        </Box>
      </Flex>

      <Flex>
        <Box width={7 / 12}>
          <Flex flexDirection="column" flexWrap="wrap">
            <Box height={1 / 2} height="100%" width="100%">
              <Flex flexDirection="row" flexWrap="wrap">
                <Box width={1 / 2} height="100%">
                  <Card className="balance-col" style={{ paddingBottom: '35px' }}>
                    <Text.p />
                    <Text.p />
                    <Text fontSize={26}> 1.23 </Text>
                    <Text.p />
                    <Text fontSize={16} > LINK </Text>
                    <Text fontSize={16} > TOP-UP BALANCE </Text>
                  </Card>
                </Box>
                <Box width={1 / 2} height="100%">
                  <Card className="balance-col" style={{ paddingBottom: '35px' }}>
                    <Text.p />
                    <Text.p />
                    <Text fontSize={26}> 0.0003 </Text>
                    <Text.p />
                    <Text fontSize={16} > LINK/ETH RATE </Text>
                    <Text fontSize={16} > UNISWAP </Text>
                  </Card>
                </Box>
              </Flex>
            </Box>
            <Box height={1 / 2} height="100%" width="100%">
              <Card className="balance-col">
                <Text.p fontWeight={"bold"}> Top-up your node </Text.p>
                <Input placeholder="LINK Value" type="text" value={topUpKey} onChange={updateField} style={{ marginRight: '10px', minWidth: '150px' }} />
                <Input placeholder="ETH Value" type="text" value={(exchange && props.formatData(true, exchange.value, "ETH", false)) || ''} disabled style={{ marginRight: '10px' }} />
                <Text.p />
                {buttonStatus()}
                <Text.p />
                <Text.p> This will be a basic description of how the top-up function works (ETH->LINK via Uniswap) </Text.p>
              </Card>
            </Box>
          </Flex>
        </Box>

        <Box width={5 / 12} height="100%">
          <Card className="balance-col">
            <Text fontSize={16} > RECENT NODE ACTIVITY </Text>
            <Text.p />
            <Table style={{ paddingRight: '10px' }} >
              <thead>
                <tr>
                  <th> Block No. </th>
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

    </div >
  )
}

export default TopUp;


/*
<Flex>
<Box width={1 / 2}>
<Flex>
<Box height={1 / 2}>
 <Box width={1 / 2}>
   <Card className="balance-col" style={{ paddingBottom: '35px' }}>
     <Text.p />
     <Text.p />
     <Text fontSize={26}> 1.23 </Text>
     <Text.p />
     <Text fontSize={16} > LINK </Text>
     <Text fontSize={16} > TOP-UP BALANCE </Text>
   </Card>
 </Box>
 <Box width={1 / 2}>
   <Card className="balance-col" style={{ paddingBottom: '35px' }}>
     <Text.p />
     <Text.p />
     <Text fontSize={26}> 0.0003 </Text>
     <Text.p />
     <Text fontSize={16} > LINK/ETH RATE </Text>
     <Text fontSize={16} > UNISWAP </Text>
   </Card>
 </Box>
</Box>
<Box height={1 / 2}>
 <Card className="panel-col">
   <Text.p fontWeight={"bold"}> Node Top-Up </Text.p>
   <Text.p />
   <Box p={3} >
     <Input placeholder="LINK Value" type="text" value={topUpKey} onChange={updateField} style={{ marginRight: '10px', minWidth: '150px' }} />
     <Input placeholder="ETH Value" type="text" value={(exchange && props.formatData(true, exchange.value, "ETH", false)) || ''} disabled style={{ marginRight: '10px' }} /> {buttonStatus()}
   </Box>
 </Card>
</Box>
</Flex>
</Box>
<Box width={1 / 2}>
<Card className="balance-col" style={{ paddingBottom: '35px' }}>
NODE HISTORY
</Card>
</Box>
</Flex>
<Card className="panel-col">
<Text fontSize={26}> Sample Text </Text>
<Text.p> This will have some kind of description as to how the top-up functions operate </Text.p>
<Text.p> Maybe a picture or something to pad it out? </Text.p>
</Card> */
/*
<Card style={{ paddingLeft: '20px' }}>
<div className="row">
  <div className="col" style={{ paddingTop: '15px' }}><Text fontSize={28}> Top-Up </Text> <Text.p> {(topUpBalance && props.formatData(true, topUpBalance.value, "LINK", true))} </Text.p></div>
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
            <Text.p> When Chainlink node is below <strong> {parameters && props.formatData(true, parameters.value[5], "ETH", false)} </strong>
              top-up with <strong> {parameters && props.formatData(true, parameters.value[7], "LINK", false)} </strong> </Text.p>
          </FormGroup>
        </Form>
      </TabPane>
      <TabPane tabId="2">
        <Text.p></Text.p>
        <Text.p fontWeight={"bold"}> Manual Top-Up </Text.p>
        <Text.p> Convert earned LINK funds to top-up your running Chainlink node with ETH, which is required to send transactions and fulfill oracle requests.</Text.p>
        <Row>
            <Flex>
            <Box p={3} width={1 / 3} >
            <Input placeholder="LINK Value" type="text" value={topUpKey} onChange={updateField} />
            </Box>
            <Box p={3} width={1 / 3} >
            <Input placeholder="ETH Value" type="text" value={(exchange && props.formatData(true, exchange.value, "ETH", false)) || ''} disabled />
            <FormText color="muted"> Uniswap LINK-ETH conversion rate </FormText>
            </Box>
            <Box p={3} width={1 / 3} >
            {buttonStatus()}
            </Box>
            </Flex>
        </Row>
      </TabPane>
    </TabContent>
  </CardBody>
</Collapse>
</Card>
 */