<?php

include_once('db.inc.php');
include_once('roles.inc.php');

function addDomain($domain) {
	if(!isSiteAdmin() || !$domain || !validDomain($domain)) {
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
	$catchall_id = addCatchAll($domain);
	if(!$catchall_id) {
		cancelTransaction();
		return FALSE;
	}
	endTransaction();
	return $domain_id;
}

function addCatchAll($domain, $active = FALSE) {
	if(!isSiteAdmin() || !$domain || !validDomain($domain)) {
		return FALSE;
	}
	if($active) {
		$active = 't';
	} else {
		$active = 'f';
	}
	$domainId = getDomainId($domain);
	$catchall = array(
		'username'    => '',
		'domain_id'   => $domainId,
		'password'    => '!',
		'role_id'     => getRoleId('catchall'),
		'description' => $domain.' catch all',
		'active'      => $active
	);
	return db_insert('virtual_users', $catchall, 'user_id');
}

function validDomain($domain) {
	$domainLen = strlen($domain);
	if(($domainLen < 1) || ($domainLen > 255)) {
		## too short or too long
		return FALSE;
	} else if(!preg_match('/[A-Za-z0-9]/', substr($domain, 0, 1))) {
		## doesn't begin with alphanumeric
		return FALSE;
	} else if(!preg_match('/[A-Za-z0-9]/', substr($domain, -1))) {
		## doesn't end with alphanumeric
		return FALSE;
	} else if(!preg_match('/^[A-Za-z0-9\\-\\.]+$/', $domain)) {
		## has invalid chars
		return FALSE;
	} else if(preg_match('/\\.\\./', $domain)) {
		## has '..'
		return FALSE;
	}
	return TRUE;
}

function updateDomain($domainId, $domain) {
	if(!isSiteAdmin() || !$domainId || !$domain || !validDomain($domain)) {
		return FALSE;
	}
	$update = array(
		'domain' => $domain
	);
	$condition = array(
		'domain_id' => $domainId
	);
	return db_update('virtual_domains', $update, $condition);
}

function removeDomain($domainId) {
	if(!isSiteAdmin() || !$domainId) {
		return FALSE;
	}
	$condition = array(
		'domain_id' => $domainId
	);
	return db_delete('virtual_domains', $condition);
}

function getDomain($domainId) {
	if(!$domainId) {
		return FALSE;
	}
	$sql = 'SELECT domain FROM virtual_domains WHERE domain_id = ?';
	return db_getval($sql, array($domainId));
}

function getDomainId($domain) {
	if(!$domain) {
		return FALSE;
	}
	$sql = 'SELECT domain_id FROM virtual_domains WHERE domain = ?';
	return db_getval($sql, array($domain));
}
