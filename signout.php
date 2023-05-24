<?php
    session_start();

    // remove all session variables
    session_unset();

    // destroy the session
    session_destroy();

    unset($_COOKIE['calamus_phone']);
    unset($_COOKIE['calamus_token']);
    setcookie('calamus_phone', null, -1, '/'); 
    setcookie('calamus_token', null, -1, '/');
    
    header("Location: login.php");
    die;

?>