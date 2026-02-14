<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';
apiSecurityHeaders();
apiHandlePreflight();
