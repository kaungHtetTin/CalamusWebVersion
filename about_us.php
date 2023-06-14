<?php 
include('classes/connect.php');
include('classes/course.php');
include('classes/user.php');
include('classes/teacher.php');
include('classes/util.php');
include('classes/lesson.php');

$Teacher=new Teacher();
$Course=new Course();
$User=new User();
$Util=new Util();
$Lesson=new Lesson();

$teacher=$Teacher->count();
$course=$Course->count();
$enrollment=$User->getEnrollStudent();
$totalUser=$User-> getTotalUser();
$lecture=$Lesson->count();

?>

<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="utf-8">		
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, shrink-to-fit=9">
		<meta name="description" content="CalamusEducation">
		<meta name="author" content="CalamusEducation">
		<title>Calamus | About Us</title>
		
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

		<style>
			.div{
				margin-top:20px;
			}
            .border-div{
				border: 1px solid black; padding:7px;margin:7px;border-radius:3px;
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
				<div class="row">
					<div class="col-lg-12">						
						<div class="title129 mt-35 mb-35">	
							<h2>For Higher Education Of Myanmar</h2>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="_215td5">
			<div class="container">
				<div class="row">
					<div class="col-lg-12">
						<div class="title589 text-center">
							<h2>Our Features</h2>
							<p>On Calamus, you have access to:</p>
							<img class="line-title" src="images/line.svg" alt="">
						</div>
					</div>
					<div class="col-lg-3  col-sm-6">
						<div class="feature125">
							<i class="uil uil-mobile-android-alt"></i>
							<h4>Mobile learning</h4>
							<p>We Support mobile application (Android) for learning.</p>
						</div>
					</div>
					<div class="col-lg-3  col-sm-6">
						<div class="feature125">
							<i class="uil uil-users-alt"></i>
							<h4>Academic & Technical Support</h4>
							<p>You can directly contact the teacher team or developer team through our platform, telegram or facebook.</p>
						</div>
					</div>
					<div class="col-lg-3  col-sm-6">
						<div class="feature125">
							<i class="uil uil-award"></i>
							<h4>Sharable Certificates</h4>
							<p>We give the certificate for each course you have finished.</p>
						</div>
					</div>
					<div class="col-lg-3  col-sm-6">
						<div class="feature125">
							<i class="uil uil-globe"></i>
							<h4>An Inclusive Experience</h4>
							<p>We can support new experience, opportunity to developing up yourself and new friendship for you.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="_215zd5">
			<div class="container">
				<div class="row">
					<div class="col-md-6">
						<div class="title478">
							<h2>Our Story</h2>
							<img class="line-title" src="images/line.svg" alt="">
							<p>We have been trying to develop the grestest online learning platform in Myanmar since 2019.
								Firstly, We have released the Easy English Android App on May 28th, 2020. 
								And then, we developed a learning app for Korean Language and we could released the Easy Korean Android App on Jan 12nd, 2021.
								Also, we have freely released an E-library Mobile App and a Russia-Myanmar Dictionary Mobile App on Google Playstore.
							</p>
						</div>
					</div>
					<div class="col-md-6">
						<div class="story125">
							<img src="assets/images/about/stroy_img.png" alt="">
						</div>
					</div>
					
				</div>
			</div>
		</div>
		<div class="_215td5">
			<div class="container">
				<div class="row">
					<div class="col-lg-12">
						<div class="title589 text-center">
							<h2>Our Reach</h2>
							<p>Calamus is the leading marketplace for teaching and learning, connecting thousands of students to the skills they need to succeed.</p >
							<img class="line-title" src="images/line.svg" alt="">
						</div>
					</div>
					<div class="col-lg-2 col-md-4 col-sm-6">
						<div class="p__metric">
							<?php echo $teacher ?>
							<span>Instructors</span>
						</div>
					</div>
					<div class="col-lg-2 col-md-4 col-sm-6">
						<div class="p__metric">
							<?php echo $course ?>
							<span>Courses</span>
						</div>
					</div>
					<div class="col-lg-2 col-md-4 col-sm-6">
						<div class="p__metric">
							<?php echo $Util->formatCount($lecture) ?>
							<span>Lectures</span>
						</div>
					</div>
					
					<div class="col-lg-2 col-md-4 col-sm-6">
						<div class="p__metric">
							<?php echo $Util->formatCount($enrollment) ?>
							<span>Course enrollments</span>
						</div>
					</div>
					<div class="col-lg-2 col-md-4 col-sm-6">
						<div class="p__metric">
							2
							<span>Languages</span>
						</div>
					</div>
					<div class="col-lg-2 col-md-4 col-sm-6">
						<div class="p__metric">
							<?php echo $Util->formatCount($totalUser); ?>
							<span>Members Joined</span>
						</div>
					</div>
					
				</div>
			</div>
		</div>
		<div class="_215xd5">
			<div class="container">
				<div class="row">
					<div class="col-lg-12">
						<div class="title589 text-center">
							<h2>Honest Reviews</h2>
							<p>A perfect blend of creativity and technical wizardry. The best people formula for great websites!</p>
							<img class="line-title" src="images/line.svg" alt="">
						</div>						
					</div>
					<div class="col-lg-6">
						<div class="jmio125">
							<p>This is the app to learn Korean Language for Myanmar People. In app many lessons and additional materials to improve your language skills are included. And you can attend to our online course via this app. Courses are pretty cheaper than other online courses, but you will get more than the cost is worth. If you're willing to learn Korean language (or) to improve your Korean language skills, this app is for you.
								Wish you all the success!</p>
							 
						</div>
					</div>
					<div class="col-lg-6">
						<div class="jmio125">
							<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/836210202?h=5036ec7717&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Easy Korean Honest Review"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>
						</div>
					</div>					
				</div>
			</div>
		</div>
		
		
<?php include('layouts/footer.php') ?>