<?php // phpcs:ignore WordPressVIPMinimum.Variables.VariableAnalysis.UnusedVariable
// VIPWPCS bug: https://github.com/Automattic/VIP-Coding-Standards/issues/446

/**
 * Class Liveblog_AMP_Template
 *
 * Simple Class for working with Templates.
 */
class Liveblog_AMP_Template {

	/**
	 * Theme Template Path
	 *
	 * @var string
	 */
	public $theme_template_path = '/liveblog/amp/';

	/**
	 * Theme Template Path
	 *
	 * @var string
	 */
	public $plugin_template_path = '/templates/amp/';

	/**
	 * Template Data
	 *
	 * @var array
	 */
	public $data = [];

	/**
	 * Constructor
	 *
	 * @return void
	 */
	public function __construct() {
		$this->theme_template_path  = apply_filters( 'liveblog_amp_theme_template_path', $this->theme_template_path );
		$this->plugin_template_path = apply_filters( 'liveblog_amp_plugin_template_path', $this->plugin_template_path );
	}

	/**
	 * Get a template variable.
	 *
	 * @param  string $name    Name if variable.
	 * @param  mixed  $default  Default value.
	 * @return mixed          value
	 */
	public function get( $name, $default = false ) {
		if ( isset( $this->data[ $name ] ) ) {
			return $this->data[ $name ];
		}
		return $default;
	}

	/*
	 * Sanitize HTML with WP AMP
	 */
	public static function sanitize_html( $html ) {
		if ( class_exists( 'AMP_Content_Sanitizer' ) && class_exists( 'AMP_Allowed_Tags_Generated' ) ) {

			// Apply AMP Content Sanitizer to $html
			list( $sanitized_html, $sanitize_scripts, $sanitize_styles ) = AMP_Content_Sanitizer::sanitize(
				$html,
				[
					'AMP_Style_Sanitizer'             => [],
					'AMP_Img_Sanitizer'               => [],
					'AMP_Video_Sanitizer'             => [],
					'AMP_Audio_Sanitizer'             => [],
					'AMP_Playbuzz_Sanitizer'          => [],
					'AMP_Iframe_Sanitizer'            => [
						'add_placeholder' => true,
					],
					'AMP_Tag_And_Attribute_Sanitizer' => [],
				]
			);

			// Get Allowed Tags including AMP HTML
			$allowed_amp_tags        = AMP_Allowed_Tags_Generated::get_allowed_tags();
			$allowed_amp_attr        = AMP_Allowed_Tags_Generated::get_allowed_attributes();
			$allowed_amp_layout_attr = AMP_Allowed_Tags_Generated::get_layout_attributes();
			$wp_kses_amp_tags        = [];
			foreach ( $allowed_amp_tags as $allowed_amp_tag => $value ) {
				// Get the attribute spec list from the allowed tags and merge with globally allowed attributes
				// https://github.com/Automattic/amp-wp/blob/3c69b214b1350a4ce1e6da92a1831a31cbee20ef/includes/sanitizers/class-amp-allowed-tags-generated.php#L17
				$allowed_attr = array_merge( $allowed_amp_attr, $allowed_amp_layout_attr, $value[0]['attr_spec_list'] );
				// Rebuild allowed tags array
				$wp_kses_amp_tags[ $allowed_amp_tag ] = $allowed_attr;
			}
			echo wp_kses( $sanitized_html, $wp_kses_amp_tags );
		} else {
			echo wp_kses_post( $html );
		}
	}

	/**
	 * Render template.
	 *
	 * @param  string $name      Name of Template.
	 * @param  array  $variables Variables to be passed to Template.
	 * @return string            Rendered Template
	 */
	public function render( $name, $variables = [] ) {

		$name        = ltrim( esc_attr( $name ), '/' ) . '.php';
		$theme       = get_template_directory() . $this->theme_template_path . $name;
		$child_theme = get_stylesheet_directory() . $this->theme_template_path . $name;
		$plugin      = dirname( __DIR__ ) . $this->plugin_template_path . $name;
		$path        = false;

		if ( file_exists( $child_theme ) ) {
			$path = $child_theme;
		} elseif ( file_exists( $theme ) ) {
			$path = $theme;
		} elseif ( file_exists( $plugin ) ) {
			$path = $plugin;
		}

		if ( false === $path ) {
			return 'Template Not Found: ' . $name;
		}

		$this->data = $variables;

		ob_start();
		include $path; // phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable
		return ob_get_clean();
	}

	/**
	 * Load partial
	 *
	 * @param  string $name      Name of Template.
	 * @param  array  $variables Variables to be passed to Template.
	 * @return void
	 */
	public function load_part( $name, $variables = [] ) {
		echo Liveblog_AMP::get_template( $name, $variables ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}
}
