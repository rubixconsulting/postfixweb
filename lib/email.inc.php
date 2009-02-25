<?php

include_once('user.inc.php');
include_once('domains.inc.php');

function validEmailAddress($email) {
	$emailParts = split('@', $email);
	if(validUserName($emailParts[0]) && validDomain($emailParts[1])) {
		return TRUE;
	}
	return FALSE;
}
