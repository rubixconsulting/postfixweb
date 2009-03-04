<?php

include_once('../lib/config.inc.php');
include_once('../lib/session.inc.php');

requireSiteAdmin();

global $config;

if(!$config['stats']['enabled'] || !$config['stats']['pflogsumm']['enabled']) {
	exit;
}

$dir = $config['stats']['pflogsumm']['dir'];

$time = 0;
$file = null;
foreach(glob($dir.'/*.txt') as $tmpFile) {
	$tmpTime = filemtime($tmpFile);
	if($tmpTime > $time) {
		$time = $tmpTime;
		$file = $tmpFile;
	}
}

$text = file_get_contents($file);
$text = str_replace(" ", "&nbsp;", $text);
$text = str_replace("<", "&lt;", $text);
$text = str_replace(">", "&gt;", $text);
$text = str_replace("\n", "<br />\n", $text);
$time = "Log Summary for: ".strftime("%Y-%m-%d", $time - (60 * 60 * 24));

print <<< EOF
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
	<head>
		<title>$time</title>
	</head>
	<body>
		<div style='padding: 15px; font-family: monospace;'>
			$time<br />
			$text
		</div>
	</body>
</html>
EOF;
