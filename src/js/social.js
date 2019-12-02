document.addEventListener('DOMContentLoaded', () => {
  let parentLink = document.querySelector('[data-update-url]');
  if (parentLink) {
    parentLink = parentLink.getAttribute('data-update-url');
  }

  if (1 !== document.querySelectorAll('.fte_liveblog-template-default').length) {
    return;
  }

  document.addEventListener('click', (event) => {
    const story = event.currentTarget.parentElement.parentElement;
    const leftLocation = (screen.width / 2) - 300;
    const topLocation = (screen.height / 2) - 175;
    const options = `width=600,height=350,location=yes,status=yes,top=${topLocation}, left=${leftLocation}`;
    let shareUrl = '';
    let postLink;
    let postId;

    event.preventDefault();

    if (!event.target.matches('.share-facebook')) {
      return;
    }

    // individual story
    if (story.classList.contains('liveblog-entry-main')) {
      postLink = story.querySelector('.liveblog-meta-time').getAttribute('href');
      postId = event.currentTarget.parentElement.getAttribute('id');

    // overall page
    } else {
      postLink = parentLink || window.location.href;
      postId = document.querySelector('article').getAttribute('id');
    }

    shareUrl = `https://www.facebook.com/sharer.php?u=${encodeURIComponent(postLink)}`;

    window.open(shareUrl, postId, options);
  });

  document.addEventListener('click', (event) => {
    const story = event.currentTarget.parentElement.parentElement;
    const leftLocation = (screen.width / 2) - 300;
    const topLocation = (screen.height / 2) - 175;
    const options = `width=600,height=350,location=yes,status=yes,top=${topLocation}, left=${leftLocation}`;
    let shareUrl = '';
    let description;
    let header;
    let postLink;
    let postId;

    event.preventDefault();

    if (!event.target.matches('.share-twitter')) {
      return;
    }

    // individual story
    if (story.classList.contains('liveblog-entry-main')) {
      postLink = story.querySelector('.liveblog-meta-time').getAttribute('href');
      postId = event.currentTarget.parentElement.getAttribute('id');

      header = story.querySelector('.liveblog-entry-header');
      if (header) {
        description = header.innerText.trim();
      }

      if (!description) {
        description = story.querySelector('.liveblog-entry-content').innerText.trim();
      }

    // overall page
    } else {
      postLink = parentLink || window.location.href;
      postId = document.querySelector('article').getAttribute('id');
      description = document.querySelector('meta[name="description"]').getAttribute('content');
    }

    // truncate post to 140 characters (not 280)
    if (description.length > 140) {
      description = `${description.substr(0, 140)}…`;
    }

    shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${description} ${postLink}`)}`;

    window.open(shareUrl, postId, options);
  });
});
