#!/usr/bin/php
<?php

$path = "/var/www/secure/postfixweb";
set_include_path(get_include_path() . PATH_SEPARATOR . $path."/lib");

include_once("db.inc.php");
include_once("email.inc.php");
include_once("Mail/mimeDecode.php");

if($argc < 2) {
	printErr("Error: missing 'from' address");
	usage($argv[0]);
	exit(1);
}

if($argc < 3) {
	printErr("Error: missing 'to' address");
	usage($argv[0]);
	exit(1);
}

$from = $argv[1];
$to   = $argv[2];

$sql  = "SELECT user_id, message";
$sql .= "  FROM autoreply";
$sql .= "    JOIN virtual_users   USING(user_id)";
$sql .= "    JOIN virtual_domains USING(domain_id)";
$sql .= "  WHERE virtual_users.active = 't'";
$sql .= "    AND autoreply.active = 't'";
$sql .= "    AND begins <= now()";
$sql .= "    AND (now() < ends";
$sql .= "      OR ends IS NULL";
$sql .= "    )";
$sql .= "    AND (username || '@' || domain) = ?";

$params = array();
$params[] = $to;

$row = db_getrow($sql, $params);

$userId  = $row['user_id'];
$message = $row['message'];

if($message) {
	$sql  = "SELECT timestamp";
	$sql .= "  FROM autoreply_log";
	$sql .= "    JOIN autoreply USING(user_id)";
	$sql .= "  WHERE active = 't'";
	$sql .= "    AND begins <= timestamp";
	$sql .= "    AND user_id = ?";
	$sql .= "    AND from_email = ?";
	$params = array();
	$params[] = $userId;
	$params[] = $from;
	$time = db_getval($sql, $params);
	if($time) {
		exit(0);
	}
	$params = array();
	$params['user_id']    = $userId;
	$params['from_email'] = $from;
	$time = db_insert('autoreply_log', $params, 'timestamp');
	if(!$time) {
		printErr("could not insert into autoreply_log");
		exit(1);
	}
	$subject = "Re: ".getOrigSubject();
	sendEmail($from, $to, $subject, $message);
}

exit(0);

function printErr($msg) {
	$stderr = fopen("php://stderr", "w");
	if(!$stderr) {
		exit(1);
	}
	fprintf($stderr, $msg."\n");
	fflush($stderr);
	fclose($stderr);
}

function usage($cmd) {
	printErr("Usage: ".$cmd." <FROM> <TO>");
}

function getStdin() {
	$input = "";
	while($line = fgets(STDIN)) {
		$input .= $line;
	}
	return $input;
}

function getOrigSubject() {
	$params['include_bodies'] = true;
	$params['decode_bodies'] = true;
	$params['decode_headers'] = true;
	$params['input'] = getStdin();
	$orig = Mail_mimeDecode::decode($params);
	if (!array_key_exists('subject', $orig->headers)) {
		return '';
	}
	return $orig->headers['subject'];
}
