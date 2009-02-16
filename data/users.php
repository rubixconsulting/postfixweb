<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');
include_once('../lib/domains.inc.php');

requireDomainAdmin();

$mode = $_POST['mode'];

if($mode == 'load') {
	$userRows = getAdminUsers();
	if($userRows) {
		$users = array(
			'success' => TRUE,
			'users' => $userRows
		);
		print json_encode($users);
	} else {
		print json_encode(array('success' => FALSE));
	}
} else if($mode == 'add') {
	$newUser = array(
		'username' => $_POST['username'],
		'domainId' => $_POST['domain'],
		'pass'     => $_POST['password'],
		'repPass'  => $_POST['reppassword'],
		'name'     => $_POST['name'],
		'active'   => $_POST['active']
	);
	addUser($newUser);
} else if($mode == 'save') {
	$update = $_POST['update'];
	$remove = $_POST['remove'];
	if($add) {
#		$domains = split(',', $add);
#		foreach($domains as $domain) {
#			$domain_id = addDomain($domain);
#		}
	}
	if($update) {
#		$domains = split(',', $update);
#		foreach($domains as $domain) {
#			$values = split(':', $domain);
#			updateDomain($values[0], $values[1]);
#		}
	}
	if($remove) {
#		$domainIds = split(',', $remove);
#		foreach($domainIds as $domainId) {
#			removeDomain($domainId);
#		}
	}
	print json_encode(array('success' => TRUE));
}
