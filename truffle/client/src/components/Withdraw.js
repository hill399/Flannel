
import React, { useState, useEffect } from "react"
import { Collapse, CardBody, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Form, FormGroup, Spinner } from 'reactstrap';
import { Input, Text, Button, Loader, Flex, Box, Card, Radio, Field, Table } from 'rimble-ui';

import '../layout/App.css'

const Withdraw = (props) => {
  // UI state keys
  const [activeTab, setActiveTab] = useState('1');
  const [isOpen, setIsOpen] = useState(false);

  // TX keys
  const [stackId, setStackID] = useState({
    withdrawId: '',
    rebalanceId: ''
  })

  // User input keys
  const [withdrawKey, setWithdrawKey] = useState({
    withdrawParam: '',
    withdrawValue: '',
    rebalanceTo: '',
    rebalanceFrom: '',
    rebalanceAmount: ''
  })

  const [withdrawHistoryKey, setWithdrawHistoryKey] = useState({
    data: []
  })

  // Contract variable keys
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Drizzle / Contract props
  const { drizzle, drizzleState, balanceKey, validateInput, extBalances } = props
  const { Flannel } = drizzleState.contracts

  // Update effects
  useEffect(() => {
    setWithdrawHistoryKey(getWithdrawHistory())
  }, [])

  // Tab functions
  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const toggle = () => setIsOpen(!isOpen);

  // Field update functions
  const updateField = e => {
    setWithdrawKey({
      ...withdrawKey,
      [e.target.name]: e.target.value
    });
  }

  const getWithdrawHistory = () => {
    let account = drizzleState.accounts[0];
    let aToken = drizzle.contracts.Flannel.address;

    let txArray = { data: [] }

    drizzle.web3.eth.getBlockNumber().then(function (endBlock) {
      for (let i = endBlock; i >= (endBlock - 50); i--) {
        drizzle.web3.eth.getBlock(i, true).then(function (block) {
          if (block != null && block.transactions != null) {
            block.transactions.forEach(function (e) {
              if (account === e.from && aToken === e.to) {
                let newTx = { blockNumber: e.blockNumber, hash: e.hash, input: e.input };
                txArray.data.push(newTx);
              }
            })
          }
        })
      }
    })

    if (txArray.data.length < 5) {
      for (let i = txArray.data.length; i <= 4; i++) {
        txArray.data.push({ blockNumber: i, hash: '0', input: '0' })
      }
    }

    return txArray;
  }

  const buttonStatus = (func) => {
    const { transactions, transactionStack } = drizzleState

    let txHash

    if (func === 0) {
      txHash = transactionStack[stackId.withdrawId]
    } else {
      txHash = transactionStack[stackId.rebalanceId]
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
            <Button color="primary" onClick={() => initiateWithdraw(withdrawKey.withdrawParam, withdrawKey.withdrawValue)} > Withdraw </Button>
          )
        case 1:
          return (
            <Button color="primary" onClick={() => initiateRebalance(withdrawKey.rebalanceTo, withdrawKey.rebalanceFrom, withdrawKey.rebalanceAmount)}> Rebalance </Button>
          )
      }
    }
  }

  // Function to produce dynamic table elements

  const WithdrawHistory = (props) => {

    if (props.data.hash === 0) {

      let funcName;

      switch (props.data.input.slice(0, 10)) {
        case "0x284503f5":
          funcName = "Withdrawal"
          break;
        case "0x32b5d1ab":
          funcName = "Rebalance";
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
          <td> </td>
          <td> </td>
          <td> </td>
        </tr>
      );
    }
  }

  // Variable to hold dynamic mapped JSX elements

  let txData = withdrawHistoryKey.data.map(tx => {
    return <WithdrawHistory key={tx.timestamp} data={tx} />
  })


  // Initiate a withdraw from Flannel contract

  const initiateWithdraw = (from, value) => {

    console.log(withdrawKey)

    if (validateInput(value)) {
      const contract = drizzle.contracts.Flannel;
      const fValue = props.formatData(false, value, "", false);
      const stackId = contract.methods["withdrawFromFlannel"].cacheSend(from, fValue, {
        from: drizzleState.accounts[0]
      })

      setStackID({
        withdrawId: stackId
      })

      setWithdrawKey({
        ...withdrawKey,
        withdrawValue: ''
      });
    } else {
      alert('Invalid Withdraw Amount');
    }
  }

  const initiateRebalance = (to, from, value) => {
    console.log(withdrawKey)

    if (validateInput(value)) {
      const contract = drizzle.contracts.Flannel;
      const fValue = props.formatData(false, value, "", false);
      const stackId = contract.methods["rebalance"].cacheSend(to, from, fValue, {
        from: drizzleState.accounts[0]
      })

      setStackID({
        rebalanceId: stackId
      })

      setWithdrawKey({
        ...withdrawKey,
        rebalanceAmount: ''
      });
    } else {
      alert('Invalid Rebalance Amount');
    }
  }

  // Field update functions
  const updateWithdrawField = e => {
    setWithdrawAmount(e.target.value);
  }

  const buttonWithdrawStatus = () => {
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
  const storeBalance = Flannel.storeBalance[balanceKey.store];
  const aaveBalance = Flannel.aaveBalance[balanceKey.earn];
  const topUpBalance = Flannel.topUpBalance[balanceKey.topUp];

  const oracleLinkBalance = extBalances.oracle;

  return (
    <div style={{ marginTop: '10px' }}>
      <Flex>
        <Box width={7 / 12}>
          <Flex flexDirection="column" flexWrap="wrap">
            <Box height={1 / 2} height="100%" width="100%">
              <Flex flexDirection="row" flexWrap="wrap">
                <Box width={1 / 2} height="100%">
                  <Card className="panel-col">
                    <Text.p fontWeight={"bold"}> Withdraw From Flannel </Text.p>
                    <Text.p> Withdraw LINK from the Flannel contract directly to the owner. </Text.p>
                    <Text.p> Maybe there should be some more text here to pad the box out for better fit? </Text.p>
                    <Text.p />
                    <Text.p />
                    <Field label="Choose fund to withdraw from" name="withdrawParam" id="withdrawParam" onClick={updateField}>
                      <Radio value={0} name="withdrawParam" required={true} label="Store" my={2} />
                      <Radio value={1} name="withdrawParam" required={true} label="Earn" my={2} />
                      <Radio value={2} name="withdrawParam" required={true} label="Top-Up" my={2} />
                    </Field>
                    <Text.p />
                    <Input placeholder="Withdraw Amount" type="text" name="withdrawValue" value={withdrawKey.withdrawValue} onChange={updateField} /> {buttonStatus(0)}
                  </Card>
                </Box>
                <Box width={1 / 2} height="100%">
                  <Flex flexDirection="column" flexWrap="wrap">
                    <Box height={1 / 3} height="100%" width="100%">
                      <Card className="withdraw-col">
                        <Text fontSize={26}>  {(storeBalance && props.formatData(true, storeBalance.value, "", false))} </Text>

                        <Text fontSize={16} > LINK </Text>
                        <Text fontSize={16} > STORE </Text>
                      </Card>
                    </Box>
                    <Box height={1 / 3} height="80%" width="100%">
                      <Card className="withdraw-col">
                        <Text fontSize={26}>  {(aaveBalance && props.formatData(true, aaveBalance.value, "", false))} </Text>

                        <Text fontSize={16} > LINK </Text>
                        <Text fontSize={16} > EARN </Text>
                      </Card>
                    </Box>
                    <Box height={1 / 3} height="100%" width="100%">
                      <Card className="withdraw-col">
                        <Text fontSize={26}>  {(topUpBalance && props.formatData(true, topUpBalance.value, "", false))} </Text>

                        <Text fontSize={16} > LINK </Text>
                        <Text fontSize={16} > TOP-UP </Text>
                      </Card>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Box>
            <Box height={1 / 2} height="100%" width="100%">
              <Card className="panel-col">
                <Flex flexDirection="row" flexWrap="wrap">
                  <Box width={1 / 2} height="100%">
                    <Text.p fontWeight={"bold"}> Rebalance Flannel </Text.p>
                    <Text.p> Withdraw LINK from the Flannel contract directly to the owner. </Text.p>
                    <Field label="Choose fund to rebalance from" name="rebalanceFrom" id="rebalanceFrom" onClick={updateField}>
                      <Radio value={0} name="rebalanceFrom" required={true} label="Store" my={2} />
                      <Radio value={1} name="rebalanceFrom" required={true} label="Earn" my={2} />
                      <Radio value={2} name="rebalanceFrom" required={true} label="Top-Up" my={2} />
                    </Field>
                    <Text.p />
                    <Input placeholder="Rebalance Amount" type="text" name="rebalanceAmount" value={withdrawKey.rebalanceAmount} onChange={updateField} /> {buttonStatus(1)}
                  </Box>
                  <Box width={1 / 2} height="100%">
                    <Field label="Choose fund to rebalance to" name="rebalanceTo" id="rebalanceTo" onClick={updateField} style={{ paddingTop: '90px' }}>
                      <Radio value={0} name="rebalanceTo" required={true} label="Store" my={2} />
                      <Radio value={1} name="rebalanceTo" required={true} label="Earn" my={2} />
                      <Radio value={2} name="rebalanceTo" required={true} label="Top-Up" my={2} />
                    </Field>
                  </Box>
                </Flex>
              </Card>
            </Box>
          </Flex>
        </Box>

        <Box width={5 / 12} height="100%">
          <Flex flexDirection="column" flexWrap="wrap">
            <Box height={1 / 2} height="100%" width="100%">
              <Card className="balance-col">
                <Text fontSize={16} > RECENT WITHDRAW ACTIVITY </Text>
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

            <Box height={1 / 2} height="100%" width="100%">
              <Flex flexDirection="column" flexWrap="wrap">
                <Box height={1 / 3} height="80%" width="100%">
                  <Card className="withdraw-col">
                    <Text fontSize={26}>  <Text.p>{props.formatData(true, oracleLinkBalance, "", false)} </Text.p> </Text>

                    <Text fontSize={16} > LINK </Text>
                    <Text fontSize={16} > ORACLE </Text>
                  </Card>
                </Box>
                <Box height={2 / 3} height="100%" width="100%">
                  <Card className="withdraw-col">
                    <Text.p fontWeight={"bold"}> Manual Oracle Withdraw </Text.p>
                    <Input placeholder="Withdraw Amount" type="text" name="withdrawAmount" value={withdrawAmount} onChange={updateWithdrawField} />
                    {buttonWithdrawStatus()}
                  </Card>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </div>
  )
}

export default Withdraw;
