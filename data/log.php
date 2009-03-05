<?php

include_once('../lib/config.inc.php');
include_once('../lib/session.inc.php');
include_once('../lib/syslog.inc.php');

requireSiteAdmin();

global $config;

if(!$config['logs']['enabled']) {
	exit;
}

$log = getSyslog(500);
print json_encode(array('success' => TRUE, 'log' => $log));
