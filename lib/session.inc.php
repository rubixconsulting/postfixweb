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

function requireAdmin() {
	requireLogin();
	if(!isAdmin()) {
		header('HTTP/1.1 403 Forbidden: Not an administrator');
		exit;
	}
}
