<?php

include_once('db.inc.php');

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
	       '  (username || \'@\' || domain)=?'.
	       '  AND password=CRYPT(?, password)';
	return db_getrow($sql, array($user, $pass));
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
	return db_getrow($sql, array($userId));
}

function isLoggedIn() {
	if(!$_SESSION['user']) {
		return FALSE;
	}
	$user = $_SESSION['user'];
	if($user{'user_id'} && $user{'role_id'} && ($user{'role_id'} > 1)) {
		return TRUE;
	}
	return FALSE;
}

function isSuperAdmin($userId = FALSE) {
	if(!$userId) {
		$userId = $_SESSION['user']{'user_id'};
	}
	$tmpUser = loadUser($userId);
	if($tmpUser{'role'} == 'superadmin') {
		return TRUE;
	}
	return FALSE;
}

function isDomainAdmin($userId = FALSE) {
	if(!$userId) {
		$userId = $_SESSION['user']{'user_id'};
	}
	$tmpUser = loadUser($userId);
	if(($tmpUser{'role'} == 'domainadmin') || ($tmpUser{'role'} == 'superadmin')) {
		return TRUE;
	}
	return FALSE;
}

function getAdminDomains($userId = FALSE) {
	if(!$userId) {
		$userId = $_SESSION['user']{'user_id'};
	}
	if(!isDomainAdmin($userId)) {
		return FALSE;
	}
	$sql = 'SELECT domain'.
		'  FROM domain_administrators'.
		'  JOIN virtual_domains'.
		'  USING(domain_id)'.
		'  WHERE user_id = ?';
	return db_getarray($sql, array($userId));
}

// TODO add an admin password change
// function adminChangePassword($userId, $new) {

function changePassword($old, $new, $rep) {
	$user = $_SESSION['user'];
	$userId = $user{'user_id'};
	$testauth = authenticateUser($user{'email'}, $old);
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
