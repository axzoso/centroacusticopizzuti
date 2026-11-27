<?php
/**
 * Plugin Name: Centro Acustico Pizzuti Core
 * Description: Logica, grafica generata, caratteri locali, Dati del Centro (shortcode), SEO, dati strutturati, anti-spam e ottimizzazione immagini per il sito Centro Acustico Pizzuti (proposta A).
 * Version:     1.0.4
 * Text Domain: pizzuti-core
 *
 * Architettura basata su artes-core 1.0.4:
 * - Il CSS del sito (`pizzuti.css`) è GENERATO da `tools/port-css.js` a partire dal CSS della proposta A.
 * - I Dati del Centro vivono nell'opzione unica `pizzuti_dati` e vengono letti tramite shortcode.
 * - Il CSS personalizzato del kit Elementor resta vuoto; le classi globali sono solo etichette.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( defined( 'PIZZUTI_CORE_VERSION' ) ) {
	return;
}

define( 'PIZZUTI_CORE_VERSION', '1.0.4' );

if ( is_admin() ) {
	require_once __DIR__ . '/admin/pizzuti-admin.php';
}

/* ==================================================================================================== */
/* 1. Catalogo testi (pronto per eventuali traduzioni future)                                           */
/* ==================================================================================================== */

function pizzuti_t( $testo, $chiave = '' ) {
	$testo = (string) $testo;

	if ( '' !== $chiave ) {
		$testo = (string) apply_filters( 'pizzuti_string', $testo, $chiave );
	}

	return $testo;
}

/* ==================================================================================================== */
/* 2. Dati del Centro (opzione unica `pizzuti_dati`) e shortcode                                        */
/* ==================================================================================================== */

function pizzuti_dati_default() {
	return array(
		'nome'              => 'Centro Acustico Pizzuti',
		'dottore'           => 'Dott. Pasqualino Pizzuti',
		'societa'           => 'Centro Acustico Pizzuti di Pasqualino Pizzuti',
		'partita_iva'       => 'P.IVA 00000000000',
		'indirizzo'         => 'Via Roma 45, 87100 Cosenza (CS)',
		'citta'             => 'Cosenza',
		'mappa_query'       => 'Via Roma 45, 87100 Cosenza',
		'mappa_url'         => 'https://www.google.com/maps/search/?api=1&query=Via%20Roma%2045%2C%2087100%20Cosenza',
		'telefono_visibile' => '0984 123 456',
		'telefono_href'     => 'tel:+390984123456',
		'whatsapp_numero'   => '390984123456',
		'whatsapp_testo'    => "Buongiorno, vorrei prenotare un controllo dell'udito.",
		'email'             => 'info@centroacusticopizzuti.it',
		'orari'             => array(
			array( 'giorni' => 'Lunedì – Venerdì', 'ore' => '9:00 – 13:00 · 16:00 – 19:30' ),
			array( 'giorni' => 'Sabato', 'ore' => '9:00 – 13:00' ),
			array( 'giorni' => 'Domenica', 'ore' => 'Chiuso' ),
		),
		'social'            => array(
			array( 'nome' => 'Facebook', 'icona' => 'facebook', 'href' => 'https://www.facebook.com/' ),
			array( 'nome' => 'Instagram', 'icona' => 'instagram', 'href' => 'https://www.instagram.com/' ),
		),
		'marchi'            => 'Signia, Bernafon',
		'mostra_recensioni' => true,
		'recensioni'        => array(
			array(
				'testo' => 'Pienamente soddisfatto del lavoro svolto dal Dott. Pizzuti, che con professionalità, gentilezza e pazienza ha individuato e risolto il problema dell’udito a mia madre. Consiglio di affidarsi con fiducia alla sua persona. Inoltre disponibilissimo al post vendita.',
				'nome'  => 'Fulvio C.',
				'luogo' => 'recensione su Google',
			),
			array(
				'testo' => 'Professionalità e cortesia sono elementi a dir poco distintivi. Disponibilità assoluta, ma soprattutto partecipazione alle problematiche che si hanno e che solo chi le ha può conoscere.',
				'nome'  => 'Giancarlo M.',
				'luogo' => 'recensione su Google',
			),
		),
		// Campi marcati ESEMPIO in mockup/src/config.ts: restano segnalati in rosso in Stato finché non confermati reali.
		'campi_esempio'     => array( 'telefono_visibile', 'whatsapp_numero', 'email', 'indirizzo', 'orari', 'partita_iva', 'social' ),
	);
}

function pizzuti_dati() {
	$salvati = get_option( 'pizzuti_dati', array() );
	$def     = pizzuti_dati_default();

	if ( ! is_array( $salvati ) || empty( $salvati ) ) {
		return $def;
	}

	return array_merge( $def, $salvati );
}

function pizzuti_ha_dati_esempio() {
	$d = pizzuti_dati();

	return array_values( array_filter( (array) ( $d['campi_esempio'] ?? array() ) ) );
}

function pizzuti_whatsapp_url( $dati = null ) {
	$d   = is_array( $dati ) ? $dati : pizzuti_dati();
	$num = preg_replace( '/[^0-9]/', '', (string) ( $d['whatsapp_numero'] ?? '' ) );
	$txt = rawurlencode( (string) ( $d['whatsapp_testo'] ?? '' ) );

	if ( '' === $num ) {
		return '#';
	}

	return 'https://wa.me/' . $num . ( '' !== $txt ? '?text=' . $txt : '' );
}

