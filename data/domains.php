<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');
include_once('../lib/domains.inc.php');

requireSuperAdmin();

$mode = $_POST['mode'];

if($mode == 'load') {
	$sql = 'SELECT domain_id, domain FROM virtual_domains ORDER BY domain';
	$rows = db_getrows($sql);
	$domains = array(
		'success' => true,
		'domains' => $rows
	);
	print json_encode($domains)."\n";
} else if($mode == 'save') {
	$add    = $_POST['add'];
	$update = $_POST['update'];
	$remove = $_POST['remove'];
	if($add) {
		$domains = split(',', $add);
		foreach($domains as $domain) {
			$domain_id = addDomain($domain);
		}
	}
	if($update) {
		$domains = split(',', $update);
		foreach($domains as $domain) {
			$values = split(':', $domain);
			updateDomain($values[0], $values[1]);
		}
	}
	if($remove) {
		$domainIds = split(',', $remove);
		foreach($domainIds as $domainId) {
			removeDomain($domainId);
		}
	}
	print json_encode(array('success' => TRUE));
}
