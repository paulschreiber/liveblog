<?php
/**
 * Live Blog Custom Post Type
 */

/**
 * Register and handle the "Live Blog" Custom Post Type
 */
class Liveblog_CPT {
	const DEFAULT_CPT_SLUG = 'liveblog';

	public static $cpt_slug;

	/**
	 * Register the Live Blog post type
	 *
	 * @return object|WP_Error
	 */
	public static function hooks() {
		self::$cpt_slug = apply_filters( 'liveblog_cpt_slug', self::DEFAULT_CPT_SLUG );

		add_action( 'init', [ __CLASS__, 'register_post_type' ] );
		add_action( 'before_delete_post', [ __CLASS__, 'delete_children' ] );
		add_action( 'pre_get_posts', [ __CLASS__, 'filter_children_from_query' ] );
		add_filter( 'parse_query', [ __CLASS__, 'hierarchical_posts_filter' ] );
		add_filter( 'post_type_link', [ __CLASS__, 'post_type_link' ], 10, 4 );
		add_filter( self::$cpt_slug . '_rewrite_rules', [ __CLASS__, 'rewrite_rules' ] );

		// adjust counts above the table to ignore child posts
		add_filter( 'wp_count_posts', [ __CLASS__, 'count_list_page' ], 10, 3 );

		// sort by date in table view, overriding hierarchical default sort
		add_filter( 'pre_get_posts', [ __CLASS__, 'filter_list_page' ] );

		// Hide Facebook Instant Articles status column on liveblog page
		add_action( 'wp', function() {
			if ( is_post_type_archive( self::$cpt_slug ) ) {
				remove_filter( 'manage_posts_columns', 'fbia_indicator_column_heading' );
			}
		});
	}

	/**
	 * Remove nested child posts when a parent is removed.
	 *
	 * @param int $parent ID of the parent post being deleted
	 */
	public static function delete_children( $parent ) {

		// Remove the query filter.
		remove_filter( 'parse_query', [ __CLASS__, 'hierarchical_posts_filter' ] );
		remove_action( 'pre_get_posts', [ __CLASS__, 'filter_children_from_query' ] );
		$parent = (int) $parent; // Force a cast as an integer.

		$post = get_post( $parent );

		// Only delete children of top-level posts.
		if ( 0 !== $post->post_parent || self::$cpt_slug !== $post->post_type ) {
			return;
		}

		// Get all children
		$children = new WP_Query(
			[
				'post_type'        => self::$cpt_slug,
				'post_parent'      => $parent,
				'suppress_filters' => false,
			]
		);

		// Remove the action so it doesn't fire again
		remove_action( 'before_delete_post', [ __CLASS__, 'delete_children' ] );

		if ( $children->have_posts() ) {
			foreach ( $children->posts as $child ) {
				// Never delete top level posts!
				if ( 0 === (int) $child->post_parent ) {
					continue;
				}
				wp_delete_post( $child->ID, true );
			}
		}

		add_action( 'before_delete_post', [ __CLASS__, 'delete_children' ] );
		add_action( 'pre_get_posts', [ __CLASS__, 'filter_children_from_query' ] );
		add_filter( 'parse_query', [ __CLASS__, 'hierarchical_posts_filter' ] );
	}

	/**
	 * Remove child posts from results.
	 *
	 * @param WP_Query $query
	 */
	public static function filter_children_from_query( $query ) {

		$post_type = $query->get( 'post_type' );

		if ( is_author() || is_search() || is_feed() ||
				( ( $query->is_home() || $query->is_archive() ) && ( empty( $post_type ) || in_array( $post_type, [ self::$cpt_slug ], true ) ) ) ) {

			$parent = $query->get( 'post_parent' );
			if ( empty( $parent ) ) {
				$query->set( 'post_parent', 0 );
			}
		}
	}

	/**
	 * Posts cannot typically have parent-child relationships.
	 *
	 * Our updates, however, are all "owned" by a traditional
	 * post so we know how to lump things together on the front-end
	 * and in the post editor.
	 *
	 * @param WP_Query $query Current query.
	 *
	 * @return WP_Query
	 */
	public static function hierarchical_posts_filter( $query ) {
		global $pagenow, $typenow;

		if ( is_admin() && 'edit.php' === $pagenow && in_array( $typenow, [ self::$cpt_slug ], true ) ) {
			$query->query_vars['post_parent'] = 0;
		}

		return $query;
	}

	/**
	 * Permalinks for child posts should use IDs, not slugs.
	 *
	 * @param string  $post_link The post's permalink.
	 * @param WP_Post $post      The post in question.
	 * @param bool    $leavename Whether to keep the post name.
	 * @param bool    $sample    Is it a sample permalink.
	 *
	 * @return string
	 */
	public static function post_type_link( $post_link, $post, $leavename, $sample ) {
		if ( self::$cpt_slug !== $post->post_type || 0 === $post->post_parent ) {
			return $post_link;
		}

		return get_permalink( $post->post_parent ) . "$post->ID/";
	}

