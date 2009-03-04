<?php

include_once('../lib/config.inc.php');
include_once('../lib/session.inc.php');

requireSiteAdmin();

global $config;

if(!$config['stats']['enabled'] || !$config['stats']['pflogsumm']['enabled']) {
	exit;
}

$dir = $config['stats']['pflogsumm']['dir'];

$limit = $_POST['limit'];
$query = $_POST['query'];
$start = $_POST['start'];

if(!$start) {
	$start = 0;
}

if($limit && $query) {
	$files = array();
	$string = $dir.'/*.txt';
	if($query && ($query != 'all')) {
		$string = $dir.'/*'.$query.'*';
	}
	foreach(glob($string) as $tmpFile) {
		$files[] = array('file' => basename($tmpFile));
	}
	rsort($files);
	$results = array();
	$i = 0;
	foreach($files as $tmpFile) {
		if(($i >= $start) && ($i < $start + $limit)) {
			$results[] = $tmpFile;
		}
		$i++;
	}
	print json_encode(array('numFiles' => $i, 'files' => $results));
	exit;
}

$file = $_POST['file'];
$time = 0;
if($file) {
	$file = $dir.'/'.$file;
	$time = filemtime($file);
} else {
	foreach(glob($dir.'/*.txt') as $tmpFile) {
		$tmpTime = filemtime($tmpFile);
		if($tmpTime > $time) {
			$time = $tmpTime;
			$file = $tmpFile;
		}
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
