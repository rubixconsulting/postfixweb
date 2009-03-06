<?php

include_once('../lib/config.inc.php');
include_once('../lib/session.inc.php');
include_once('../lib/syslog.inc.php');

requireSiteAdmin();

global $config;

if(!$config['logs']['enabled']) {
	exit;
}

$limit = $_POST['limit'];
$start = $_POST['start'];

if(!$limit) {
	$limit = 30;
}

$log = getSyslog($limit, $start);
print json_encode(array('success' => TRUE, 'log' => $log));