function pizzuti_svg_icon( $name ) {
	$paths = array(
		'phone'     => 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
		'whatsapp'  => 'M3 21l1.6-4.6A8.5 8.5 0 1 1 8 19.5L3 21zM9 8.5c0 3.5 3 6.5 6.500 6.500l1-1.500-2-1-1 .8a4.500 4.500 0 0 1-2-2l.8-1-1-2L9 8.500z',
		'pin'       => 'M12 21s7-6 7-11.500a7 7 0 1 0-14 0C5 15 12 21 12 21zM12 12a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5z',
		'clock'     => 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
		'mail'      => 'M4 5h16v14H4zM4 7l8 6 8-6',
		'facebook'  => 'M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z',
		'instagram' => 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.500 6.500h.01',
	);

	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}

	return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' . esc_attr( $paths[ $name ] ) . '"/></svg>';
}

add_shortcode(
	'pizzuti_dato',
	function ( $atts ) {
		$atts  = shortcode_atts( array( 'campo' => '' ), (array) $atts, 'pizzuti_dato' );
		$campo = sanitize_key( $atts['campo'] );
		$d     = pizzuti_dati();

		$alias = array(
			'telefono' => 'telefono_visibile',
			'piva'     => 'partita_iva',
			'whatsapp' => 'whatsapp_numero',
		);

		if ( isset( $alias[ $campo ] ) ) {
			$campo = $alias[ $campo ];
		}

		if ( '' === $campo || ! isset( $d[ $campo ] ) || ! is_scalar( $d[ $campo ] ) ) {
			return '';
		}

		return esc_html( (string) $d[ $campo ] );
	}
);

add_shortcode(
	'pizzuti_tel',
	function ( $atts ) {
		$d    = pizzuti_dati();
		$atts = shortcode_atts(
			array(
				'testo'  => $d['telefono_visibile'],
				'classe' => '',
				'icona'  => '0',
			),
			(array) $atts,
			'pizzuti_tel'
		);
		$cls  = trim( (string) $atts['classe'] );
		$ico  = '1' === (string) $atts['icona'] ? pizzuti_svg_icon( 'phone' ) : '';

		return sprintf(
			'<a%s href="%s">%s%s</a>',
			'' !== $cls ? ' class="' . esc_attr( $cls ) . '"' : '',
			esc_url( (string) $d['telefono_href'], array( 'tel' ) ),
			$ico,
			esc_html( (string) $atts['testo'] )
		);
	}
);

add_shortcode(
	'pizzuti_whatsapp',
	function ( $atts ) {
		$d    = pizzuti_dati();
		$atts = shortcode_atts(
			array(
				'testo'  => pizzuti_t( 'Scrivimi su WhatsApp', 'wa_label' ),
				'classe' => '',
				'icona'  => '0',
			),
			(array) $atts,
			'pizzuti_whatsapp'
		);
		$cls  = trim( (string) $atts['classe'] );
		$ico  = '1' === (string) $atts['icona'] ? pizzuti_svg_icon( 'whatsapp' ) : '';

		return sprintf(
			'<a%s href="%s" target="_blank" rel="noopener">%s%s</a>',
			'' !== $cls ? ' class="' . esc_attr( $cls ) . '"' : '',
			esc_url( pizzuti_whatsapp_url( $d ) ),
			$ico,
			esc_html( (string) $atts['testo'] )
		);
	}
);

add_shortcode(
	'pizzuti_orari',
	function ( $atts ) {
		$d    = pizzuti_dati();
		$atts = shortcode_atts( array( 'formato' => 'dl' ), (array) $atts, 'pizzuti_orari' );
		$rows = (array) ( $d['orari'] ?? array() );

		if ( empty( $rows ) ) {
			return '';
		}

		if ( 'inline' === $atts['formato'] ) {
			$parti = array();
			foreach ( $rows as $r ) {
				if ( empty( $r['giorni'] ) && empty( $r['ore'] ) ) {
					continue;
				}
				$parti[] = esc_html( (string) ( $r['giorni'] ?? '' ) . ': ' . (string) ( $r['ore'] ?? '' ) );
			}
			return '<span>' . implode( ' · ', $parti ) . '</span>';
		}

		$html = '<dl class="footer-hours">';
		foreach ( $rows as $r ) {
			if ( empty( $r['giorni'] ) && empty( $r['ore'] ) ) {
				continue;
			}
			$html .= '<div><dt>' . esc_html( (string) ( $r['giorni'] ?? '' ) ) . '</dt><dd>' . esc_html( (string) ( $r['ore'] ?? '' ) ) . '</dd></div>';
		}
		$html .= '</dl>';

		return $html;
	}
);

add_shortcode(
	'pizzuti_indirizzo',
	function ( $atts ) {
		$d    = pizzuti_dati();
		$atts = shortcode_atts( array( 'link' => '0' ), (array) $atts, 'pizzuti_indirizzo' );
		$ind  = esc_html( (string) $d['indirizzo'] );

		if ( '1' === (string) $atts['link'] && ! empty( $d['mappa_url'] ) ) {
			return '<a href="' . esc_url( (string) $d['mappa_url'] ) . '" target="_blank" rel="noopener">' . $ind . '<span class="visually-hidden"> (si apre in una nuova scheda)</span></a>';
		}

		return $ind;
	}
);

