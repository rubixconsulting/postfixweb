<?php

include_once('db.inc.php');

function getRoleId($role) {
	$sql = 'SELECT role_id FROM roles WHERE role = ?';
	return db_getval($sql, array($role));
}
