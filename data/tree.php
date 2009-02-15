<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireLogin();

$tree = array(
	array(
		'text' => 'User Information',
		'id'   => 'user-info',
		'leaf' => TRUE
	),
	array(
		'text' => 'Change Password',
		'id'   => 'change-password',
		'leaf' => TRUE
	),
	array(
		'text' => 'Aliases',
		'id'   => 'aliases',
		'leaf' => TRUE
	),
	array(
		'text' => 'Forwarders',
		'id'   => 'forwarders',
		'leaf' => TRUE
	),
	array(
		'text' => 'Auto Replies',
		'id'   => 'auto-replies',
		'leaf' => TRUE
	)
);

if(isSuperAdmin()) {
	$tree[] = array(
		'text' => 'Manage Domains',
		'id'   => 'manage-domains',
		'leaf' => TRUE
	);
}

if(isDomainAdmin()) {
	$tree[] = array(
		'text' => 'Manage Users',
		'id'   => 'manage-users',
		'leaf' => TRUE
	);
	$tree[] = array(
		'text' => 'Manage Aliases',
		'id'   => 'manage-aliases',
		'leaf' => TRUE
	);
}

print json_encode($tree)."\n";
