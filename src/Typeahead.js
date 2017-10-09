import React, { Component } from 'react';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

class Typeahead extends Component {

  constructor(props) {
    super(props);
    this.state = { disabled: false, errorText: null };
  }

  handleFormSubmit = (e) => {
    e.preventDefault();

    const form = document.forms[0],
      text = form.query.value || '';

    if (this.webSocket !== null && /^[\w\s\-\'\?\.\,]{2,256}$/.test(text)) {
      this.setState({ disabled: true, errorText: null });

      if (this.submitTimeoutId) {
        clearTimeout(this.submitTimeoutId);
      }

      this.submitTimeoutId = setTimeout(() => {
        this.props.onSubmit(e, text);
        this.setState({ disabled: false });
      }, 500);
    } else {
      this.setState({ errorText: 'Input must be alphanumeric, 256 chars max' });
    }
  }

  render() {
    return (
      <form onSubmit={this.handleFormSubmit} style={this.props.formStyles}>
        <TextField
          name={"query"}
          style={{margin: '4px 16px', flex: '0 0 50%'}}
          disabled={this.state.disabled}
          autocomplete={"off"}
          hintText={"ex. How are you?"}
          errorText={this.state.errorText}
          floatingLabelText={"Enter word or phrase"}
          floatingLabelFixed={true} />
        <RaisedButton
          type={"submit"}
          label={"Translate"}
          secondary={true}
          style={{flex: '0 0 30%'}} />
      </form>
    );
  }

}

Typeahead.defaultProps = {
  formStyles: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    margin: '16px 0'
  },
  onSubmit: (e, text) => {}
};

export default Typeahead;