	/**
	 * Modifies the rewrite rules for the live blog CPT.
	 *
	 * @param array $rules The Rules.
	 *
	 * @return array
	 */
	public static function rewrite_rules( $rules ) {

		// Unset the broken rule.
		unset( $rules['live-blog/(.+?)(?:/([0-9]+))?/?$'] );

		// Matches live-blog/post-name/
		$rules['live-blog/([^/]+)/?$'] = 'index.php?' . self::$cpt_slug . '=$matches[1]';

		// matches live-blog/post-name/12345/ -- where 12345 is a post ID from liveblog
		$rules['live-blog/[^/]+/([0-9]+)/?$'] = 'index.php?post_type=' . self::$cpt_slug . '&p=$matches[1]';

		return $rules;
	}

	/**
	 * Register the Liveblog post type
	 * @return object|WP_Error
	 */
	public static function register_post_type() {
		return register_post_type(
			self::$cpt_slug,
			[
				'labels'        => [
					'name'               => _x( 'Live blog', 'post type name', 'liveblog' ),
					'singular_name'      => _x( 'Live blog', 'post type name', 'liveblog' ),
					'add_new_item'       => _x( 'Add New Live blog', 'add new post type', 'liveblog' ),
					'edit_item'          => _x( 'Edit Live blog', 'edit_item post type', 'liveblog' ),
					'new_item'           => _x( 'New Live blog', 'new_item post type', 'liveblog' ),
					'view_item'          => _x( 'View Live blog', 'view_item post type', 'liveblog' ),
					'search_items'       => _x( 'Search Live blogs', 'search_items post type', 'liveblog' ),
					'not_found'          => _x( 'No Live blogs found', 'not_found post type', 'liveblog' ),
					'not_found_in_trash' => _x( 'No Live blogs found in the trash', 'not_found_in_trash post type', 'liveblog' ),
				],
				'taxonomies'    => [ 'post_tag' ],
				'public'        => true,
				'show_in_rest'  => true,
				'supports'      => [ 'title', 'editor', 'thumbnail', 'revisions', 'author', 'shortlinks', 'exclude_from_external_editors' ],
				'hierarchical'  => true,
				'has_archive'   => 'live-blog',
				'menu_icon'     => 'dashicons-admin-post',
				'menu_position' => 5,
				'rewrite'       => [
					'slug'       => 'live-blog',
					'with_front' => 'false',
				],
			]
		);
	}

	/**
	 * Filter the query on list page to sort by date by default.
	 * menu_order title/asc is the default sort for hierarchical items.
	 *
	 * @param WP_Query $query
	 */
	public static function filter_list_page( $query ) {
		if ( is_admin() && $query->is_main_query() && is_post_type_archive( self::$cpt_slug ) &&
			'menu_order title' === $query->get( 'orderby' ) && 'asc' === $query->get( 'order' ) ) {
			global $wpdb;
			$query->set( 'orderby', $wpdb->posts );
			$query->set( 'order', 'DESC' );
		}
	}


	/**
	 * Ignore child posts on table
	 *
	 * @param object $counts An object containing the current post_type's post
	 *                       counts by status.
	 * @param string $type   Post type.
	 * @param string $perm   The permission to determine if the posts are 'readable'
	 *                       by the current user.
	 */
	public static function count_list_page( $counts, $type, $perm ) {
		if ( is_admin() && is_post_type_archive( self::$cpt_slug ) ) {

			$cache_key = _count_posts_cache_key( $type, $perm ) . '-child';
			$counts    = wp_cache_get( $cache_key, 'counts' );

			if ( false === $counts ) {
				global $wpdb;

				$results = $wpdb->get_results( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
					$wpdb->prepare(
						"SELECT post_status, COUNT(*) AS num_posts
					FROM {$wpdb->posts}	WHERE post_type = %s AND post_parent = 0
					GROUP BY post_status",
						$type
					),
					ARRAY_N
				);

				$count_array = (array) $counts;
				foreach ( $results as $item ) {
					$count_array[ $item[0] ] = $item[1];
				}

				// need to include trash, auto-draft, inherit, request-pending, request-confirmed, request-failed and request-completed
				// in the object. Otherwise you get undefined property errors.
				foreach ( array_keys( get_post_stati( [ 'show_in_admin_all_list' => false ] ) ) as $item ) {
					if ( ! isset( $count_array[ $item ] ) ) {
						$count_array[ $item ] = 0;
					}
				}

				$counts = (object) $count_array;
				wp_cache_set( $cache_key, $counts, 'counts' );
			}
		}

		return $counts;
	}

}

add_action( 'after_setup_theme', [ 'Liveblog_CPT', 'hooks' ] );
