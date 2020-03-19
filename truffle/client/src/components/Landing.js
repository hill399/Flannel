
import React, { useState, Fragment } from "react"
import { Button, Form, FormGroup, Input } from 'reactstrap';

import Flannel from "../contracts/Flannel.json";

import '../layout/App.css'
import git_icon from '../icons/GitHub-Mark-32px.png';

const REQ_NETWORK = 3;

const Landing = (props) => {
    // User input keys
    const [addressKey, setAddressKey] = useState(null);
    const [networkSafe, setNetworkSafe] = useState(false);

    // Drizzle / Contract props
    const { drizzle, drizzleState, ready, addresses } = props

    // Field update functions
    const updateField = e => {
        setAddressKey(e.target.value);
    }

    const handleKeyPress = e => {
        if(e.keyCode === 13){
            addContract(ready);
        }
    }

    // Function to dynamically add Flannel details to drizzle state
    const addContract = (state) => {
        if (networkSafe) {
            if (drizzle.web3.utils.isAddress(addressKey)) {
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
            } else {
                alert('Please enter a valid Ethereum address');
            }
        }
    }

    // Function to dynamically add Flannel details to drizzle state
    const viewDemo = (state) => {
        if (networkSafe) {
            let contractConfig = {
                contractName: Flannel.contractName,
                web3Contract: new drizzle.web3.eth.Contract(Flannel.abi, '0x5c756b8dfa70b7aca3c2f97cac92f75d40953e6b')
            }

            let events = []

            drizzle.addContract(contractConfig, events);

            const flannelContract = drizzle.contracts.Flannel
            const address = flannelContract.methods.getAddresses.cacheCall();


            addresses(address);
            state(true);
        }
    }

    const CheckCorrectNetwork = () => {
        if (typeof (drizzleState.web3.networkId) === 'undefined') {
            return (
                <FormGroup className="network-col">
                    <p> Unable to reach Ethereum network, please connect a web3 instance. </p>
                </FormGroup>
            )
        } else if (drizzleState.web3.networkId !== REQ_NETWORK) {
            return (
                <FormGroup className="network-col">
                    <p> Connected to the wrong network. Please connect to the Ropsten network. </p>
                </FormGroup>
            )
        } else {
            setNetworkSafe(true);
            return null;
        }
    }

    return (
        <Fragment>
            <div className="landing">
                <Form style={{ padding: '10% 30% 1% 30%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} >
                    <FormGroup>
                        <h1> Flannel </h1>
                        <h4> Chainlink Oracle Interface </h4>
                    </FormGroup>
                    <FormGroup>
                        <Input placeholder="Deployed Flannel Address" name="addressKey" type="text" onKeyDown={handleKeyPress} style={{ justifyContent: 'center', textAlign: 'center' }} onChange={updateField} />
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
                        <img src={git_icon} id="gitIcon" alt="git-icon" style={{ cursor: "pointer" }} onClick={() => window.open('http://github.com/hill399/Flannel')} />
                        <p><Button color="link" style={{ marginTop: '20px' }} onClick={() => viewDemo(ready)} > View Demo </Button> </p>
                    </FormGroup>
                </Form >
            </div>
            <div>
                <Form style={{ padding: '0 30% 0 30%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <CheckCorrectNetwork />
                </Form >
            </div>
        </Fragment>
    )
}

export default Landing;
