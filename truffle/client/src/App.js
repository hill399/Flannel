import React, { useState } from "react";
import { DrizzleContext } from "drizzle-react";
import Header from './components/Header';
import Balance from './components/Balance';
import Oracle from './components/Oracle';
import TopUp from './components/TopUp';
import Earn from './components/Earn';
import Withdraw from './components/Withdraw';
import Admin from './components/Admin';
import History from './components/History';
import Landing from './components/Landing';
import Loading from './components/Loading';

import "./layout/App.css";

const App = () => {
  const [readyState, setReadyState] = useState(false);
  const [loadingState, setLoadingState] = useState(false);

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

  return (
    <DrizzleContext.Consumer>
      {drizzleContext => {
        const { drizzle, initialized, drizzleState } = drizzleContext;

        if (!initialized) {
          return "Loading...";
        }

        if (!readyState || !initialized) {
          return (
            <Landing drizzle={drizzle} drizzleState={drizzleState} ready={setReadyState} addresses={setAddresses} />
          )
        }

        if (!loadingState) {
          return (
            <Loading drizzle={drizzle} drizzleState={drizzleState} loading={setLoadingState} addressKey={addresses} />
          )
        }

        return (
          <div className="App" style={{overflow: "hidden"}}>
            <Header drizzle={drizzle} drizzleState={drizzleState} setBalances={setBalances} setExtBalances={setExtBalances} addressKey={addresses} parameters={setParameters} />
            <Balance drizzle={drizzle} drizzleState={drizzleState} formatData={formatData} balanceKey={balances} extBalances={extBalances} parameterKey={parameters} addressKey={addresses} />
            <Oracle drizzle={drizzle} drizzleState={drizzleState} formatData={formatData} extBalances={extBalances} parameterKey={parameters} />
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
