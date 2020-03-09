
import React, { useState, Fragment } from "react"
import { Button, Form, FormGroup, Input } from 'reactstrap';

import Flannel from "./contracts/Flannel.json";

import './App.css'
import git_icon from './icons/GitHub-Mark-32px.png';

const Landing = (props) => {
    // User input keys
    const [addressKey, setAddressKey] = useState(null);

    // Drizzle / Contract props
    const { drizzle, ready, addresses } = props

    // Field update functions
    const updateField = e => {
        setAddressKey(e.target.value);
    }

    // Function to dynamically add Flannel details to drizzle state
    const addContract = (state) => {
        let contractConfig = {
            contractName: Flannel.contractName,
            web3Contract: new drizzle.web3.eth.Contract(Flannel.abi, addressKey)
        }

        let events = []

        drizzle.addContract(contractConfig, events);

        const flannelContract = drizzle.contracts.Flannel
        const address = flannelContract.methods.getAddresses.cacheCall();

        addresses(address);

        state(true);
    }

    return (
        <Fragment>
            <div className="landing">
                <Form style={{ padding: '10% 30% 1% 30%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} >
                    <FormGroup>
                        <h1> Flannel </h1>
                    </FormGroup>
                    <FormGroup>
                        <Input placeholder="Deployed Flannel Address" name="addressKey" type="text" style={{ justifyContent: 'center', textAlign: 'center' }} onChange={updateField} />
                        <Button color="success" style={{ marginTop: '15px' }} onClick={() => addContract(ready)} > Connect </Button>
                    </FormGroup>
                </Form>
            </div>
            <div>
                <Form style={{ padding: '0 30% 0 30%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <FormGroup style={{ paddingTop: '30px', color: 'black' }}>
                        <p> Flannel is a management interface for your personal Chainlink oracle. Automate withdrawal of earnings, take advantage of DeFi
                            and keep your node topped up to avoid service interruptions.
                        </p>
                        <p> 0x5dddd91c5c80280f4462bc9dfb4fc2124ac40b59 </p>
                        <img src={git_icon} id="gitIcon" style={{ cursor: "pointer" }} onClick={() => window.open('http://github.com/hill399/Flannel')} />
                    </FormGroup>
                </Form >
            </div>
        </Fragment>
    )
}

export default Landing;
