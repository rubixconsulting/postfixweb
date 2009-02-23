<?php

include_once('db.inc.php');

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
		'  destination,'.
		'  active'.
		'  FROM virtual_aliases'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE domain IN ('.
			quotedAdminDomainString().
		'  )'.
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
	if(userExists($email)) {
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
	return db_insert('virtual_aliases', $params, 'alias_id');
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
