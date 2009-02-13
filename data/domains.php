<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireAdmin();

$sql = 'SELECT domain_id, domain FROM virtual_domains ORDER BY domain';
$rows = db_getrows($sql);
$domains = array(
	'success' => true,
	'domains' => $rows
);
print json_encode($domains)."\n";
