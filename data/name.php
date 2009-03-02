<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireLogin();

$mode = $_POST['mode'];

if($mode == 'load') {
	$userId = $_SESSION['user']['user_id'];
	$_SESSION['user'] = loadUser($userId);
	print json_encode(array('success' => TRUE, 'data' => array('name' => $_SESSION['user']['name'])));
} else if($mode == 'save') {
	$name = $_POST['name'];
	$name = trim($name);
	if(!$name) {
		print json_encode(array('success' => FALSE, 'errors' => array('name' => 'This field is required')));
		exit;
	}
	if(changeName($name)) {
		print json_encode(array('success' => TRUE));
	} else {
		print json_encode(array('success' => FALSE, 'errors' => array('name' => 'Error changing name')));
	}
}
