<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

$userId = requireLogin();
$_SESSION['user'] = loadUser($userId);
print json_encode(array('success' => true, 'user' => $_SESSION['user']))."\n";
