<?php

include_once('../lib/session.inc.php');
include_once('../lib/localForwards.inc.php');

requireSiteAdmin();

$mode = $_POST['mode'];

if($mode == 'load') {
	$forwardsRows = getLocalForwards();
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
#	$update = $_POST['update'];
#	$remove = $_POST['remove'];
#	if($update) {
#		$updates = json_decode($update);
#		foreach($updates as $tmpForward) {
#			$aliasId     = $tmpForward->alias_id;
#			$destination = trim($tmpForward->destination);
#			$active      = $tmpForward->active;
#			modifyForward($aliasId, $destination, $active);
#		}
#	}
#	if($remove) {
#		$aliasIds = split(',', $remove);
#		foreach($aliasIds as $aliasId) {
#			removeForward($aliasId);
#		}
#	}
#	print json_encode(array('success' => TRUE));
} else if($mode == 'add') {
	$username    = $_POST['username'];
	$domainId    = $_POST['domain'];
	$destination = $_POST['destination'];
	$active      = $_POST['active'];
	if($active == 'true') {
		$active = TRUE;
	} else {
		$active = FALSE;
	}
	$username    = trim($username);
	$destination = trim($destination);
	addLocalForward($username, $domainId, $destination, $active);
} else if($mode == 'bulk-add') {
	$lines = split("\n", $_POST['local-forwards']);
	foreach($lines as $line) {
		if(substr($line, ':') === FALSE) {
			continue;
		}
		$forwardParts = split(':', $line);
		$email        = trim($forwardParts[0]);
		$destination  = trim($forwardParts[1]);
		bulkAddLocalForward($email, $destination);
	}
	print json_encode(array('success' => TRUE));
}
