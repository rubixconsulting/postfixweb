<?php

include_once('db.inc.php');

function addDomain($domain) {
	$add = array(
		'domain' => $domain
	);
	return db_insert('virtual_domains', $add, 'domain_id');
}

function updateDomain($domainId, $domain) {
	$update = array(
		'domain' => $domain
	);
	$condition = array(
		'domain_id' => $domainId
	);
	db_update('virtual_domains', $update, $condition);
}

function removeDomain($domainId) {
	$condition = array(
		'domain_id' => $domainId
	);
	db_delete('virtual_domains', $condition);
}
