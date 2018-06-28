/* global wp,  tinymce, jQuery */
/* eslint-disable no-return-assign */
/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { debounce } from 'lodash-es';

import * as apiActions from '../actions/apiActions';

export const getTinyMCEContent = () => {
  const currentEditor = tinymce.activeEditor;
  const $textField = jQuery(`#${currentEditor.id}`);
  if ($textField.is(':visible')) {
    return $textField.val();
  }

  return currentEditor ? currentEditor.getContent() : '';
};

export const clearTinyMCEContent = () => {
  const currentEditor = tinymce.activeEditor;
  const $textField = jQuery(`#${currentEditor.id}`);
  $textField.val('');
  currentEditor.setContent('');
};

export const clearAuthors = () => {
  if (tinymce.activeEditor.clearAuthors) {
    tinymce.activeEditor.clearAuthors();
  }
};

export const clearHeadline = () => {
  if (tinymce.activeEditor.clearHeadline) {
    tinymce.activeEditor.clearHeadline();
  }
};

class TinyMCEEditor extends Component {
  constructor(props) {
    super(props);
    const { setPostingEnabled } = this.props;
    this.containerId = `live-editor-${Math.floor(Math.random() * 100000)}`;
    this.editorSettings = window.liveblog_settings.editorSettings;
    setTimeout(() => { // wait for load
      wp.editor.initialize(this.containerId, this.editorSettings);
      setTimeout(() => {
        const stateContent = this.props.rawText;
        tinymce.activeEditor.clearAuthors = this.props.clearAuthors;
        tinymce.activeEditor.clearHeadline = this.props.clearHeadline;
        if (stateContent && stateContent !== '' && stateContent !== '<p></p>') {
          tinymce.activeEditor.setContent(stateContent);
        }
        tinymce.activeEditor.off('input');
        tinymce.activeEditor.on('input', debounce(() => {
          const content = tinymce.activeEditor.getContent();
          const postingEnabled = content.length > 0 && content.length < 65535;
          setPostingEnabled(postingEnabled);
        }, 250));
        tinymce.activeEditor.focus(); // Set focus to active editor
      }, 250);
    }, 10);
  }

  render() {
    return <textarea className="liveblog-editor-textarea" id={this.containerId} />;
  }
}
TinyMCEEditor.propTypes = {
  setPostingEnabled: PropTypes.func,
};

const mapStateToProps = state => (state);

const mapDispatchToProps = dispatch =>
  bindActionCreators({
    ...apiActions,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TinyMCEEditor);
