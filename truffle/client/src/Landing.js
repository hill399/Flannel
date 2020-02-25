
import React, { useState, Fragment } from "react"
import { Button, Form, FormGroup, Input } from 'reactstrap';

import Flannel from "./contracts/Flannel.json";

import './App.css'

const Landing = (props) => {
    // User input keys
    const [addressKey, setAddressKey] = useState(null);

    // Drizzle / Contract props
    const { drizzle, ready } = props

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

        drizzle.addContract(contractConfig, events)
        state(true);
    }

    return (
    <Fragment>
        <div className="landing">
            <Form style={{ padding: '10% 30% 1% 30%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} >
                <FormGroup>
                    <h1> Flannel </h1>
                    <h2> LOGO HERE </h2>
                </FormGroup>
                <FormGroup>
                    <Input placeholder="Deployed Flannel Address" name="addressKey" type="text" onChange={updateField} />
                    <Button color="success" style={{ marginTop: '15px' }} onClick={() => addContract(ready)} > Connect </Button>
                </FormGroup>
            </Form>
        </div>
        <div>
            <Form style={{ padding: '0 30% 0 30%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <FormGroup style={{ paddingTop: '30px', color: 'black' }}>
                    <p> This is where you should add a description about what this is. Make something succinct up.</p>
                </FormGroup>
                <FormGroup style={{ paddingTop: '30px' }}>
                    <p> Add github links here with icons here </p>
                </FormGroup>
            </Form >
        </div>
        </Fragment>
    )
}

export default Landing;
