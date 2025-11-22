<?php
/**
 * Check Korean Words - Display all Korean words with IPA
 * 
 * This script fetches all Korean words from the database
 * and displays them in an HTML table format with only word and ipa columns.
 */

include('../classes/connect.php');

// Set UTF-8 encoding for proper Korean character handling
mb_internal_encoding('UTF-8');
header('Content-Type: text/html; charset=UTF-8');

$db = new Database();
$conn = $db->connect();

// Set database connection to UTF-8
if ($conn) {
    $conn->set_charset("utf8mb4");
}

$language_id = 1; // Korean language ID

// Query to fetch all Korean words with word and ipa columns
$query = "SELECT word, ipa 
          FROM cards 
          WHERE language_id = $language_id 
          ORDER BY id ASC";

$words = $db->read($query);
$totalWords = $words ? count($words) : 0;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Korean Words - Word and IPA</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .stats {
            padding: 20px 30px;
            background: #f8f9fa;
            border-bottom: 2px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .stats-info {
            font-size: 1.1em;
            color: #495057;
        }
        
        .stats-info strong {
            color: #667eea;
            font-size: 1.3em;
        }
        
        .table-wrapper {
            overflow-x: auto;
            padding: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 1em;
        }
        
        thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 1.1em;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        tbody tr {
            border-bottom: 1px solid #e9ecef;
            transition: background-color 0.2s;
        }
        
        tbody tr:hover {
            background-color: #f8f9fa;
        }
        
        tbody tr:nth-child(even) {
            background-color: #fdfdfd;
        }
        
        tbody tr:nth-child(even):hover {
            background-color: #f8f9fa;
        }
        
        td {
            padding: 12px 15px;
            color: #495057;
        }
        
        .word-cell {
            font-size: 1.2em;
            font-weight: 500;
            color: #212529;
        }
        
        .ipa-cell {
            font-family: 'Courier New', monospace;
            color: #667eea;
            font-size: 1.1em;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #6c757d;
        }
        
        .empty-state h2 {
            font-size: 2em;
            margin-bottom: 10px;
            color: #495057;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8em;
            }
            
            .stats {
                flex-direction: column;
                gap: 10px;
                text-align: center;
            }
            
            table {
                font-size: 0.9em;
            }
            
            th, td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>한국어 단어</h1>
            <p>Korean Words with IPA</p>
        </div>
        
        <div class="stats">
            <div class="stats-info">
                Total Words: <strong><?php echo number_format($totalWords); ?></strong>
            </div>
        </div>
        
        <div class="table-wrapper">
            <?php if ($words && !empty($words)): ?>
                <table>
                    <thead>
                        <tr>
                            <th>Word</th>
                            <th>IPA</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($words as $word_data): 
                            $word = htmlspecialchars($word_data['word'] ?? '', ENT_QUOTES, 'UTF-8');
                            $ipa = htmlspecialchars($word_data['ipa'] ?? '', ENT_QUOTES, 'UTF-8');
                        ?>
                            <tr>
                                <td class="word-cell"><?php echo $word; ?></td>
                                <td class="ipa-cell"><?php echo $ipa ?: '<span style="color: #adb5bd;">No IPA</span>'; ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <div class="empty-state">
                    <h2>No Korean words found</h2>
                    <p>The database does not contain any Korean words.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>

