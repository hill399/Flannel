import React, { useState, useEffect } from "react"
import { Collapse, Button, CardBody, Card, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col } from 'reactstrap';

import './App.css'

const Parameters = (props) => {
  const [parametersKey, setParametersKey] = useState(null)
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('1');

  const { drizzle, drizzleState } = props
  const { Flannel } = drizzleState.contracts

  useEffect(() => {
    const flannelContract = drizzle.contracts.Flannel
    const parametersKey = flannelContract.methods.userStoredParams.cacheCall()
    setParametersKey(parametersKey)
  }, [parametersKey, drizzle.contracts.Flannel])

  const toggle = () => setIsOpen(!isOpen);

  const tabToggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  }

  const formatData = (data, symbol) => {
    return (
      String(data / 1e18) + " " + (symbol)
    )
  }

  const parameters = Flannel.userStoredParams[parametersKey]

  return (
    // if it exists, then we display its value
    <div className="section">
    <Card style={{ paddingLeft: '20px'}}>
      <div className="row">
        <div className="col" style={{ paddingTop: '15px' }}><h2> Flannel Parameters </h2></div>
        <div className="col-auto"> <Button color="primary" onClick={toggle} style={{ margin: '10px 20px 15px 0px' }}>Show/Hide</Button></div>
      </div>
      <Collapse isOpen={isOpen}>    
          <CardBody>
            <Nav tabs>
              <NavItem>
                <NavLink onClick={() => { tabToggle('1'); }}>
                  Withdraw
              </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={() => { tabToggle('2'); }}>
                  Top-Up
              </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Row>
                  <Col sm="12">
                    <p></p>
                    <p> LINK Withdraw Threshold: {parameters && formatData(parameters.value[4], "LINK")}</p>
                    <p> For Storage : {parameters && parameters.value[1]} % </p>
                    <p> For Aave : {parameters && parameters.value[2]} %</p>
                    <p> For Top-Up : {parameters && parameters.value[3]} %</p>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tabId="2">
                <Row>
                  <Col sm="12">
                    <p></p>
                    <p> ETH Top-Up Threshold: {parameters && formatData(parameters.value[5], "ETH")}</p>
                    <p> ETH Top-Up Amount: {parameters && formatData(parameters.value[6], "ETH")}</p>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </CardBody>
        
      </Collapse>
      </Card>
    </div>
  )
}

export default Parameters;
