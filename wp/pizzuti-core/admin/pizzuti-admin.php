<?php
/**
 * Centro Acustico Pizzuti Core — menu di amministrazione "Centro Pizzuti" e riquadro "SEO Pizzuti".
 *
 * Modello: artes-core/admin/artes-admin.php. Caricato solo in area amministrazione. Permessi: manage_options.
 * Schede: Stato · Dati del Centro · SEO · Moduli · Stile · Manutenzione · Guida.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const PIZZUTI_ADMIN_SLUG = 'pizzuti';

add_action(
	'admin_menu',
	function () {
		add_menu_page(
			'Centro Pizzuti',
			'Centro Pizzuti',
			'manage_options',
			PIZZUTI_ADMIN_SLUG,
			'pizzuti_admin_pagina',
			'dashicons-admin-site-alt3',
			3
		);
	}
);

function pizzuti_admin_schede() {
	return array(
		'stato'        => 'Stato',
		'dati'         => 'Dati del Centro',
		'seo'          => 'SEO',
		'moduli'       => 'Moduli',
		'stile'        => 'Stile',
		'manutenzione' => 'Manutenzione',
		'guida'        => 'Guida',
	);
}

function pizzuti_admin_url( $scheda = 'stato', $extra = array() ) {
	return add_query_arg( array_merge( array( 'page' => PIZZUTI_ADMIN_SLUG, 'tab' => $scheda ), $extra ), admin_url( 'admin.php' ) );
}

function pizzuti_admin_pagina() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$schede = pizzuti_admin_schede();
	$tab    = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'stato'; // phpcs:ignore WordPress.Security.NonceVerification
	$tab    = isset( $schede[ $tab ] ) ? $tab : 'stato';

	echo '<div class="wrap pizzuti-admin"><h1>Centro Acustico Pizzuti <span class="pizzuti-versione">plugin pizzuti-core ' . esc_html( PIZZUTI_CORE_VERSION ) . '</span></h1>';
	echo '<p class="pizzuti-sottotitolo">Impostazioni, recapiti unificati e controlli del sito. Le pagine si modificano con Elementor. Dubbi? Scheda <a href="' . esc_url( pizzuti_admin_url( 'guida' ) ) . '">Guida</a>.</p>';

	if ( isset( $_GET['pizzuti_msg'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( sanitize_text_field( wp_unslash( $_GET['pizzuti_msg'] ) ) ) . '</p></div>'; // phpcs:ignore WordPress.Security.NonceVerification
	}

	echo '<nav class="nav-tab-wrapper">';
	foreach ( $schede as $k => $etichetta ) {
		printf( '<a href="%s" class="nav-tab%s">%s</a>', esc_url( pizzuti_admin_url( $k ) ), $k === $tab ? ' nav-tab-active' : '', esc_html( $etichetta ) );
	}
	echo '</nav><div class="pizzuti-scheda">';

	call_user_func( 'pizzuti_admin_scheda_' . $tab );

	echo '</div></div>';
}

add_action(
	'admin_head',
	function () {
		$screen = get_current_screen();
		if ( ! $screen || false === strpos( (string) $screen->id, PIZZUTI_ADMIN_SLUG ) ) {
			return;
		}
		echo '<style>
			.pizzuti-admin .pizzuti-versione{font-size:13px;font-weight:400;color:#646970;margin-left:8px}
			.pizzuti-admin .pizzuti-sottotitolo{color:#50575e;max-width:900px}
			.pizzuti-admin .pizzuti-scheda{max-width:1100px;margin-top:20px}
			.pizzuti-admin .pizzuti-box{background:#fff;border:1px solid #c3c4c7;padding:18px 22px;margin:0 0 20px}
			.pizzuti-admin .pizzuti-box h2{margin-top:0}
			.pizzuti-admin .pizzuti-controlli td,.pizzuti-admin .pizzuti-controlli th{padding:8px 10px;vertical-align:top}
			.pizzuti-admin .pizzuti-ok{color:#008a20;font-weight:600}
			.pizzuti-admin .pizzuti-ko{color:#d63638;font-weight:600}
			.pizzuti-admin .pizzuti-info{color:#996800;font-weight:600}
			.pizzuti-admin textarea.pizzuti-css{width:100%;min-height:280px;font-family:Consolas,Monaco,monospace;font-size:13px}
			.pizzuti-admin .pizzuti-guida{background:#fff;border:1px solid #c3c4c7;padding:10px 30px 30px;max-width:900px;line-height:1.6}
			.pizzuti-admin .pizzuti-guida code{font-size:12px}
			.pizzuti-admin .pizzuti-guida pre{background:#f6f7f7;padding:12px;overflow:auto}
			.pizzuti-admin .descrizione{color:#646970;font-size:12px}
			.pizzuti-admin .tag-esempio{display:inline-block;margin-left:8px;padding:2px 6px;border-radius:3px;background:#fcf0f1;color:#d63638;font-size:11px;font-weight:600}
		</style>';
	}
);

/* ---------------------------------------------------------------------------------------------------- */
/* Salvataggi (admin-post.php con nonce)                                                                */
/* ---------------------------------------------------------------------------------------------------- */

function pizzuti_admin_form_apri( $azione ) {
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '">';
	echo '<input type="hidden" name="action" value="pizzuti_' . esc_attr( $azione ) . '">';
	wp_nonce_field( 'pizzuti_' . $azione );
}

function pizzuti_admin_verifica( $azione ) {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( 'Permessi insufficienti.' );
	}
	check_admin_referer( 'pizzuti_' . $azione );
}

