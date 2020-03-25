if (!document.getElementById('fb-root')) {
  // create div required for fb
  const fbDiv = document.createElement('div');
  fbDiv.id = 'fb-root';
  document.body.appendChild(fbDiv);
}

// inject fb sdk.js
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('facebook-jssdk')) {
    return;
  }
  const fjs = document.getElementsByTagName('script')[0];
  const js = document.createElement('script');
  js.id = 'facebook-jssdk';
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
});
