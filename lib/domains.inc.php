<?php

include_once('db.inc.php');
include_once('roles.inc.php');

function addDomain($domain) {
	if(!isSiteAdmin()) {
		print json_encode(array('success' => FALSE, 'errors' => array('domain' => 'Permission denied')));
		return;
	}
	if(!$domain) {
		print json_encode(array('success' => FALSE, 'errors' => array('domain' => 'This field is required')));
		return;
	}
	if(!validDomain($domain)) {
		print json_encode(array('success' => FALSE, 'errors' => array('domain' => 'Invalid domain')));
		return;
	}
	if(domainExists($domain)) {
		print json_encode(array('success' => FALSE, 'errors' => array('domain' => 'Domain already exists')));
		return;
	}
	$user = $_SESSION['user'];
	if($domain == $user['domain']) {
		print json_encode(array('success' => FALSE, 'errors' => array('domain' => 'Can not delete your own domain')));
		return;
	}
	beginTransaction();
	$add = array(
		'domain' => $domain
	);
	$domain_id = db_insert('virtual_domains', $add, 'domain_id');
	if(!$domain_id) {
		cancelTransaction();
		print json_encode(array('success' => FALSE, 'errors' => array('domain' => 'Unknown error')));
		return;
	}
	$catchall_id = addCatchAll($domain);
	if(!$catchall_id) {
		cancelTransaction();
		print json_encode(array('success' => FALSE, 'errors' => array('domain' => 'Unknown error')));
		return;
	}
	endTransaction();
	print json_encode(array('success' => true));
}

function domainExists($domain) {
	$domainId = getDomainId($domain);
	if($domainId) {
		return TRUE;
	}
	return FALSE;
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
