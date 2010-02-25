<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

$userId = requireLogin();

$mode = $_POST['mode'];

if($mode == 'load') {
	print json_encode(array('success' => TRUE, 'data' => getAutoReply($userId)));
} else if($mode == 'save') {
	$active  = trim($_POST['active']);
	$begins  = trim($_POST['begins']);
	$ends    = trim($_POST['ends']);
	$message = trim($_POST['message']);

	if($active == 'on') {
		$active = TRUE;
	} else {
		$active = FALSE;
	}

	if($active && !$begins) {
		print json_encode(array('success' => FALSE, 'errors' => array('begins' => 'This field is required if active is enabled')));
		exit;
	}

	if(saveAutoReply($userId, $active, $begins, $ends, $message)) {
		if(!$active) {
			db_delete('autoreply_log', array('user_id' => $userId));
		}
		print json_encode(array('success' => TRUE));
	} else {
		print json_encode(array('success' => FALSE, 'errors' => array('message' => 'Error saving auto reply')));
	}
}
