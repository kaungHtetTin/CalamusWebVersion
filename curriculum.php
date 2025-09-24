<?php 
include('classes/connect.php');
include('classes/course.php');
include('classes/lesson.php');

	$course_id = $_GET['course_id'];

    $Course = new Course();
    $course = $Course->detail($course_id);

    $modules = $Course->getModules($course_id);

    $Lesson = new Lesson();

?>

<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="utf-8">		
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, shrink-to-fit=9">
		<meta name="description" content="CalamusEducation">
		<meta name="author" content="CalamusEducation">
		<title>Calamus | Curriculum</title>
		
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
            
        }
     
        .course_title{
            font-family: 'Rosario';
            text-align:center;
        }


        .module .title{
            font-family: 'Rosario';
            font-size: 16px;
        }

        .module ul{
            list-style: disc;
        }

        .module ul li{
            padding:5px;
        }

		</style>
	</head> 

<body style="<?php if(!$error) echo 'min-width:700px;'  ?>">
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
                <div class = "course_title">
                    <h2><?php echo $course['title'] ?> - Curriculum</h2>
                    
                </div>
                <br><br>
                <?php foreach($modules as $module){ ?>
                    <div class = "card module">
                        <div class = "card-header title">
                            <?php echo $module['category_title'] ?>
                        </div>
                        <div class="card-body">
                            <div style="padding:7px;">
                                <ul>
                                    <?php $lessons = $Lesson->getLessonByCategory($module['id']); ?>
                                    <?php for($i=count($lessons)-1;$i>=0;$i-- ) {?>
                                        <?php $lesson = $lessons[$i]; ?>
                                        <li><?php echo $lesson['lesson_title']?></li>
                                    <?php }?>
                                </ul>
                            </div>
                        </div>
                        
                    </div>
                    <br>
                <?php }?>
                
            </div>
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