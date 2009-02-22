<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireSiteAdmin();

$mode = $_POST['mode'];

if($mode == 'load') {
	$adminUserRows = getSiteAdminUsers();
	if($adminUserRows) {
		$adminUsers = array(
			'success' => TRUE,
			'admins' => $adminUserRows
		);
		print json_encode($adminUsers);
	} else {
		print json_encode(array('success' => FALSE));
	}
} else if($mode == 'save') {
	$update = $_POST['update'];
	$updates = json_decode($update);
	foreach($updates as $tmpUser) {
		$userId     = $tmpUser->user_id;
		$siteAdmin = $tmpUser->site_admin;
		modifySiteAdminUser($userId, $siteAdmin);
	}
	print json_encode(array('success' => TRUE));
}
