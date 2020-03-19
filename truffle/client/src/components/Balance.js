
import React, { useState } from "react"
import { Row, Col, Form, FormGroup, Tooltip } from 'reactstrap';

import '../layout/App.css'
import info_icon from '../icons/simple-small.svg';

const Balance = (props) => {
    const [tooltip, setTooltip] = useState({
        oracleInfo: false,
        nodeInfo: false,
        earnInfo: false
    });

    const { extBalances } = props

    const toolToggle = (prev, e) => {
        setTooltip({
            ...tooltip,
            [e.target.id]: !prev
        })
    };

    // Cachecall() lookup variables
    const oracleBal = extBalances.oracle;
    const aLinkBal = extBalances.aLink; 
    const nodeBal = extBalances.node;

    return (
        <div >
            <Form>
                <Row form >
                    <Col md={4}>
                        <FormGroup className="balance-col">
                            <h2> {(props.formatData(true, oracleBal, "", true))} </h2>
                            <h6> LINK </h6>
                            <p></p>
                            <h5> ORACLE </h5>
                            <img src={info_icon} id="oracleInfo" alt="oracle-info" />
                            <Tooltip placement="bottom" isOpen={tooltip.oracleInfo} target="oracleInfo" toggle={(e) => toolToggle(tooltip.oracleInfo, e)}>
                                Full Oracle Balance: {props.formatData(true, oracleBal, "LINK", false)}
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
                            <img src={info_icon} id="nodeInfo" alt="node-info" />
                            <Tooltip placement="bottom" isOpen={tooltip.nodeInfo} target="nodeInfo" toggle={(e) => toolToggle(tooltip.nodeInfo, e)}>
                                Full Node Balance: {(nodeBal && props.formatData(true, nodeBal, "ETH", false))}
                            </Tooltip>
                            <p></p>
                        </FormGroup>
                    </Col>
                    <Col md={4}>
                        <FormGroup className="balance-col">
                            <h2> {(props.formatData(true, aLinkBal, "", true))} </h2>
                            <h6> aLINK </h6>
                            <p></p>
                            <h5> EARN </h5>
                            <img src={info_icon} id="earnInfo" alt="earn-info" />
                            <Tooltip placement="bottom" isOpen={tooltip.earnInfo} target="earnInfo" toggle={(e) => toolToggle(tooltip.earnInfo, e)}>
                                Full aLINK Balance: {props.formatData(true, aLinkBal, "aLINK", false)}
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
