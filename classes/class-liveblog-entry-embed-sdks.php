<?php

/**
 * Class Liveblog_Entry_Embed_SDKs
 *
 * As we're render posts in React it requires some SDKs to pulled in on page load
 */
class Liveblog_Entry_Embed_SDKs {

	/**
	 * @var A list of provider SDKs
	 */
	protected static $sdks = [
		'platform-twitter'   => 'https://platform.twitter.com/widgets.js',
		'instagram'          => 'https://platform.instagram.com/en_US/embeds.js',
		'reddit'             => 'https://embed.redditmedia.com/widgets/platform.js',
	];

	/**
	 * Called by Liveblog::load(),
	 * acts as a constructor
	 */
	public static function load() {
		self::$sdks = apply_filters( 'liveblog_embed_sdks', self::$sdks );

		add_action( 'wp_enqueue_scripts', [ __CLASS__, 'enqueue' ] );
		add_action( 'admin_enqueue_scripts', [ __CLASS__, 'admin_enqueue' ] );
		add_filter( 'script_loader_tag', [ __CLASS__, 'add_async_attribute' ], 10, 2 );
		add_filter( 'wp_footer', [ __CLASS__, 'add_facebook_sdk' ] );
	}

	/**
	 * Enqueue scripts on frontend
	 *
	 * @return void
	 */
	public static function enqueue() {
		if ( ! Liveblog::is_viewing_liveblog_post() ) {
			return;
		}

		self::enqueue_scripts();
	}

	/**
	 * Enqueue scripts on admin backend for LB post types
	 *
	 * @return void
	 */
	public static function admin_enqueue() {
		if ( get_post_type() !== Liveblog_CPT::$cpt_slug ) {
			return;
		}

		self::enqueue_scripts();
	}

	/**
	 * Loop through provider SDKs and enqueue them
	 *
	 * @return void
	 */
	public static function enqueue_scripts() {
		foreach ( self::$sdks as $name => $url ) {
			wp_enqueue_script( $name, esc_url( $url ), [], Liveblog::VERSION, false );
		}
	}

	/**
	 * Set are scripts to use async
	 *
	 * @param type $tag
	 * @param type $handle
	 * @return type
	 */
	public static function add_async_attribute( $tag, $handle ) {
		if ( ! in_array( $handle, array_keys( self::$sdks ), true ) ) {
			return $tag;
		}
		return str_replace( ' src', ' async="async" src', $tag );
	}

	/**
	 * Adds facebook script to the footer
	 */
	public static function add_facebook_sdk() {
		if ( ! Liveblog::is_viewing_liveblog_post() ) {
			return;
		}

		ob_start();
		?>
		<div id="fb-root"></div>
		<script>
			document.addEventListener( 'DOMContentLoaded', function() {
				(function(d, s, id){
					var js, fjs = d.getElementsByTagName(s)[0];
					if (d.getElementById(id)) {return;}
					js = d.createElement(s); js.id = id;
					js.src = "//connect.facebook.net/en_US/sdk.js";
					fjs.parentNode.insertBefore(js, fjs);
				}(document, 'script', 'facebook-jssdk'));
			} )
		</script>
		<?php
		echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
}
