<?php

ini_set('session.name', 'RubixConsultingMailUser');
session_set_cookie_params(0, '/mailuser/', 'rubixconsulting.com', TRUE, TRUE);
session_start();

function requireLogin() {
	if(!isLoggedIn()) {
		header('HTTP/1.1 403 Forbidden: Not logged in');
		exit;
	}
}

function requireSiteAdmin() {
	requireLogin();
	if(!isSiteAdmin()) {
		header('HTTP/1.1 403 Forbidden: Not a site administrator');
		exit;
	}
}

function requireDomainAdmin() {
	requireLogin();
	if(!isDomainAdmin()) {
		header('HTTP/1.1 403 Forbidden: Not a domain administrator');
		exit;
	}
}
