<?php

include_once('db.inc.php');

function authenticate_user($user, $pass) {
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

function isAdmin() {
	if(!isLoggedIn()) {
		return FALSE;
	}
	$user = $_SESSION['user'];
	if($user{'role'} == 'admin') {
		return TRUE;
	}
	return FALSE;
}

function changePassword($old, $new, $rep) {
	$user = $_SESSION['user'];
	$userId = $user{'user_id'};
	$testauth = authenticate_user($user{'email'}, $old);
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
