
import React, { useState } from "react"

import { Blockie, Card, Text, Heading, Flex, Box } from 'rimble-ui';
import { Note } from '@rimble/icons';

import { Tooltip } from 'reactstrap';

import '../layout/App.css'
import info_icon from '../icons/simple-small.svg';

const Balance = (props) => {

    const [tooltip, setTooltip] = useState({
        oracleInfo: false,
        nodeInfo: false,
        earnInfo: false
    });

    const { drizzle, drizzleState, extBalances } = props

    const toolToggle = (prev, e) => {
        setTooltip({
            ...tooltip,
            [e.target.id]: !prev
        })
    };

    const shortAccount = () => {
        const connAccount = drizzleState.accounts[0];
        return (
            connAccount.slice(0, 8) + "..." + connAccount.slice(36)
        )
    }

    // Cachecall() lookup variables
    const oracleBal = extBalances.oracle;
    const aLinkBal = extBalances.aLink;
    const nodeBal = extBalances.node;

    const deployed = drizzle.contracts.Flannel.address;

    return (
        <div style={{ marginTop: '10px' }}>
            <Flex>
                <Box width={1 / 3}>
                    <Card className="balance-col">
                        <Text fontSize={36}> {(props.formatData(true, oracleBal, "", true))} </Text>
                        <Text fontSize={18}> LINK </Text>
                        <Text.p />
                        <Text fontSize={22} > ORACLE </Text>
                        <img src={info_icon} id="oracleInfo" alt="oracle-info" />
                        <Tooltip placement="bottom" isOpen={tooltip.oracleInfo} target="oracleInfo" toggle={(e) => toolToggle(tooltip.oracleInfo, e)}>
                            Full Oracle Balance: {props.formatData(true, oracleBal, "LINK", false)}
                        </Tooltip>
                    </Card>
                </Box>
                <Box width={1 / 3}>
                    <Card className="balance-col">
                        <Text fontSize={36}> {(props.formatData(true, nodeBal, "", true))}  </Text>
                        <Text fontSize={18}> ETH  </Text>
                        <Text.p />
                        <Text fontSize={22}> NODE  </Text>
                        <img src={info_icon} id="nodeInfo" alt="node-info" />
                        <Tooltip placement="bottom" isOpen={tooltip.nodeInfo} target="nodeInfo" toggle={(e) => toolToggle(tooltip.nodeInfo, e)}>
                            Full Node Balance: {(nodeBal && props.formatData(true, nodeBal, "ETH", false))}
                        </Tooltip>
                    </Card>
                </Box>
                <Box width={1 / 3}>
                    <Card className="balance-col">
                        <Text fontSize={36}> {(props.formatData(true, aLinkBal, "", true))}  </Text>
                        <Text fontSize={18}> aLINK  </Text>
                        <Text.p />
                        <Text fontSize={22}> EARN  </Text>
                        <img src={info_icon} id="earnInfo" alt="earn-info" />
                        <Tooltip placement="bottom" isOpen={tooltip.earnInfo} target="earnInfo" toggle={(e) => toolToggle(tooltip.earnInfo, e)}>
                            Full aLINK Balance: {props.formatData(true, aLinkBal, "aLINK", false)}
                        </Tooltip>
                    </Card>
                </Box>
            </Flex>

        </div>
    )
}

export default Balance;

/*
<Form>
<Row form >
    <Col md={4}>
        <FormGroup className="balance-col">
            <Text fontSize={36}> {(props.formatData(true, oracleBal, "", true))} </Text>
            <Text fontSize={18}> LINK </Text>
            <p></p>
            <Text fontSize={22} > ORACLE </Text>
            <img src={info_icon} id="oracleInfo" alt="oracle-info" />
            <Tooltip placement="bottom" isOpen={tooltip.oracleInfo} target="oracleInfo" toggle={(e) => toolToggle(tooltip.oracleInfo, e)}>
                Full Oracle Balance: {props.formatData(true, oracleBal, "LINK", false)}
            </Tooltip>
            <p> </p>
        </FormGroup>
    </Col>
    <Col md={4}>
        <FormGroup className="balance-col">
            <Text fontSize={36}> {(props.formatData(true, nodeBal, "", true))}  </Text>
            <Text fontSize={18}> ETH  </Text>
            <p></p>
            <Text fontSize={22}> NODE  </Text>
            <img src={info_icon} id="nodeInfo" alt="node-info" />
            <Tooltip placement="bottom" isOpen={tooltip.nodeInfo} target="nodeInfo" toggle={(e) => toolToggle(tooltip.nodeInfo, e)}>
                Full Node Balance: {(nodeBal && props.formatData(true, nodeBal, "ETH", false))}
            </Tooltip>
            <p></p>
        </FormGroup>
    </Col>
    <Col md={4}>
        <FormGroup className="balance-col">
             <Text fontSize={36}> {(props.formatData(true, aLinkBal, "", true))}  </Text>
             <Text fontSize={18}> aLINK  </Text>
            <p></p>
            <Text fontSize={22}> EARN  </Text>
            <img src={info_icon} id="earnInfo" alt="earn-info" />
            <Tooltip placement="bottom" isOpen={tooltip.earnInfo} target="earnInfo" toggle={(e) => toolToggle(tooltip.earnInfo, e)}>
                Full aLINK Balance: {props.formatData(true, aLinkBal, "aLINK", false)}
            </Tooltip>
            <p></p>
        </FormGroup>
    </Col>
</Row>
</Form> */