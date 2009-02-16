<?php

include_once('db.inc.php');
include_once('roles.inc.php');

function addDomain($domain) {
	if(!$domain) {
		return FALSE;
	}
	beginTransaction();
	$add = array(
		'domain' => $domain
	);
	$domain_id = db_insert('virtual_domains', $add, 'domain_id');
	if(!$domain_id) {
		cancelTransaction();
		return FALSE;
	}
	$catchall = array(
		'username'    => '',
		'domain_id'   => $domain_id,
		'password'    => '!',
		'role_id'     => getRoleId('catchall'),
		'description' => $domain.' catch all',
		'active'      => 'f'
	);
	$catchall_id = db_insert('virtual_users', $catchall, 'user_id');
	if(!$catchall_id) {
		cancelTransaction();
		return FALSE;
	}
	endTransaction();
	return $domain_id;
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

function getDomain($domainId) {
	if(!$domainId) {
		return FALSE;
	}
	$sql = 'SELECT domain FROM virtual_domains WHERE domain_id = ?';
	return db_getval($sql, array($domainId));
}
