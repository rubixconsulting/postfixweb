<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');
include_once('../lib/domains.inc.php');

requireDomainAdmin();

$query = $_POST['query'];
$mode = $_POST['mode'];

if($query && !$mode && ($query != 'all')) {
	$sql = 'SELECT'.
		'  domain_id,'.
		'  domain'.
		'  FROM virtual_domains'.
		'  WHERE domain LIKE ?'.
		'  AND domain IN ('.
			'\''.join('\', \'', getAdminDomains()).'\''.
		'  )'.
		' ORDER BY domain';
	$rows = db_getrows($sql, array('%'.strtolower($query).'%'));
	$domains = array(
		'success' => true,
		'domains' => $rows
	);
	print json_encode($domains);
} else if(($mode == 'load') || ($query == 'all')) {
	$sql = 'SELECT'.
		'  domain_id,'.
		'  domain'.
		'  FROM virtual_domains'.
		'  WHERE domain IN ('.
			'\''.join('\', \'', getAdminDomains()).'\''.
		'  )'.
		'  ORDER BY domain';
	$rows = db_getrows($sql);
	$domains = array(
		'success' => true,
		'domains' => $rows
	);
	print json_encode($domains);
} else if($mode == 'save') {
	requireSiteAdmin();
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
