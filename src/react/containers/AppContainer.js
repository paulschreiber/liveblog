/* global jQuery */
/* eslint-disable class-methods-use-this */
/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as apiActions from '../actions/apiActions';
import * as configActions from '../actions/configActions';
import * as eventsActions from '../actions/eventsActions';
import * as userActions from '../actions/userActions';
import Entries from '../components/Entries';
import PaginationContainer from '../containers/PaginationContainer';
import EventsContainer from '../containers/EventsContainer';
import UpdateButton from '../components/UpdateButton';
import UpdateCount from '../components/UpdateCount';
import StatusFilter from '../components/StatusFilter';
import Editor from '../components/Editor';
import { triggerOembedLoad } from '../utils/utils';

class AppContainer extends Component {
  constructor() {
    super();
    this.eventsContainer = document.getElementById('liveblog-key-events');
  }

  componentDidMount() {
    const { loadConfig, getEntries, getEvents, startPolling } = this.props;
    loadConfig(window.liveblog_settings);
    getEntries(1, window.location.hash);
    startPolling();
    if (this.eventsContainer) {
      getEvents();
    }
  }

  componentDidUpdate(prevProps) {
    const { scrollToEntry, loading } = this.props;
    // If there is a hash link to specific entry, scroll again once all entries are rendered.
    if (!loading && prevProps.loading) {
      const hashId = window.location.hash.split('#')[1];
      scrollToEntry(`id_${hashId}`);
      jQuery(document).trigger('liveblog-loaded');
      triggerOembedLoad(false, true);
    }
  }

  render() {
    const { loading, entries, polling, mergePolling, config, total } = this.props;
    const isAdmin = config.is_admin;

    return (
      <div style={{ position: 'relative' }}>
        {
          isAdmin &&
          <Editor
            isEditing={false}
          />
        }
        <UpdateButton polling={polling} click={() => mergePolling()} />

        <div id="liveblog-action-wrapper">
          { isAdmin && <StatusFilter loading={loading} /> }
          { isAdmin && <UpdateCount entries={entries} config={config} total={total} /> }
        </div>

        <Entries loading={loading} entries={entries} config={config} />
        <PaginationContainer entries={entries} />
        {this.eventsContainer && <EventsContainer container={this.eventsContainer} title={this.eventsContainer.getAttribute('data-title')} />}
        { isAdmin && <UpdateCount entries={entries} config={config} total={total} /> }
      </div>
    );
  }
}

AppContainer.propTypes = {
  loadConfig: PropTypes.func,
  getEntries: PropTypes.func,
  getEvents: PropTypes.func,
  startPolling: PropTypes.func,
  api: PropTypes.object,
  entries: PropTypes.array,
  page: PropTypes.number,
  loading: PropTypes.bool,
  polling: PropTypes.array,
  mergePolling: PropTypes.func,
  config: PropTypes.object,
  scrollToEntry: PropTypes.func,
  total: PropTypes.number,
};

const filterPollingEntries = (pollingEntries, config, entries) => {
  let newPollingEntries = Object.values(pollingEntries);

  // Bail if you're in the admin.
  // Just give us the entries.
  if (config.is_admin) {
    return Object.keys(pollingEntries);
  }

  // Make array of IDs for entries that are loaded and ones that are loading
  const entryIds = Object.values(entries).map(entry => entry.id);
  const pollingEntryIds = newPollingEntries.map(entry => entry.id);

  // Compare the IDs for any differences. We only care about those since those are actually new.
  // The original polling entries object has a mix of old and new.
  const difference = pollingEntryIds.filter(x => !entryIds.includes(x));

  // Get an array of entries that match the difference IDs so we return a complete set of data.
  newPollingEntries = newPollingEntries.filter(entry => difference.includes(entry.id));

  return newPollingEntries;
};

const mapStateToProps = state => ({
  page: state.pagination.page,
  loading: state.api.loading,
  total: state.api.total,
  entries: Object.keys(state.api.entries).map(key => state.api.entries[key]),
  polling: filterPollingEntries(state.polling.entries, state.config, state.api.entries),
  config: state.config,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({
    ...configActions,
    ...apiActions,
    ...eventsActions,
    ...userActions,
  }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
