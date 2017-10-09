import React, { Component } from 'react';
import * as Env from './constants/Env';

import Typeahead from './Typeahead';

import './App.css';


class App extends Component {

  constructor(props) {
    super(props)
    this.webSocket = null;
    this.state = { 
      fetching: false,
      translation: null,
      source: props.defaultSource,
      target: props.defaultTarget }
  }

  componentWillMount = () => {
    this.initWebSocket();
  }

  componentWillUnmount = () => {
    if (this.webSocket !== null) {
      this.webSocket.close();
    }
  }

  // FIXME refactor to a service w/ Promises
  initWebSocket = () => {
    this.webSocket = new WebSocket(Env.API_URL);
    this.webSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        this.setState({ translation: data.result.translatedText, fetching: false });
      } else {
        this.setState({ fetching: false });
      }
    }

    this.webSocket.onopen = (event) => {

    }

    this.webSocket.onclose = (event) => {
      this.webSocket = null;
    }
  }

  handleInputSubmit = (e, text) => {
    this.setState({ fetching: true });
    this.webSocket.send(
      JSON.stringify({
        to: this.state.target,
        frm: this.state.source,
        text: text})
    );
  }

  handleSourceSelectChange = (e) => {
    const element = e.target || e.currentTarget,
      value = element.value;

    if (value in this.props.codes && value !== this.state.target) {
      this.setState({source: value});
      return true;
    }

    return false;
  }

  handleTargetSelectChange = (e) => {
    const element = e.target || e.currentTarget,
     value = element.value;

    if (value in this.props.codes && value !== this.state.source) {
      this.setState({target: value});
      return true;
    }

    return false;
  }

  render() {

    const languageOptions = (value) => (
        Object.keys(this.props.codes).map((k, i) => (
          (<option key={i} value={k} selected={value === k}>{this.props.codes[k]}</option>)
        ))
    )

    return (
      <div className="App">
        <header>
          <h1 className="App-title">ReactJS Translate</h1>
        </header>
        <section id={"translation"} className={this.state.fetching ? 'loading' : ''}>
          <h5 className={"source"}>{this.state.source}</h5>
          <h5 className={"target"}>{this.state.target}</h5>
          <h3>{this.state.translation}</h3>
        </section>
        <section>
          <Typeahead onSubmit={(e, text) => this.handleInputSubmit(e, text)} />
        </section>
        <section>
          <select name="source" onChange={this.handleSourceSelectChange}>
            <option>From:</option>
            {languageOptions(this.state.source)}
          </select> 
          <select name="target" onChange={this.handleTargetSelectChange}>
            <option>To: </option>
            {languageOptions(this.state.target)}
          </select>
        </section>
      </div>
    )

  }
}

App.defaultProps = {
  codes: {
    en: 'English',
    es: 'Spanish',
    it: 'Italian',
    mal: 'Malayalam'
  },
  defaultSource: 'en',
  defaultTarget: 'es'
};

export default App;
