# Impacchetta wp/pizzuti-core/ in tools/out/pizzuti-core.zip (barre "/" via System.IO.Compression,
# mai Compress-Archive), controlla la sintassi con php -l, carica via Novamira CLI, installa e attiva
# via WP-CLI (--force), verifica la versione attiva, svuota le cache e rimuove lo ZIP temporaneo dal server.
# Uso (da PowerShell): .\tools\install-plugin.ps1 [-SoloZip]
param(
  [switch]$SoloZip,
  [string]$Site = 'dev1.minimalstudiodev.it'
)
$ErrorActionPreference = 'Stop'
$d = $PSScriptRoot
$src = Join-Path $d '..\wp\pizzuti-core'
$out = Join-Path $d 'out'
New-Item -ItemType Directory -Force $out | Out-Null

# 0. Controllo sintassi PHP su ogni file del plugin
foreach ($php in Get-ChildItem $src -Recurse -Filter '*.php') {
  $chk = & php -l $php.FullName 2>&1
  if ($LASTEXITCODE -ne 0) { throw "Errore sintassi PHP in $($php.FullName): $chk" }
}
"0. php -l: tutti i file PHP validi"

# 1. Pacchetto ZIP con barre normali "/"
$stage = Join-Path $out 'pkg'
$pkgRoot = Join-Path $stage 'pizzuti-core'
Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $pkgRoot | Out-Null
Copy-Item (Join-Path $src '*') $pkgRoot -Recurse -Force

$zip = Join-Path $out 'pizzuti-core.zip'
Remove-Item $zip -Force -ErrorAction SilentlyContinue
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$za = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
$pkgRootFull = (Get-Item $pkgRoot).FullName.TrimEnd('\', '/')
foreach ($f in Get-ChildItem $pkgRoot -Recurse -File) {
  $rel = $f.FullName.Substring($pkgRootFull.Length + 1).Replace('\', '/')
  [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($za, $f.FullName, "pizzuti-core/$rel")
}
$za.Dispose()
"1. pacchetto: $zip ($((Get-Item $zip).Length) byte)"
if ($SoloZip) { return }

function RunNovamira($ability, $payload) {
  $tmp = Join-Path $out '_nm-install.json'
  $payload | ConvertTo-Json -Depth 10 -Compress | Set-Content -Path $tmp -Encoding utf8NoBOM
  try {
    $raw = & novamira --site $Site run $ability --input "@$tmp" --yes --json
    if ($LASTEXITCODE -ne 0) { throw "novamira $ability fallita: $raw" }
    return ($raw | ConvertFrom-Json)
  } finally {
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  }
}

$reqId = 'pizzuti-inst-' + (Get-Date -Format 'HHmmss')

# 2. Upload ZIP
$upRes = RunNovamira 'novamira/create-upload-link' @{
  path = 'wp-content/uploads/pizzuti-core.zip'
  overwrite = $true
  expires_in = 300
  novamira_review = @{ attention = 3; summary = 'Crea link temporaneo per caricare lo ZIP del plugin pizzuti-core.'; request_id = $reqId }
}
$link = $upRes.data
if (-not $link.upload_url) { throw "create-upload-link fallito: $($upRes | ConvertTo-Json -Compress)" }
$null = Invoke-WebRequest $link.upload_url -Method Put -Headers @{ $link.token_header = $link.upload_token } -InFile $zip -ContentType 'application/zip' -UseBasicParsing -TimeoutSec 120
"2. caricato su $Site"

# 3. Installazione + attivazione via WP-CLI
$inst = (RunNovamira 'novamira/run-wp-cli' @{
  args = @('plugin', 'install', 'wp-content/uploads/pizzuti-core.zip', '--force', '--activate')
  novamira_review = @{ attention = 4; summary = 'Installa e attiva il plugin pizzuti-core sullo staging.'; request_id = $reqId }
}).data
"3. wp plugin install --activate: exit $($inst.exit_code) | $(($inst.stdout -split "`n" | Where-Object { $_ } | Select-Object -Last 3) -join ' / ')"
if ($inst.exit_code -ne 0) { throw "ERRORE WP-CLI: $($inst.stderr)" }

# 4. Verifica plugin attivo, versione, kit vuoto e svuota cache
$verifyCode = @'
if (class_exists('\Elementor\Plugin')) { \Elementor\Plugin::$instance->files_manager->clear_cache(); }
wp_cache_flush();
do_action('litespeed_purge_all');
if (!function_exists('is_plugin_active')) { require_once ABSPATH . 'wp-admin/includes/plugin.php'; }
$kid = (int) get_option('elementor_active_kit');
$ks = $kid ? get_post_meta($kid, '_elementor_page_settings', true) : [];
return [
  'plugin_attivo' => is_plugin_active('pizzuti-core/pizzuti-core.php'),
  'versione' => defined('PIZZUTI_CORE_VERSION') ? PIZZUTI_CORE_VERSION : null,
  'css_nel_plugin' => file_exists(WP_PLUGIN_DIR . '/pizzuti-core/pizzuti.css'),
  'js_nel_plugin' => file_exists(WP_PLUGIN_DIR . '/pizzuti-core/pizzuti.js'),
  'fonts_nel_plugin' => file_exists(WP_PLUGIN_DIR . '/pizzuti-core/fonts/fonts.css'),
  'kit_css_vuoto' => empty($ks['custom_css']),
  'shortcode' => array_map('shortcode_exists', ['pizzuti_dato','pizzuti_tel','pizzuti_whatsapp','pizzuti_orari','pizzuti_indirizzo','pizzuti_social','pizzuti_recensioni','pizzuti_anno','pizzuti_mappa']),
];
'@
$ver = (RunNovamira 'novamira/execute-php' @{
  code = $verifyCode
  novamira_review = @{ attention = 2; summary = 'Verifica attivazione pizzuti-core, asset presenti e svuota cache.'; request_id = $reqId }
}).data
"4. verifica: $($ver.return_value | ConvertTo-Json -Compress)"

# 5. Pulizia ZIP temporaneo dal server
$null = RunNovamira 'novamira/delete-file' @{
  path = 'wp-content/uploads/pizzuti-core.zip'
  novamira_review = @{ attention = 2; summary = 'Rimuove lo ZIP temporaneo pizzuti-core.zip da wp-content/uploads/.'; request_id = $reqId }
}
"5. zip temporaneo rimosso dal server"
