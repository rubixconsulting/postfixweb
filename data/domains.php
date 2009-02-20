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
			quotedAdminDomainString().
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
			quotedAdminDomainString().
		'  )'.
		'  ORDER BY domain';
	$rows = db_getrows($sql);
	$domains = array(
		'success' => true,
		'domains' => $rows
	);
	print json_encode($domains);
} else if($mode == 'add') {
	requireSiteAdmin();
	addDomain($_POST['domain']);
} else if($mode == 'remove') {
	requireSiteAdmin();
	$remove = $_POST['domains'];
	$domainIds = split(',', $remove);
	foreach($domainIds as $domainId) {
		removeDomain($domainId);
	}
	print json_encode(array('success' => TRUE));
}
