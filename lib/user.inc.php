<?php

include_once('db.inc.php');
include_once('roles.inc.php');
include_once('forwards.inc.php');
include_once('localForwards.inc.php');

function getUserId($email) {
	$sql = 'SELECT '.
		'  user_id'.
		'  FROM virtual_users'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE (username || \'@\' || domain) = ?';
	return db_getval($sql, array($email));
}

function getUserEmail($userId) {
	$sql = 'SELECT '.
		'  (username || \'@\' || domain) AS email'.
		'  FROM virtual_users'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE user_id = ?';
	return db_getval($sql, array($userId));
}

function userIsActive($userId) {
	$sql = 'SELECT'.
		'  active'.
		'  FROM virtual_users'.
		'  WHERE user_id = ?';
	$active = db_getval($sql, array($userId));
	if($active == 't') {
		return TRUE;
	}
	return FALSE;
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

function getAllActiveUsers() {
	if(!isDomainAdmin()) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  user_id,'.
		'  (username || \'@\' || domain) AS email,'.
		'  domain'.
		'  FROM virtual_users'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE active = \'y\''.
		'    AND domain IN ('.
			quotedAdminDomainString().
		'    )'.
		'  ORDER BY domain, username';
	return db_getrows($sql);
}

function getAllActiveUsersByRole($role) {
	if(!$role || !isDomainAdmin()) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  user_id,'.
		'  (username || \'@\' || domain) AS email,'.
		'  domain'.
		'  FROM virtual_users'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  JOIN roles USING(role_id)'.
		'  WHERE role = ?'.
		'    AND active = \'y\''.
		'    AND domain IN ('.
			quotedAdminDomainString().
		'    )'.
		'  ORDER BY domain, username';
	return db_getrows($sql, array($role));
}

function getDomainAdminsById($domainId) {
	if(!$domainId || !isDomainAdmin()) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  domain_administrators.user_id,'.
		'  (username || \'@\' || domain) AS email'.
		'  FROM domain_administrators'.
		'  JOIN virtual_users   ON domain_administrators.user_id   = virtual_users.user_id'.
		'  JOIN virtual_domains ON domain_administrators.domain_id = virtual_domains.domain_id'.
		'  WHERE domain_administrators.domain_id = ?';
	return db_getrows($sql, array($domainId));
}

function getCatchAlls() {
	if(!isDomainAdmin()) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  alias_id,'.
		'  domain,'.
		'  destination,'.
		'  active'.
		'  FROM virtual_aliases'.
		'  JOIN virtual_domains USING (domain_id)'.
		'  WHERE username = \'\''.
		'    AND domain IN ('.
			quotedAdminDomainString().
		'    )'.
		'  ORDER BY domain, destination';
	$catchAlls = db_getrows($sql);
	$i = 0;
	foreach($catchAlls as $catchAll) {
		if($catchAll['active'] == 't') {
			$catchAlls[$i]['active'] = TRUE;
		} else {
			$catchAlls[$i]['active'] = FALSE;
		}
		$i++;
	}
	return $catchAlls;
}

function getDomainPermissions($domainId) {
	if(!$domainId || !isDomainAdmin()) {
		return FALSE;
	}
	$allUsers = getAllActiveUsersByRole('user');
	$domainAdmins = getDomainAdminsById($domainId);
	$i = 0;
	foreach($allUsers as $user) {
		$userId = $user['user_id'];
		$allUsers[$i]['admin'] = FALSE;
		foreach($domainAdmins as $admin) {
			if($admin['user_id'] == $userId) {
				$allUsers[$i]['admin'] = TRUE;
			}
		}
		$i++;
	}
	return $allUsers;
}

function getSiteAdminUsers() {
	if(!isSiteAdmin()) {
		return FALSE;
	}
	$userRoleId  = getRoleId('user');
	$adminRoleId = getRoleId('admin');
	$roleIdArray = array(
		$userRoleId,
		$adminRoleId
	);
	$sql = 'SELECT'.
		'  user_id,'.
		'  (username || \'@\' || domain) AS email,'.
		'  domain,'.
		'  role_id'.
		'  FROM virtual_users'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE role_id IN ('.
			join(',', db_quotearray($roleIdArray)).
		'  )'.
		'  AND active = \'t\''.
		'  ORDER BY domain, username, role_id';
	$userRows = db_getrows($sql);
	$i = 0;
	foreach($userRows as $row) {
		if($row['role_id'] == $adminRoleId) {
			$userRows[$i]['site_admin'] = TRUE;
		} else {
			$userRows[$i]['site_admin'] = FALSE;
		}
		$i++;
	}
	return $userRows;
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

function quotedAdminUserString() {
	$adminUsers = getAdminUsers();
	$returnArray = array();
	foreach($adminUsers as $user) {
		$returnArray[] = $user['email'];
	}
	return join(',', db_quotearray($returnArray));
}

function getAdminUsers($like = FALSE, $userId = FALSE) {
	if(!$userId) {
		$userId = $_SESSION['user']['user_id'];
	}
	if(!isDomainAdmin($userId)) {
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
		'  WHERE domain IN ('.
			quotedAdminDomainString().
		'  )';
	if($like) {
		$sql .= '  AND (username || \'@\' || domain) LIKE ?';
	}
	$sql .= ' ORDER BY domain, username';
	if($like) {
		$params = array('%'.$like.'%');
	} else {
		$params = array();
	}
	$users = db_getrows($sql, $params);
	if(!$users) {
		return FALSE;
	}
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
	       '  domain_id,'.
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
	$userObj['aliases'] = getUserAliases($userObj['email']);
	$forwards = array();
	$forwardsHash = getActiveUserForwards($userObj['email']);
	foreach($forwardsHash as $forward) {
		$forwards[] = $forward['destination'];
	}
	$userObj['forwards'] = $forwards;
	$userObj['domain_admin'] = FALSE;
	$adminDomains = getAdminDomains($userId);
	if(is_array($adminDomains) && (count($adminDomains) > 0)) {
		$userObj['domain_admin'] = TRUE;
		$userObj['admin_domains'] = $adminDomains;
	}
	return $userObj;
}

function getUserAliases($email) {
	if(!$email) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  (username || \'@\' || domain) AS email'.
		'  FROM virtual_aliases'.
		'  JOIN virtual_domains USING(domain_id)'.
		'  WHERE destination = ?'.
		'    AND active = \'t\''.
		'    AND (username || \'@\' || domain) != ?'.
		'  ORDER BY domain, username';
	return db_getcol($sql, array($email, $email));
}

function isLoggedIn() {
	if(!$_SESSION['user']) {
		return FALSE;
	}
	$user = $_SESSION['user'];
	if($user['user_id'] && $user['role_id'] && ($user['role_id'] > 1)) {
		return $user['user_id'];
	}
	return FALSE;
}

function isSiteAdmin($userId = FALSE) {
	if(!$userId) {
		$userId = $_SESSION['user']['user_id'];
	}
	if(!userIsActive($userId)) {
		return FALSE;
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
	if(!userIsActive($userId)) {
		return FALSE;
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
	if(!isSiteAdmin() && isSiteAdmin($userId)) {
		print json_encode(array('success' => false, 'errors' => array('user' => 'User is a site administrator')));
		return;
	}
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

function validUserName($username) {
	$usernameLen = strlen($username);
	if(($usernameLen < 1) || ($usernameLen > 64)) {
		## too short or too long
		return FALSE;
	} else if(preg_match('/[\\.\\/|]/', substr($username, 0, 1))) {
		## begins with '.', '/' or '|'
		return FALSE;
	} else if(preg_match('/[\\.]/', substr($username, -1))) {
		## ends with '.'
		return FALSE;
	} else if(preg_match('/\\.\\./', $username)) {
		## has '..'
		return FALSE;
	} else if(!preg_match('/^(\\\\.|[A-Za-z0-9!#%&`_=\\/$\'*+?^{}|~.-])+$/', str_replace("\\\\", "", $username))) {
		## has invalid chars
		return FALSE;
	}
	return TRUE;
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
	if(!validUserName($username)) {
		$foundError = TRUE;
		$errors['username'] = 'Invalid username';
	}
	$domain = getDomain($domainId);
	if(!$domain) {
		$foundError = TRUE;
		$errors['domain'] = 'Invalid domain';
	}
	if($foundError) {
		print json_encode(array('success' => false, 'errors' => $errors));
		return;
	}
	$email = $username.'@'.$domain;
	$errors = array();
	$foundError = FALSE;
	if(userExists($email) || localForwardExists($email)) {
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

function removeCatchAll($catchAllId) {
	if(!$catchAllId) {
		return FALSE;
	}
	if(!isDomainAdmin()) {
		return FALSE;
	}
	$catchAll = loadAlias($catchAllId);
	if(!$catchAll) {
		return FALSE;
	}
	if($catchAll['username'] != '') {
		return FALSE;
	}
	$domain = $catchAll['domain'];
	$adminDomains = getAdminDomains();
	if(!in_array($domain, $adminDomains)) {
		return FALSE;
	}
	$conditions = array(
		'alias_id' => $catchAllId
	);
	return db_delete('virtual_aliases', $conditions);
}

function removeUser($userId) {
	if(!$userId) {
		return FALSE;
	}
	if(!isSiteAdmin() && isSiteAdmin($userId)) {
		return FALSE;
	}
	$user = $_SESSION['user'];
	if($userId == $user['user_id']) {
		return FALSE;
	}
	$userObj = loadUser($userId);
	if(!$userObj) {
		return FALSE;
	}
	$adminDomains = getAdminDomains();
	$domain = $userObj['domain'];
	if(!in_array($domain, $adminDomains)) {
		return FALSE;
	}
	$condition = array(
		'user_id' => $userId
	);
	## TODO remove the virtual home directory
	return db_delete('virtual_users', $condition);
}

function modifyCatchAll($catchAllId, $destination, $active) {
	if(!$active) {
		$active = 'f';
	} else {
		$active = 't';
	}
	if(!$catchAllId || !$destination || !$active) {
		return FALSE;
	}
	if(!isDomainAdmin()) {
		return FALSE;
	}
	$catchAll = loadAlias($catchAllId);
	if(!$catchAll) {
		return FALSE;
	}
	if($catchAll['username'] != '') {
		return FALSE;
	}
	$domain = $catchAll['domain'];
	$adminDomains = getAdminDomains();
	if(!in_array($domain, $adminDomains)) {
		return FALSE;
	}
	if(!validEmailAddress($destination)) {
		return FALSE;
	}
	$updates = array(
		'destination' => $destination,
		'active'      => $active
	);
	$conditions = array(
		'alias_id' => $catchAllId
	);
	return db_update('virtual_aliases', $updates, $conditions);
}

function modifyUser($userId, $description, $active) {
	if(!$active) {
		$active = 'f';
	} else {
		$active = 't';
	}
	if(!$userId || !$active) {
		return FALSE;
	}
	if(!isSiteAdmin() && isSiteAdmin($userId)) {
		return FALSE;
	}
	$userObj = loadUser($userId);
	if(!$userObj) {
		return FALSE;
	}
	$adminDomains = getAdminDomains();
	$domain = $userObj['domain'];
	if(!in_array($domain, $adminDomains)) {
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

function modifySiteAdminUser($userId, $siteAdmin) {
	if(!isSiteAdmin()) {
		return FALSE;
	}
	if($userId == $_SESSION['user']['user_id']) {
		return FALSE;
	}
	$userObj = loadUser($userId);
	if(!$userObj) {
		return FALSE;
	}
	if(!userIsActive($userId)) {
		return FALSE;
	}
	$userRoleId  = getRoleId('user');
	$adminRoleId = getRoleId('admin');
	if(($userObj['role_id'] != $userRoleId) && ($userObj['role_id'] != $adminRoleId)) {
		return FALSE;
	}
	$newRoleId = $userRoleId;
	if($siteAdmin) {
		$newRoleId = $adminRoleId;
	}
	$updates = array(
		'role_id' => $newRoleId
	);
	$conditions = array(
		'user_id' => $userId
	);
	return db_update('virtual_users', $updates, $conditions);
}

function modifyDomainPerm($domainId, $userId, $admin) {
	if(!$domainId || !$userId) {
		return FALSE;
	}
	if(!isDomainAdmin()) {
		return FALSE;
	}
	if($userId == $_SESSION['user']['user_id']) {
		return FALSE;
	}
	if(!userIsActive($userId)) {
		return FALSE;
	}
	$user = getUserEmail($userId);
	if(!$user) {
		return FALSE;
	}
	$domain = getDomain($domainId);
	if(!$domain) {
		return FALSE;
	}
	$adminDomains = getAdminDomains();
	if(!in_array($domain, $adminDomains)) {
		return FALSE;
	}
	$params = array(
		'user_id' => $userId,
		'domain_id' => $domainId
	);
	if($admin) {
		return db_insert('domain_administrators', $params, 'admin_id');
	} else {
		return db_delete('domain_administrators', $params);
	}
}
