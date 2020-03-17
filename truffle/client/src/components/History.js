
import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, Table, Label } from 'reactstrap';

import '../layout/App.css'

const History = (props) => {
    // UI state keys
    const [isOpen, setIsOpen] = useState(true);

    // Contract variable keys
    const [addressKey, setAddressKey] = useState(null);
    const [ownerKey, setOwnerKey] = useState(null);
    const [historyKey, setHistoryKey] = useState({
        data: []
    })

    // Drizzle / Contract props
    const { drizzle, drizzleState } = props
    const { Flannel } = drizzleState.contracts

    // Update effects
    useEffect(() => {
        const FlannelContract = drizzle.contracts.Flannel
        const addressKey = FlannelContract.methods.getAddresses.cacheCall();
        setAddressKey(addressKey);

        const ownerKey = FlannelContract.methods.owner.cacheCall();
        setOwnerKey(ownerKey);

        setHistoryKey(getHistory())
    }, [drizzle.contracts.Flannel])

    // Tab functions
    const toggle = () => setIsOpen(!isOpen);

    // Function to get relevant TXs from past 50 blocks

    const getHistory = () => {
        let account = drizzle.contracts.Flannel.address;

        let txArray = { data: [] }

        drizzle.web3.eth.getBlockNumber().then(function (endBlock) {
            for (let i = endBlock; i >= (endBlock - 50); i--) {
                drizzle.web3.eth.getBlock(i, true).then(function (block) {
                    if (block != null && block.transactions != null) {
                        block.transactions.forEach(function (e) {
                            if (account === e.from || account === e.to) {
                                let newTx = { timestamp: block.timestamp, from: e.from, input: e.input };
                                txArray.data.push(newTx);
                            }
                        })
                    }
                })
            }
        })

        return txArray;
    }

    // Function to lookup incoming address to make user readable

    const addressLookup = (address) => {
        const adminAddress = Flannel.getAddresses[addressKey];
        const owner = Flannel.owner[ownerKey];

        if (address === (owner && owner.value)) {
            return "Owner"
        } else if (address === (adminAddress && adminAddress.value[1])) {
            return "Node"
        } else {
            return address
        }
    }

    // Function to lookup TX data to make function user readable

    const funcLookup = (data) => {
        switch (data.slice(0, 10)) {
            case "0x8a3ae54f":
                return "Oracle Withdrawal";
            case "0xcbd8b036":
                return "Node Top-Up";
            case "0x746fa26e":
                return "Aave Deposit";
            case "0x9aee8f5b":
                return "Aave Withdrawal";
            case "0x45a190af":
                return "Oracle Configured";
            case "0x284503f5":
                return "Flannel Withdrawal";
            case "0x08c00746":
                return "Flannel Parameters Changed";
            case "0x32b5d1ab":
                return "Flannel Rebalanced";
            case "0x0cbfef9f":
                return "Oracle Ownership Reverted";
            case "0x86b12681":
                return "Co-ordinator Called";
            default:
                return "Unknown";
        }
    }

    // Function to produce dynamic table elements

    const PersonRow = (props) => {
        let dateObj = new Date(props.data.timestamp * 1000);
        let utcString = dateObj.toUTCString();

        return (
            <tr>
                <th scope="row">{utcString}</th>
                <td> {addressLookup(props.data.from)} </td>
                <td> {funcLookup(props.data.input)} </td>
            </tr>
        );
    }

    // Variable to hold dynamic mapped JSX elements

    let rows = historyKey.data.map(tx => {
        return <PersonRow key={tx.timestamp} data={tx} />
    })

    return (
        <div className="section">
            <Card style={{ paddingLeft: '20px' }}>
                <div className="row">
                    <div className="col" style={{ paddingTop: '15px' }}><h4> History </h4></div>
                    <div className="col-auto"> <Button outline color="primary" size="sm" onClick={toggle} className="button-sh"> &#709; </Button></div>
                </div>
                <Collapse isOpen={isOpen}>
                    <CardBody>
                        <Label> Last 50 Blocks </Label>
                        <Table style={{ paddingRight: '10px' }} >
                            <thead>
                                <tr>
                                    <th> # </th>
                                    <th> From </th>
                                    <th> Function </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </Table>
                    </CardBody>
                </Collapse>
            </Card>
        </div>
    )
}

export default History;
