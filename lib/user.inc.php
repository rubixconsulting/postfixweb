<?php

include_once('db.inc.php');

function getUserId($email) {
	$sql = 'SELECT '.
		'  user_id'.
		'  FROM virtual_users'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE (username || \'@\' || domain) = ?';
	return db_getval($sql, array($email));
}

function authenticateUser($user, $pass) {
	if(!$user || !$pass) {
		return FALSE;
	}

	$sql = 'SELECT '.
	       '  user_id,'.
	       '  username AS user,'.
	       '  domain,'.
	       '  role,'.
	       '  role_id,'.
	       '  roles.description AS longrole,'.
	       '  virtual_users.description AS name,'.
	       '  (username || \'@\' || domain) AS email'.
	       '  FROM virtual_users'.
	       '  JOIN virtual_domains USING(domain_id)'.
	       '  JOIN roles USING(role_id)'.
	       '  WHERE active=\'t\' AND'.
	       '  (username || \'@\' || domain) = ?'.
	       '  AND password=CRYPT(?, password)';
	$userObj = db_getrow($sql, array($user, $pass));
	if(!$userObj) {
		return FALSE;
	}
	$adminDomains = getAdminDomains($userObj['user_id']);
	$userObj['domain_admin'] = FALSE;
	if(count($adminDomains) > 0) {
		$userObj['domain_admin'] = TRUE;
		$userObj['admin_domains'] = $adminDomains;
	}
	return $userObj;
}

function getAdminDomains($userId) {
	$sql = 'SELECT'.
		'  domain'.
		'  FROM domain_administrators'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE user_id = ?'.
		'  ORDER BY domain';
	return db_getcol($sql, array($userId));
}

function loadUser($userId) {
	if(!$userId) {
		return FALSE;
	}
	$sql = 'SELECT '.
	       '  user_id,'.
	       '  username AS user,'.
	       '  domain,'.
	       '  role,'.
	       '  role_id,'.
	       '  roles.description AS longrole,'.
	       '  virtual_users.description AS name,'.
	       '  (username || \'@\' || domain) AS email'.
	       '  FROM virtual_users'.
	       '  JOIN virtual_domains USING(domain_id)'.
	       '  JOIN roles USING(role_id)'.
	       '  WHERE user_id = ?';
	$userObj = db_getrow($sql, array($userId));
	if(!$userObj) {
		return FALSE;
	}
	$adminDomains = getAdminDomains($userObj['user_id']);
	$userObj['domain_admin'] = FALSE;
	if(count($adminDomains) > 0) {
		$userObj['domain_admin'] = TRUE;
		$userObj['admin_domains'] = $adminDomains;
	}
	return $userObj;
}

function isLoggedIn() {
	if(!$_SESSION['user']) {
		return FALSE;
	}
	$user = $_SESSION['user'];
	if($user['user_id'] && $user['role_id'] && ($user['role_id'] > 1)) {
		return TRUE;
	}
	return FALSE;
}

function isSiteAdmin($userId = FALSE) {
	if(!$userId) {
		$userId = $_SESSION['user']['user_id'];
	}
	$tmpUser = loadUser($userId);
	if($tmpUser['role'] == 'admin') {
		return TRUE;
	}
	return FALSE;
}

function isDomainAdmin($userId = FALSE) {
	if(!$userId) {
		$userId = $_SESSION['user']['user_id'];
	}
	if(isSiteAdmin($userId)) {
		return TRUE;
	}
	$sql = 'SELECT count(*)'.
		'  FROM domain_administrators'.
		'  WHERE user_id = ?';
	$numDomains = db_getval($sql, array($userId));
	if($numDomains > 0) {
		return TRUE;
	}
	return FALSE;
}

// TODO add an admin password change
// function adminChangePassword($userId, $new) {

function changePassword($old, $new, $rep) {
	$user = $_SESSION['user'];
	$userId = $user['user_id'];
	$testauth = authenticateUser($user['email'], $old);
	if(!$testauth) {
		print json_encode(array('success' => false, 'errors' => array('oldpass' => 'Incorrect password')))."\n";
		return;
	}
	if($new != $rep) {
		print json_encode(array('success' => false, 'errors' => array('repnewpass' => 'Passwords do not match')))."\n";
		return;
	}
	if(strlen($new) < 8) {
		print json_encode(array('success' => false, 'errors' => array('newpass' => 'Password must be at least 8 characters long')))."\n";
		return;
	}
	// TODO add password complexity requirements here
	$rs = db_do('UPDATE virtual_users SET password = CRYPT(?, GEN_SALT(\'bf\', 8)) WHERE user_id = ?', array($new, $userId));
	if($rs) {
		print json_encode(array('success' => true));
		return;
	}
	print json_encode(array('success' => false, 'errors' => array('newpass' => 'Unknown Error')))."\n";
}
