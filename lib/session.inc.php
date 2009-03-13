<?php

include_once('config.inc.php');
include_once('user.inc.php');

global $config;
ini_set('session.name', $config['cookie']['name']);
session_set_cookie_params($config['cookie']['lifetime'], $config['page']['path'], $config['cookie']['host'], $config['cookie']['secure'], TRUE);
session_start();

function requireLogin() {
	$userId = isLoggedIn();
	if(!$userId) {
		header('HTTP/1.1 403 Forbidden: Not logged in');
		exit;
	}
	return $userId;
}

function requireSiteAdmin() {
	$userId = requireLogin();
	if(!isSiteAdmin()) {
		header('HTTP/1.1 403 Forbidden: Not a site administrator');
		exit;
	}
	return $userId;
}

function requireDomainAdmin() {
	$userId = requireLogin();
	if(!isDomainAdmin()) {
		header('HTTP/1.1 403 Forbidden: Not a domain administrator');
		exit;
	}
	return $userId;
}
