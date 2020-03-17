
import React, { useEffect, Fragment } from "react"
import { Form, FormGroup } from 'reactstrap';

import Oracle from "../contracts/Oracle.json";

import '../layout/App.css'

const Loading = (props) => {
    // Drizzle / Contract props
    const { drizzle, drizzleState, loading, addressKey } = props
    const { Flannel } = drizzleState.contracts

    // Update Parameters
    useEffect(() => {
        const address = Flannel.getAddresses[addressKey];

        if ((address && address.value[0]) && typeof (drizzle.contracts.Oracle) === 'undefined') {
            let contractConfig = {
                contractName: Oracle.contractName,
                web3Contract: new drizzle.web3.eth.Contract(Oracle.abi, address.value[0])
            }

            let events = []

            drizzle.addContract(contractConfig, events);
            loading(true);
        }

    }, [drizzleState])

    return (
        <Fragment>
            <div className="landing">
                <Form style={{ padding: '10% 30% 1% 30%', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} >
                    <FormGroup>
                    <h1> Loading... </h1>
                    </FormGroup>
                </Form>
            </div>
        </Fragment>
    )
}

export default Loading;
