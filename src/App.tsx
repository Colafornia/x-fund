import React from 'react';
import { Layout, Card } from 'antd';
import FundList from 'src/components/fundList';
import Similarity from 'src/components/similarity';
import {
  HashRouter as Router,
  Route,
  Switch,
} from "react-router-dom";
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import 'antd/dist/antd.css';

import rootReducer from './reducers';

const store = createStore(rootReducer);

const { Content } = Layout;

function App() {
  console.log("%c+",
  `font-size: 1px;
  padding: 122px 217px;
  background-image: url(https://i01piccdn.sogoucdn.com/982a9917ddc1a5b2);
  background-size: contain;
  background-repeat: no-repeat;
  color: transparent;`);
  console.log('Joy, you are the apple of my eyes.');
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Layout style={{ minHeight: '100vh' }}>
            <Content>
              <Card
                title="X-FUND"
                bordered={false}
                extra={<span style={{ color: '#999', fontWeight: 400 }}>个人基金工具，数据来源天天基金、东方财富网</span>}
              >
                <Switch>
                  <Route path="/similarity">
                    <Similarity />
                  </Route>
                  <Route path="/:codes">
                    <FundList />
                  </Route>
                  <Route path="/">
                    <FundList />
                  </Route>
                </Switch>
              </Card>
            </Content>
          </Layout>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
