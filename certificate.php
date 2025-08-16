<?php 
include('classes/connect.php');
include('classes/user.php');

	$user_id = $_GET['user_id'];
	$course_id = $_GET['course_id'];

	$DB = new Database();
	$query = "	SELECT
				courses.lessons_count,
				count(*) as learned
				FROM courses
				JOIN lessons_categories ON lessons_categories.course_id = courses.course_id
				JOIN lessons ON lessons.category_id = lessons_categories.id
				JOIN studies studies.lesson_id = lessons.id
				WHERE courses.course_id=$course_id and studies.learner_id=$user_id;
			";

	$result = $DB->read($query);

	$lesson_count = $result['lessons_count'];
	$learned = $result['learned'];

	if($lesson_count==$learned){
		
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
             font-family: Poppins SemiBold, sans-serif;
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
			<div class="container">
				<div id="captureArea" align="center" style="position:relative;width:630px; height:891px;margin:auto">
                    <img src="assets/images/certificate_bg.png" alt="" style="width:630px; height:891px;">
                    <img src="assets/images/certificate/feather.svg" alt="" style="width:150px;height:150px;top:70px;right:230px;position:absolute;margin:auto;z-index:10;">
                    <div class="font-bell" style="position:absolute;top:190px;left:115px;font-size:40px;font-weight:bold;width:400px;">
                        CERTIFICATION OF 
                    </div>

                    <div class="font-bell" style="position:absolute;top:250px;left:95px;font-size:60px;font-weight:bold;width:450px;">
                       COMPLETITON
                    </div>

                    <div class="font-poppin-medium" style="position:absolute;top:370px;left:95px;font-size:16px;width:450px;">
                       This certificate is rewarded to
                    </div>

                     <div class="font-poppin-semibold" style="position:absolute;top:420px;left:95px;font-size:36px;width:450px;">
                        Kaung Htet Tin
                    </div>

                    <div class="font-poppin-medium" style="position:absolute;top:470px;left:0px;font-size:16px;width:630px;text-align:center">
                       for succefully completing the course of "Basic Course"
                    </div>

					<div style="position:absolute;top:510px;left:0px;font-size:16px;width:630px;text-align:center">
                         <img style="height:100px;" src="assets/images/certificate/1.png" alt="" srcset="">
                    </div>
					<div style="position:absolute;bottom:50px;left:50px;font-size:16px;">
                        <span class="font-poppin-semibold"><b>Issued Date:</b></span> 
						<span class="font-poppin-medium"> July 7th 2024</span>
                    </div>
                </div>

                <br><br>
                <div id="btn_download" style="padding:5px; background:#000;color:white;border-radius:5px;cursor:pointer;text-align:center;">
                    Download
                </div>
                <br><br>
			</div>
		</div>

	</div>
		
  
	<!-- Body End -->

    <script>
        $(document).ready(function() {
            $('#btn_download').on('click', function() {
                html2canvas($('#captureArea')[0]).then(canvas => {
                    // Create an <a> element to trigger the download
                    let link = $('<a>').attr({
                        href: canvas.toDataURL('image/png'),
                        download: 'capture.png'
                    });

                    // Trigger the download
                    link[0].click();
                });
            });
        });
    </script>

	<script src="assets/js/vertical-responsive-menu.min.js"></script>
	<script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
	<script src="assets/vendor/OwlCarousel/owl.carousel.js"></script>
	<script src="assets/vendor/semantic/semantic.min.js"></script>
	<script src="assets/js/custom.js"></script>
	<script src="assets/js/night-mode.js"></script>
	
	
</body>
</html>