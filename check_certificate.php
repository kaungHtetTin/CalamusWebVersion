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

    $id = base64_decode($id);

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
        <link href='assets/vendor/unicons-2.0.1/css/unicons.css' rel='stylesheet'>
		<link href="assets/css/vertical-responsive-menu.min.css" rel="stylesheet">
		<link href="assets/css/style.css" rel="stylesheet">
		<link href="assets/css/responsive.css" rel="stylesheet">
		<link href="assets/css/night-mode.css" rel="stylesheet">
		
		<!-- Vendor Stylesheets -->
		<link href="assets/vendor/fontawesome-free/css/all.min.css" rel="stylesheet">
		<link href="assets/vendor/OwlCarousel/assets/owl.carousel.css" rel="stylesheet">
		<link href="assets/vendor/OwlCarousel/assets/owl.theme.default.min.css" rel="stylesheet">
		<link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
		<link rel="stylesheet" type="text/css" href="assets/vendor/semantic/semantic.min.css">	
        <script src="assets/js/jquery-3.3.1.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

		<style>
			
        .font-bell{
             font-family: Bell MT, sans-serif;
        }

        .font-poppin-medium{
            font-family: Poppins Medium, sans-serif;
        }

        .font-poppin-semibold{
           
        }
        /* .font_bold{
            font-family: 'Rosario',Pyidaungsu , Poppins SemiBold, sans-serif;
        } */
        .font_bold{
            font-family: 'Rosario';
            font-weight:bold;
            
        }

        .error_container{
            text-align:center;
            padding:50px;
            color:#aaa;
            font-size:16px;
            font-family: Poppins Medium, sans-serif;
        
        }

        .course{
            padding: 7px;
            margin-bottom:7px;
            cursor: pointer;
            color:#333;
        }

        .course:hover{
            background: #333;
            color:white;
        }

        .course .title{
            font-size:14px;
            font-family: 'Rosario';
        }

        table tr td{
            padding:5px;
        }

		</style>
	</head> 

<body>
	<!-- Header Start -->
	<header class="header clearfix">
		<div class="container">
			<div class="row">
				<div class="col-12">
					<div class="back_link">
						<a href="index.php" class="hde151">Back To Calamus</a>
						<a href="index.php" class="hde152">Back</a>
					</div>
					<div class="ml_item">
						<div class="main_logo main_logo15" id="logo">
							<a href="index.php"><img src="assets/images/calamuslogo.png" style="width:100px;" alt=""></a>
							<a href="index.php"><img class="logo-inverse" src="images/ct_logo.svg" alt=""></a>
						</div>				
					</div>					
				</div>		
			</div>
		</div>
	</header>
	<!-- Header End -->
	<!-- Body Start -->
	<div class="wrapper _bg4586 _new89">		
		<div class="_215cd2">
            <?php if(!$error) {?>
                <div class="container">
                    <div id="captureArea" align="center" style="margin:auto">
                        <div class="font_bold" style="font-size:20px;">Certificate Authentication</div>
                    </div>
                    <br><br>
                    <div style="text-align:center;">
                        <i class="uil uil-check-circle" style="font-size:40px;color:green"></i>
                    </div>

                    <br><br>

                    <table style="display:inline">
                        <tr>
                            <td style="width:100px;"><span class="font_bold">Certificate ID </span></td>
                            <td> <?php echo $course['certificate_code'].$certificate_id ?>  </td>
                        </tr>
                        <tr>
                            <td><span class="font_bold">Name </span> </td>
                            <td><?php echo $user['learner_name'] ?> </td>
                        </tr>
                        <tr>
                            <td><span class="font_bold">Course </span> </td>
                            <td><?php echo $course['title'] ?> </td>
                        </tr>
                        <tr>
                            <td><span class="font_bold">Issued Date </span> </td>
                            <td> <?php echo formatIssuedDate($certificate['date']) ?> </td>
                        </tr>
                    </table>
              
                    <br><br><br>
                    <div>
                        <div class="font_bold">
                            Related Information
                        </div>
                        <br>
                        <div  >
                            <?php echo $user['learner_name'];?>  has succesfully completed the following course(s) from Calamus Education.
                        </div>
                    </div> <br>

                    <?php foreach($learning_courses as $learning_course) {?>
                        <?php if($learning_course['major'] == $major) {?>
                            <?php if(isCompleted($learned_counts, $learning_course['course_id'])){ ?>
                                <a href="curriculum.php?course_id=<?php echo $learning_course['course_id'] ?>">
                                    <div id="course" class="card course">
                                        <div style="display:flex">
                                            <div style="flex:1">
                                                <div class="title">
                                                    <?php echo $learning_course['title'] ?> 
                                                </div>
                                                <div style="font-size:12px; color:#777">
                                                    View Curriculum
                                                </div>
                                            </div>
                                            <div style="flex:1;text-align:right;padding-top:7px;">
                                                <i style="font-size:23px;color:#777;" class="uil uil-arrow-circle-right"></i>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            <?php }?>
                        <?php }?>
                    <?php }?>
                    <br><br>
                </div>
               

            <?php }else {?>
                <div class="container">
                    <div class="error_container">
                        <br><br><br><br><br>
                        <img src="assets/images/certificate/feather.svg" alt="" style="width:100px;height:100px;margin:auto;">
                        <br>
                        <?php echo $error ?>
                        <br><br><br><br><br>
                        <br><br>
                    </div>
                </div>
            <?php }?>
		</div>

	</div>
		
	<!-- Body End -->

	<script src="assets/js/vertical-responsive-menu.min.js"></script>
	<script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
	<script src="assets/vendor/OwlCarousel/owl.carousel.js"></script>
	<script src="assets/vendor/semantic/semantic.min.js"></script>
	<script src="assets/js/custom.js"></script>
	<script src="assets/js/night-mode.js"></script>
	
	
</body>
</html>