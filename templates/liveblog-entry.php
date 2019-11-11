<?php
$post         = $template_variables['post'];
$authordata   = [];
foreach ( get_coauthors( $post->ID ) as $c ) {
	$authordata[] = [
		'name'      => $c->display_name,
		'link_url'  => get_author_posts_url( $c->ID, $c->user_nicename ),
		'image_url' => get_the_post_thumbnail_url( $c->ID, [ 60, 60 ] ),
	];
}
?>
<div class="liveblog-entry-main">
	<div class="liveblog-meta-avatars">
		<?php foreach ( $authordata as $author ) { ?>
			<a class="liveblog-meta-avatar" href="<?php echo esc_url( $author['link_url'] ); ?>"><img width="60" height="60" src="<?php echo esc_url( $author['image_url'] ); ?>" class="attachment-30 size-30 wp-post-image" alt="<?php echo esc_attr( $author['name'] ); ?>"></a>
		<?php } ?>
	</div>

	<header class="liveblog-meta">
		<div class="liveblog-meta-authors">
			<?php foreach ( $authordata as $author ) { ?>
				<span class="liveblog-meta-author"><a href="<?php echo esc_url( $author['link_url'] ); ?>"><?php echo esc_html( $author['name'] ); ?></a></span>
			<?php } ?>
		</div>

		<a class="liveblog-meta-time" href="<?php echo esc_url( get_permalink() ); ?>">
			<abbr data-entry-time="<?php echo esc_attr( get_the_date( 'c', $post->ID ) ); ?>" class="liveblog-timestamp"><?php the_date( 'g:i A' ); ?></abbr></a>
		<h2 class="liveblog-entry-header"><?php echo wp_kses_post( apply_filters( 'the_title', $post->post_title ) ); ?></h2>
	</header>

		<div class="liveblog-entry-content">
			<?php echo wp_kses_post( $post->post_content ); ?>
		</div>

<div class="liveblog-share" id="<?php echo esc_attr( 'liveblog-update-' . $post->ID . '-share' ); ?>" data-update-id="<?php echo esc_attr( $post->ID ); ?>">
	<button class="share-social share-facebook"></button>
	<button class="share-social share-twitter"></button>
</div>
</div>
