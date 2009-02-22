<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');
include_once('../lib/domains.inc.php');

requireDomainAdmin();

$query = $_POST['query'];
$mode = $_POST['mode'];

if($query && !$mode && ($query != 'all')) {
	$userRows = getAdminUsers($query);
	if($userRows) {
		$users = array(
			'success' => TRUE,
			'users' => $userRows
		);
		print json_encode($users);
	} else {
		print json_encode(array('success' => FALSE));
	}
} else if(($mode == 'load') || ($query == 'all')) {
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
} else if($mode == 'resetPassword') {
	$user    = $_POST['user'];
	$pass    = $_POST['password'];
	$reppass = $_POST['password'];
	resetPassword($user, $pass, $reppass);
} else if($mode == 'save') {
	$update = $_POST['update'];
	$remove = $_POST['remove'];
	if($update) {
		$updates = json_decode($update);
		foreach($updates as $tmpUser) {
			$userId = $tmpUser->user_id;
			$description = trim($tmpUser->name);
			$active = $tmpUser->active;
			modifyUser($userId, $description, $active);
		}
	}
	if($remove) {
		$userIds = split(',', $remove);
		foreach($userIds as $userId) {
			removeUser($userId);
		}
	}
	print json_encode(array('success' => TRUE));
}
