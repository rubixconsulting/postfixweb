<?php

include_once('../lib/session.inc.php');
include_once('../lib/aliases.inc.php');

requireDomainAdmin();

$mode = $_POST['mode'];

if($mode == 'load') {
	$aliasesRows = getAliases();
	$i = 0;
	foreach($aliasesRows as $alias) {
		if($alias['active'] == 't') {
			$aliasesRows[$i]['active'] = TRUE;
		} else {
			$aliasesRows[$i]['active'] = FALSE;
		}
		$i++;
	}
	$aliases = array(
		'success' => TRUE,
		'aliases' => $aliasesRows
	);
	print json_encode($aliases);
} else if($mode == 'save') {
#	$update = $_POST['update'];
#	$remove = $_POST['remove'];
#	if($update) {
#		$updates = json_decode($update);
#		foreach($updates as $tmpForward) {
#			$aliasId     = $tmpForward->alias_id;
#			$name        = trim($tmpForward->name);
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
	$domain      = $_POST['domain'];
	$destination = $_POST['destination'];
	$active      = $_POST['active'];
	if($active == 'true') {
		$active = TRUE;
	} else {
		$active = FALSE;
	}
	$username = trim($username);
	addAlias($username, $domain, $destination, $active);
}
