
import React, { useState, Fragment } from "react"
//import { Button, Form, FormGroup, Input } from 'reactstrap';
import { FormGroup } from 'reactstrap';
import { Heading, Form, Button, Input, Text, Flash } from 'rimble-ui';
import { Error } from '@rimble/icons';

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
                web3Contract: new drizzle.web3.eth.Contract(Flannel.abi, '0xea4543fde5284895ad51f109e8601472d3c5739a')
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
                <Flash variant="danger">
                    <Error marginRight={"5px"} />
                    Unable to reach Ethereum network, please connect a web3 instance.
                </Flash>
            )
        } else if (drizzleState.web3.networkId !== REQ_NETWORK) {
            return (
                <Flash variant="danger">
                    <Error marginRight={"5px"} />
                    Connected to the wrong network. Please connect to the Ropsten network.
                </Flash>
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
                        <Heading as={"h1"}> Flannel </Heading>
                        <Text fontSize={24}> Chainlink Oracle Interface </Text>
                    </FormGroup>
                    <FormGroup>
                        <Input placeholder="Deployed Flannel Address" name="addressKey" type="text" onKeyDown={handleKeyPress} style={{ justifyContent: 'center', textAlign: 'center', minWidth: '30%', marginRight: '2px' }} onChange={updateField} />
                        <Button variant="success" style={{ marginTop: '15px' }} onClick={() => addContract(ready)} > Connect </Button>
                    </FormGroup>
                </Form>
            </div>
            <div>
                <Form style={{ padding: '0 30% 0 30%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <FormGroup style={{ paddingTop: '30px', color: 'black' }}>
                        <Text.p> Flannel is a management interface for your personal Chainlink oracle. Automate withdrawal of earnings, take advantage of DeFi
                            and keep your node topped up to avoid service interruptions.
                        </Text.p>
                        <img src={git_icon} id="gitIcon" alt="git-icon" style={{ cursor: "pointer" }} onClick={() => window.open('http://github.com/hill399/Flannel')} />
                        <p><Button.Text style={{ marginTop: '20px' }} onClick={() => viewDemo(ready)} > View Demo </Button.Text> </p>
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
