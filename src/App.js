import React, { Component } from 'react';
import * as Env from './constants/Env';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Typeahead from './components/Typeahead';

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
    this.webSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.success) {
        this.setState({ translation: data.result.translatedText, fetching: false });
      } else {
        this.setState({ fetching: false });
      }
    };

    this.webSocket.onclose = (e) => {
      this.webSocket = null;
    };

    this.webSocket.onerror = (e) => {
      this.handleWebSocketError(e);
    };
  }

  handleWebSocketError = (e) => {
    if (this.state.fetching) {
      alert('Looks like there was a connectinon issue. Please try again.');
      this.setState({ fetching: false });
    }
  }

  // push data to queue
  handleInputSubmit = (e, text) => {
    this.setState({ fetching: true });
    if (this.webSocket !== null) {
      try {
        this.webSocket.send(
          JSON.stringify({
            to: this.state.target,
            frm: this.state.source,
            text: text})
        );
      } catch(ex) {
        this.handleWebSocketError(e);
      }
    } else {
      this.initWebSocket();
    }
  }

  handleSourceSelectChange = (e, key, value) => {
    if (value && value !== this.state.target) {
      this.setState({source: value});
      return true;
    }

    return false;
  }

  handleTargetSelectChange = (e, key, value) => {
    if (value && value !== this.state.source) {
      this.setState({target: value});
      return true;
    }

    return false;
  }

  render() {

    const languageOptions = (value) => (
        Object.keys(this.props.codes).map((k, i) => (
          (<MenuItem key={i} value={k} primaryText={this.props.codes[k]} />)
        ))
    )

    return (
      <div className="App">
        <header>
          <h1 className="app-title">ReactJS Translate</h1>
        </header>
        <section id={"translation"} className={this.state.fetching ? 'loading' : ''}>
          <h5 className={"source"}>{this.state.source}</h5>
          <h5 className={"target"}>{this.state.target}</h5>
          <h3>{this.state.translation}</h3>
        </section>
        <section>
          <Typeahead onSubmit={(e, text) => this.handleInputSubmit(e, text)} />
        </section>
        <section id={"languages"}>
          <SelectField
            name="source"
            value={this.state.source}
            floatingLabelText={"From:"}
            onChange={this.handleSourceSelectChange}>
            {languageOptions(this.state.source)}
          </SelectField>
          <SelectField
            name="target"
            value={this.state.target}
            floatingLabelText={"To:"}
            onChange={this.handleTargetSelectChange}>
            {languageOptions(this.state.target)}
          </SelectField>
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
    fr: 'French',
    de: 'German',
    mal: 'Malayalam'
  },
  defaultSource: 'en',
  defaultTarget: 'es'
};

export default App;
