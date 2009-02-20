<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');
include_once('../lib/domains.inc.php');

requireDomainAdmin();

$query = $_POST['query'];
$mode = $_POST['mode'];

if($mode == 'load') {
	$domainId = $_POST['domain'];
	print json_encode(array('domains' => getDomainPermissions($domainId)));
} else if($mode == 'save') {
}
