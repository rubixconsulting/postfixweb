<?php

include_once('db.inc.php');
include_once('user.inc.php');
include_once('domains.inc.php');
include_once('email.inc.php');
include_once('aliases.inc.php');

function getUserForwards($email) {
	if(!$email) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  destination'.
		'  FROM virtual_aliases'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE active = \'t\''.
		'    AND (username || \'@\' || domain) = ?'.
		'    AND destination != ?';
		'  ORDER BY destination';
	return db_getcol($sql, array($email, $email));
}

function getForwards() {
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
		'  AND (username || \'@\' || domain) IN ('.
			quotedAdminUserString().
		'  )'.
		'  ORDER BY domain, username, destination';
	return db_getrows($sql);
}

function addForward($destination, $active, $userId = FALSE) {
	if($active) {
		$active = 't';
	} else {
		$active = 'f';
	}
	$user     = $_SESSION['user']['user'];
	$domainId = $_SESSION['user']['domain_id'];
	if(!$userId) {
		$userId = $_SESSION['user']['user_id'];
	}
	$foundError = FALSE;
	$errors = array();
	if(!$userId) {
		$errors['email'] = 'This field is required';
		$foundError = TRUE;
	}
	if(!$destination) {
		$errors['destination'] = 'This field is required';
		$foundError = TRUE;
	}
	if($foundError) {
		print json_encode(array('success' => false, 'errors' => $errors));
		return FALSE;
	}
	if($userId != $_SESSION['user']['user_id']) {
		$userObj = loadUser($userId);
		$adminDomains = getAdminDomains();
		$domain = $userObj['domain'];
		if(!in_array($domain, $adminDomains)) {
			$errors['email'] = 'Permission denied on domain: '.$domain;
			$foundError = TRUE;
		}
		$user     = $userObj['user'];
		$domainId = $userObj['domain_id'];
	}
	if(!validEmailAddress($destination)) {
		$errors['destination'] = 'Invalid destination email address';
		$foundError = TRUE;
	}
	if($foundError) {
		print json_encode(array('success' => false, 'errors' => $errors));
		return FALSE;
	}
	if(forwardExists($destination, $userId)) {
		print json_encode(array(
			'success' => false,
			'errors' => array(
				'destination' => 'Forward already exists'
			)
		));
		return FALSE;
	}
	$destinationParts = split('@', $destination);
	$allDomainsHash = getAllDomains();
	$allDomains = array();
	foreach($allDomainsHash as $domain) {
		$allDomains[] = $domain['domain'];
	}
	if(in_array($destinationParts[1], $allDomains)) {
		if(!userExists($destination)) {
			print json_encode(array(
				'success' => false,
				'errors' => array(
					'destination' => 'User does not exist in local domain: '.$destinationParts[1]
				)
			));
			return FALSE;
		}
	}
	$params = array(
		'username'    => $user,
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

function forwardExists($destination, $userId = FALSE) {
	if(!$destination) {
		return FALSE;
	}
	$user     = $_SESSION['user']['user'];
	$domainId = $_SESSION['user']['domain_id'];
	if(!$userId) {
		$userId   = $_SESSION['user']['user_id'];
	}
	if($userId != $_SESSION['user']['user_id']) {
		$userObj = loadUser($userId);
		$adminDomains = getAdminDomains();
		$domain = $userObj['domain'];
		if(!in_array($domain, $adminDomains)) {
			return FALSE;
		}
		$user     = $userObj['user'];
		$domainId = $userObj['domain_id'];
	}
	$sql = 'SELECT'.
		'  COUNT(*)'.
		'  FROM virtual_aliases'.
		'  WHERE username = ?'.
		'    AND domain_id = ?'.
		'    AND destination = ?';
	$numForwards = db_getval($sql, array($user, $domainId, $destination));
	if($numForwards > 0) {
		return TRUE;
	} else {
		return FALSE;
	}
}

function forwardExistsByIdEmail($aliasId, $email) {
	$sql = 'SELECT'.
		'  COUNT(*)'.
		'  FROM virtual_aliases'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE alias_id = ?'.
		'    AND (username || \'@\' || domain) = ?';
	$val = db_getval($sql, array($aliasId, $email));
	if($val > 0) {
		return TRUE;
	} else {
		return FALSE;
	}
}

function modifyForward($aliasId, $destination, $active) {
	if($active) {
		$active = 't';
	} else {
		$active = 'f';
	}
	if(!$aliasId || !$destination || !$active) {
		return FALSE;
	}
	$email = getAliasEmail($aliasId);
	if(!$email) {
		return FALSE;
	}
	if($email != $_SESSION['user']['email']) {
		$adminDomains = getAdminDomains();
		$emailParts = split('@', $email);
		$domain = $emailParts[1];
		if(!in_array($domain, $adminDomains)) {
			return FALSE;
		}
	}
	if(!userExists($email)) {
		return FALSE;
	}
	if(!validEmailAddress($destination)) {
		return FALSE;
	}
	$destinationParts = split('@', $destination);
	$allDomainsHash = getAllDomains();
	$allDomains = array();
	foreach($allDomainsHash as $domain) {
		$allDomains[] = $domain['domain'];
	}
	if(in_array($destinationParts[1], $allDomains)) {
		if(!userExists($destination)) {
			return FALSE;
		}
	}
	$updates = array(
		'destination' => $destination,
		'active' => $active
	);
	$conditions = array(
		'alias_id' => $aliasId
	);
	return db_update('virtual_aliases', $updates, $conditions);
}

function removeForward($aliasId) {
	if(!$aliasId) {
		return FALSE;
	}
	$email = getAliasEmail($aliasId);
	if(!$email) {
		return FALSE;
	}
	if($email != $_SESSION['user']['email']) {
		$adminDomains = getAdminDomains();
		$emailParts = split('@', $email);
		$domain = $emailParts[1];
		if(!in_array($domain, $adminDomains)) {
			return FALSE;
		}
	}
	$conditions = array(
		'alias_id' => $aliasId
	);
	return db_delete('virtual_aliases', $conditions);
}