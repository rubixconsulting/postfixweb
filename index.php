<?php
set_include_path(get_include_path() . PATH_SEPARATOR . 'lib/min/lib');
include_once('lib/min/utils.php');
include_once('lib/config.inc.php');
$jsUri  = Minify_groupUri('js');
$cssUri = Minify_groupUri('css');
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
	<head>
		<title><?php print $config['page']['title'] ?></title>
		<link rel="shortcut icon" href="img/favicon.png" type="image/x-icon" />
		<link rel="stylesheet" type="text/css" href="<?php print $config['page']['path'].'lib'.$cssUri ?>" />
		<script type="text/javascript" src="<?php print $config['page']['path'].'lib'.$jsUri ?>"></script>
	</head>
	<body>
		<div id="login" />
<?php
if($config['page']['google_analytics']['enabled']) {
	$code = $config['page']['google_analytics']['code'];
	print <<< EOF
		<script type="text/javascript">
			var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
			document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
		</script>
		<script type="text/javascript">
			try {
				var pageTracker = _gat._getTracker("$code");
				pageTracker._trackPageview();
			} catch(err) {}
		</script>

EOF;
}
?>
	</body>
</html>