add_shortcode(
	'pizzuti_social',
	function () {
		$d      = pizzuti_dati();
		$social = (array) ( $d['social'] ?? array() );

		if ( empty( $social ) ) {
			return '';
		}

		$out = '<div class="footer-social">';
		foreach ( $social as $s ) {
			$href = trim( (string) ( $s['href'] ?? '' ) );
			$nome = trim( (string) ( $s['nome'] ?? '' ) );
			$ico  = sanitize_key( (string) ( $s['icona'] ?? strtolower( $nome ) ) );

			if ( '' === $href || '' === $nome ) {
				continue;
			}

			$out .= sprintf(
				'<a href="%s" target="_blank" rel="noopener" aria-label="%s">%s</a>',
				esc_url( $href ),
				esc_attr( $nome . ' (si apre in una nuova scheda)' ),
				pizzuti_svg_icon( $ico )
			);
		}
		$out .= '</div>';

		return $out;
	}
);

add_shortcode(
	'pizzuti_recensioni',
	function ( $atts ) {
		$d = pizzuti_dati();

		if ( empty( $d['mostra_recensioni'] ) || empty( $d['recensioni'] ) ) {
			return '';
		}

		$atts  = shortcode_atts( array( 'titolo' => pizzuti_t( 'Cosa dicono di noi', 'recensioni_titolo' ), 'badge_url' => '' ), (array) $atts, 'pizzuti_recensioni' );
		$badge = trim( (string) $atts['badge_url'] );

		if ( '' === $badge ) {
			$badge_post = get_posts( array( 'post_type' => 'attachment', 'name' => 'badge-google', 'posts_per_page' => 1, 'fields' => 'ids' ) );
			if ( ! empty( $badge_post[0] ) ) {
				$badge = (string) wp_get_attachment_url( (int) $badge_post[0] );
			}
		}

		$out  = '<section class="sec tone-soft" id="recensioni" aria-labelledby="rec-t"><div class="container">';
		$out .= '<h2 id="rec-t" data-reveal>' . esc_html( (string) $atts['titolo'] ) . '</h2>';
		$out .= '<div class="reviews-grid" data-stagger>';
		foreach ( (array) $d['recensioni'] as $r ) {
			if ( empty( $r['testo'] ) ) {
				continue;
			}
			$out .= '<figure class="review"><blockquote>«' . esc_html( (string) $r['testo'] ) . '»</blockquote>';
			$out .= '<figcaption>' . esc_html( (string) ( $r['nome'] ?? '' ) . ( ! empty( $r['luogo'] ) ? ', ' . $r['luogo'] : '' ) ) . '</figcaption></figure>';
		}
		if ( '' !== $badge ) {
			$out .= '<figure class="review review-badge"><img src="' . esc_url( $badge ) . '" width="422" height="124" alt="Valutazione Google 5.0 su 5" loading="lazy" /><figcaption>' . esc_html( pizzuti_t( 'Valutazione dei pazienti su Google', 'recensioni_badge' ) ) . '</figcaption></figure>';
		}
		$out .= '</div></div></section>';

		return $out;
	}
);

add_shortcode(
	'pizzuti_anno',
	function () {
		return esc_html( wp_date( 'Y' ) );
	}
);

/* Shortcode testuali/URL puri per i tag dinamici dei widget atomici Elementor V4 (Header, Footer, Barra mobile, 404). */
add_shortcode(
	'pizzuti_whatsapp_url',
	function () {
		return esc_url_raw( pizzuti_whatsapp_url() );
	}
);

add_shortcode(
	'pizzuti_mailto',
	function () {
		$d = pizzuti_dati();
		return 'mailto:' . sanitize_email( (string) ( $d['email'] ?? '' ) );
	}
);

add_shortcode(
	'pizzuti_social_url',
	function ( $atts ) {
		$atts = shortcode_atts( array( 'nome' => '' ), (array) $atts, 'pizzuti_social_url' );
		$want = strtolower( trim( (string) $atts['nome'] ) );
		$d    = pizzuti_dati();
		foreach ( (array) ( $d['social'] ?? array() ) as $s ) {
			if ( strtolower( (string) ( $s['icona'] ?? '' ) ) === $want || strtolower( (string) ( $s['nome'] ?? '' ) ) === $want ) {
				return esc_url_raw( (string) ( $s['href'] ?? '' ) );
			}
		}
		return '';
	}
);

add_shortcode(
	'pizzuti_orario',
	function ( $atts ) {
		$atts = shortcode_atts( array( 'riga' => '1', 'parte' => 'giorni' ), (array) $atts, 'pizzuti_orario' );
		$idx  = max( 1, (int) $atts['riga'] ) - 1;
		$d    = pizzuti_dati();
		$rows = array_values( (array) ( $d['orari'] ?? array() ) );
		if ( ! isset( $rows[ $idx ] ) ) {
			return '';
		}
		$chiave = 'ore' === $atts['parte'] ? 'ore' : 'giorni';
		return esc_html( (string) ( $rows[ $idx ][ $chiave ] ?? '' ) );
	}
);

