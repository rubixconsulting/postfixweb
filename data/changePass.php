<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireLogin();

$oldpass    = $_POST['oldpass'];
$newpass    = $_POST['newpass'];
$repnewpass = $_POST['repnewpass'];

if(!$oldpass || !$newpass || !$repnewpass) {
	print json_encode(array('success' => false, 'errors' => array('oldpass' => 'Missing Parameters')))."\n";
	exit;
}

changePassword($oldpass, $newpass, $repnewpass);
