import React, { Component } from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';


const KEY_HISTORY = '__history';
const MAX_HISTORY_ITEMS = 5;

class Typeahead extends Component {

  constructor(props) {
    super(props);
    this.history = [];
    this.state = { 
      disabled: false,
      errorText: null,
      anchorEl: null,
      popoverOpen: false };
  }

  componentWillMount = () => {
    this.history = JSON.parse(
      window.localStorage.getItem(KEY_HISTORY) || '[]').filter((x) => x !== null);
  }

  componentWillUnmount = () => {
    this.history = null;
  }

  addToHistory = (text) => {
    if (!text) {
      return false;
    } else if (this.history.indexOf(text) !== -1) {
      delete this.history[this.history.indexOf(text)];
    } else if (this.history.length >= MAX_HISTORY_ITEMS) {
      this.history.pop();
    }

    this.history.unshift(text);
    window.localStorage.setItem(
      KEY_HISTORY, JSON.stringify(this.history.filter((x) => x !== null)));

    return true;
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
    e.preventDefault();
    this.doFormSubmit(e, query);
  }

  handleFormSubmit = (e) => {
    e.preventDefault();

    const form = document.forms[0],
      query = form.query.value || '';

    form.query.value = '';
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
        top: ((el.offsetTop + el.clientHeight - 18) + 'px'),
        left: ((el.offsetParent.offsetLeft ) + 'px'),
        width: (el.clientWidth + 'px')};
    }

    const historyItems = this.history.map((x, i) => (
      <li key={'history-' + i}>
        <button onClick={(e) => this.handleHistoryClick(e, x)}>{x}</button>
      </li>
    ));

    return (
      <form onSubmit={this.handleFormSubmit} style={this.props.formStyles}>
        <TextField
          name={"query"}
          style={this.props.textFieldStyles}
          disabled={this.state.disabled}
          autoComplete={"off"}
          hintText={"ex. How are you?"}
          errorText={this.state.errorText}
          floatingLabelText={"Enter word or phrase"}
          floatingLabelFixed={true}
          onFocus={(e) => this.handleInputFocus(e)}
          onBlur={(e) => this.handleInputBlur(e)}
          onChange={(e) => this.handleInputChange(e)} />
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
  textFieldStyles: {
    margin: '4px 16px',
    flex: '0 0 50%'
  },
  onSubmit: (e, text) => {}
};

export default Typeahead;
