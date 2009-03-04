<?php

include_once('db.inc.php');
include_once('user.inc.php');
include_once('email.inc.php');
include_once('domains.inc.php');
include_once('localAliases.inc.php');
include_once('aliases.inc.php');

function getLocalForwards() {
	$sql = 'SELECT'.
		'  alias_id,'.
		'  (username || \'@\' || domain) AS email,'.
		'  domain,'.
		'  destination,'.
		'  active'.
		'  FROM virtual_aliases'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE (username || \'@\' || domain) NOT IN ('.
			quotedAdminUserString().
		'  )'.
		'  ORDER BY domain, username, destination';
	$rows = db_getrows($sql);
	$ret = array();
	foreach($rows as $row) {
		if(!validEmailAddress($row['destination']) && validUserName($row['destination'])) {
			$row['aliases'] = getNumLocalAliasDestination($row['destination']);
			$ret[] = $row;
		}
	}
	return $ret;
}

function removeLocalForward($aliasId) {
	if(!$aliasId) {
		return FALSE;
	}
	if(!isSiteAdmin()) {
		return FALSE;
	}
	if(!aliasExistsById($aliasId)) {
		return FALSE;
	}
	$conditions = array(
		'alias_id' => $aliasId
	);
	return db_delete('virtual_aliases', $conditions);
}

function modifyLocalForward($aliasId, $destination, $active) {
	if($active) {
		$active = 't';
	} else {
		$active = 'f';
	}
	if(!$aliasId || !$destination || !$active) {
		return FALSE;
	}
	if(!isSiteAdmin()) {
		return FALSE;
	}
	if(!aliasExistsById($aliasId)) {
		return FALSE;
	}
	if(!validUserName($destination)) {
		return FALSE;
	}
	$updates = array(
		'destination' => $destination,
		'active'      => $active
	);
	$conditions = array(
		'alias_id' => $aliasId
	);
	return db_update('virtual_aliases', $updates, $conditions);
}

function getNumVirtualForwards($name) {
	$sql = 'SELECT'.
		'  COUNT(alias_id)'.
		'  FROM virtual_aliases'.
		'  WHERE destination = ?';
	return db_getval($sql, array($name));
}

function localForwardExists($email) {
	$localForwards = getLocalForwards();
	foreach($localForwards as $localForward) {
		if($localForward['email'] == $email) {
			return TRUE;
		}
	}
	return FALSE;
}

function bulkAddLocalForward($email, $destination) {
	if(!$email || !$destination) {
		return FALSE;
	}
	$emailParts = split('@', $email);
	$username = $emailParts[0];
	$domain   = $emailParts[1];
	$domainId = getDomainId($domain);
	if(!$domainId) {
		return FALSE;
	}
	return addLocalForward($username, $domainId, $destination, TRUE, FALSE);
}

function addLocalForward($username, $domainId, $destination, $active, $printErrors = TRUE) {
	if(!isSiteAdmin()) {
		if($printErrors) {
			print json_encode(array('success' => false, 'errors' => array('username' => 'Permission denied')));
		}
		return FALSE;
	}
	if($active) {
		$active = 't';
	} else {
		$active = 'f';
	}
	$errors = array();
	$foundError = FALSE;
	if(!$username) {
		$foundError = TRUE;
		$errors['username'] = 'This field is required';
	}
	if(!$domainId) {
		$foundError = TRUE;
		$errors['domain'] = 'This field is required';
	}
	if(!$destination) {
		$foundError = TRUE;
		$errors['destination'] = 'This field is required';
	}
	if(!$active) {
		$foundError = TRUE;
		$errors['active'] = 'This field is required';
	}
	if($foundError) {
		if($printErrors) {
			print json_encode(array('success' => false, 'errors' => $errors));
		}
		return FALSE;
	}
	if(!validUserName($username)) {
		$foundError = TRUE;
		$errors['username'] = 'Invalid username';
	}
	$domain = getDomain($domainId);
	if(!$domain) {
		$foundError = TRUE;
		$errors['domain'] = 'Invalid domain';
	}
	if(!validUserName($destination)) {
		$foundError = TRUE;
		$errors['destination'] = 'Invalid destination';
	}
	if($foundError) {
		if($printErrors) {
			print json_encode(array('success' => false, 'errors' => $errors));
		}
		return FALSE;
	}
	$email = $username.'@'.$domain;
	if(userExists($email) || localForwardExists($email)) {
		if($printErrors) {
			print json_encode(array('success' => false, 'errors' => array('username' => 'Username already exists')));
		}
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