function pizzuti_admin_torna( $scheda, $messaggio ) {
	wp_safe_redirect( pizzuti_admin_url( $scheda, array( 'pizzuti_msg' => rawurlencode( $messaggio ) ) ) );
	exit;
}

function pizzuti_admin_svuota_cache() {
	if ( class_exists( '\Elementor\Plugin' ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	wp_cache_flush();
	do_action( 'litespeed_purge_all' );
}

add_action(
	'admin_post_pizzuti_dati',
	function () {
		pizzuti_admin_verifica( 'dati' );
		$in = isset( $_POST['dati'] ) && is_array( $_POST['dati'] ) ? wp_unslash( $_POST['dati'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput, WordPress.Security.NonceVerification

		$tel_vis  = sanitize_text_field( $in['telefono_visibile'] ?? '' );
		$tel_href = trim( sanitize_text_field( $in['telefono_href'] ?? '' ) );
		if ( '' === $tel_href && '' !== $tel_vis ) {
			$cifre    = preg_replace( '/[^0-9+]/', '', $tel_vis );
			$tel_href = 'tel:' . ( 0 === strpos( $cifre, '+' ) ? $cifre : '+39' . $cifre );
		}

		$orari = array();
		foreach ( preg_split( '/\r?\n/', (string) ( $in['orari_righe'] ?? '' ) ) as $riga ) {
			$riga = trim( $riga );
			if ( '' === $riga ) {
				continue;
			}
			$parti   = array_map( 'trim', explode( '|', $riga, 2 ) );
			$orari[] = array( 'giorni' => sanitize_text_field( $parti[0] ), 'ore' => sanitize_text_field( $parti[1] ?? '' ) );
		}

		$social = array();
		foreach ( preg_split( '/\r?\n/', (string) ( $in['social_righe'] ?? '' ) ) as $riga ) {
			$riga = trim( $riga );
			if ( '' === $riga ) {
				continue;
			}
			$parti    = array_map( 'trim', explode( '|', $riga, 3 ) );
			$nome     = sanitize_text_field( $parti[0] );
			$href     = esc_url_raw( $parti[1] ?? '' );
			$ico      = sanitize_key( $parti[2] ?? strtolower( $nome ) );
			$social[] = array( 'nome' => $nome, 'href' => $href, 'icona' => $ico );
		}

		$recensioni = array();
		foreach ( preg_split( '/\r?\n/', (string) ( $in['recensioni_righe'] ?? '' ) ) as $riga ) {
			$riga = trim( $riga );
			if ( '' === $riga ) {
				continue;
			}
			$parti        = array_map( 'trim', explode( '|', $riga, 3 ) );
			$recensioni[] = array(
				'nome'  => sanitize_text_field( $parti[0] ),
				'luogo' => sanitize_text_field( $parti[1] ?? 'recensione su Google' ),
				'testo' => sanitize_textarea_field( $parti[2] ?? '' ),
			);
		}

		$esempio = array_values( array_map( 'sanitize_key', (array) ( $_POST['esempio'] ?? array() ) ) ); // phpcs:ignore WordPress.Security.NonceVerification

		$nuovi = array(
			'nome'              => sanitize_text_field( $in['nome'] ?? '' ),
			'dottore'           => sanitize_text_field( $in['dottore'] ?? '' ),
			'societa'           => sanitize_text_field( $in['societa'] ?? '' ),
			'partita_iva'       => sanitize_text_field( $in['partita_iva'] ?? '' ),
			'indirizzo'         => sanitize_text_field( $in['indirizzo'] ?? '' ),
			'citta'             => sanitize_text_field( $in['citta'] ?? '' ),
			'mappa_query'       => sanitize_text_field( $in['mappa_query'] ?? '' ),
			'mappa_url'         => esc_url_raw( $in['mappa_url'] ?? '' ),
			'telefono_visibile' => $tel_vis,
			'telefono_href'     => $tel_href,
			'whatsapp_numero'   => preg_replace( '/[^0-9]/', '', (string) ( $in['whatsapp_numero'] ?? '' ) ),
			'whatsapp_testo'    => sanitize_text_field( $in['whatsapp_testo'] ?? '' ),
			'email'             => sanitize_email( $in['email'] ?? '' ),
			'orari'             => $orari,
			'social'            => $social,
			'marchi'            => sanitize_text_field( $in['marchi'] ?? '' ),
			'mostra_recensioni' => ! empty( $in['mostra_recensioni'] ),
			'recensioni'        => $recensioni,
			'campi_esempio'     => $esempio,
		);

		update_option( 'pizzuti_dati', $nuovi );
		pizzuti_admin_svuota_cache();
		pizzuti_admin_torna( 'dati', 'Dati del Centro salvati.' );
	}
);

add_action(
	'admin_post_pizzuti_seo',
	function () {
		pizzuti_admin_verifica( 'seo' );
		update_option( 'pizzuti_seo_schema', ! empty( $_POST['schema_attivo'] ) ? 1 : 0 ); // phpcs:ignore WordPress.Security.NonceVerification
		pizzuti_admin_torna( 'seo', 'Impostazioni SEO salvate.' );
	}
);

add_action(
	'admin_post_pizzuti_copia_yoast',
	function () {
		pizzuti_admin_verifica( 'copia_yoast' );
		$n   = 0;
		$ids = get_posts( array( 'post_type' => 'page', 'post_status' => array( 'publish', 'draft' ), 'numberposts' => -1, 'fields' => 'ids' ) );
		foreach ( $ids as $id ) {
			$seo = pizzuti_seo_for_post( $id );
			if ( '' !== $seo['title'] && '' === (string) get_post_meta( $id, '_yoast_wpseo_title', true ) ) {
				update_post_meta( $id, '_yoast_wpseo_title', $seo['title'] );
				$n++;
			}
			if ( '' !== $seo['description'] && '' === (string) get_post_meta( $id, '_yoast_wpseo_metadesc', true ) ) {
				update_post_meta( $id, '_yoast_wpseo_metadesc', $seo['description'] );
				$n++;
			}
		}
		update_option( 'pizzuti_seo_yoast_copiato', current_time( 'mysql' ) . ' (' . $n . ' campi)' );
		pizzuti_admin_torna( 'seo', 'Copiati in Yoast ' . $n . ' campi.' );
	}
);

add_action(
	'admin_post_pizzuti_moduli',
	function () {
		pizzuti_admin_verifica( 'moduli' );
		update_option( 'pizzuti_antispam_max_link', max( 0, (int) ( $_POST['max_link'] ?? 3 ) ) ); // phpcs:ignore WordPress.Security.NonceVerification
		update_option( 'pizzuti_prova_invio', ! empty( $_POST['prova_invio'] ) ? 1 : 0, false ); // phpcs:ignore WordPress.Security.NonceVerification
		if ( ! empty( $_POST['svuota_log'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			delete_option( 'pizzuti_prova_invio_log' );
		}
		pizzuti_admin_torna( 'moduli', get_option( 'pizzuti_prova_invio' ) ? 'Salvato. ATTENZIONE: modalità prova accesa, le email NON partono.' : 'Impostazioni moduli salvate.' );
	}
);

add_action(
	'admin_post_pizzuti_stile',
	function () {
		pizzuti_admin_verifica( 'stile' );
		$css = isset( $_POST['css'] ) ? wp_strip_all_tags( wp_unslash( $_POST['css'] ) ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput, WordPress.Security.NonceVerification
		update_option( 'pizzuti_css_aggiuntivo', $css );
		pizzuti_admin_svuota_cache();
		pizzuti_admin_torna( 'stile', 'CSS aggiuntivo salvato.' );
	}
);

add_action(
	'admin_post_pizzuti_pubblica',
	function () {
		pizzuti_admin_verifica( 'pubblica' );
		$id = (int) ( $_POST['pagina'] ?? 0 ); // phpcs:ignore WordPress.Security.NonceVerification
		if ( $id > 0 && 'page' === get_post_type( $id ) && 'draft' === get_post_status( $id ) ) {
			wp_update_post( array( 'ID' => $id, 'post_status' => 'publish' ) );
			pizzuti_admin_svuota_cache();
			pizzuti_admin_torna( 'manutenzione', 'Pubblicata: ' . get_the_title( $id ) . '.' );
		}
		pizzuti_admin_torna( 'manutenzione', 'Nessuna pagina pubblicata.' );
	}
);

add_action(
	'admin_post_pizzuti_manutenzione',
	function () {
		pizzuti_admin_verifica( 'manutenzione' );
		$fatto = array();
		if ( ! empty( $_POST['cache'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			pizzuti_admin_svuota_cache();
			$fatto[] = 'cache svuotate';
		}
		if ( ! empty( $_POST['permalink'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			flush_rewrite_rules( false );
			$fatto[] = 'permalink rigenerati';
		}
		pizzuti_admin_torna( 'manutenzione', $fatto ? ucfirst( implode( ', ', $fatto ) ) . '.' : 'Nessuna operazione scelta.' );
	}
);

/* ---------------------------------------------------------------------------------------------------- */
/* Controlli di salute (scheda Stato)                                                                   */
/* ---------------------------------------------------------------------------------------------------- */

function pizzuti_admin_moduli_honeypot() {
	global $wpdb;
	$righe = $wpdb->get_col( "SELECT post_id FROM {$wpdb->postmeta} m JOIN {$wpdb->posts} p ON p.ID = m.post_id WHERE m.meta_key = '_elementor_data' AND p.post_type <> 'revision' AND p.post_status <> 'trash' AND m.meta_value LIKE '%\"e-form\"%'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery
	$out   = array();

	foreach ( $righe as $id ) {
		$data  = json_decode( (string) get_post_meta( (int) $id, '_elementor_data', true ), true );
		$cerca = function ( $els ) use ( &$cerca, &$out, $id ) {
			foreach ( (array) $els as $e ) {
				if ( 'e-form' === ( $e['elType'] ?? '' ) || 'e-form' === ( $e['widgetType'] ?? '' ) ) {
					$figli = array_values( (array) ( $e['elements'] ?? array() ) );
					$tipi  = array_map( function ( $f ) { return $f['widgetType'] ?? ( $f['elType'] ?? '' ); }, $figli );
					$pos   = array_search( 'e-form-honeypot', $tipi, true );
					$out[] = array(
						'id'    => (int) $id,
						'stato' => false === $pos ? 'manca' : ( count( $tipi ) - 1 === $pos ? 'ok' : 'non-ultimo' ),
					);
				}
				if ( ! empty( $e['elements'] ) ) {
					$cerca( $e['elements'] );
				}
			}
		};
		$cerca( $data );
	}

	return $out;
}

function pizzuti_admin_controlli() {
	$dir     = dirname( __DIR__ ) . '/';
	$plugins = (array) get_option( 'active_plugins', array() );
	$c       = array();

	$font_ok = file_exists( $dir . 'fonts/fonts.css' ) && file_exists( $dir . 'fonts/montserrat-latin-wght-normal.woff2' );
	$c[]     = array( 'Caratteri locali', $font_ok ? 'ok' : 'ko', $font_ok ? 'Montserrat Variable (latin + latin-ext) servito dal plugin: zero richieste a Google.' : 'Mancano i file woff2 in fonts/: reinstallare lo ZIP completo.' );

	$css_ok = file_exists( $dir . 'pizzuti.css' );
	$c[]    = array( 'CSS generato', $css_ok ? 'ok' : 'ko', $css_ok ? 'pizzuti.css presente (' . size_format( filesize( $dir . 'pizzuti.css' ) ) . ').' : 'pizzuti.css MANCANTE.' );

	$kit = (int) get_option( 'elementor_active_kit' );
	$ks  = $kit ? get_post_meta( $kit, '_elementor_page_settings', true ) : array();
	$c[] = array( 'CSS personalizzato del kit Elementor', empty( $ks['custom_css'] ) ? 'ok' : 'info', empty( $ks['custom_css'] ) ? 'Vuoto, come previsto.' : 'Contiene del CSS: spostarlo nella scheda Stile.' );

	$c[] = array( 'Indicizzazione (noindex)', '0' === (string) get_option( 'blog_public' ) ? 'info' : 'ok', '0' === (string) get_option( 'blog_public' ) ? 'noindex attivo (corretto in staging; da togliere in produzione: Impostazioni → Lettura).' : 'Il sito è indicizzabile dai motori di ricerca.' );

	$smtp = array_filter( $plugins, function ( $p ) { return false !== stripos( $p, 'smtp' ) || false !== stripos( $p, 'mail' ); } );
	$c[]  = array( 'Plugin SMTP', $smtp ? 'ok' : 'info', $smtp ? 'Attivo: ' . implode( ', ', $smtp ) : 'Nessun plugin SMTP attivo (da configurare in produzione).' );

	$c[] = array( 'Modalità prova dei moduli', get_option( 'pizzuti_prova_invio' ) ? 'ko' : 'ok', get_option( 'pizzuti_prova_invio' ) ? 'ACCESA: le email del sito non partono.' : 'Spenta: le email partono normalmente.' );

	$moduli = pizzuti_admin_moduli_honeypot();
	if ( empty( $moduli ) ) {
		$c[] = array( 'Moduli (Honeypot ultimo campo)', 'info', 'Nessun modulo Elementor (e-form) ancora creato sul sito (previsto in Fase 4).' );
	} else {
		foreach ( $moduli as $m ) {
			$titolo = get_the_title( $m['id'] ) . ' (#' . $m['id'] . ', ' . get_post_status( $m['id'] ) . ')';
			$testo  = array(
				'ok'         => 'campo Honeypot presente come ultimo campo.',
				'manca'      => 'manca il campo Honeypot: aggiungerlo come ULTIMO campo.',
				'non-ultimo' => 'Honeypot NON è l\'ultimo campo: spostarlo in fondo.',
			);
			$c[] = array( 'Modulo: ' . $titolo, 'ok' === $m['stato'] ? 'ok' : 'ko', $testo[ $m['stato'] ] );
		}
	}

	$esempi = pizzuti_ha_dati_esempio();
	$c[]    = array(
		'Dati del Centro ("esempio")',
		empty( $esempi ) ? 'ok' : 'ko',
		empty( $esempi )
			? 'Tutti i dati del Centro sono confermati reali (dati strutturati LocalBusiness abilitabili).'
			: 'Campi ancora segnati come esempio (' . count( $esempi ) . '): <code>' . esc_html( implode( ', ', $esempi ) ) . '</code>. Sostituirli in <a href="' . esc_url( pizzuti_admin_url( 'dati' ) ) . '">Dati del Centro</a> prima di andare online.',
	);

	// Pagine legali ancora in bozza o mancanti
	$legali_bozza = array();
	foreach ( array( 'privacy-policy' => 'Privacy Policy', 'cookie-policy' => 'Cookie Policy', 'note-legali' => 'Note legali' ) as $slug => $label ) {
		$p = get_page_by_path( $slug );
		if ( ! $p || 'publish' !== $p->post_status ) {
			$legali_bozza[] = $label . ( $p ? ' (bozza)' : ' (non creata)' );
		}
	}
	$c[] = array( 'Pagine legali', empty( $legali_bozza ) ? 'ok' : 'info', empty( $legali_bozza ) ? 'Privacy, Cookie e Note legali pubblicate.' : 'Da completare/verificare con consulente: ' . implode( ', ', $legali_bozza ) . '.' );

	$cookie = array_filter( $plugins, function ( $p ) { return false !== stripos( $p, 'cookie' ) || false !== stripos( $p, 'complianz' ) || false !== stripos( $p, 'iubenda' ); } );
	$c[]    = array( 'Plugin banner cookie', $cookie ? 'ok' : 'info', $cookie ? 'Attivo: ' . implode( ', ', $cookie ) : 'Nessun plugin banner cookie attivo (previsto prima della pubblicazione).' );

	$c[] = array( 'Plugin SEO esterno (Yoast / Rank Math / AIOSEO)', pizzuti_seo_esterno() ? 'ok' : 'info', pizzuti_seo_esterno() ? 'Attivo: pizzuti-core si è fatto da parte automaticamente.' : 'Non attivo: title, description, OG e JSON-LD sono gestiti da pizzuti-core.' );

	return $c;
}

/* ---------------------------------------------------------------------------------------------------- */
/* Schede                                                                                               */
/* ---------------------------------------------------------------------------------------------------- */

function pizzuti_admin_scheda_stato() {
	echo '<div class="pizzuti-box"><h2>Controlli</h2><table class="widefat striped pizzuti-controlli"><tbody>';
	foreach ( pizzuti_admin_controlli() as $r ) {
		$segno = array( 'ok' => array( 'pizzuti-ok', '✓' ), 'ko' => array( 'pizzuti-ko', '✗' ), 'info' => array( 'pizzuti-info', '!' ) )[ $r[1] ];
		printf( '<tr><td style="width:30px" class="%s">%s</td><th style="width:310px">%s</th><td>%s</td></tr>', esc_attr( $segno[0] ), esc_html( $segno[1] ), esc_html( $r[0] ), wp_kses_post( $r[2] ) );
	}
	echo '</tbody></table></div>';

	$tpl = get_posts( array( 'post_type' => 'elementor_library', 'post_status' => array( 'publish', 'draft' ), 'numberposts' => -1, 'meta_key' => '_elementor_template_type', 'orderby' => 'title', 'order' => 'ASC' ) );
	echo '<div class="pizzuti-box"><h2>Template del Theme Builder</h2>';
	if ( empty( $tpl ) ) {
		echo '<p class="descrizione">Nessun template del Theme Builder ancora creato (previsti in Fase 3: Header, Footer, Barra mobile, 404).</p>';
	} else {
		echo '<table class="widefat striped"><thead><tr><th>Template</th><th>Tipo</th><th>Stato</th><th>Condizioni</th><th></th></tr></thead><tbody>';
		foreach ( $tpl as $t ) {
			$tipo = (string) get_post_meta( $t->ID, '_elementor_template_type', true );
			$cond = (array) get_post_meta( $t->ID, '_elementor_conditions', true );
			printf(
				'<tr><td>%s <span class="descrizione">#%d</span></td><td>%s</td><td>%s</td><td><code>%s</code></td><td><a href="%s">Modifica con Elementor</a></td></tr>',
				esc_html( $t->post_title ),
				(int) $t->ID,
				esc_html( $tipo ),
				'publish' === $t->post_status ? 'pubblicato' : 'bozza',
				esc_html( implode( ', ', array_filter( $cond ) ) ),
				esc_url( admin_url( 'post.php?post=' . $t->ID . '&action=elementor' ) )
			);
		}
		echo '</tbody></table>';
	}
	echo '</div>';
}

function pizzuti_admin_scheda_dati() {
	$d      = pizzuti_dati();
	$esempi = pizzuti_ha_dati_esempio();
	$chk    = function ( $k ) use ( $esempi ) {
		$is = in_array( $k, $esempi, true );
		return '<label style="margin-left:10px"><input type="checkbox" name="esempio[]" value="' . esc_attr( $k ) . '"' . checked( $is, true, false ) . '> Dato di esempio</label>' . ( $is ? '<span class="tag-esempio">ESEMPIO</span>' : '' );
	};

	$orari_txt = implode( "\n", array_map( function ( $r ) { return ( $r['giorni'] ?? '' ) . ' | ' . ( $r['ore'] ?? '' ); }, (array) $d['orari'] ) );
	$soc_txt   = implode( "\n", array_map( function ( $s ) { return ( $s['nome'] ?? '' ) . ' | ' . ( $s['href'] ?? '' ) . ' | ' . ( $s['icona'] ?? '' ); }, (array) $d['social'] ) );
	$rec_txt   = implode( "\n", array_map( function ( $r ) { return ( $r['nome'] ?? '' ) . ' | ' . ( $r['luogo'] ?? '' ) . ' | ' . ( $r['testo'] ?? '' ); }, (array) $d['recensioni'] ) );

	echo '<div class="pizzuti-box"><h2>Dati del Centro</h2><p class="descrizione">Fonte unica per header, footer, barra mobile, pagina Contatti e dati strutturati. Togli la spunta "Dato di esempio" quando inserisci il dato definitivo.</p>';
	pizzuti_admin_form_apri( 'dati' );
	echo '<table class="form-table">';
	printf( '<tr><th>Nome Centro</th><td><input type="text" class="regular-text" name="dati[nome]" value="%s"></td></tr>', esc_attr( $d['nome'] ) );
	printf( '<tr><th>Dottore</th><td><input type="text" class="regular-text" name="dati[dottore]" value="%s"></td></tr>', esc_attr( $d['dottore'] ) );
	printf( '<tr><th>Ragione sociale</th><td><input type="text" class="large-text" name="dati[societa]" value="%s"></td></tr>', esc_attr( $d['societa'] ) );
	printf( '<tr><th>Partita IVA</th><td><input type="text" class="regular-text" name="dati[partita_iva]" value="%s">%s</td></tr>', esc_attr( $d['partita_iva'] ), $chk( 'partita_iva' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
	printf( '<tr><th>Indirizzo completo</th><td><input type="text" class="large-text" name="dati[indirizzo]" value="%s">%s</td></tr>', esc_attr( $d['indirizzo'] ), $chk( 'indirizzo' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
	printf( '<tr><th>Città</th><td><input type="text" class="regular-text" name="dati[citta]" value="%s"></td></tr>', esc_attr( $d['citta'] ) );
	printf( '<tr><th>Query Google Maps</th><td><input type="text" class="regular-text" name="dati[mappa_query]" value="%s"></td></tr>', esc_attr( $d['mappa_query'] ) );
	printf( '<tr><th>Link Google Maps</th><td><input type="url" class="large-text" name="dati[mappa_url]" value="%s"></td></tr>', esc_attr( $d['mappa_url'] ) );
	printf( '<tr><th>Telefono (visibile)</th><td><input type="text" class="regular-text" name="dati[telefono_visibile]" value="%s">%s</td></tr>', esc_attr( $d['telefono_visibile'] ), $chk( 'telefono_visibile' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
	printf( '<tr><th>Telefono (href tel:)</th><td><input type="text" class="regular-text" name="dati[telefono_href]" value="%s"> <span class="descrizione">Vuoto = generato automaticamente</span></td></tr>', esc_attr( $d['telefono_href'] ) );
	printf( '<tr><th>WhatsApp (solo cifre)</th><td><input type="text" class="regular-text" name="dati[whatsapp_numero]" value="%s">%s</td></tr>', esc_attr( $d['whatsapp_numero'] ), $chk( 'whatsapp_numero' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
	printf( '<tr><th>WhatsApp (testo precompilato)</th><td><input type="text" class="large-text" name="dati[whatsapp_testo]" value="%s"></td></tr>', esc_attr( $d['whatsapp_testo'] ) );
	printf( '<tr><th>Email</th><td><input type="email" class="regular-text" name="dati[email]" value="%s">%s</td></tr>', esc_attr( $d['email'] ), $chk( 'email' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
	printf( '<tr><th>Orari (una riga: Giorni | Ore)</th><td><textarea class="large-text" rows="4" name="dati[orari_righe]">%s</textarea><br>%s</td></tr>', esc_textarea( $orari_txt ), $chk( 'orari' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
	printf( '<tr><th>Social (Nome | URL | icona)</th><td><textarea class="large-text" rows="3" name="dati[social_righe]">%s</textarea><br>%s</td></tr>', esc_textarea( $soc_txt ), $chk( 'social' ) ); // phpcs:ignore WordPress.Security.EscapeOutput
	printf( '<tr><th>Marchi trattati</th><td><input type="text" class="large-text" name="dati[marchi]" value="%s"></td></tr>', esc_attr( $d['marchi'] ) );
	printf( '<tr><th>Mostra recensioni</th><td><label><input type="checkbox" name="dati[mostra_recensioni]" value="1"%s> Mostra la sezione recensioni sul sito</label></td></tr>', checked( ! empty( $d['mostra_recensioni'] ), true, false ) );
	printf( '<tr><th>Recensioni (Nome | Luogo | Testo)</th><td><textarea class="large-text" rows="5" name="dati[recensioni_righe]">%s</textarea></td></tr>', esc_textarea( $rec_txt ) );
	echo '</table>';
	submit_button( 'Salva Dati del Centro' );
	echo '</form></div>';

	echo '<div class="pizzuti-box"><h2>Shortcode disponibili</h2><ul style="list-style:disc;padding-left:20px">';
	echo '<li><code>[pizzuti_dato campo="telefono"]</code> (anche <code>dottore</code>, <code>societa</code>, <code>partita_iva</code>, <code>indirizzo</code>, <code>email</code>, <code>marchi</code>)</li>';
	echo '<li><code>[pizzuti_tel]</code> · <code>[pizzuti_whatsapp]</code> (opzioni <code>testo="..." classe="..." icona="1"</code>)</li>';
	echo '<li><code>[pizzuti_orari]</code> (<code>formato="dl"</code> per il footer, <code>formato="inline"</code> per la home)</li>';
	echo '<li><code>[pizzuti_indirizzo link="1"]</code> · <code>[pizzuti_social]</code> · <code>[pizzuti_recensioni]</code> · <code>[pizzuti_mappa]</code> · <code>[pizzuti_anno]</code></li>';
	echo '</ul></div>';
}

function pizzuti_admin_scheda_seo() {
	echo '<div class="pizzuti-box"><h2>Plugin SEO esterno</h2>';
	if ( pizzuti_seo_esterno() ) {
		echo '<p class="pizzuti-ok">Plugin SEO esterno attivo: titolo, descrizione, Open Graph e dati strutturati li gestisce lui. <code>pizzuti-core</code> si è fatto da parte.</p>';
		if ( defined( 'WPSEO_VERSION' ) ) {
			$copiato = get_option( 'pizzuti_seo_yoast_copiato' );
			echo '<p>Copia in Yoast i titoli e le descrizioni delle pagine scritti finora (non sovrascrive i campi Yoast già compilati).</p>';
			echo $copiato ? '<p class="descrizione">Ultima copia: ' . esc_html( $copiato ) . '</p>' : '';
			pizzuti_admin_form_apri( 'copia_yoast' );
			submit_button( 'Copia in Yoast', 'primary', 'submit', false );
			echo '</form>';
		}
	} else {
		echo '<p>Nessun plugin SEO esterno attivo: <code>pizzuti-core</code> gestisce title, meta description, Open Graph e JSON-LD. Se si installa Yoast / Rank Math / AIOSEO si fa da parte in automatico.</p>';
	}
	echo '</div>';

	echo '<div class="pizzuti-box"><h2>Dati strutturati LocalBusiness</h2>';
	$esempi = pizzuti_ha_dati_esempio();
	if ( ! empty( $esempi ) ) {
		echo '<p class="pizzuti-ko">Sospesi finché restano campi "esempio" in Dati del Centro (' . esc_html( implode( ', ', $esempi ) ) . ').</p>';
	}
	pizzuti_admin_form_apri( 'seo' );
	printf( '<p><label><input type="checkbox" name="schema_attivo" value="1"%s> Genera JSON-LD <code>LocalBusiness</code> dai Dati del Centro (solo quando nessun campo è più "esempio")</label></p>', checked( (bool) get_option( 'pizzuti_seo_schema', 1 ), true, false ) );
	submit_button( 'Salva impostazioni SEO' );
	echo '</form></div>';

	echo '<div class="pizzuti-box"><h2>Riquadro "SEO Pizzuti" nelle pagine</h2><p>In ogni pagina (editor WordPress → riquadro <strong>SEO Pizzuti</strong>) puoi impostare titolo e descrizione. Se lasciati vuoti, il plugin usa valori calcolati automaticamente («Titolo pagina · Centro Acustico Pizzuti»).</p></div>';
}

function pizzuti_admin_scheda_moduli() {
	$log = (array) get_option( 'pizzuti_prova_invio_log', array() );

	echo '<div class="pizzuti-box"><h2>Anti-spam e modalità prova</h2>';
	pizzuti_admin_form_apri( 'moduli' );
	echo '<table class="form-table">';
	printf( '<tr><th>Link massimi in un messaggio</th><td><input type="number" min="0" max="50" name="max_link" value="%d"> <p class="descrizione">I messaggi con più link vengono scartati come spam (0 = controllo spento). In ogni modulo aggiungere anche il campo Honeypot come ULTIMO campo.</p></td></tr>', (int) get_option( 'pizzuti_antispam_max_link', 3 ) );
	printf( '<tr><th>Modalità prova</th><td><label><input type="checkbox" name="prova_invio" value="1"%s> Accesa: le email NON partono, vengono registrate qui sotto</label><p class="descrizione">Per collaudare i moduli senza scrivere al cliente. Spegnerla al termine.</p></td></tr>', checked( (bool) get_option( 'pizzuti_prova_invio' ), true, false ) );
	echo '<tr><th>Registro</th><td><label><input type="checkbox" name="svuota_log" value="1"> Svuota il registro delle email intercettate</label></td></tr>';
	echo '</table>';
	submit_button( 'Salva' );
	echo '</form></div>';

	echo '<div class="pizzuti-box"><h2>Email intercettate in modalità prova (ultime 10)</h2>';
	if ( empty( $log ) ) {
		echo '<p>Nessuna email registrata.</p>';
	} else {
		echo '<table class="widefat striped"><thead><tr><th>Quando</th><th>A</th><th>Oggetto</th><th>Testo</th></tr></thead><tbody>';
		foreach ( array_reverse( $log ) as $e ) {
			printf( '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>', esc_html( $e['quando'] ?? '' ), esc_html( is_array( $e['to'] ?? '' ) ? implode( ', ', $e['to'] ) : ( $e['to'] ?? '' ) ), esc_html( $e['subject'] ?? '' ), esc_html( wp_trim_words( (string) ( $e['message'] ?? '' ), 30 ) ) );
		}
		echo '</tbody></table>';
	}
	echo '</div>';
}

function pizzuti_admin_scheda_stile() {
	echo '<div class="pizzuti-box"><h2>Come funziona lo stile</h2><ul style="list-style:disc;padding-left:20px">';
	echo '<li><code>pizzuti.css</code> è <strong>generato</strong> dal CSS della proposta A (non modificarlo a mano).</li>';
	echo '<li>Le classi di Elementor (<code>container</code>, <code>sec-head</code>, <code>lead</code>, <code>home-hero</code>…) sono solo etichette.</li>';
	echo '<li>Il CSS personalizzato del kit Elementor resta vuoto.</li>';
	echo '<li>Per ritocchi locali usa il campo qui sotto (caricato dopo <code>pizzuti.css</code>): es. <code>body.pizzuti .elementor .classe { … }</code>.</li></ul></div>';

	echo '<div class="pizzuti-box"><h2>CSS aggiuntivo</h2>';
	pizzuti_admin_form_apri( 'stile' );
	printf( '<textarea class="pizzuti-css" name="css" spellcheck="false" placeholder="body.pizzuti .elementor .classe { … }">%s</textarea>', esc_textarea( (string) get_option( 'pizzuti_css_aggiuntivo', '' ) ) );
	submit_button( 'Salva CSS aggiuntivo' );
	echo '</form></div>';
}

function pizzuti_admin_scheda_manutenzione() {
	$bozze = get_posts( array( 'post_type' => 'page', 'post_status' => 'draft', 'numberposts' => -1, 'orderby' => 'title', 'order' => 'ASC' ) );
	echo '<div class="pizzuti-box"><h2>Pagine in bozza</h2>';
	if ( empty( $bozze ) ) {
		echo '<p>Nessuna pagina in bozza.</p>';
	} else {
		echo '<table class="widefat striped"><thead><tr><th>Pagina</th><th>Slug</th><th></th></tr></thead><tbody>';
		foreach ( $bozze as $b ) {
			echo '<tr><td>' . esc_html( $b->post_title ) . ' <span class="descrizione">#' . (int) $b->ID . '</span></td><td><code>/' . esc_html( $b->post_name ) . '/</code></td><td>';
			pizzuti_admin_form_apri( 'pubblica' );
			echo '<input type="hidden" name="pagina" value="' . (int) $b->ID . '">';
			submit_button( 'Pubblica', 'secondary small', 'submit', false );
			echo '</form></td></tr>';
		}
		echo '</tbody></table>';
	}
	echo '</div>';

	echo '<div class="pizzuti-box"><h2>Operazioni rapide</h2>';
	pizzuti_admin_form_apri( 'manutenzione' );
	echo '<p><label><input type="checkbox" name="cache" value="1" checked> Svuota le cache (CSS Elementor + cache WordPress + LiteSpeed)</label></p>';
	echo '<p><label><input type="checkbox" name="permalink" value="1"> Rigenera i permalink</label></p>';
	submit_button( 'Esegui' );
	echo '</form></div>';

	echo '<div class="pizzuti-box"><h2>Aggiornare il plugin</h2><p>Plugin → Aggiungi nuovo → Carica plugin con il nuovo file <code>pizzuti-core.zip</code>. Dopo l\'aggiornamento svuota le cache qui sopra e verifica la scheda <strong>Stato</strong>.</p></div>';
}

function pizzuti_admin_scheda_guida() {
	$file = dirname( __DIR__ ) . '/LEGGIMI-MANUTENZIONE.md';
	if ( ! file_exists( $file ) ) {
		echo '<p>Guida non trovata.</p>';
		return;
	}
	echo '<div class="pizzuti-guida">' . pizzuti_admin_markdown( (string) file_get_contents( $file ) ) . '</div>'; // phpcs:ignore WordPress.Security.EscapeOutput
}

function pizzuti_admin_markdown( $md ) {
	$out = ''; $lista = false; $codice = false;
	$inline = function ( $t ) {
		$t = esc_html( $t );
		$t = preg_replace( '/`([^`]+)`/', '<code>$1</code>', $t );
		$t = preg_replace( '/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $t );
		return $t;
	};
	foreach ( preg_split( '/\r?\n/', $md ) as $riga ) {
		if ( 0 === strpos( $riga, '```' ) ) {
			$out .= $codice ? '</pre>' : ( $lista ? '</ul>' : '' ) . '<pre>';
			$lista = $codice ? $lista : false;
			$codice = ! $codice;
			continue;
		}
		if ( $codice ) { $out .= esc_html( $riga ) . "\n"; continue; }
		if ( preg_match( '/^\s*[-*] (.*)$/', $riga, $m ) ) {
			$out .= ( $lista ? '' : '<ul style="list-style:disc;padding-left:20px">' ) . '<li>' . $inline( $m[1] ) . '</li>';
			$lista = true;
			continue;
		}
		if ( $lista ) { $out .= '</ul>'; $lista = false; }
		if ( preg_match( '/^(#{1,4}) (.*)$/', $riga, $m ) ) {
			$n = min( 4, strlen( $m[1] ) + 1 );
			$out .= '<h' . $n . '>' . $inline( $m[2] ) . '</h' . $n . '>';
		} elseif ( '' !== trim( $riga ) ) {
			$out .= '<p>' . $inline( $riga ) . '</p>';
		}
	}
	return $out . ( $lista ? '</ul>' : '' ) . ( $codice ? '</pre>' : '' );
}

/* ---------------------------------------------------------------------------------------------------- */
/* Riquadro "SEO Pizzuti" negli editor di pagina                                                        */
/* ---------------------------------------------------------------------------------------------------- */

add_action(
	'add_meta_boxes',
	function () {
		if ( pizzuti_seo_esterno() ) {
			return;
		}
		add_meta_box( 'pizzuti_seo', 'SEO Pizzuti', 'pizzuti_admin_metabox_seo', 'page', 'normal', 'default' );
	}
);

function pizzuti_admin_metabox_seo( $post ) {
	wp_nonce_field( 'pizzuti_seo_meta', 'pizzuti_seo_nonce' );
	$auto  = pizzuti_seo_for_post( $post->ID );
	$title = (string) get_post_meta( $post->ID, '_pizzuti_seo_title', true );
	$desc  = (string) get_post_meta( $post->ID, '_pizzuti_seo_description', true );

	echo '<p class="description">Titolo e descrizione per Google e condivisione. Vuoti = testo calcolato automaticamente (in grigio). Consigliato: titolo ≤ 60 caratteri, descrizione 120-160.</p>';
	printf( '<p><label for="pizzuti_seo_title"><strong>Titolo SEO</strong></label><br><input type="text" id="pizzuti_seo_title" name="pizzuti_seo_title" class="large-text" value="%s" placeholder="%s"></p>', esc_attr( $title ), esc_attr( $title ? '' : $auto['title'] ) );
	printf( '<p><label for="pizzuti_seo_description"><strong>Descrizione SEO</strong></label><br><textarea id="pizzuti_seo_description" name="pizzuti_seo_description" class="large-text" rows="3" placeholder="%s">%s</textarea></p>', esc_attr( $desc ? '' : $auto['description'] ), esc_textarea( $desc ) );
}

add_action(
	'save_post',
	function ( $post_id ) {
		if ( ! isset( $_POST['pizzuti_seo_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['pizzuti_seo_nonce'] ) ), 'pizzuti_seo_meta' ) ) {
			return;
		}
		if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		foreach ( array( 'pizzuti_seo_title' => '_pizzuti_seo_title', 'pizzuti_seo_description' => '_pizzuti_seo_description' ) as $campo => $meta ) {
			$v = isset( $_POST[ $campo ] ) ? sanitize_textarea_field( wp_unslash( $_POST[ $campo ] ) ) : '';
			if ( '' === trim( $v ) ) {
				delete_post_meta( $post_id, $meta );
			} else {
				update_post_meta( $post_id, $meta, $v );
			}
		}
	}
);

add_filter(
	'plugin_action_links_pizzuti-core/pizzuti-core.php',
	function ( $links ) {
		array_unshift( $links, '<a href="' . esc_url( pizzuti_admin_url() ) . '">Impostazioni</a>' );
		return $links;
	}
);
