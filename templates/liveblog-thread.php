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
$is_amp      = function_exists( 'is_amp_endpoint' ) ? is_amp_endpoint() : false;

if ( empty( $author_id ) || empty( $timestamp ) || empty( $content ) ) {
	return;
}

$coauthor      = $coauthors_plus->get_coauthor_by( 'ID', $author_id );
$author_info[] = [
	'name'      => $coauthor->display_name,
	'link_url'  => get_author_posts_url( $coauthor->ID, $coauthor->user_nicename ),
	'image_url' => get_the_post_thumbnail_url( $coauthor->ID, [ 60, 60 ] ),
];

?>
<div class="liveblog-entry-main">
	<?php foreach ( $author_info as $author ) : ?>
		<?php if ( ! $is_amp && ! empty( $author['image_url'] ) ) : ?>
			<div class="liveblog-meta-avatars">
				<a class="liveblog-meta-avatar" href="<?php echo esc_url( $author['link_url'] ); ?>"><img width="60" height="60" src="<?php echo esc_url( $author['image_url'] ); ?>" class="attachment-30 size-30 wp-post-image" alt="<?php echo esc_attr( $author['name'] ); ?>"></a>
			</div>
		<?php endif; ?>
	<?php endforeach; ?>

	<header class="liveblog-meta">
		<div class="liveblog-meta-authors" style="display: inline-block;">
			<?php foreach ( $author_info as $author ) { ?>
				<span class="liveblog-meta-author">
					<?php if ( false === $is_amp ) : ?>
						<a href="<?php echo esc_url( $author['link_url'] ); ?>">
							<?php echo esc_html( $author['name'] ); ?>
						</a>
					<?php else : ?>
						<?php echo esc_html( $author['name'] ); ?>
					<?php endif; ?>
				</span>
			<?php } ?>
		</div>
		<div style="display: inline-block; font-family: 'DecimaMono', Consolas, Monaco, monospace; color: #999; font-size:13px;">
			<time datetime="<?php echo esc_attr( date( 'c', $timestamp ) ); ?>" class="liveblog-timestamp"><?php echo esc_html( date( 'g:i A', $timestamp ) ); ?></time>
		</div>
	</header>

	<div class="liveblog-entry-content">
		<?php
			if ( $is_amp ) {
				Liveblog_AMP_Template::sanitize_html( $content );
			} else {
				echo wp_kses_post( $content );
			}
		?>
	</div>
</div>
