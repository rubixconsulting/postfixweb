<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireLogin();

$encPass = $_POST['pass'];
$decPass = decryptPass($encPass);

if($encPass && $decPass) {
	print json_encode(array('success' => true, 'pass' => $decPass));
} else {
	print json_encode(array('success' => false));
}
