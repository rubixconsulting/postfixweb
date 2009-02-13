<?php

include_once('../lib/session.inc.php');
include_once('../lib/user.inc.php');

requireLogin();

session_destroy();
setcookie("RubixConsultingMailUser", "", time() - 3600, '/mailuser/', 'rubixconsulting.com', TRUE, TRUE);
