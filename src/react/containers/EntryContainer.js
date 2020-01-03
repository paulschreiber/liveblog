/* eslint-disable no-return-assign */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import * as userActions from '../actions/userActions';
import { triggerOembedLoad, formattedTime } from '../utils/utils';
import Editor from '../components/Editor';
import DeleteConfirmation from '../components/DeleteConfirmation';
import EntryShare from '../components/EntryShare';

const authorLink = (author) => {
  let result = '';
  let slug = '';
  if (typeof author !== 'undefined' && author && author.name) {
    slug = author.name.toLowerCase();
    slug = slug.replace(/[^%a-z0-9 _-]/g, '');
    slug = slug.replace(/\s+/g, '-');
    slug = slug.replace(/-+/g, '-');

    result = `/contributors/${slug}/`;
  }
  return result;
};

class EntryContainer extends Component {
  constructor(props) {
    super(props);

    this.isEditing = () => {
      const { user, entry } = this.props;
      return user.entries[entry.id] && user.entries[entry.id].isEditing && !this.isLockedEntry();
    };
    this.edit = (event) => {
      event.preventDefault();
      this.props.entryEditOpen({
        entryId: this.props.entry.id,
        config: this.props.config,
      });
    };
    this.updateStatus = (status) => {
      const { entry, updateEntry } = this.props;
      const { id, content, authors, headline } = entry;
      const authorIds = authors.map(author => author.id);

      this.setState({ updating: true });

      updateEntry({
        id,
        content,
        authors,
        authorIds,
        headline,
        status,
        statusUpdate: true,
      });
    };
    this.delete = (event) => {
      event.preventDefault();
      this.props.deleteEntry(this.props.entry.id);
    };
    this.scrollIntoView = () => {
      this.node.scrollIntoView({ block: 'start', behavior: 'smooth' });
      this.props.resetScrollOnEntry(`id_${this.props.entry.id}`);
    };
    this.state = {
      showPopup: false,
      updating: false,
    };
  }

  togglePopup(event) {
    event.preventDefault();
    this.setState({
      showPopup: !this.state.showPopup,
    });
  }

  isLockedEntry() {
    const { locked } = this.props.entry;
    const currentUser = parseInt(this.props.config.current_user.id, 10);
    const lockedUser = parseInt(this.props.entry.locked_user.id, 10);
    const isLocked = locked && lockedUser !== currentUser;
    return isLocked;
  }

  componentDidMount() {
    const { activateScrolling } = this.props.entry;
    triggerOembedLoad(this.node);
    if (activateScrolling) {
      this.scrollIntoView();
    }

    // Listen for a tab close and remove the lock.
    window.addEventListener('beforeunload', () => {
      if (this.isLockedEntry) {
        this.props.entryEditClose({
          entryId: this.props.entry.id,
          config: this.props.config,
        });
      }
    });
  }

  componentDidUpdate(prevProps) {
    const { activateScrolling, status, id } = this.props.entry;
    const isEditing = this.props.user.entries[id] && this.props.user.entries[id].isEditing;
    const wasEditing = prevProps.user.entries[id] && prevProps.user.entries[id].isEditing;
    const contentChanged = this.props.entry.render !== prevProps.entry.render;

    if (activateScrolling && activateScrolling !== prevProps.entry.activateScrolling) {
      this.scrollIntoView();
    }

    if (contentChanged || (isEditing !== wasEditing && !isEditing)) {
      triggerOembedLoad(this.node);
    }
    if (status !== prevProps.entry.status) {
      this.setState({ updating: false });
    }
  }

