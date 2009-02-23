<?php

include_once('../lib/session.inc.php');
include_once('../lib/forwards.inc.php');

requireDomainAdmin();

$mode = $_POST['mode'];

if($mode == 'load') {
	$forwardsRows = getForwards();
	$i = 0;
	foreach($forwardsRows as $forward) {
		if($forward['active'] == 't') {
			$forwardsRows[$i]['active'] = TRUE;
		} else {
			$forwardsRows[$i]['active'] = FALSE;
		}
		$i++;
	}
	$forwards = array(
		'success' => TRUE,
		'forwards' => $forwardsRows
	);
	print json_encode($forwards);
} else if($mode == 'save') {
	$update = $_POST['update'];
	$remove = $_POST['remove'];
	if($update) {
		$updates = json_decode($update);
		foreach($updates as $tmpForward) {
			$aliasId     = $tmpForward->alias_id;
			$name        = trim($tmpForward->name);
			$destination = trim($tmpForward->destination);
			$active      = $tmpForward->active;
			modifyForward($aliasId, $destination, $active);
		}
	}
	if($remove) {
		$aliasIds = split(',', $remove);
		foreach($aliasIds as $aliasId) {
			removeForward($aliasId);
		}
	}
	print json_encode(array('success' => TRUE));
} else if($mode == 'add') {
	$userId      = $_POST['email'];
	$destination = $_POST['destination'];
	$active      = $_POST['active'];
	if($active == 'true') {
		$active = TRUE;
	} else {
		$active = FALSE;
	}
	$destination = trim($destination);
	addForward($destination, $active, $userId);
}
