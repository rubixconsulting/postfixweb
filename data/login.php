<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

$user = $_POST['user'];
$pass = $_POST['pass'];

$user = authenticate_user($user, $pass);
if($user) {
	$_SESSION['user'] = $user;
	print json_encode(array('success' => true))."\n";
} else {
	print json_encode(array('success' => false))."\n";
}
