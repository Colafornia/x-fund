import React from 'react';
import FundList from 'src/components/fundList';
import {
  HashRouter as Router,
  Route,
  Switch,
} from "react-router-dom";
import 'antd/dist/antd.css';


function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/:codes">
            <FundList />
          </Route>
          <Route path="/">
            <FundList />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
