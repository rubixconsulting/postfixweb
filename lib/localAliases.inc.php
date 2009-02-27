<?php

include_once('db.inc.php');
include_once('user.inc.php');
include_once('localForwards.inc.php');

function getNumLocalAliasDestination($name) {
	if(!isSiteAdmin()) {
		return FALSE;
	}
	$sql = 'SELECT COUNT(alias_id) FROM local_aliases WHERE name = ?';
	return db_getval($sql, array($name));
}

function getLocalAliases() {
	if(!isSiteAdmin()) {
		return FALSE;
	}
	$sql = 'SELECT'.
		'  alias_id,'.
		'  name,'.
		'  destination,'.
		'  active'.
		'  FROM local_aliases'.
		'  ORDER BY name';
	$rows = db_getrows($sql);
	$i = 0;
	foreach($rows as $row) {
		if($row['active'] == 't') {
			$rows[$i]['active'] = TRUE;
		} else {
			$rows[$i]['active'] = FALSE;
		}
		$rows[$i]['forwards'] = getNumVirtualForwards($row['name']);
		$i++;
	}
	return $rows;
}

function localAliasExistsById($aliasId) {
	$sql = 'SELECT'.
		'  alias_id'.
		'  FROM local_aliases'.
		'  WHERE alias_id=?';
	$conditions = array(
		$aliasId
	);
	$result = db_getval($sql, $conditions);
	if($result) {
		return TRUE;
	}
	return FALSE;
}

function localAliasExists($name, $destination) {
	$sql = 'SELECT'.
		'  alias_id'.
		'  FROM local_aliases'.
		'  WHERE name=?'.
		'    AND destination=?';
	$conditions = array(
		$name,
		$destination
	);
	$result = db_getval($sql, $conditions);
	if($result) {
		return TRUE;
	}
	return FALSE;
}

function validLocalAliasDestination($destination) {
	if(validUserName($destination)) {
		return TRUE;
	}
	## TODO is there any other local alias destination validation that makes sense?
	return TRUE;
}

function addLocalAlias($name, $destination, $active, $bulk = FALSE) {
	$foundError = FALSE;
	$errors = array();
	if(!$active) {
		$active = 'f';
	} else {
		$active = 't';
	}
	if(!$name) {
		$foundError = TRUE;
		$errors['name'] = 'This field is required';
	}
	if(!$destination) {
		$foundError = TRUE;
		$errors['destination'] = 'This field is required';
	}
	if($foundError) {
		if(!$bulk) {
			print json_encode(array('success' => FALSE, 'errors' => $errors));
		}
		return FALSE;
	}
	if(!isSiteAdmin()) {
		if(!$bulk) {
			print json_encode(array('success' => FALSE, 'msg' => 'Permission denied'));
		}
		return FALSE;
	}
	if(!validUserName($name)) {
		$foundError = TRUE;
		$errors['name'] = 'Invalid name';
	}
	if(!validLocalAliasDestination($destination)) {
		$foundError = TRUE;
		$errors['destination'] = 'Invalid destination';
	}
	if($foundError) {
		if(!$bulk) {
			print json_encode(array('success' => FALSE, 'errors' => $errors));
		}
		return FALSE;
	}
	if(localAliasExists($name, $destination)) {
		$foundError = TRUE;
		$errors['destination'] = 'Local alias name, destination pair already exists';
	}
	if($foundError) {
		if(!$bulk) {
			print json_encode(array('success' => FALSE, 'errors' => $errors));
		}
		return FALSE;
	}
	if($name == $destination) {
		$foundError = TRUE;
		$errors['destination'] = 'Destination and name can not be the same';
	}
	if($foundError) {
		if(!$bulk) {
			print json_encode(array('success' => FALSE, 'errors' => $errors));
		}
		return FALSE;
	}
	$params = array(
		'name'        => $name,
		'destination' => $destination,
		'active'      => $active
	);
	return db_insert('local_aliases', $params, 'alias_id');
}

function removeLocalAlias($aliasId) {
	if(!$aliasId) {
		return FALSE;
	}
	if(!isSiteAdmin()) {
		return FALSE;
	}
	if(!localAliasExistsById($aliasId)) {
		return FALSE;
	}
	$condition = array(
		'alias_id' => $aliasId
	);
	return db_delete('local_aliases', $condition);
}

function modifyLocalAlias($aliasId, $name, $destination, $active) {
	if(!$active) {
		$active = 'f';
	} else {
		$active = 't';
	}
	if(!$aliasId || !$name || !$destination || !$active) {
		return FALSE;
	}
	if(!isSiteAdmin()) {
		return FALSE;
	}
	if(!localAliasExistsById($aliasId)) {
		return FALSE;
	}
	if(!validUserName($name)) {
		return FALSE;
	}
	if(!validLocalAliasDestination($destination)) {
		return FALSE;
	}
	$updates = array(
		'name'        => $name,
		'destination' => $destination,
		'active'      => $active
	);
	$conditions = array(
		'alias_id' => $aliasId
	);
	return db_update('local_aliases', $updates, $conditions);
}
