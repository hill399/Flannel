
import React, { useState, useEffect, useCallback } from "react"
import { Row, Col, Form, FormGroup, Tooltip, Button } from 'reactstrap';

import './App.css'
import info_icon from './icons/simple-small.svg';

const Balance = (props) => {
    const [extBalances, setExtBalances] = useState({
        oracle: '',
        aLink: '',
        node: ''
    })

    const [tooltip, setTooltip] = useState({
        oracleInfo: false,
        nodeInfo: false,
        earnInfo: false
    });

    const { drizzle, addressKey, drizzleState } = props
    const { Flannel, AToken, LinkTokenInterface } = drizzleState.contracts

    const nodeAddress = Flannel.getAddresses[addressKey];

    // Update Balances
    useEffect(async () => {
        const linkTokenContract = drizzle.contracts.LinkTokenInterface;
        const oracleLinkBalanceKey = await linkTokenContract.methods["balanceOf"].cacheCall(drizzle.contracts.Oracle.address);

        const ATokenContract = drizzle.contracts.AToken;
        const aLinkBalanceKey = await ATokenContract.methods["balanceOf"].cacheCall(drizzle.contracts.Flannel.address);

        setExtBalances({
            ...extBalances,
            oracle: oracleLinkBalanceKey,
            aLink: aLinkBalanceKey,
        })
    }, [])


    const nodeBalance = useCallback(async () => {
        let bal = (typeof nodeAddress !== 'undefined') ? await drizzle.web3.eth.getBalance(nodeAddress.value[1]) : '0'

        setExtBalances({
            ...extBalances,
            node: bal
        })

    }, [drizzleState])

    // Update Balances
    useEffect(() => {

        nodeBalance();

    }, [drizzleState, nodeBalance])

    const toolToggle = (prev, e) => {
        setTooltip({
            ...tooltip,
            [e.target.id]: !prev
        })
    };

    const SetBalance = (bal) => {
        return (
            <h2> {(bal.bal && props.formatData(true, bal.bal.value, "", true))} </h2>
        );
    }

    // Cachecall() lookup variables
    const oracleBal = LinkTokenInterface.balanceOf[extBalances.oracle];
    const aLinkBal = AToken.balanceOf[extBalances.aLink];
    const nodeBal = extBalances.node;

    return (
        <div >
            <Form>
                <Row form >
                    <Col md={4}>
                        <FormGroup className="balance-col">
                            <SetBalance bal={oracleBal} />
                            <h6> LINK </h6>
                            <p></p>
                            <h5> ORACLE </h5>
                            <img src={info_icon} id="oracleInfo" />
                            <Tooltip placement="bottom" isOpen={tooltip.oracleInfo} target="oracleInfo" toggle={(e) => toolToggle(tooltip.oracleInfo, e)}>
                                Full Oracle Balance: {(oracleBal && props.formatData(true, oracleBal.value, "LINK", false))}
                            </Tooltip>
                            <p> </p>
                        </FormGroup>
                    </Col>
                    <Col md={4}>
                        <FormGroup className="balance-col">
                            <h2> {(props.formatData(true, nodeBal, "", true))} </h2>
                            <h6> ETH </h6>
                            <p></p>
                            <h5> NODE </h5>
                            <img src={info_icon} id="nodeInfo" />
                            <Tooltip placement="bottom" isOpen={tooltip.nodeInfo} target="nodeInfo" toggle={(e) => toolToggle(tooltip.nodeInfo, e)}>
                                Full Node Balance: {(nodeBal && props.formatData(true, nodeBal, "ETH", false))}
                            </Tooltip>
                            <p></p>
                        </FormGroup>
                    </Col>
                    <Col md={4}>
                        <FormGroup className="balance-col">
                            <SetBalance bal={aLinkBal} />
                            <h6> aLINK </h6>
                            <p></p>
                            <h5> EARN </h5>
                            <img src={info_icon} id="earnInfo" />
                            <Tooltip placement="bottom" isOpen={tooltip.earnInfo} target="earnInfo" toggle={(e) => toolToggle(tooltip.earnInfo, e)}>
                                Full aLINK Balance: {(aLinkBal && props.formatData(true, aLinkBal.value, "aLINK", false))}
                            </Tooltip>
                            <p></p>
                        </FormGroup>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

export default Balance;
