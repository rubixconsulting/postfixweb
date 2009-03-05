<?php

include_once('config.inc.php');
include_once('adodb/adodb.inc.php');

function db_set_active($name) {
	global $ACTIVE_DB;
	$ACTIVE_DB = $name;
}

function db_connect() {
	global $config, $DB, $ACTIVE_DB, $CONNECTED_DB;
	if($DB && $DB->IsConnected() && ($ACTIVE_DB == $CONNECTED_DB)) {
		return;
	}
	if(!$ACTIVE_DB) {
		$ACTIVE_DB = 'default';
	}
	$DB = NewADOConnection($config['db'][$ACTIVE_DB]['type']);
	$DB->Connect(
		$config['db'][$ACTIVE_DB]['host'],
		$config['db'][$ACTIVE_DB]['user'],
		$config['db'][$ACTIVE_DB]['pass'],
		$config['db'][$ACTIVE_DB]['name']
	);
	if(!$DB->IsConnected()) {
		unset($DB);
	}
	$CONNECTED_DB = $ACTIVE_DB;
}

function db_getval($sql, $params = FALSE) {
	global $DB;
	db_connect();
	return $DB->GetOne($sql, $params);
}

function db_getcol($sql, $params = FALSE) {
	global $DB;
	db_connect();
	return $DB->GetCol($sql, $params);
}

function db_getrows($sql, $params = FALSE) {
	global $DB;
	db_connect();
	$DB->SetFetchMode(ADODB_FETCH_ASSOC);
	$rs = $DB->Execute($sql, $params);
	if(!$rs) {
		return FALSE;
	}
	$DB->SetFetchMode(ADODB_FETCH_NUM);
	$arr = $rs->GetArray();
	$rs->Close();
	return $arr;
}

function db_getrow($sql, $params = FALSE) {
	$rows = db_getrows($sql, $params);
	return $rows[0];
}

function db_insert($table, $params, $retcol = FALSE) {
	global $DB;
	db_connect();
	$cols = array();
	foreach($params as $key => $value) {
		$cols[] = '?';
	}
	$sql = 'INSERT INTO '.$table.' ('.
			join(',', array_keys($params)).
		') VALUES ('.
			join(',', $cols).
		')';
	if($retcol) {
		$sql .= ' RETURNING '.$retcol;
	}
	if($rs = $DB->Execute($sql, array_values($params))) {
		if($retcol) {
			$row = $rs->GetRowAssoc();
			return $row[strtoupper($retcol)];
		} else {
			return $rs;
		}
	}
	return FALSE;
}

function db_update($table, $updates, $conditions) {
	global $DB;
	if(!is_array($updates) || count($updates)==0) {
		return FALSE;
	}
	if(!is_array($conditions) || count($conditions)==0) {
		return FALSE;
	}
	db_connect();
	$sql = "UPDATE $table SET ".
			join(' = ?, ', array_keys($updates)).' = ?'.
		'  WHERE '.
			join(' = ? AND ', array_keys($conditions)).' = ?';
	return $DB->Execute($sql, array_merge(array_values($updates), array_values($conditions)));
}

function db_do($sql, $values = array()) {
	global $DB;
	db_connect();
	return $DB->Execute($sql, $values);
}

function db_delete($table, $conditions) {
	global $DB;
	if(!is_array($conditions) || count($conditions)==0) {
		return FALSE;
	}
	db_connect();
	$sql = "DELETE FROM $table".
		'  WHERE '.
			join(' = ? AND ', array_keys($conditions)).' = ?';
	return $DB->Execute($sql, array_values($conditions));
}

function beginTransaction() {
	global $DB;
	db_connect();
	return $DB->Execute("BEGIN");
}

function endTransaction() {
	global $DB;
	db_connect();
	return $DB->Execute("COMMIT");
}

function cancelTransaction() {
	global $DB;
	db_connect();
	return $DB->Execute("ROLLBACK");
}

function db_quote($string) {
	global $DB;
	db_connect();
	return $DB->qstr($string, get_magic_quotes_gpc());
}

function db_quotearray($array) {
	global $DB;
	db_connect();
	$return = array();
	foreach($array as $item) {
		$return[] = $DB->qstr($item, get_magic_quotes_gpc());
	}
	return $return;
}
