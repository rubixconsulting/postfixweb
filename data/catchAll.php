<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireDomainAdmin();

$query = $_POST['query'];
$mode = $_POST['mode'];

if($mode == 'load') {
	print json_encode(array('catchalls' => getCatchAlls()));
} else if($mode == 'add') {
	$domainId    = $_POST['domain'];
	$destination = $_POST['destination'];
	$active      = $_POST['active'];
	if($active == 'true') {
		$active = TRUE;
	} else {
		$active = FALSE;
	}
	$destination = trim($destination);
	addCatchAll($domainId, $destination, $active);
} else if($mode == 'save') {
	$update = $_POST['update'];
	$remove = $_POST['remove'];
	if($update) {
		$updates = json_decode($update);
		foreach($updates as $tmpCatchAll) {
			$catchAllId  = $tmpCatchAll->alias_id;
			$destination = $tmpCatchAll->destination;
			$active      = $tmpCatchAll->active;
			modifyCatchAll($catchAllId, $destination, $active);
		}
	}
	if($remove) {
		$catchAllIds = split(',', $remove);
		foreach($catchAllIds as $catchAllId) {
			removeCatchAll($catchAllId);
		}
	}
	print json_encode(array('success' => TRUE));
}
