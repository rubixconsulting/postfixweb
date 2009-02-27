<?php

include_once('../lib/session.inc.php');
include_once('../lib/forwards.inc.php');

$mode = $_POST['mode'];

if($mode == 'load') {
	print json_encode(array(
		'success' => TRUE,
		'forwards' => getUserForwards()
	));
} else if($mode == 'save') {
	$update = $_POST['update'];
	$remove = $_POST['remove'];
	if($update) {
		$updates = json_decode($update);
		foreach($updates as $tmpForward) {
			$aliasId     = $tmpForward->alias_id;
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
	$destination = $_POST['destination'];
	$active      = $_POST['active'];
	if($active == 'true') {
		$active = TRUE;
	} else {
		$active = FALSE;
	}
	$destination = trim($destination);
	addForward($destination, $active);
}
