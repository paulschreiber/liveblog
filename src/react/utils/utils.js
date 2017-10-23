/* eslint-disable no-param-reassign */

/**
 * Apply updated entries to current entries.
 * @param {Object} currentEntries
 * @param {Array} newEntries
 */
export const applyUpdate = (currentEntries, newEntries) =>
  newEntries.reduce((accumulator, entry) => {
    const id = `id_${entry.id}`;

    if (entry.type === 'new') {
      accumulator = {
        ...accumulator,
        [id]: entry,
      };
    }

    if (entry.type === 'update') {
      if (Object.prototype.hasOwnProperty.call(accumulator, id)) {
        accumulator[id] = entry;
      } else {
        accumulator = {
          ...accumulator,
          [id]: entry,
        };
      }
    }

    if (entry.type === 'delete') {
      delete accumulator[id];
    }

    return accumulator;
  }, { ...currentEntries });

/**
 * Apply updated events to current events.
 * @param {Object} currentEntries
 * @param {Array} newEntries
 */
export const eventsApplyUpdate = (currentEntries, newEntries) =>
  newEntries.reduce((accumulator, entry) => {
    const id = `id_${entry.id}`;

    if (entry.type === 'new' && entry.key_event) {
      accumulator = {
        [id]: entry,
        ...accumulator,
      };
    }

    if (Object.prototype.hasOwnProperty.call(accumulator, id)) {
      accumulator[id] = entry;
    }

    if (!entry.key_event || entry.type === 'delete') {
      delete accumulator[id];
    }

    return accumulator;
  }, { ...currentEntries });

/**
 * Apply updates from polling to current entries
 * @param {Object} currentEntries
 * @param {Array} newEntries
 * @param {Boolean} renderNewEntries
 */
export const pollingApplyUpdate = (currentEntries, newEntries, renderNewEntries) =>
  newEntries.reduce((accumulator, entry) => {
    const id = `id_${entry.id}`;

    if (entry.type === 'new' && renderNewEntries) {
      accumulator = {
        [id]: entry,
        ...accumulator,
      };
    }

    if (entry.type === 'update' && Object.prototype.hasOwnProperty.call(accumulator, id)) {
      accumulator[id] = entry;
    }

    if (entry.type === 'delete') {
      delete accumulator[id];
    }

    return accumulator;
  }, { ...currentEntries });

/**
 * Determine whether we should render new entries or prompt the user that a new entry is available.
 * Will return false if the user is not on page one or if the user is on page 1 but the latest
 * entry is not on the screen.
 * @param {Number} page
 * @param {Object} entries
 * @param {Object} polling
 */
export const shouldRenderNewEntries = (page, entries, polling) => {
  if (page !== 1) return false;
  if (Object.keys(polling).length > 0) return false;
  const element = document.getElementById(Object.keys(entries)[0]);
  if (!element) return true;
  return element.getBoundingClientRect().y > 0;
};

/**
 * Determine the newest entry from current and updated entries
 * @param {Object} current
 * @param {Array} updates
 */
export const getNewestEntry = (current, updates) => {
  if (!current && !updates[0]) return false;
  if (!current && updates[0]) return updates[0];
  if (!updates[0]) return current;
  if (current.timestamp > updates[0].timestamp) return current;
  return updates[0];
};

/**
 * Returns a formated string indicating how long ago a timestamp was.
 * @param {Number} timestamp
 */
export const timeAgo = (timestamp) => {
  const units = [
    { name: 'second', limit: 60, in_seconds: 1 },
    { name: 'minute', limit: 3600, in_seconds: 60 },
    { name: 'hour', limit: 86400, in_seconds: 3600 },
    { name: 'day', limit: 604800, in_seconds: 86400 },
    { name: 'week', limit: 2629743, in_seconds: 604800 },
    { name: 'month', limit: 31556926, in_seconds: 2629743 },
    { name: 'year', limit: null, in_seconds: 31556926 },
  ];

  let diff = (new Date() - new Date(timestamp * 1000)) / 1000;
  if (diff < 5) return 'now';

  let output;

  for (let i = 0; i < units.length; i += 1) {
    if (diff < units[i].limit || !units[i].limit) {
      diff = Math.floor(diff / units[i].in_seconds);
      output = `${diff} ${units[i].name}${(diff > 1 ? 's' : '')} ago`;
      break;
    }
  }

  return output;
};

export const getLastOfObject = object =>
  object[Object.keys(object)[Object.keys(object).length - 1]];

export const getFirstOfObject = object => object[Object.keys(object)[0]];

export const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);
