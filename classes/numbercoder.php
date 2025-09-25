<?php

class CompactNumberEncoder {
    private $charset;
    
    public function __construct() {
        // Extended character set (86 characters - more characters = shorter encoding)
        $this->charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()-_=+[]{}|;:,.<>?~';
    }
    
    /**
     * Encode a number to 5-character string
     * @param int $number Number to encode (1 to 99999999)
     * @return string 5-character encoded string
     */
    public function encode($number) {
        if ($number < 1 || $number > 99999999) {
            throw new InvalidArgumentException('Number must be between 1 and 99999999');
        }
        
        $base = strlen($this->charset);
        $encoded = '';
        $num = $number;
        
        // Convert to higher base
        do {
            $encoded = $this->charset[$num % $base] . $encoded;
            $num = (int)($num / $base);
        } while ($num > 0);
        
        // Pad to make it exactly 5 characters
        $encoded = str_pad($encoded, 5, '0', STR_PAD_LEFT);
        
        return $encoded;
    }
    
    /**
     * Decode a 5-character string back to number
     * @param string $encoded 5-character encoded string
     * @return int Original number
     */
    public function decode($encoded) {
        if (strlen($encoded) !== 5) {
            throw new InvalidArgumentException('Encoded string must be exactly 5 characters long');
        }
        
        $base = strlen($this->charset);
        $decoded = 0;
        
        for ($i = 0; $i < 5; $i++) {
            $char = $encoded[$i];
            $pos = strpos($this->charset, $char);
            
            if ($pos === false) {
                throw new InvalidArgumentException('Invalid character in encoded string');
            }
            
            $decoded = $decoded * $base + $pos;
        }
        
        return $decoded;
    }
}

// Even more compact version using maximum character set
class UltraCompactEncoder {
    private static $charset;
    
    public static function init() {
        // Using almost all printable ASCII characters (94 total)
        self::$charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()-_=+[]{}|;:,.<>?~`\'"\\/';
    }
    
    public static function encode($number) {
        if (!isset(self::$charset)) {
            self::init();
        }
        
        if ($number < 1 || $number > 99999999) {
            throw new InvalidArgumentException('Number must be between 1 and 99999999');
        }
        
        $base = strlen(self::$charset);
        $encoded = '';
        $num = $number;
        
        while ($num > 0) {
            $encoded = self::$charset[$num % $base] . $encoded;
            $num = (int)($num / $base);
        }
        
        return str_pad($encoded, 5, '0', STR_PAD_LEFT);
    }
    
    public static function decode($encoded) {
        if (!isset(self::$charset)) {
            self::init();
        }
        
        if (strlen($encoded) !== 5) {
            throw new InvalidArgumentException('Encoded string must be exactly 5 characters long');
        }
        
        $base = strlen(self::$charset);
        $number = 0;
        
        for ($i = 0; $i < 5; $i++) {
            $pos = strpos(self::$charset, $encoded[$i]);
            if ($pos === false) {
                throw new InvalidArgumentException('Invalid character in encoded string');
            }
            $number = $number * $base + $pos;
        }
        
        return $number;
    }
}

// URL-safe version (only URL-safe characters)
class URLSafeEncoder {
    private static $charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
    
    public static function encode($number) {
        if ($number < 1 || $number > 99999999) {
            throw new InvalidArgumentException('Number must be between 1 and 99999999');
        }
        
        $base = strlen(self::$charset);
        $encoded = '';
        $num = $number;
        
        while ($num > 0) {
            $encoded = self::$charset[$num % $base] . $encoded;
            $num = (int)($num / $base);
        }
        
        return str_pad($encoded, 5, '0', STR_PAD_LEFT);
    }
    
    public static function decode($encoded) {
        if (strlen($encoded) !== 5) {
            throw new InvalidArgumentException('Encoded string must be exactly 5 characters long');
        }
        
        $base = strlen(self::$charset);
        $number = 0;
        
        for ($i = 0; $i < 5; $i++) {
            $pos = strpos(self::$charset, $encoded[$i]);
            if ($pos === false) {
                throw new InvalidArgumentException('Invalid character in encoded string');
            }
            $number = $number * $base + $pos;
        }
        
        return $number;
    }
}
?>