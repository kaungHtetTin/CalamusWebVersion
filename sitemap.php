<?php
/**
 * Sitemap Generator for Calamus Education
 * This file generates a sitemap.xml dynamically
 * Access via: https://www.calamuseducation.com/sitemap.php
 */

header('Content-Type: application/xml; charset=utf-8');

// Get base URL
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
$base_url = $protocol . "://" . $_SERVER['HTTP_HOST'];
$site_url = $base_url;

// Include database connection
include('classes/connect.php');

$db = new Database();

// Get current date
$lastmod = date('Y-m-d');

// Start XML output
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
echo ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
echo ' xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9';
echo ' http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . "\n";

// Static pages with priority
$static_pages = [
    ['url' => '/index.php', 'priority' => '1.0', 'changefreq' => 'daily'],
    ['url' => '/explore.php', 'priority' => '0.9', 'changefreq' => 'daily'],
    ['url' => '/about_us.php', 'priority' => '0.8', 'changefreq' => 'monthly'],
    ['url' => '/contact_us.php', 'priority' => '0.7', 'changefreq' => 'monthly'],
    ['url' => '/vocab_learning.php', 'priority' => '0.9', 'changefreq' => 'weekly'],
    ['url' => '/discuss.php', 'priority' => '0.8', 'changefreq' => 'daily'],
    ['url' => '/all_instructor.php', 'priority' => '0.8', 'changefreq' => 'weekly'],
    ['url' => '/term.php', 'priority' => '0.5', 'changefreq' => 'yearly'],
    ['url' => '/privacy.php', 'priority' => '0.5', 'changefreq' => 'yearly'],
];

// Output static pages
foreach ($static_pages as $page) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($site_url . $page['url']) . "</loc>\n";
    echo "    <lastmod>" . $lastmod . "</lastmod>\n";
    echo "    <changefreq>" . $page['changefreq'] . "</changefreq>\n";
    echo "    <priority>" . $page['priority'] . "</priority>\n";
    echo "  </url>\n";
}

// Get courses from database
try {
    $courses_query = "SELECT course_id, updated_at FROM courses WHERE status = 'published' ORDER BY course_id DESC";
    $courses = $db->read($courses_query);
    
    if ($courses) {
        foreach ($courses as $course) {
            $course_id = (int)$course['course_id'];
            $course_lastmod = isset($course['updated_at']) ? date('Y-m-d', strtotime($course['updated_at'])) : $lastmod;
            
            echo "  <url>\n";
            echo "    <loc>" . htmlspecialchars($site_url . "/course_detail.php?course_id=" . $course_id) . "</loc>\n";
            echo "    <lastmod>" . $course_lastmod . "</lastmod>\n";
            echo "    <changefreq>weekly</changefreq>\n";
            echo "    <priority>0.8</priority>\n";
            echo "  </url>\n";
        }
    }
} catch (Exception $e) {
    // Silently continue if courses table doesn't exist or query fails
}

// Get instructors from database
try {
    $instructors_query = "SELECT id, updated_at FROM teachers WHERE status = 'active' ORDER BY id DESC";
    $instructors = $db->read($instructors_query);
    
    if ($instructors) {
        foreach ($instructors as $instructor) {
            $teacher_id = (int)$instructor['id'];
            $instructor_lastmod = isset($instructor['updated_at']) ? date('Y-m-d', strtotime($instructor['updated_at'])) : $lastmod;
            
            echo "  <url>\n";
            echo "    <loc>" . htmlspecialchars($site_url . "/instructor_profile.php?teacher_id=" . $teacher_id) . "</loc>\n";
            echo "    <lastmod>" . $instructor_lastmod . "</lastmod>\n";
            echo "    <changefreq>monthly</changefreq>\n";
            echo "    <priority>0.7</priority>\n";
            echo "  </url>\n";
        }
    }
} catch (Exception $e) {
    // Silently continue if teachers table doesn't exist or query fails
}

// Close XML
echo '</urlset>';

?>

