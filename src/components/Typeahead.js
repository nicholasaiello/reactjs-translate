import React, { Component } from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import HistoryQueue from './HistoryQueue';


const KEY_HISTORY = '__history1';
const MAX_HISTORY_ITEMS = 10;

class Typeahead extends Component {

  constructor(props) {
    super(props);
    this.historyQueue = new HistoryQueue(KEY_HISTORY, MAX_HISTORY_ITEMS);
    this.state = {
      disabled: false,
      query: '',
      errorText: null,
      anchorEl: null,
      open: false };
  }

  componentWillMount = () => {
    this.historyQueue.restore();
  }

  componentWillUnmount = () => {
    this.historyQueue = null;
  }

  addToHistory = (text) => {
    if (!text) {
      return false;
    }

    return this.historyQueue
      .add(text, this.state.source, this.state.target);
  }

  handleInputFocus = (e) => {
    this.setState({ open: true, anchorEl: (e.target || e.currentTarget) });
    return true;
  }

  handleInputBlur = (e) => {
    this.setState({ open: false });
    return true;
  }

  handleInputChange = (e) => {
    if (!this.state.open) {
      this.handleInputFocus(e);
    }

    this.setState({ query: this.refs.query.value });
  }

  handleHistoryClick = (e, query) => {
    this.refs.query.value = query;
    this.setState({ query: query });
    this.handleFormSubmit(e);
  }

  handleFormSubmit = (e) => {
    e.preventDefault();

    const query = this.refs.query.value || '';
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

  renderHistoryItems(query) {
    return this.historyQueue.getAll()
      .filter((x) => query === '' || x.q.indexOf(query) !== -1)
      .map((x,i) => (
        <li key={'history-' + i}>
          <button onClick={(e) => this.handleHistoryClick(e, x.q)}>{x.q}</button>
        </li>
      ));
  }

  render() {

    let suggestionStyles = {}, query = '';
    const el = this.state.anchorEl;

    if (el) {
      query = el.value || '';
      suggestionStyles = {
        top: ((el.offsetTop + el.clientHeight + 1) + 'px'),
        left: ((el.offsetLeft ) + 'px'),
        width: (el.clientWidth + 'px')};
    }

    return (
      <form id={"typeahead"} ref={"typeahead"} onSubmit={this.handleFormSubmit}>
        <input
          ref={"query"}
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
        <ul className={"history-suggestions" + (this.state.open ? ' open' : '')}
          style={suggestionStyles}>
          {this.renderHistoryItems(query)}
        </ul>
      </form>
    );
  }

}

Typeahead.defaultProps = {
  onSubmit: (e, text) => {}
};

export default Typeahead;