  entryActions() {
    const { entry, config } = this.props;
    const { status } = entry;
    const statusLabel = 'publish' === status ? 'Unpublish' : 'Publish';
    const newStatus = 'publish' === status ? 'draft' : 'publish';
    const isLocked = this.isLockedEntry();

    if (!config.is_admin) {
      return false;
    }

    return (
      <footer className="liveblog-entry-tools">
        { isLocked && <div className="locked-info">
          <span className="locked-avatar" dangerouslySetInnerHTML={{ __html: entry.locked_user.avatar }} />
          <span className="locked-text">{entry.locked_user.name} is currently editing</span>
        </div> }

        <div className="liveblog-entry-actions">
          { isLocked && <span className="dashicons dashicons-lock"></span> }
          <button
            className="liveblog-btn liveblog-btn-small liveblog-btn-edit"
            onClick={this.edit}
            disabled={this.state.updating || (isLocked && !config.current_user.can_unlock)}
          >
            Edit
          </button>
          <button
            className={`liveblog-btn liveblog-btn-small liveblog-btn-status ${newStatus}`}
            onClick={ (event) => {
              event.preventDefault();
              this.updateStatus(newStatus);
            } } key={entry.entry_time}
            disabled={this.state.updating || isLocked}>
            {statusLabel}{this.state.updating ? '…' : ''}
          </button>
          <button
            className="liveblog-btn liveblog-btn-small liveblog-btn-delete"
            onClick={this.togglePopup.bind(this)}
            disabled={this.state.updating || isLocked}>
            Delete
          </button>
        </div>
      </footer>
    );
  }

  render() {
    const { entry, config } = this.props;

    // Filter out empty authors.
    entry.authors = Array.isArray(entry.authors) && entry.authors.filter(author => (author.id !== null && author.name !== null && author.key !== ''));
    return (
      <article
        id={`id_${entry.id}`}
        ref={node => this.node = node}
        className={`${entry.key_event ? 'is-key-event ' : ''} ${entry.css_classes}`}
      >
        <div className="liveblog-entry-main">
          {this.state.showPopup ?
            <DeleteConfirmation
              text="Are you sure you want to delete this entry?"
              onConfirmDelete={this.delete}
              onCancel={this.togglePopup.bind(this)}
            />
            : null
          }
          {
            (entry.authors && entry.authors.length > 0) &&
            <div className="liveblog-meta-avatars">
              {
                entry.authors.map(author => (
                  author.id &&
                  <a
                    key={author.id}
                    className="liveblog-meta-avatar"
                    href={authorLink(author)}
                    dangerouslySetInnerHTML={{ __html: author.avatar }} />
                ))
              }
            </div>
          }
          <header className="liveblog-meta">
            {
              (entry.authors && entry.authors.length > 0) &&
              <div className="liveblog-meta-authors">
                {
                  entry.authors.map((author, index, list) => (
                    author.id &&
                    <span className="liveblog-meta-author" key={author.id}>
                      <a href={authorLink(author)}>{author.name}</a>
                      {(index < list.length - 1) && ', '}
                    </span>
                  ))
                }
              </div>
            }
            <a className="liveblog-meta-time" href={entry.share_link}>
              <abbr data-entry-time={formattedTime(entry.entry_time, config.timezone_string, 'c')} className="liveblog-timestamp">{formattedTime(entry.entry_time, config.timezone_string, config.time_format)}</abbr>
            </a>
            { entry.headline &&
              <h2 className="liveblog-entry-header">
                {entry.headline}
              </h2>
            }
          </header>
          {
            this.isEditing()
              ? (
                <div className="liveblog-entry-edit">
                  <Editor entry={entry} isEditing={true} />
                </div>
              )
              : (
                <div
                  className="liveblog-entry-content"
                  dangerouslySetInnerHTML={{ __html: entry.render }}
                />
              )
          }
          {!this.isEditing() && this.entryActions()}
          <EntryShare entry={entry} />
        </div>
      </article>
    );
  }
}

EntryContainer.propTypes = {
  user: PropTypes.object,
  config: PropTypes.object,
  entry: PropTypes.object,
  entryEditOpen: PropTypes.func,
  entryEditClose: PropTypes.func,
  updateEntry: PropTypes.func,
  deleteEntry: PropTypes.func,
  activateScrolling: PropTypes.bool,
  resetScrollOnEntry: PropTypes.func,
  showPopup: PropTypes.bool,
};

const mapStateToProps = state => state;

const mapDispatchToProps = dispatch =>
  bindActionCreators({
    ...apiActions,
    ...userActions,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EntryContainer);
