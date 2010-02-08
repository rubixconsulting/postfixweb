<?php

include_once('user.inc.php');
include_once('domains.inc.php');

function sendEmail($to, $from, $subject, $body, $cc = FALSE, $bcc = FALSE) {
	if(is_array($to)) {
		foreach($to as $addr) {
			if(!validEmailAddress($to)) {
				return FALSE;
			}
		}
		$to = join(', ', $to);
	} else {
		if(!validEmailAddress($to)) {
			return FALSE;
		}
	}
	if($cc && is_array($cc)) {
		foreach($cc as $addr) {
			if(!validEmailAddress($addr)) {
				return FALSE;
			}
		}
		$cc = join(', ', $cc);
	} else if($cc) {
		if(!validEmailAddress($cc)) {
			return FALSE;
		}
	}
	if($bcc && is_array($bcc)) {
		foreach($bcc as $addr) {
			if(!validEmailAddress($addr)) {
				return FALSE;
			}
		}
		$bcc = join(', ', $bcc);
	} else if($bcc) {
		if(!validEmailAddress($bcc)) {
			return FALSE;
		}
	}
	$headers  = 'From: '     . $from . "\n".
		    'Reply-To: ' . $from . "\n".
		    'X-Mailer: Rubix Consulting, Inc. Postfix Web Autoreply';
	if($cc) {
		$headers .= "\n" . 'Cc: ' . $cc . "\n";
	}
	if($bcc) {
		$headers .= "\n" . 'Bcc: ' . $bcc . "\n";
	}
	$additional = '-f' . $from;
	mail($to, $subject, $body, $headers, $additional);
}

function validEmailAddress($email) {
	$emailParts = split('@', $email);
	if(validUserName($emailParts[0]) && validDomain($emailParts[1])) {
		return TRUE;
	}
	return FALSE;
}
