<?php

ini_set('session.name', 'RubixConsultingMailUser');
session_set_cookie_params(0, '/mailuser/', 'rubixconsulting.com', TRUE, TRUE);
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