add_shortcode(
	'pizzuti_footer_tagline',
	function () {
		$d = pizzuti_dati();
		return esc_html(
			sprintf(
				'Centro acustico indipendente a %s. Ascolto su misura, dalla prima visita all’assistenza nel tempo.',
				(string) ( $d['citta'] ?? 'Cosenza' )
			)
		);
	}
);

add_shortcode(
	'pizzuti_footer_copyright',
	function () {
		$d = pizzuti_dati();
		return esc_html(
			sprintf(
				'© %s %s · %s',
				wp_date( 'Y' ),
				(string) ( $d['societa'] ?? '' ),
				(string) ( $d['partita_iva'] ?? '' )
			)
		);
	}
);

add_shortcode(
	'pizzuti_chiama_label',
	function () {
		$d = pizzuti_dati();
		return esc_html( 'Chiamami: ' . (string) ( $d['telefono_visibile'] ?? '' ) );
	}
);

add_action(
	'after_setup_theme',
	function () {
		register_nav_menus(
			array(
				'pizzuti-principale' => 'Menu principale (Header)',
				'pizzuti-mobile'     => 'Menu mobile (Header)',
				'pizzuti-footer-1'   => 'Footer — Il Centro',
				'pizzuti-footer-2'   => 'Footer — Servizi',
				'pizzuti-footer-leg' => 'Footer — Pagine legali',
			)
		);
	}
);

add_shortcode(
	'pizzuti_mappa',
	function ( $atts ) {
		$d    = pizzuti_dati();
		$atts = shortcode_atts( array( 'classe' => 'contact-map' ), (array) $atts, 'pizzuti_mappa' );
		$q    = rawurlencode( (string) ( $d['mappa_query'] ?? $d['indirizzo'] ) );
		$src  = 'https://maps.google.com/maps?q=' . $q . '&z=16&output=embed';
		$open = ! empty( $d['mappa_url'] ) ? (string) $d['mappa_url'] : 'https://www.google.com/maps/search/?api=1&query=' . $q;
		$cls  = trim( 'map-consent ' . (string) $atts['classe'] );

		return '<div class="' . esc_attr( $cls ) . '" data-src="' . esc_url( $src ) . '">'
			. '<div class="map-consent-box">'
			. pizzuti_svg_icon( 'pin' )
			. '<p><strong>' . esc_html( pizzuti_t( 'Mappa di Google Maps', 'mappa_titolo_box' ) ) . '</strong><br />'
			. esc_html( pizzuti_t( 'Si carica solo se lo scegli: Google può usare cookie propri. Vedi la ', 'mappa_consenso' ) )
			. '<a href="' . esc_url( home_url( '/cookie-policy/' ) ) . '">Cookie Policy</a>.</p>'
			. '<div class="btn-row">'
			. '<button type="button" class="btn btn-secondary map-consent-load">' . esc_html( pizzuti_t( 'Mostra la mappa', 'mappa_mostra' ) ) . '</button>'
			. '<a class="btn btn-secondary" href="' . esc_url( $open ) . '" target="_blank" rel="noopener">' . esc_html( pizzuti_t( 'Apri in Google Maps', 'mappa_apri' ) ) . '<span class="visually-hidden"> (si apre in una nuova scheda)</span></a>'
			. '</div></div></div>';
	}
);

/* ==================================================================================================== */
/* 3. Caricamento asset, font locali (zero Google Fonts) e classe `pizzuti` sul <body>                  */
/* ==================================================================================================== */

add_filter(
	'body_class',
	function ( $classes ) {
		if ( ! is_admin() ) {
			$classes[] = 'pizzuti';
		}

		return $classes;
	}
);

add_filter(
	'hello_elementor_page_title',
	function () {
		return is_404() || is_search();
	}
);

// Disattiva i Google Fonts di Elementor su tutto il frontend (zero richieste verso Google).
add_filter( 'elementor/frontend/print_google_fonts', '__return_false' );

add_action(
	'wp_head',
	function () {
		$dir = plugin_dir_path( __FILE__ );
		echo '<meta name="theme-color" content="#0b1a2c">' . "\n";
		echo "<script>document.documentElement.classList.add('js');</script>\n";

		$font_latin = $dir . 'fonts/montserrat-latin-wght-normal.woff2';
		if ( file_exists( $font_latin ) ) {
			printf(
				'<link rel="preload" as="font" type="font/woff2" href="%s" crossorigin>' . "\n",
				esc_url( plugins_url( 'fonts/montserrat-latin-wght-normal.woff2', __FILE__ ) )
			);
		}
	},
	1
);

