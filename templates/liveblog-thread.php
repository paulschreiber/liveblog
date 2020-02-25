<?php
/**
 * Handles the liveblog entry rendering.
 *
 * @global array $template_variables Some template variables passed in.
 */
global $coauthors_plus;

$author_id   = $template_variables['author_id'] ?? null;
$timestamp   = $template_variables['timestamp'] ?? null;
$content     = $template_variables['content'] ?? null;
$author_info = [];

if ( empty( $author_id ) || empty( $timestamp ) || empty( $content ) ) {
	return;
}

$coauthor = $coauthors_plus->get_coauthor_by( 'ID', $author_id );
$author_info[] = [
	'name'      => $coauthor->display_name,
	'link_url'  => get_author_posts_url( $coauthor->ID, $coauthor->user_nicename ),
	'image_url' => get_the_post_thumbnail_url( $coauthor->ID, [ 60, 60 ] ),
];

?>
<div class="liveblog-entry-main">
	<div class="liveblog-meta-avatars">
		<?php foreach ( $author_info as $author ) { ?>
			<a class="liveblog-meta-avatar" href="<?php echo esc_url( $author['link_url'] ); ?>"><img width="60" height="60" src="<?php echo esc_url( $author['image_url'] ); ?>" class="attachment-30 size-30 wp-post-image" alt="<?php echo esc_attr( $author['name'] ); ?>"></a>
		<?php } ?>
	</div>

	<header class="liveblog-meta">
		<div class="liveblog-meta-authors">
			<?php foreach ( $author_info as $author ) { ?>
				<span class="liveblog-meta-author"><a href="<?php echo esc_url( $author['link_url'] ); ?>"><?php echo esc_html( $author['name'] ); ?></a></span>
			<?php } ?>
		</div>
		<div>
			<time datetime="<?php echo esc_attr( date( 'c', $timestamp ) ); ?>" class="liveblog-timestamp"><?php echo esc_html( date( 'g:i A', $timestamp ) ); ?></time>
		</div>
	</header>

	<div class="liveblog-entry-content">
		<?php echo wp_kses_post( $content ); ?>
	</div>
</div>
