<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

$userId = requireLogin();

$mode = $_POST['mode'];

if($mode == 'load') {
	print json_encode(array('success' => TRUE, 'data' => getAutoReply($userId)));
} else if($mode == 'save') {
}