function pizzuti_form_preselection_data() {
	$d = pizzuti_dati();
	$q = rawurlencode( (string) ( $d['mappa_query'] ?? $d['indirizzo'] ?? 'Via Roma 45, 87100 Cosenza' ) );
	return array(
		'mappa_embed_url' => 'https://maps.google.com/maps?q=' . $q . '&z=16&output=embed',
		'motivi'          => array(
			'controllo'  => 'Vorrei prenotare un controllo dell’udito',
			'caro'       => 'Cerco aiuto per una persona cara',
			'assistenza' => 'Ho già un apparecchio e mi serve assistenza',
			'ssn'        => 'Vorrei informazioni sui contributi SSN',
			'auricolari' => 'Vorrei informazioni sugli auricolari su misura',
			'preventivo' => 'Vorrei un preventivo',
			'altro'      => 'Altro',
		),
		'i18n'   => array(
			'contatti_rapidi' => pizzuti_t( 'Contatti rapidi', 'aria_contatti_rapidi' ),
			'nav_principale'  => pizzuti_t( 'Principale', 'aria_nav_principale' ),
			'nav_mobile'      => pizzuti_t( 'Principale (mobile)', 'aria_nav_mobile' ),
			'mappa_titolo'    => pizzuti_t( 'Mappa: come raggiungere il Centro Acustico Pizzuti', 'mappa_iframe_title' ),
		),
	);
}

add_action(
	'wp_enqueue_scripts',
	function () {
		if ( is_admin() ) {
			return;
		}

		$dir = plugin_dir_path( __FILE__ );

		// Neutralizza i fogli di base di Hello Elementor (reset/theme/header-footer) che alterano colori, margini e interlinee.
		foreach ( array( 'hello-elementor', 'hello-elementor-theme-style', 'hello-elementor-header-footer' ) as $handle ) {
			wp_dequeue_style( $handle );
		}

		if ( file_exists( $dir . 'fonts/fonts.css' ) ) {
			wp_enqueue_style( 'pizzuti-fonts', plugins_url( 'fonts/fonts.css', __FILE__ ), array(), (string) filemtime( $dir . 'fonts/fonts.css' ) );
		}

		if ( file_exists( $dir . 'pizzuti.css' ) ) {
			wp_enqueue_style( 'pizzuti-style', plugins_url( 'pizzuti.css', __FILE__ ), array(), (string) filemtime( $dir . 'pizzuti.css' ) );

			$css_extra = trim( (string) get_option( 'pizzuti_css_aggiuntivo', '' ) );
			if ( '' !== $css_extra ) {
				wp_add_inline_style( 'pizzuti-style', $css_extra );
			}
		}

		if ( file_exists( $dir . 'pizzuti.js' ) ) {
			wp_enqueue_script( 'pizzuti-script', plugins_url( 'pizzuti.js', __FILE__ ), array(), (string) filemtime( $dir . 'pizzuti.js' ), true );
			wp_add_inline_script( 'pizzuti-script', 'window.PizzutiDati = ' . wp_json_encode( pizzuti_form_preselection_data() ) . ';', 'before' );
		}
	},
	99
);

/* ==================================================================================================== */
/* 4. SEO, Open Graph e Dati Strutturati (LocalBusiness + FAQPage)                                      */
/* ==================================================================================================== */

function pizzuti_seo_esterno() {
	return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' );
}

function pizzuti_seo_for_post( $post_id ) {
	$post_id = (int) $post_id;
	$title   = trim( (string) get_post_meta( $post_id, '_pizzuti_seo_title', true ) );
	$desc    = trim( (string) get_post_meta( $post_id, '_pizzuti_seo_description', true ) );

	if ( '' === $title ) {
		$pt = trim( wp_strip_all_tags( (string) get_the_title( $post_id ) ) );
		if ( (int) get_option( 'page_on_front' ) === $post_id ) {
			$title = 'Centro Acustico Pizzuti · Cosenza';
		} elseif ( '' !== $pt ) {
			$title = $pt . ' · Centro Acustico Pizzuti';
		} else {
			$title = 'Centro Acustico Pizzuti · Cosenza';
		}
	}

	if ( '' === $desc ) {
		$desc = 'Centro acustico indipendente a Cosenza. Ascolto su misura, dalla prima visita all’assistenza nel tempo.';
	}

	return array(
		'title'       => $title,
		'description' => $desc,
	);
}

function pizzuti_seo_current() {
	if ( is_404() ) {
		return array(
			'title'       => pizzuti_t( 'Pagina non trovata · Centro Acustico Pizzuti', 'seo_404_title' ),
			'description' => '',
		);
	}

	if ( is_singular() ) {
		return pizzuti_seo_for_post( get_queried_object_id() );
	}

	return array(
		'title'       => 'Centro Acustico Pizzuti · Cosenza',
		'description' => 'Centro acustico indipendente a Cosenza. Ascolto su misura, dalla prima visita all’assistenza nel tempo.',
	);
}

add_filter(
	'pre_get_document_title',
	function ( $title ) {
		if ( is_admin() || pizzuti_seo_esterno() ) {
			return $title;
		}
		$seo = pizzuti_seo_current();

		return '' !== $seo['title'] ? $seo['title'] : $title;
	},
	20
);

add_filter(
	'hello_elementor_description_meta_tag',
	function ( $enabled ) {
		if ( pizzuti_seo_esterno() ) {
			return $enabled;
		}
		$seo = pizzuti_seo_current();

		return '' !== $seo['description'] ? false : $enabled;
	}
);

