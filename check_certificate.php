<?php 
session_start();

include('classes/connect.php');
include('classes/user.php');
include('classes/course.php');
include('classes/certificate.php');
include('classes/study.php');
include('classes/digitencoder.php');

    $id = $_GET['id'];

    $encoder = new DigitEncoder();
    $id = $encoder->decode($id);

    $Certificate = new Certificate();
    $certificate = $Certificate->detailById($id);

    $error = false;
    if($certificate){
        $course_id = $certificate['course_id'];
        $user_id = $certificate['user_id'];

        $Course = new Course();
        $course = $Course->detail($course_id);

        $User = new User();
        $user = $User->detail($user_id);


        if(!$user) $error = "No Resource Found!";
        if(!$course) $error = "No Resourse Found!";

    }else{
        $error = "No Resource Found!";
    }

    if(!$error){
        $major = $course['major'];
        if($major == "english"){
            $certificate_bg = "assets/images/ee_certificate_bg.png";
            $certificate_seal = "assets/images/ee_certificate_seal.png";
        }else{
            $certificate_bg = "assets/images/ko_certificate_bg.png";
            $certificate_seal = "assets/images/ko_certificate_seal.png";
        }

        if($major == 'not') $error = "No Resource Found!";

        $DB = new Database();
        $query = "	SELECT
                    courses.lessons_count,
                    count(*) as learned
                    FROM courses
                    JOIN lessons_categories ON lessons_categories.course_id = courses.course_id
                    JOIN lessons ON lessons.category_id = lessons_categories.id
                    JOIN studies ON studies.lesson_id = lessons.id
                    WHERE courses.course_id=$course_id and studies.learner_id=$user_id;
                ";

        $result = $DB->read($query); 
        $lesson_count = $result[0]['lessons_count'];
        $learned = $result[0]['learned'];

       // print_r($result);
        if($lesson_count>$learned){
            $error = "Access Denied! <br> You need to learn the course completely first.";
	    }

        if(!$error){
            
        }
        $Study = new Study();
        $learned_counts=$Study->getCountByCourse($user['learner_phone']);
        $learning_courses = $Course->learnningCourse($user['learner_phone']);
      
        $certificate_id = $encoder->encode($certificate['id']);

    }

    function formatIssuedDate($certificate_date){
      
        $date = new DateTime($certificate_date);

        $year = $date->format('Y');  // 2025
        $month = $date->format('M'); // 09
        $day = $date->format('d');   // 23

        if($day%10 == 1){
            $day = $day."st";
        }else if($day%10 ==  2){
            $day = $day."nd";
        }else if($day%10 == 3){
            $day = $day."rd";
        }else{
            $day = $day."th";
        }
        
        return "$month $day, $year";
    }

    function isCompleted($learned_counts, $course_id){
        $isCompleted = false;
        foreach($learned_counts as $count){
            if($count['course_id'] == $course_id){
                
            //    echo $count['count']." Vs ".$count['lessons_count']." CourseId-".$course_id;
                return $count['count']>=$count['lessons_count'];
            }
        }
       
        return $isCompleted;
    }


?>

<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="utf-8">		
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, shrink-to-fit=9">
		<meta name="description" content="CalamusEducation">
		<meta name="author" content="CalamusEducation">
		<title>Calamus | Certificate</title>
		
		<!-- Favicon Icon -->
		<link rel="icon" type="image/png" href="assets/images/logo.png">
		
		<!-- Stylesheets -->
		<link href='http://fonts.googleapis.com/css?family=Roboto:400,700,500' rel='stylesheet'>
        <link href="https://fonts.googleapis.com/css2?family=Rosario:wght@300;400;500;600;700&display=swap" rel="stylesheet"> 
		<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
 
		<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
		 
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

		<style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: 'Roboto', 'Rosario', sans-serif;
            background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .wrapper { width: 100%; max-width: 560px; }
        .font_bold { font-family: 'Rosario', sans-serif; font-weight: 700; }
        .cert-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
            padding: 32px 28px;
        }
        .cert-header {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .cert-header h1 {
            font-family: 'Rosario', sans-serif;
            font-weight: 700;
            font-size: 22px;
            letter-spacing: 0.5px;
            color: #1a1a1a;
            margin: 0 0 16px 0;
        }
        .cert-badge {
            width: 56px;
            height: 56px;
            margin: 0 auto;
            border-radius: 50%;
            background: #2e7d32;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 28px;
            line-height: 1;
        }
        .cert-details {
            display: flex;
            flex-direction: column;
            gap: 0;
        }
        .cert-row {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
            font-size: 15px;
        }
        .cert-row:last-child { border-bottom: none; }
        .cert-row .label {
            font-family: 'Rosario', sans-serif;
            font-weight: 600;
            color: #555;
            min-width: 120px;
            flex-shrink: 0;
        }
        .cert-row .value { color: #1a1a1a; }
        .error_container {
            text-align: center;
            padding: 48px 32px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            max-width: 400px;
            margin: 0 auto;
        }
        .error_container img {
            width: 80px;
            height: 80px;
            margin-bottom: 16px;
            opacity: 0.7;
        }
        .error_container .error-text {
            color: #666;
            font-size: 15px;
            line-height: 1.5;
        }
		</style>
	</head> 

<body>
	 
	<!-- Body Start -->
	<div class="wrapper _bg4586 _new89">		
		<div class="_215cd2">
            <?php if(!$error) {?>
                <div class="cert-card" id="captureArea">
                    <div class="cert-header">
                        <h1>Certificate Authentication</h1>
                        <div class="cert-badge">✓</div>
                    </div>
                    <div class="cert-details">
                        <div class="cert-row">
                            <span class="label">Certificate ID</span>
                            <span class="value"><?php echo htmlspecialchars($course['certificate_code'] . $certificate_id); ?></span>
                        </div>
                        <div class="cert-row">
                            <span class="label">Name</span>
                            <span class="value"><?php echo htmlspecialchars($user['learner_name']); ?></span>
                        </div>
                        <div class="cert-row">
                            <span class="label">Course</span>
                            <span class="value"><?php echo htmlspecialchars($course['title']); ?></span>
                        </div>
                        <div class="cert-row">
                            <span class="label">Issued Date</span>
                            <span class="value"><?php echo htmlspecialchars(formatIssuedDate($certificate['date'])); ?></span>
                        </div>
                    </div>
                </div>
               

            <?php } else { ?>
                <div class="error_container">
                    <img src="assets/images/certificate/feather.svg" alt="">
                    <div class="error-text"><?php echo $error; ?></div>
                </div>
            <?php } ?>
		</div>

	</div>
	
</body>
</html>