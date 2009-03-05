<?php

include_once('db.inc.php');

define('SYSLOG_KERN', 0);
define('SYSLOG_USER', 1);
define('SYSLOG_MAIL', 2);
define('SYSLOG_DAEMON', 3);
define('SYSLOG_AUTH', 4);
define('SYSLOG_SYSLOG', 5);
define('SYSLOG_LPR', 6);
define('SYSLOG_NEWS', 7);
define('SYSLOG_UUCP', 8);
define('SYSLOG_CRON', 9);
define('SYSLOG_SECURITY', 10);
define('SYSLOG_FTP', 11);
define('SYSLOG_NTP', 12);
define('SYSLOG_LOGAUDIT', 13);
define('SYSLOG_LOGALERT', 14);
define('SYSLOG_CLOCK', 15);
define('SYSLOG_LOCAL0', 16);
define('SYSLOG_LOCAL1', 17);
define('SYSLOG_LOCAL2', 18);
define('SYSLOG_LOCAL3', 19);
define('SYSLOG_LOCAL4', 20);
define('SYSLOG_LOCAL5', 21);
define('SYSLOG_LOCAL6', 22);
define('SYSLOG_LOCAL7', 23);

define('SYSLOG_EMERG', 0);
define('SYSLOG_ALERT', 1);
define('SYSLOG_CRIT', 2);
define('SYSLOG_ERR', 3);
define('SYSLOG_WARNING', 4);
define('SYSLOG_NOTICE', 5);
define('SYSLOG_INFO', 6);
define('SYSLOG_DEBUG', 7);

$priorities = array(
	0 => array(
		'name'    => 'SYSLOG_EMERG',
		'display' => 'Emergency'
	),
	1 => array(
		'name'    => 'SYSLOG_ALERT',
		'display' => 'Alert'
	),
	2 => array(
		'name'    => 'SYSLOG_CRIT',
		'display' => 'Critical'
	),
	3 => array(
		'name'    => 'SYSLOG_ERR',
		'display' => 'Error'
	),
	4 => array(
		'name'    => 'SYSLOG_WARNING',
		'display' => 'Warning'
	),
	5 => array(
		'name'    => 'SYSLOG_NOTICE',
		'display' => 'Notice'
	),
	6 => array(
		'name'    => 'SYSLOG_INFO',
		'display' => 'Info'
	),
	7 => array(
		'name'    => 'SYSLOG_DEBUG',
		'display' => 'Debug'
	)
);

function getSyslog($limit = FALSE, $start = FALSE) {
	global $priorities;
	$sql = 'SELECT * FROM ('.
		'  SELECT'.
		'    id,'.
		'    DATE_PART(\'epoch\', devicereportedtime) AS time,'.
		'    priority AS priority_id,'.
		'    message,'.
		'    syslogtag AS service'.
		'    FROM systemevents'.
		'    WHERE facility = ?';
	$params = array(SYSLOG_MAIL);
	if($start) {
		$sql .= ' AND id > ?';
		$params[] = $start;
	}
		$sql .= ' ORDER BY id DESC';
	if($limit) {
		$sql .= ' LIMIT ?';
		$params[] = $limit;
	}
	$sql .= ') AS LOG'.
		'  ORDER BY id';
	db_set_active('logs');
	$rows = db_getrows($sql, $params);
	db_set_active('default');

	if(!$rows) {
		return FALSE;
	}

	$i = 0;
	foreach($rows as $row) {
		$priority = $priorities[$row['priority_id']]['display'];
		$rows[$i]['priority'] = $priorities[$row['priority_id']]['display'];

		$pid     = null;
		$service = str_replace(':', '', $row['service']);
		if(preg_match('/^(.*)\[(.*)\]$/', $service, $matches)) {
			$service = $matches[1];
			$pid     = $matches[2];
		}
		$rows[$i]['pid']     = $pid;
		$rows[$i]['service'] = $service;

		$message = htmlspecialchars($row['message']);
		$rows[$i]['message'] = $message;

		$i++;
	}
	return $rows;
}
