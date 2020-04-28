import React, { useState } from "react";
import { DrizzleContext } from "drizzle-react";
import Header from './components/Header';
import Balance from './components/Balance';
import Oracle from './components/Oracle';
import TopUp from './components/TopUp';
import Earn from './components/Earn';
import Withdraw from './components/Withdraw';
import Admin from './components/Admin';
import Parameters from './components/Parameters';
import Activity from './components/History';
import Landing from './components/Landing';
import Loading from './components/Loading';

import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

import { Dashboard, FilterTiltShift, AttachMoney, Undo, Memory, Security, History } from '@rimble/icons';

import "./layout/App.css";

const App = () => {
  const [readyState, setReadyState] = useState(false);
  const [loadingState, setLoadingState] = useState(false);

  const [activePage, setActivePage] = useState("dashboard");

  const [balances, setBalances] = useState({
    topUp: '',
    store: '',
    earn: ''
  });

  const [extBalances, setExtBalances] = useState({
    oracle: '',
    node: '',
    aLink: ''
  });

  const [parameters, setParameters] = useState(null);

  const [addresses, setAddresses] = useState(null);

  const formatData = (output, data, symbol, reduce) => {
    if (output === true) {

      if (reduce === true) {
        data = Math.round((data / 1e18 + Number.EPSILON) * 100) / 100
      } else {
        data = data / 1e18
      }

      return String(data) + " " + (symbol);

    } else {
      return data * 1e18;
    }
  }

  const validateInput = (input) => {
    const regex = /^\d+\.?\d*$/;

    if (input === '' || regex.test(input)) {
      return true;
    } else {
      return false;
    }
  }

  const sidebarRender = () => {
    return (
      <SideNav onSelect={(selected) => {
        setActivePage(selected)
      }} style={{ backgroundColor: '#0b0bde', position: 'fixed' }}>
        <SideNav.Toggle />
        <SideNav.Nav defaultSelected="dashboard">
          <NavItem eventKey="dashboard">
            <NavIcon>
              <Dashboard />
            </NavIcon>
            <NavText>
              Dashboard
            </NavText>
          </NavItem>
          <NavItem eventKey="node">
            <NavIcon>
              <FilterTiltShift />
            </NavIcon>
            <NavText>
              Node
                  </NavText>
          </NavItem>
          <NavItem eventKey="earn">
            <NavIcon>
              <AttachMoney />
            </NavIcon>
            <NavText>
              Earn
                  </NavText>
          </NavItem>
          <NavItem eventKey="funds">
            <NavIcon>
              <Undo />
            </NavIcon>
            <NavText>
              Funds
                  </NavText>
          </NavItem>
          <NavItem eventKey="parameters">
            <NavIcon>
              <Memory />
            </NavIcon>
            <NavText>
              Parameters
                  </NavText>
          </NavItem>
          <NavItem eventKey="admin">
            <NavIcon>
              <Security />
            </NavIcon>
            <NavText>
              Admin
                  </NavText>
          </NavItem>
        </SideNav.Nav>
      </SideNav>
    )
  }


  return (
    <DrizzleContext.Consumer>
      {drizzleContext => {
        const { drizzle, initialized, drizzleState } = drizzleContext;

        if (!initialized) {
          console.log(drizzle)
          return "Loading, Web3 initialising...";
        }

        if (!readyState || !initialized) {
          return (
            <Landing drizzle={drizzle} drizzleState={drizzleState} ready={setReadyState} addresses={setAddresses} />
          )
        }

        if (!loadingState) {
          return (
            <Loading
              drizzle={drizzle}
              drizzleState={drizzleState}
              loading={setLoadingState}
              addressKey={addresses}
            />
          )
        }

        switch (activePage) {
          case "dashboard":
            return (
              <div className="App" style={{ overflow: "hidden", paddingLeft: '80px', paddingRight: '20px', paddingBottom: '100%' }}>
                {sidebarRender()}
                <Header
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  setBalances={setBalances}
                  setExtBalances={setExtBalances}
                  addressKey={addresses}
                  parameters={setParameters}
                />
                <Balance
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  formatData={formatData}
                  balanceKey={balances}
                  extBalances={extBalances}
                  parameterKey={parameters}
                  addressKey={addresses}
                />
                <Activity
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                />
              </div>
            )
          case "node":
            return (
              <div className="App" style={{ overflow: "hidden", paddingLeft: '80px', paddingRight: '20px', paddingBottom: '100%' }}>
                {sidebarRender()}
                <Header
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  setBalances={setBalances}
                  setExtBalances={setExtBalances}
                  addressKey={addresses}
                  parameters={setParameters}
                />
                <TopUp
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  formatData={formatData}
                  balanceKey={balances}
                  parameterKey={parameters}
                  validateInput={validateInput}
                  addressKey={addresses}
                  extBalances={extBalances}
                />
              </div>
            )
          case "earn":
            return (
              <div className="App" style={{ overflow: "hidden", paddingLeft: '80px', paddingRight: '20px', paddingBottom: '100%' }}>
                {sidebarRender()}
                <Header
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  setBalances={setBalances}
                  setExtBalances={setExtBalances}
                  addressKey={addresses}
                  parameters={setParameters}
                />
                <Earn
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  formatData={formatData}
                  balanceKey={balances}
                  parameterKey={parameters}
                  addressKey={addresses}
                  validateInput={validateInput}
                />
              </div>
            )
          case "funds":
            return (
              <div className="App" style={{ overflow: "hidden", paddingLeft: '80px', paddingRight: '20px', paddingBottom: '100%' }}>
                {sidebarRender()}
                <Header
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  setBalances={setBalances}
                  setExtBalances={setExtBalances}
                  addressKey={addresses}
                  parameters={setParameters}
                />
                <Withdraw
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  formatData={formatData}
                  balanceKey={balances}
                  parameterKey={parameters}
                  extBalances={extBalances}
                  validateInput={validateInput}
                />
              </div>
            )
          case "parameters":
            return (
              <div className="App" style={{ overflow: "hidden", paddingLeft: '80px', paddingRight: '20px', paddingBottom: '100%' }}>
                {sidebarRender()}
                < Header
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  setBalances={setBalances}
                  setExtBalances={setExtBalances}
                  addressKey={addresses}
                  parameters={setParameters}
                />
                <Parameters
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  formatData={formatData}
                  addressKey={addresses}
                  parameterKey={parameters}
                  validateInput={validateInput}
                />

              </div>
            )
          case "admin":
            return (
              <div className="App" style={{ overflow: "hidden", paddingLeft: '80px', paddingRight: '20px', paddingBottom: '100%' }}>
                {sidebarRender()}
                <Admin
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  formatData={formatData}
                  addressKey={addresses}
                  parameterKey={parameters}
                  validateInput={validateInput}
                />
              </div>
            )
        }
      }}
    </DrizzleContext.Consumer >
  )
}

export default App;

/* <Balance
drizzle={drizzle}
drizzleState={drizzleState}
formatData={formatData}
balanceKey={balances}
extBalances={extBalances}
parameterKey={parameters}
addressKey={addresses}
/>
<Oracle
drizzle={drizzle}
drizzleState={drizzleState}
formatData={formatData}
extBalances={extBalances}
parameterKey={parameters}
validateInput={validateInput}
/>
<TopUp
drizzle={drizzle}
drizzleState={drizzleState}
formatData={formatData}
balanceKey={balances}
parameterKey={parameters}
validateInput={validateInput}
/>
<Earn
drizzle={drizzle}
drizzleState={drizzleState}
formatData={formatData}
balanceKey={balances}
parameterKey={parameters}
validateInput={validateInput}
/>
<Withdraw
drizzle={drizzle}
drizzleState={drizzleState}
formatData={formatData}
balanceKey={balances}
parameterKey={parameters}
validateInput={validateInput}
/>
<Admin
drizzle={drizzle}
drizzleState={drizzleState}
formatData={formatData}
addressKey={addresses}
parameterKey={parameters}
validateInput={validateInput}
/>
<History
drizzle={drizzle}
drizzleState={drizzleState}
/> */