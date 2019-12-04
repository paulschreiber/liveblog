import React from 'react';
import PropTypes from 'prop-types';

const EntryShare = ({ entry }) => {
  const leftLocation = (screen.width / 2) - 300;
  const topLocation = (screen.height / 2) - 175;
  const fbShareUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(entry.share_link)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(entry.share_description)}&url=${encodeURIComponent(entry.share_link)}`
  const options = `width=600,height=350,location=yes,status=yes,top=${topLocation},left=${leftLocation}`;

  const openFbShare = (event) => {
    event.preventDefault();
    window.open(fbShareUrl, entry.id, options);
  };

  const openTwitterShare = (event) => {
    event.preventDefault();
    window.open(twitterShareUrl, entry.id, options);
  };

  return (
    <div className="liveblog-share" id={`liveblog-update-${entry.id}-share`}>
      <a onClick={openFbShare} target="_blank" rel="noopener noreferrer" href={fbShareUrl} className="share-social share-facebook">
        <span className="screen-reader-text">Share on Facebook</span>
      </a>
      <a onClick={openTwitterShare} target="_blank" rel="noopener noreferrer" href={twitterShareUrl} className="share-social share-twitter">
        <span className="screen-reader-text">Share on Twitter</span>
      </a>
    </div>
  );
};

EntryShare.propTypes = {
  entry: PropTypes.object,
};

export default EntryShare;
