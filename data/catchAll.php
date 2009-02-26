<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireDomainAdmin();

$query = $_POST['query'];
$mode = $_POST['mode'];

if($mode == 'load') {
	print json_encode(array('catchalls' => getCatchAlls()));
} else if($mode == 'add') {
	$domainId    = $_POST['domain'];
	$destination = $_POST['destination'];
	$active      = $_POST['active'];
	if($active == 'true') {
		$active = TRUE;
	} else {
		$active = FALSE;
	}
	$destination = trim($destination);
	addCatchAll($domainId, $destination, $active);
} else if($mode == 'save') {
#	$domainId = $_POST['domain'];
#	$updates = json_decode($_POST['update']);
#	if(!$domainId || !$updates) {
#		header('HTTP/1.1 403 Forbidden: Missing Parameters');
#		exit;
#	}
#	foreach($updates as $update) {
#		$userId = $update->user_id;
#		$admin  = $update->admin;
#		modifyDomainPerm($domainId, $userId, $admin);
#	}
#	print json_encode(array('success' => TRUE));
}
