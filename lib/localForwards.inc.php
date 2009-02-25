<?php

include_once('db.inc.php');
include_once('user.inc.php');
include_once('email.inc.php');
include_once('domain.inc.php');

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
			$ret[] = $row;
		}
	}
	return $ret;
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
	return addLocalForward($username, $domainId, $destination, TRUE);
}

function addLocalForward($username, $domainId, $destination, $active) {
	if(!isSiteAdmin()) {
		print json_encode(array('success' => false, 'errors' => array('username' => 'Permission denied')));
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
		print json_encode(array('success' => false, 'errors' => $errors));
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
		print json_encode(array('success' => false, 'errors' => $errors));
		return FALSE;
	}
	$email = $username.'@'.$domain;
	if(userExists($email) || localForwardExists($email)) {
		print json_encode(array('success' => false, 'errors' => array('username' => 'Username already exists')));
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
