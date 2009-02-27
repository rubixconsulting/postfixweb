<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

$user = $_POST['user'];
$pass = $_POST['pass'];

$userId = authenticateUser($user, $pass);
if($userId) {
	$_SESSION['user'] = loadUser($userId);
	print json_encode(array('success' => true, 'pass' => encryptPass($pass)));
} else {
	print json_encode(array('success' => false));
}
