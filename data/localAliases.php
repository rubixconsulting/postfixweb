<?php

include_once('../lib/session.inc.php');
include_once('../lib/localAliases.inc.php');

requireSiteAdmin();

$mode = $_POST['mode'];

if($mode == 'load') {
	$localAliasRows = getLocalAliases();
	if($localAliasRows) {
		$localAliases = array(
			'success' => TRUE,
			'aliases' => $localAliasRows
		);
		print json_encode($localAliases);
	} else {
		print json_encode(array('success' => FALSE));
	}
} else if($mode == 'save') {
	$update = $_POST['update'];
	$remove = $_POST['remove'];
	if($update) {
		$updates = json_decode($update);
		foreach($updates as $tmpAlias) {
			$aliasId     = $tmpAlias->alias_id;
			$name        = trim($tmpAlias->name);
			$destination = trim($tmpAlias->destination);
			$active      = $tmpAlias->active;
			modifyLocalAlias($aliasId, $name, $destination, $active);
		}
	}
	if($remove) {
		$aliasIds = split(',', $remove);
		foreach($aliasIds as $aliasId) {
			removeLocalAlias($aliasId);
		}
	}
	print json_encode(array('success' => TRUE));
} else if($mode == 'add') {
	$name        = $_POST['name'];
	$destination = $_POST['destination'];
	$active      = $_POST['active'];
	if($active == 'true') {
		$active = TRUE;
	} else {
		$active = FALSE;
	}
	$name        = trim($name);
	$destination = trim($destination);
	addLocalAlias($name, $destination, $active);
} else if($mode == 'bulk-add') {
	$lines = split("\n", $_POST['local-aliases']);
	foreach($lines as $line) {
		if(substr($line, ':') === FALSE) {
			continue;
		}
		$aliasParts = split(':', $line);
		$name        = trim(array_shift($aliasParts));
		$destination = join(':', $aliasParts);
		addLocalAlias($name, $destination, TRUE, TRUE);
	}
	print json_encode(array('success' => TRUE));
}