add_action(
	'wp_head',
	function () {
		if ( is_admin() || pizzuti_seo_esterno() ) {
			return;
		}

		$seo = pizzuti_seo_current();
		$d   = pizzuti_dati();

		if ( '' !== $seo['description'] ) {
			echo '<meta name="description" content="' . esc_attr( $seo['description'] ) . '">' . "\n";
		}

		// Open Graph come nel mockup Base.astro
		$og_img = '';
		if ( is_singular() && has_post_thumbnail() ) {
			$og_img = (string) get_the_post_thumbnail_url( get_queried_object_id(), 'full' );
		}
		if ( '' === $og_img ) {
			$ritratto = get_posts( array( 'post_type' => 'attachment', 'name' => 'dottore-ritratto', 'posts_per_page' => 1, 'fields' => 'ids' ) );
			if ( ! empty( $ritratto[0] ) ) {
				$og_img = (string) wp_get_attachment_url( (int) $ritratto[0] );
			}
		}

		echo '<meta property="og:type" content="website">' . "\n";
		echo '<meta property="og:locale" content="it_IT">' . "\n";
		echo '<meta property="og:site_name" content="' . esc_attr( (string) $d['nome'] ) . '">' . "\n";
		echo '<meta property="og:title" content="' . esc_attr( $seo['title'] ) . '">' . "\n";
		if ( '' !== $seo['description'] ) {
			echo '<meta property="og:description" content="' . esc_attr( $seo['description'] ) . '">' . "\n";
		}
		if ( '' !== $og_img ) {
			echo '<meta property="og:image" content="' . esc_url( $og_img ) . '">' . "\n";
		}

		// Dati strutturati LocalBusiness: SOLO se attivati e NESSUN campo è ancora "esempio" (§4.1.3).
		$schema_on = (bool) get_option( 'pizzuti_seo_schema', 1 );
		if ( $schema_on && empty( pizzuti_ha_dati_esempio() ) ) {
			$same_as = array();
			foreach ( (array) ( $d['social'] ?? array() ) as $s ) {
				if ( ! empty( $s['href'] ) ) {
					$same_as[] = esc_url_raw( (string) $s['href'] );
				}
			}

			$ld = array(
				'@context'  => 'https://schema.org',
				'@type'     => array( 'LocalBusiness', 'MedicalBusiness' ),
				'name'      => (string) $d['nome'],
				'url'       => home_url( '/' ),
				'telephone' => (string) $d['telefono_visibile'],
				'email'     => (string) $d['email'],
				'address'   => array(
					'@type'           => 'PostalAddress',
					'streetAddress'   => (string) $d['indirizzo'],
					'addressLocality' => (string) $d['citta'],
					'addressCountry'  => 'IT',
				),
			);
			if ( '' !== $og_img ) {
				$ld['image'] = $og_img;
			}
			if ( ! empty( $same_as ) ) {
				$ld['sameAs'] = $same_as;
			}

			echo '<script type="application/ld+json">' . wp_json_encode( $ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
		}
	},
	2
);

/* ==================================================================================================== */
/* 5. Moduli: anti-spam (limite link) e modalità prova invii                                            */
/* ==================================================================================================== */

add_filter(
	'elementor_pro/atomic_forms/spam_check',
	function ( $is_spam, $form_fields, $widget_settings, $post_id, $form_data = array() ) {
		if ( $is_spam ) {
			return true;
		}

		$testo = '';
		foreach ( (array) $form_data as $valore ) {
			$testo .= ' ' . ( is_array( $valore ) ? implode( ' ', array_map( 'strval', $valore ) ) : (string) $valore );
		}

		$massimo = (int) get_option( 'pizzuti_antispam_max_link', 3 );

		return $massimo > 0 && preg_match_all( '#https?://|www\.#i', $testo ) > $massimo;
	},
	10,
	5
);

add_filter(
	'pre_wp_mail',
	function ( $risultato, $atts ) {
		if ( ! get_option( 'pizzuti_prova_invio' ) ) {
			return $risultato;
		}

		$log   = (array) get_option( 'pizzuti_prova_invio_log', array() );
		$log[] = array(
			'quando'   => current_time( 'mysql' ),
			'to'       => $atts['to'] ?? '',
			'subject'  => $atts['subject'] ?? '',
			'headers'  => $atts['headers'] ?? '',
			'message'  => substr( wp_strip_all_tags( (string) ( $atts['message'] ?? '' ) ), 0, 3000 ),
			'allegati' => array_map(
				function ( $f ) {
					return array(
						'nome' => basename( (string) $f ),
						'byte' => file_exists( $f ) ? filesize( $f ) : null,
					);
				},
				(array) ( $atts['attachments'] ?? array() )
			),
		);
		update_option( 'pizzuti_prova_invio_log', array_slice( $log, -10 ), false );

		return true;
	},
	10,
	2
);

/* ==================================================================================================== */
/* 6. Ottimizzazione immagini Elementor (`sizes`, `loading`, `fetchpriority`) — modello ARTES 1.0.3     */
/* ==================================================================================================== */

function pizzuti_img_has_ancestor( $stack, $class_name ) {
	for ( $i = count( $stack ) - 1; $i >= 0; $i-- ) {
		if ( isset( $stack[ $i ]['classes'][ $class_name ] ) ) {
			return true;
		}
	}

	return false;
}

function pizzuti_img_has_ancestor_tag( $stack, $tag_name ) {
	for ( $i = count( $stack ) - 1; $i >= 0; $i-- ) {
		if ( $stack[ $i ]['tag'] === $tag_name ) {
			return true;
		}
	}

	return false;
}

function pizzuti_img_set_attr( $attrs, $name, $value ) {
	$pattern     = '/\s+\b' . preg_quote( $name, '/' ) . '=(?:"[^"]*"|\'[^\']*\'|[^\s>]+)/i';
	$replacement = ' ' . $name . '="' . esc_attr( $value ) . '"';

	if ( preg_match( $pattern, $attrs ) ) {
		return (string) preg_replace( $pattern, $replacement, $attrs, 1 );
	}

	return rtrim( $attrs ) . $replacement;
}

function pizzuti_img_remove_attr( $attrs, $name ) {
	return (string) preg_replace( '/\s+\b' . preg_quote( $name, '/' ) . '(?:=(?:"[^"]*"|\'[^\']*\'|[^\s>]+))?/i', '', $attrs );
}

function pizzuti_img_context_rule( $self_classes, $stack ) {
	// 1. Loghi header e footer.
	if ( pizzuti_img_has_ancestor( $stack, 'brand' ) || pizzuti_img_has_ancestor_tag( $stack, 'header' ) ) {
		return array( 'sizes' => '130px', 'mode' => 'logo' );
	}
	if ( pizzuti_img_has_ancestor( $stack, 'footer-brand' ) || pizzuti_img_has_ancestor_tag( $stack, 'footer' ) ) {
		return array( 'sizes' => '140px', 'mode' => 'lazy' );
	}

	// 2. Hero fotografica a tutto campo (.ph-photo .ph-bg): object-fit:cover su min-height 78svh richiede larghezza >= 100vw.
	if ( pizzuti_img_has_ancestor( $stack, 'ph-bg' ) || pizzuti_img_has_ancestor( $stack, 'ph-photo' ) ) {
		return array( 'sizes' => '(max-width: 899px) 1200px, 100vw', 'mode' => 'lcp' );
	}

	// 3. Sezioni feature (50vw desktop, 100vw sotto 900px).
	if ( pizzuti_img_has_ancestor( $stack, 'feature-img' ) ) {
		return array( 'sizes' => '(max-width: 899px) 100vw, 50vw', 'mode' => 'lazy' );
	}

	// 4. Metodo home (5fr / 11fr desktop).
	if ( pizzuti_img_has_ancestor( $stack, 'home-metodo-img' ) ) {
		return array( 'sizes' => '(max-width: 959px) calc(100vw - 40px), 45vw', 'mode' => 'lazy' );
	}

	// 5. Banner fotografico a tutta larghezza.
	if ( pizzuti_img_has_ancestor( $stack, 'banner' ) ) {
		return array( 'sizes' => '100vw', 'mode' => 'lazy' );
	}

	// 6. Badge Google recensioni (12rem = 192px).
	if ( pizzuti_img_has_ancestor( $stack, 'review-badge' ) ) {
		return array( 'sizes' => '200px', 'mode' => 'lazy' );
	}

	// 7. Foto vetrina / contatti (metà contenitore desktop).
	if ( isset( $self_classes['home-map'] ) || isset( $self_classes['contact-photo'] ) ) {
		return array( 'sizes' => '(max-width: 959px) calc(100vw - 40px), 580px', 'mode' => 'lazy' );
	}

	return array( 'sizes' => '(max-width: 899px) calc(100vw - 40px), 76rem', 'mode' => 'keep' );
}

function pizzuti_optimize_elementor_images( $html ) {
	if ( ! is_string( $html ) || false === stripos( $html, '<img' ) || is_admin() ) {
		return $html;
	}

	if ( class_exists( '\Elementor\Plugin' ) && \Elementor\Plugin::$instance ) {
		if ( ! empty( \Elementor\Plugin::$instance->editor ) && \Elementor\Plugin::$instance->editor->is_edit_mode() ) {
			return $html;
		}
		if ( ! empty( \Elementor\Plugin::$instance->preview ) && \Elementor\Plugin::$instance->preview->is_preview_mode() ) {
			return $html;
		}
	}

	$void_tags    = array_flip( array( 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr' ) );
	$stack        = array();
	$in_raw       = '';
	$lcp_assigned = false;

	return (string) preg_replace_callback(
		'/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b((?:"[^"]*"|\'[^\']*\'|[^\'">])*?)(\/?)>/',
		function ( $m ) use ( $void_tags, &$stack, &$in_raw, &$lcp_assigned ) {
			$is_close = '/' === $m[1];
			$tag      = strtolower( $m[2] );
			$attrs    = $m[3];
			$is_self  = '/' === $m[4] || isset( $void_tags[ $tag ] );

			if ( '' !== $in_raw ) {
				if ( $is_close && $tag === $in_raw ) {
					$in_raw = '';
				}
				return $m[0];
			}

			if ( ! $is_close && ( 'script' === $tag || 'style' === $tag ) && ! $is_self ) {
				$in_raw = $tag;
				return $m[0];
			}

			if ( $is_close ) {
				for ( $i = count( $stack ) - 1; $i >= 0; $i-- ) {
					if ( $stack[ $i ]['tag'] === $tag ) {
						array_splice( $stack, $i );
						break;
					}
				}
				return $m[0];
			}

			$classes = array();
			if ( preg_match( '/\bclass=(?:"([^"]*)"|\'([^\']*)\')/i', $attrs, $cm ) ) {
				$raw_cls = '' !== $cm[1] ? $cm[1] : ( $cm[2] ?? '' );
				foreach ( preg_split( '/\s+/', trim( $raw_cls ) ) as $c ) {
					if ( '' !== $c ) {
						$classes[ $c ] = true;
					}
				}
			}

			if ( 'img' !== $tag ) {
				if ( ! $is_self ) {
					$stack[] = array( 'tag' => $tag, 'classes' => $classes );
				}
				return $m[0];
			}

			if ( ! preg_match( '/\bsrcset=/i', $attrs ) ) {
				return $m[0];
			}

			$rule = pizzuti_img_context_rule( $classes, $stack );
			$mode = $rule['mode'];

			// L'immagine LCP resta senza fetchpriority e non lazy: Elementor le assegna fetchpriority="high" una sola volta;
			// loghi e immagini non lazy ricevono fetchpriority="auto" così Elementor non assegna loro high.
			if ( 'lcp' === $mode && ! $lcp_assigned ) {
				$attrs        = pizzuti_img_remove_attr( $attrs, 'loading' );
				$attrs        = pizzuti_img_remove_attr( $attrs, 'fetchpriority' );
				$lcp_assigned = true;
			} elseif ( 'lcp' === $mode || 'logo' === $mode ) {
				$attrs = pizzuti_img_set_attr( $attrs, 'loading', 'eager' );
				$attrs = pizzuti_img_set_attr( $attrs, 'fetchpriority', 'auto' );
			} elseif ( 'lazy' === $mode ) {
				$attrs = pizzuti_img_set_attr( $attrs, 'loading', 'lazy' );
				$attrs = pizzuti_img_remove_attr( $attrs, 'fetchpriority' );
			} elseif ( 'keep' === $mode && ! preg_match( '/\bloading=["\']?lazy/i', $attrs ) ) {
				$attrs = pizzuti_img_set_attr( $attrs, 'fetchpriority', 'auto' );
			}

			$is_lazy = (bool) preg_match( '/\bloading=(?:"lazy"|\'lazy\'|lazy)/i', $attrs );
			if ( ! preg_match( '/\bsizes=/i', $attrs ) && '' !== $rule['sizes'] ) {
				$attrs = pizzuti_img_set_attr( $attrs, 'sizes', $is_lazy ? 'auto, ' . $rule['sizes'] : $rule['sizes'] );
			}

			return '<img' . $attrs . ( '/' === $m[4] ? ' />' : '>' );
		},
		$html
	);
}

add_filter( 'elementor/frontend/the_content', 'pizzuti_optimize_elementor_images', 99 );

/* ==================================================================================================== */
/* 7. Redirect 301 (per eventuali vecchi indirizzi) e Icone del sito (favicon)                          */
/* ==================================================================================================== */

add_action(
	'template_redirect',
	function () {
		if ( is_admin() ) {
			return;
		}
		$mappa = get_option( 'pizzuti_redirects', array() );
		if ( ! is_array( $mappa ) || empty( $mappa ) ) {
			return;
		}
		$req = untrailingslashit( (string) wp_parse_url( isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '', PHP_URL_PATH ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
		if ( '' !== $req && isset( $mappa[ $req ] ) ) {
			wp_safe_redirect( home_url( (string) $mappa[ $req ] ), 301 );
			exit;
		}
	},
	4
);

add_action(
	'wp_head',
	function () {
		if ( has_site_icon() ) {
			return;
		}
		$dir = plugin_dir_path( __FILE__ ) . 'icone/';
		$url = function ( $file ) {
			return esc_url( plugins_url( 'icone/' . $file, __FILE__ ) . '?v=' . PIZZUTI_CORE_VERSION );
		};
		if ( file_exists( $dir . 'favicon.ico' ) ) {
			echo '<link rel="icon" href="' . $url( 'favicon.ico' ) . '" sizes="32x32">' . "\n";
		}
		if ( file_exists( $dir . 'apple-touch-icon.png' ) ) {
			echo '<link rel="apple-touch-icon" href="' . $url( 'apple-touch-icon.png' ) . '">' . "\n";
		}
		if ( file_exists( $dir . 'icona-512.png' ) ) {
			echo '<link rel="icon" href="' . $url( 'icona-512.png' ) . '" type="image/png" sizes="512x512">' . "\n";
		}
	},
	3
);

// Anteprima MCP di template Theme Builder `error-404` in bozza: Elementor Pro fa fallback sulla home
// (dove il tema non invoca la location `single`); forziamo una pagina 404 fittizia solo su token firmati.
add_filter(
	'elementor/mcp/preview/query_vars',
	function ( $query_vars, $post ) {
		if ( $post instanceof WP_Post && 'elementor_library' === $post->post_type
			&& 'error-404' === get_post_meta( $post->ID, '_elementor_template_type', true ) ) {
			return array( 'pagename' => '__pizzuti-preview-404__' );
		}

		return $query_vars;
	},
	20,
	2
);
