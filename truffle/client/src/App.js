import React, { useState } from "react";
import { DrizzleContext } from "drizzle-react";
import Header from './Header';
import Balance from './Balance';
import Oracle from './Oracle';
import TopUp from './TopUp';
import Earn from './Earn';
import Withdraw from './Withdraw';
import Admin from './Admin';
import History from './History';
import Landing from './Landing';

import "./App.css";

const App = () => {
  const [readyState, setReadyState] = useState(true);

  const [balances, setBalances] = useState({
    topUp: '',
    store: '',
    earn: ''
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

  return (
    <DrizzleContext.Consumer>
      {drizzleContext => {
        const { drizzle, drizzleState, initialized } = drizzleContext;

        if (!initialized) {
          return "Loading...";
        }

        if (!readyState) {
          return (
            <Landing drizzle={drizzle} ready={setReadyState} />
          )
        }

        return (
          <div className="App">
            <Header drizzle={drizzle} drizzleState={drizzleState} balances={setBalances} parameters={setParameters} addresses={setAddresses} />
            <Balance drizzle={drizzle} drizzleState={drizzleState} formatData={formatData} balanceKey={balances} parameterKey={parameters} addressKey={addresses} />
            <Oracle drizzle={drizzle} drizzleState={drizzleState} formatData={formatData} parameterKey={parameters} />
            <TopUp drizzle={drizzle} drizzleState={drizzleState} formatData={formatData} balanceKey={balances} parameterKey={parameters} />
            <Earn drizzle={drizzle} drizzleState={drizzleState} formatData={formatData} balanceKey={balances} parameterKey={parameters} />
            <Withdraw drizzle={drizzle} drizzleState={drizzleState} formatData={formatData} balanceKey={balances} parameterKey={parameters} />
            <Admin drizzle={drizzle} drizzleState={drizzleState} formatData={formatData} addressKey={addresses} parameterKey={parameters} />
            <History drizzle={drizzle} drizzleState={drizzleState} />
          </div>
        );
      }}

    </DrizzleContext.Consumer>
  )
}

export default App;
