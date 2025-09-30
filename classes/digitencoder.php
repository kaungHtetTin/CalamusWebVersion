<?php

class DigitEncoder
{
    private $charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    private $base;
    private $encodeLength = 4;
    
    public function __construct()
    {
        $this->base = strlen($this->charset);
    }
    
    /**
     * Encode a number to 4-character alphanumeric string
     * @param int $number The number to encode
     * @return string 4-character encoded string containing only 0-9 and A-Z
     * @throws InvalidArgumentException
     */
    public function encode($number)
    {
        // Validate input
        if (!is_numeric($number) || $number < 1) {
            throw new InvalidArgumentException('Number must be a positive integer');
        }
        
        $number = (int)$number;
        $encoded = '';
        
        // Convert to base-36 (using 0-9 and A-Z)
        while ($number > 0) {
            $remainder = $number % $this->base;
            $encoded = $this->charset[$remainder] . $encoded;
            $number = (int)($number / $this->base);
        }
        
        // Pad with leading zeros to make exactly 4 characters
        $encoded = str_pad($encoded, $this->encodeLength, '0', STR_PAD_LEFT);
        
        return $encoded;
    }
    
    /**
     * Decode an alphanumeric string back to the original number
     * @param string $encoded The encoded string to decode
     * @return int Original number
     * @throws InvalidArgumentException
     */
    public function decode($encoded)
    {
        // Validate input
        if (!is_string($encoded) || strlen($encoded) === 0) {
            throw new InvalidArgumentException('Encoded string cannot be empty');
        }
        
        if (!preg_match('/^[0-9A-Z]+$/', $encoded)) {
            throw new InvalidArgumentException('Encoded string must contain only 0-9 and A-Z');
        }
        
        $decoded = 0;
        $length = strlen($encoded);
        
        // Convert from base-36 back to decimal
        for ($i = 0; $i < $length; $i++) {
            $char = $encoded[$i];
            $value = strpos($this->charset, $char);
            
            if ($value === false) {
                throw new InvalidArgumentException('Invalid character in encoded string');
            }
            
            $decoded = $decoded * $this->base + $value;
        }
        
        // Validate output range
        if ($decoded < 1) {
            throw new InvalidArgumentException('Decoded number must be positive');
        }
        
        return $decoded;
    }
}

?>