import React, { Component } from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import HistoryQueue from './HistoryQueue';


const KEY_HISTORY = '__history1';
const MAX_HISTORY_ITEMS = 5;

class Typeahead extends Component {

  constructor(props) {
    super(props);
    this.history = new HistoryQueue(KEY_HISTORY, MAX_HISTORY_ITEMS);
    this.state = { 
      disabled: false,
      errorText: null,
      anchorEl: null,
      popoverOpen: false };
  }

  componentWillMount = () => {
    this.history.restore();
  }

  componentWillUnmount = () => {
    this.history = null;
  }

  addToHistory = (text) => {
    if (!text) {
      return false;
    }

    return this.history.add(text, this.state.source, this.state.target);
  }

  handleWindowResize = (e) => {
    // HACK
    this.setState({ popoverOpen: true });
  }

  handleInputFocus = (e) => {
    window.addEventListener('resize', this.handleWindowResize);
    this.setState({ popoverOpen: true, anchorEl: (e.target || e.currentTarget) });
    return true;
  }

  handleInputBlur = (e) => {
    window.removeEventListener('resize', this.handleWindowResize);
    this.setState({ popoverOpen: false });
    return true;
  }

  handleInputChange = (e) => {
    if (!this.state.popoverOpen) {
      this.handleInputFocus(e);
    }
  }

  handleHistoryClick = (e, query) => {
    const form = document.forms[0];
    form.query.value = query;
    this.handleFormSubmit(e);
  }

  handleFormSubmit = (e) => {
    e.preventDefault();

    const form = document.forms[0],
      query = form.query.value || '';

    this.doFormSubmit(e, query);
  }

  doFormSubmit = (e, query) => {
    this.handleInputBlur();

    if (query && /^[\w\s\-\'\?\.\,]{2,256}$/.test(query)) {
      this.setState({ disabled: true, errorText: null });

      if (this.submitTimeoutId) {
        clearTimeout(this.submitTimeoutId);
      }

      this.submitTimeoutId = setTimeout(() => {
        this.addToHistory(query);

        this.props.onSubmit(e, query);
        this.setState({ disabled: false });
      }, 500);
    } else {
      this.setState({ errorText: 'Input must be alphanumeric, 256 chars max' });
    }
  } 

  render() {

    let suggestionStyles = {};
    const el = this.state.anchorEl;

    if (el) {
      suggestionStyles = {
        top: ((el.offsetTop + el.clientHeight + 1) + 'px'),
        left: ((el.offsetLeft ) + 'px'),
        width: (el.clientWidth + 'px')};
    }

    const historyItems = this.history.getAll().map((x, i) => (
      <li key={'history-' + i}>
        <button onClick={(e) => this.handleHistoryClick(e, x.q)}>{x.q}</button>
      </li>
    ));

    return (
      <form id={"typeahead"} onSubmit={this.handleFormSubmit} style={this.props.formStyles}>
        <input
          name={"query"}
          type={"text"}
          autoComplete={"off"}
          disabled={this.state.disabled}
          maxLength={"256"}
          placeholder={"Enter word or phrase (256 chars max.)"}
          onFocus={(e) => this.handleInputFocus(e)}
          onBlur={(e) => this.handleInputBlur(e)}
          onInput={(e) => this.handleInputChange(e)} />
        <RaisedButton
          type={"submit"}
          label={"Translate"}
          secondary={true}
          style={{flex: '0 0 30%'}} />
        <ul className={"history-suggestions" + (this.state.popoverOpen ? ' open' : '')}
          style={suggestionStyles}>
          {historyItems}
        </ul>
      </form>
    );
  }

}

Typeahead.defaultProps = {
  formStyles: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    margin: '16px 0'
  },
  onSubmit: (e, text) => {}
};

export default Typeahead;
