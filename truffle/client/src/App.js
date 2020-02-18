import React from "react";
import { DrizzleContext } from "drizzle-react";
import Header from './Header';
import Oracle from './Oracle';
import TopUp from './TopUp';
import Aave from './Aave';
import Withdraw from './Withdraw';
import Parameters from './Parameters';
import Admin from './Admin';

import "./App.css";

export default () => (
  <DrizzleContext.Consumer>
    {drizzleContext => {
      const { drizzle, drizzleState, initialized } = drizzleContext;

      if (!initialized) {
        return "Loading...";
      }

      return (
        <div className="App">
          <Header drizzle={drizzle} drizzleState={drizzleState} />
          <Oracle drizzle={drizzle} drizzleState={drizzleState} />
          <TopUp drizzle={drizzle} drizzleState={drizzleState} />
          <Aave drizzle={drizzle} drizzleState={drizzleState} />
          <Withdraw drizzle={drizzle} drizzleState={drizzleState} />
          <Parameters drizzle={drizzle} drizzleState={drizzleState} />
        </div>
      );
    }}
  </DrizzleContext.Consumer>
)

//           <Admin drizzle={drizzle} drizzleState={drizzleState} />