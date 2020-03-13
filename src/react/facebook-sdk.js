if ( ! document.getElementById('fb-root')) {

	// create div required for fb
	const fbDiv = document.createElement('div');
	fbDiv.id = 'fb-root';
	document.body.appendChild(fbDiv);
}

// inject fb sdk.js
document.addEventListener( 'DOMContentLoaded', function() {
	(function(d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
} )
