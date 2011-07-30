<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireLogin();

$mode = $_POST['mode'];

if($mode == 'load') {
	print json_encode(array('success' => TRUE, 'data' => array('local' => userLocal($_SESSION['user']['email']))));
} else if($mode == 'save') {
	$value = TRUE;
	if (!array_key_exists('local', $_POST)) {
		$value = FALSE;
	}
	setUserLocal($value);
	print json_encode(array('success' => TRUE));
}
