<?php

include_once('db.inc.php');
include_once('localForwards.inc.php');

function getAliasEmail($aliasId) {
	if(!$aliasId) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  (username || \'@\' || domain) AS email'.
		'  FROM virtual_aliases'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE alias_id = ?';
	return db_getval($sql, array($aliasId));
}

function getAliases() {
	if(!isDomainAdmin()) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  alias_id,'.
		'  (username || \'@\' || domain) AS email,'.
		'  domain,'.
		'  destination,'.
		'  active'.
		'  FROM virtual_aliases'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE domain IN ('.
			quotedAdminDomainString().
		'  )'.
		'    AND username != \'\''.
		'    AND (username || \'@\' || domain) NOT IN ('.
			quotedAdminUserString().
		'    )'.
		'    AND destination IN ('.
			quotedAdminUserString().
		'    )'.
		'  ORDER BY domain, username, destination';
	return db_getrows($sql);
}

function addAlias($username, $domainId, $destinationId, $active) {
	if($active) {
		$active = 't';
	} else {
		$active = 'f';
	}
	$foundError = FALSE;
	$errors = array();
	if(!$username) {
		$errors['username'] = 'This field is required';
		$foundError = TRUE;
	}
	if(!$domainId) {
		$errors['domain'] = 'This field is required';
		$foundError = TRUE;
	}
	if(!$destinationId) {
		$errors['destination'] = 'This field is required';
		$foundError = TRUE;
	}
	if($foundError) {
		print json_encode(array('success' => false, 'errors' => $errors));
		return FALSE;
	}
	if(!validUserName($username)) {
		$errors['username'] = 'Invalid username';
		print json_encode(array('success' => false, 'errors' => $errors));
		return FALSE;
	}
	$domain = getDomain($domainId);
	if(!$domain) {
		$errors['domain'] = 'Invalid domain';
		$foundError = TRUE;
	}
	$email = $username . '@' . $domain;
	if(userExists($email) || localForwardExists($email)) {
		$errors['username'] = 'User already exists';
		$foundError = TRUE;
	}
	$destination = getUserEmail($destinationId);
	if(!$destination) {
		$errors['destination'] = 'Invalid destination';
		$foundError = TRUE;
	}
	if($foundError) {
		print json_encode(array('success' => false, 'errors' => $errors));
		return FALSE;
	}
	if(aliasExists($email, $destination)) {
		$errors['username'] = 'Alias already exists';
		$foundError = TRUE;
	}
	$adminDomains = getAdminDomains();
	if(!in_array($domain, $adminDomains)) {
		$errors['domain'] = 'Permission denied on domain: '.$domain;
		$foundError = TRUE;
	}
	$destinationParts = split('@', $destination);
	$destinationDomain = $destinationParts[1];
	if(!in_array($destinationDomain, $adminDomains)) {
		$errors['destination'] = 'Permission denied on domain: '.$destinationDomain;
		$foundError = TRUE;
	}
	if($foundError) {
		print json_encode(array('success' => false, 'errors' => $errors));
		return FALSE;
	}
	$params = array(
		'username'    => $username,
		'domain_id'   => $domainId,
		'destination' => $destination,
		'active'      => $active
	);
	$ret = db_insert('virtual_aliases', $params, 'alias_id');
	if($ret) {
		print json_encode(array('success' => TRUE));
		return;
	}
	print json_encode(array('success' => FALSE, 'msg' => 'Unknown error'));
}

function aliasExists($email, $destination) {
	$sql = 'SELECT'.
		'  COUNT(alias_id)'.
		'  FROM virtual_aliases'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE (username || \'@\' || domain) = ?'.
		'  AND destination = ?';
	$val = db_getval($sql, array($email, $destination));
	if($val > 0) {
		return TRUE;
	}
	return FALSE;
}

function aliasExistsById($aliasId) {
	if(!$aliasId) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  COUNT(alias_id)'.
		'  FROM virtual_aliases'.
		'  WHERE alias_id = ?';
	$val = db_getval($sql, array($aliasId));
	if($val > 0) {
		return TRUE;
	}
	return FALSE;
}

function loadAlias($aliasId) {
	$sql = 'SELECT'.
		'  alias_id,'.
		'  (username || \'@\' || domain) AS email,'.
		'  username,'.
		'  domain,'.
		'  destination,'.
		'  active'.
		'  FROM virtual_aliases'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE alias_id = ?';
	return db_getrow($sql, array($aliasId));
}

function modifyAlias($aliasId, $active) {
	if($active) {
		$active = 't';
	} else {
		$active = 'f';
	}
	if(!$aliasId || !$active) {
		return FALSE;
	}
	if(!isDomainAdmin()) {
		return FALSE;
	}
	$alias = loadAlias($aliasId);
	if(!$alias) {
		return FALSE;
	}
	$domain = $alias['domain'];
	$adminDomains = getAdminDomains();
	if(!in_array($domain, $adminDomains)) {
		return FALSE;
	}
	$destinationParts = split('@', $alias['destination']);
	$destinationDomain = $destinationParts[1];
	if(!in_array($destinationDomain, $adminDomains)) {
		return FALSE;
	}
	$updates = array(
		'active' => $active
	);
	$conditions = array(
		'alias_id' => $aliasId
	);
	return db_update('virtual_aliases', $updates, $conditions);
}

function removeAlias($aliasId) {
	if(!$aliasId) {
		return FALSE;
	}
	if(!isDomainAdmin()) {
		return FALSE;
	}
	$alias = loadAlias($aliasId);
	if(!$alias) {
		return FALSE;
	}
	$domain = $alias['domain'];
	$adminDomains = getAdminDomains();
	if(!in_array($domain, $adminDomains)) {
		return FALSE;
	}
	$destinationParts = split('@', $alias['destination']);
	$destinationDomain = $destinationParts[1];
	if(!in_array($destinationDomain, $adminDomains)) {
		return FALSE;
	}
	$conditions = array(
		'alias_id' => $aliasId
	);
	return db_delete('virtual_aliases', $conditions);
}
