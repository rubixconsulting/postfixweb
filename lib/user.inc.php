<?php

include_once('db.inc.php');
include_once('roles.inc.php');

function getUserId($email) {
	$sql = 'SELECT '.
		'  user_id'.
		'  FROM virtual_users'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE (username || \'@\' || domain) = ?';
	return db_getval($sql, array($email));
}

function getUserRole($userId) {
	$sql = 'SELECT '.
		'  role'.
		'  FROM virtual_users'.
		'  JOIN roles USING(role_id)'.
		'  WHERE user_id = ?';
	return db_getval($sql, array($userId));
}

function authenticateUser($email, $pass) {
	if(!$email || !$pass) {
		return FALSE;
	}

	$sql = 'SELECT '.
		'  user_id'.
		'  FROM virtual_users'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE active=\'t\' AND'.
		'  (username || \'@\' || domain) = ?'.
		'  AND password=CRYPT(?, password)';
	return db_getval($sql, array($email, $pass));
}

function getAdminDomains($userId = FALSE) {
	if(!$userId) {
		$userId = $_SESSION['user']['user_id'];
	}
	if(!$userId) {
		return FALSE;
	}
	if(isSiteAdmin($userId)) {
		$sql = 'SELECT'.
			'  domain'.
			'  FROM virtual_domains'.
			'  ORDER BY domain';
		return db_getcol($sql);
	} else if(isDomainAdmin($userId)) {
		$sql = 'SELECT'.
			'  domain'.
			'  FROM domain_administrators'.
			'  JOIN virtual_domains USING(domain_id)'.
			'  WHERE user_id = ?'.
			'  ORDER BY domain';
		return db_getcol($sql, array($userId));
	}
	return FALSE;
}

function getAdminUsers($userId = FALSE) {
	if(!$userId) {
		$userId = $_SESSION['user']['user_id'];
	}
	if(!isSiteAdmin($userId) && !isDomainAdmin($userId)) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'    user_id,'.
		'    username || \'@\' || domain AS email,'.
		'    username,'.
		'    domain,'.
		'    role_id,'.
		'    description AS name,'.
		'    active'.
		'  FROM virtual_users'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE role_id != ?'.
		'  AND domain in ('.
			'\''.join('\', \'', getAdminDomains($userId)).'\''.
		'  )'.
		' ORDER BY domain, username';
	$params = array(getRoleId('catchall'));
	$users = db_getrows($sql, $params);
	$i = 0;
	foreach($users as $tmpUser) {
		$users[$i]['active'] = FALSE;
		if($tmpUser['active'] == 't') {
			$users[$i]['active'] = TRUE;
		}
		$i++;
	}
	return $users;
}

function userExists($email) {
	if(!$email) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  count(*)'.
		'  FROM virtual_users'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE (username || \'@\' || domain) = ?';
	$numUsers = db_getval($sql, array($email));
	if($numUsers > 0) {
		return TRUE;
	}
	return FALSE;
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
	$userObj['domain_admin'] = FALSE;
	$adminDomains = getAdminDomains($userId);
	if(is_array($adminDomains) && (count($adminDomains) > 0)) {
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
	if(getUserRole($userId) == 'admin') {
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

function resetPassword($user, $new, $rep) {
	$foundError = FALSE;
	$errors = array();
	if(!$user) {
		$foundError = TRUE;
		$errors['user'] = 'This field is required';
	}
	if(!$new) {
		$foundError = TRUE;
		$errors['password'] = 'This field is required';
	}
	if(!$rep) {
		$foundError = TRUE;
		$errors['reppassword'] = 'This field is required';
	}
	if($foundError) {
		print json_encode(array('success' => false, 'errors' => $errors));
		return;
	}
	if(!userExists($user)) {
		print json_encode(array('success' => false, 'errors' => array('user' => 'Invalid user')));
		return;
	}
	$userId = getUserId($user);
	$userObj = loadUser($userId);
	$adminDomains = getAdminDomains();
	$domain = $userObj['domain'];
	if(!in_array($domain, $adminDomains)) {
		print json_encode(array('success' => false, 'errors' => array('user' => 'Permission denied for domain: '.$domain)));
		return;
	}
	if($new != $rep) {
		print json_encode(array('success' => false, 'errors' => array('reppassword' => 'Passwords do not match')));
		return;
	}
	if(strlen($new) < 8) {
		print json_encode(array('success' => false, 'errors' => array('password' => 'Password must be at least 8 characters long')));
		return;
	}
	// TODO add password complexity requirements here
	$rs = db_do('UPDATE virtual_users SET password = CRYPT(?, GEN_SALT(\'bf\', 8)) WHERE user_id = ?', array($new, $userId));
	if($rs) {
		print json_encode(array('success' => true));
		return;
	}
	print json_encode(array('success' => false, 'errors' => array('newpass' => 'Unknown Error')));
}

function changePassword($old, $new, $rep) {
	$foundError = FALSE;
	$errors = array();
	if(!$old) {
		$foundError = TRUE;
		$errors['oldpass'] = 'This field is required';
	}
	if(!$new) {
		$foundError = TRUE;
		$errors['newpass'] = 'This field is required';
	}
	if(!$rep) {
		$foundError = TRUE;
		$errors['repnewpass'] = 'This field is required';
	}
	if($foundError) {
		print json_encode(array('success' => false, 'errors' => $errors));
		return;
	}
	$user = $_SESSION['user'];
	$userId = $user['user_id'];
	$testauth = authenticateUser($user['email'], $old);
	if(!$testauth) {
		print json_encode(array('success' => false, 'errors' => array('oldpass' => 'Incorrect password')));
		return;
	}
	if($new != $rep) {
		print json_encode(array('success' => false, 'errors' => array('repnewpass' => 'Passwords do not match')));
		return;
	}
	if(strlen($new) < 8) {
		print json_encode(array('success' => false, 'errors' => array('newpass' => 'Password must be at least 8 characters long')));
		return;
	}
	// TODO add password complexity requirements here
	$rs = db_do('UPDATE virtual_users SET password = CRYPT(?, GEN_SALT(\'bf\', 8)) WHERE user_id = ?', array($new, $userId));
	if($rs) {
		print json_encode(array('success' => true));
		return;
	}
	print json_encode(array('success' => false, 'errors' => array('newpass' => 'Unknown Error')));
}

function addUser($newUser) {
	$username = $newUser['username'];
	$domainId = $newUser['domainId'];
	$pass     = $newUser['pass'];
	$repPass  = $newUser['repPass'];
	$name     = $newUser['name'];
	$active   = $newUser['active'];
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
	if(!$pass) {
		$foundError = TRUE;
		$errors['password'] = 'This field is required';
	}
	if(!$repPass) {
		$foundError = TRUE;
		$errors['reppassword'] = 'This field is required';
	}
	if(!$active) {
		$foundError = TRUE;
		$errors['active'] = 'This field is required';
	}
	if($foundError) {
		print json_encode(array('success' => false, 'errors' => $errors));
		return;
	}
	$domain = getDomain($domainId);
	$email = $username.'@'.$domain;
	$errors = array();
	$foundError = FALSE;
	if(userExists($email)) {
		$foundError = TRUE;
		$errors['username'] = 'Username already exists';
	}
	if(strlen($pass) < 8) {
		$foundError = TRUE;
		$errors['password'] = 'Password must be at least 8 characters long';
	}
	if($pass != $repPass) {
		$foundError = TRUE;
		$errors['reppassword'] = 'Passwords do not match';
	}
	$adminDomains = getAdminDomains();
	if(!in_array($domain, $adminDomains)) {
		$foundError = TRUE;
		$errors['domain'] = 'Permission denied on domain: '.$domain;
	}
	// TODO add password complexity requirements here
	if($foundError) {
		print json_encode(array('success' => false, 'errors' => $errors));
		return;
	}
	if(!$name) {
		$name = '';
	}
	if($active == 'true') {
		$active = 't';
	} else {
		$active = 'f';
	}
	$sql = 'INSERT INTO virtual_users ('.
		'    username,'.
		'    domain_id,'.
		'    password,'.
		'    role_id,'.
		'    description,'.
		'    active'.
		'  ) VALUES (?, ?, CRYPT(?, GEN_SALT(\'bf\', 8)), ?, ?, ?)';
	$params = array(
		$username,
		$domainId,
		$pass,
		getRoleId('user'),
		$name,
		$active
	);
	$rs = db_do($sql, $params);
	if(!$rs) {
		print json_encode(array('success' => false, 'errors' => array('username' => 'Unknown Error')));
		return;
	}
	$userId = getUserId($email);
	if($userId) {
		print json_encode(array('success' => true));
		return;
	}
	print json_encode(array('success' => false, 'errors' => array('username' => 'Unknown Error')));
}

function removeUser($userId) {
	if(!$userId) {
		return FALSE;
	}
	$userObj = loadUser($userId);
	$adminDomains = getAdminDomains();
	$domain = $userObj['domain'];
	if(!in_array($domain, $adminDomains)) {
		return FALSE;
	}
	$condition = array(
		'user_id' => $userId
	);
	return db_delete('virtual_users', $condition);
}

function modifyUser($userId, $description, $active) {
	if(!$active) {
		$active = 'f';
	} else {
		$active = 't';
	}
	if(!$userId || !$description || !$active) {
		print "invalid args\n";
		return FALSE;
	}
	$userObj = loadUser($userId);
	$adminDomains = getAdminDomains();
	$domain = $userObj['domain'];
	if(!in_array($domain, $adminDomains)) {
		print "permission denied\n";
		return FALSE;
	}
	$updates = array(
		'description' => $description,
		'active' => $active
	);
	$conditions = array(
		'user_id' => $userId
	);
	return db_update('virtual_users', $updates, $conditions);
}
