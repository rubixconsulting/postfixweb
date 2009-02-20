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
		'text' => 'Forwards',
		'id'   => 'forwards',
		'leaf' => TRUE
#	),
## TODO investigate how to do auto replies
#	array(
#		'text' => 'Auto Replies',
#		'id'   => 'auto-replies',
#		'leaf' => TRUE
	)
);

if(isSiteAdmin()) {
	$tree[] = array(
		'text' => 'Manage Domains',
		'id'   => 'manage-domains',
		'leaf' => TRUE
	);
}

if(isDomainAdmin()) {
	$tree[] = array(
		'text' => 'Manage Catch All Addresses',
		'id'   => 'catchall-addresses',
		'leaf' => TRUE
	);
	$tree[] = array(
		'text' => 'Manage Users',
		'id'   => 'manage-users',
		'leaf' => TRUE
	);
	$tree[] = array(
		'text' => 'Manage User Forwards',
		'id'   => 'manage-forwards',
		'leaf' => TRUE
	);
}

if(isSiteAdmin()) {
	$tree[] = array(
		'text' => 'Manage Domain Permissions',
		'id'   => 'manage-domain-permissions',
		'leaf' => TRUE
	);
	$tree[] = array(
		'text' => 'Manage Site Administrators',
		'id'   => 'manage-site-administrators',
		'leaf' => TRUE
	);
}

if(isDomainAdmin()) {
	$tree[] = array(
		'text' => 'Manage Aliases',
		'id'   => 'manage-aliases',
		'leaf' => TRUE
	);
}

if(isSiteAdmin()) {
	$tree[] = array(
		'text' => 'Manage Local Aliases',
		'id'   => 'manage-local-aliases',
		'leaf' => TRUE
	);
}

print json_encode($tree)."\n";
