import React from "react";
import "./App.css";
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Register from "./components/authentication/Register";
import Login from "./components/authentication/Login";
import Alert from "./components/layout/Alert";
//redux
import { Provider } from "react-redux";
import store from "./store/store";

function App() {
  return (
    <Provider store={store}>
      <Router>
        {/* <div className="App"> */}
        <Navbar />
        <Route exact path="/" component={Landing} />
        <section className="container">
          <Alert />
          <Switch>
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
          </Switch>
        </section>
        {/* </div> */}
      </Router>
    </Provider>
  );
}

export default App;
