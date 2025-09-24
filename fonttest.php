<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Code Generator</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            width: 100%;
            max-width: 500px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
        }
        
        .header {
            background: #4e54c8;
            color: white;
            text-align: center;
            padding: 25px 20px;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
        }
        
        .content {
            padding: 30px;
        }
        
        .input-group {
            margin-bottom: 25px;
        }
        
        .input-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }
        
        .input-wrapper {
            display: flex;
            border: 2px solid #ddd;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .input-wrapper input {
            flex: 1;
            padding: 15px;
            border: none;
            outline: none;
            font-size: 16px;
        }
        
        .input-wrapper button {
            background: #4e54c8;
            color: white;
            border: none;
            padding: 0 20px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .input-wrapper button:hover {
            background: #3a3eb3;
        }
        
        .qr-code {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            border: 2px dashed #ddd;
            border-radius: 10px;
            min-height: 280px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        #qrcode {
            margin: 15px 0;
            
        }
        
        #qrcode canvas {
            max-width: 100%;
            border: 1px solid #f1f1f1;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        .download-btn {
            display: none;
            margin-top: 20px;
            padding: 12px 25px;
            background: #4e54c8;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
            text-decoration: none;
        }
        
        .download-btn:hover {
            background: #3a3eb3;
        }
        
        .instructions {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
            margin-top: 25px;
        }
        
        .instructions h3 {
            margin-bottom: 10px;
            color: #4e54c8;
        }
        
        .instructions ol {
            padding-left: 20px;
            line-height: 1.6;
        }
        
        .instructions li {
            margin-bottom: 8px;
        }
        
        .placeholder-text {
            color: #888;
            font-style: italic;
            text-align: center;
            margin: 20px 0;
        }
        
        .error-message {
            color: #e74c3c;
            text-align: center;
            margin: 10px 0;
            display: none;
        }
        
        @media (max-width: 600px) {
            .container {
                border-radius: 15px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .content {
                padding: 20px;
            }
            
            .input-wrapper {
                flex-direction: column;
            }
            
            .input-wrapper input {
                width: 100%;
            }
            
            .input-wrapper button {
                padding: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-qrcode"></i> QR Code Generator</h1>
            <p>Create a QR code for any website URL</p>
        </div>
        
        <div class="content">
            <div class="input-group">
                <label for="url-input">Enter Website URL</label>
                <div class="input-wrapper">
                    <input type="url" id="url-input" placeholder="https://example.com">
                    <button id="generate-btn"><i class="fas fa-bolt"></i> Generate</button>
                </div>
            </div>
            
            <div class="qr-code">
                <div id="qrcode"></div>
                <p class="placeholder-text">Your QR code will appear here</p>
                <p class="error-message" id="error-message"></p>
                <a id="download-btn" class="download-btn" download="qrcode.png">
                    <i class="fas fa-download"></i> Download QR Code
                </a>
            </div>
            
            <div class="instructions">
                <h3>How to use:</h3>
                <ol>
                    <li>Enter a valid website URL in the input field above</li>
                    <li>Click the "Generate" button to create your QR code</li>
                    <li>Download the QR code image using the download button</li>
                    <li>Use the QR code in your print materials, website, or social media</li>
                </ol>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const urlInput = document.getElementById('url-input');
            const generateBtn = document.getElementById('generate-btn');
            const qrcodeDiv = document.getElementById('qrcode');
            const downloadBtn = document.getElementById('download-btn');
            const placeholderText = document.querySelector('.placeholder-text');
            const errorMessage = document.getElementById('error-message');
            
            // Set default URL to current website
            urlInput.value = window.location.href;
            
            generateBtn.addEventListener('click', function() {
                let url = urlInput.value.trim();
                
            });

            var qrcode = new QRCode(document.getElementById("qrcode"), {
                text: "https://www.calamuseducation.com",
                width: 128,
                height: 128,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });

            function showError(message) {
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
                placeholderText.style.display = 'none';
                qrcodeDiv.style.display = 'none';
                downloadBtn.style.display = 'none';
            }
            
            function hideError() {
                errorMessage.style.display = 'none';
            }
        });
    </script>
</body>
</html>