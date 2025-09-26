<?php 
session_start();

include('classes/connect.php');
include('classes/user.php');
include('classes/course.php');
include('classes/certificate.php');
include('classes/numbercoder.php');
include ('classes/auth.php');

	$user_id = $_GET['user_id'];
	$course_id = $_GET['course_id'];

    $Course = new Course();
    $course = $Course->detail($course_id);

    $User = new User();
    $user = $User->detail($user_id);

    $Auth=new Auth();
    $auth = false;
	if(isset($_SESSION['calamus_userid'])){
        $auth =$Auth->check_login($_SESSION['calamus_userid']);
    }

    $error = false;
    if(!$user) $error = "No Resource Found!";
    if(!$course) $error = "No Resourse Found!";

    if(!$error){
        $major = $course['major'];

        if($major == "english"){
            $certificate_seal = "assets/images/ee_certificate_seal.png";
            $platform = "English for Myanmar";
        }else{
            $certificate_seal = "assets/images/ko_certificate_seal.png";
            $platform = "Korean for Myanmar";
        }
        
        $certificate_bg = "assets/images/certificate_background.png";

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
            $Certificate = new Certificate();
            $certificate = $Certificate->detail($course_id,$user_id);
            if(!$certificate){
                $certificate = $Certificate->store($course_id,$user_id);
            }
        }
    }

    $numberEncoder = new CompactNumberEncoder();

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

    $date = new DateTime($certificate['date']);
    $year = $date->format('Y'); 

    $certificate_id =  base64_encode($year."-".$certificate['id']);
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
   
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
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

        .certificate_of_completion{
            font-family: 'Rosario';
            font-weight:bold;
            font-size: 30px;
            letter-spacing: 5px;
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
            <?php if(!$error) {?>
                <div class="container">
                    <div id="captureArea" align="center" style="position:relative;width:650px; height:460px;margin:auto">
                        <img src="<?php echo $certificate_bg ?>" alt=""  style="width:100%; height:100%; object-fit: contain; display:block;">

                        <div class="certificate_of_completion" style="position:absolute;top:70px;width:100%;text-align:center">
                            CERTIFICATE OF COMPLETION
                        </div>

                        <div style="font-family: 'Rosario';position:absolute;top:125px;width:100%;text-align:center">
                            This is to certify that
                        </div>

                        <div class="font_bold" style="position:absolute;top:160px;font-size:30px;width:100%;text-align:center">
                            <?php echo $user['learner_name'] ?>
                        </div>

                        <div style="position:absolute;top:188px;width:500px;left:75px;height:2px;background:black;margin:auto">

                        </div>

                         <div style="font-family: 'Rosario';position:absolute;top:203px;width:100%;text-align:center">
                            has completed the
                        </div>

                        <div class="font_bold" style="position:absolute;top:231px;font-size:22px;width:100%;text-align:center;">
                            <?php echo $course['title']; ?>
                        </div>

                        <div style="font-family: 'Rosario';position:absolute;top:263px;width:100%;text-align:center">
                            on the <?php echo $platform ?> platform by Calamus Education
                        </div>
                        
                        <img src="<?php echo $certificate_seal ?>" alt="" 
                        style="position:absolute;bottom:45px;right:60px; width:110px; height:110px;">

                        <div style="position:absolute;bottom:36px;right:40px;font-size:13px;width:170px;text-align:center">
                            <span class="font_bold">Issued on <?php echo formatIssuedDate($certificate['date']) ?></span>
                        </div>

                        <div style="position:absolute;bottom:95px;left:28px;font-size:12px;text-align:left; font-family: 'Rosario'">
                            <span class="font_bold">Certificate ID : <?php echo $certificate_id ?> </span> <br>
                            <span> Authorized by <strong>Calamus Education</strong> <br>
                            <span> <strong>Sca</strong>n the <strong>QR</strong> code <strong>bel</strong>ow to <strong>ver</strong>ify this <strong>cer</strong>tificate and <strong>vie</strong>w course <strong>con</strong>tent.
                        </div>

                        <div style="position:absolute;bottom:37px;left:35px;font-size:12px;width:55px; height:55px;">
                            <div id="qrcode"></div>
                        </div>
                    </div>

                    <br>
                    <div id="loading_bar"  class="main-loader">													
                        <div class="spinner">
                            <div class="bounce1"></div>
                            <div class="bounce2"></div>
                            <div class="bounce3"></div>
                        </div>																										
                    </div>

                    <br><br>

                    <div id="btn_download" style="padding:5px; background:#000;color:white;border-radius:5px;cursor:pointer;text-align:center;">
                        Download
                    </div>
                    <br><br>

                    

                </div>
                <script>

                    var course_id = <?php echo $course_id ?>;
                    var user_id = <?php echo $user_id ?>;
                    var certificate_id = <?php echo $certificate['id']  ?>;
                    var image_id = '<?php echo $certificate_id ?>';
 
                    
                   
                    // $(document).ready(function() {
                    //     $('#loading_bar').hide();
                    //     $('#btn_download').on('click', function() {
                    //         $('#loading_bar').show();
                    //         html2canvas($('#captureArea')[0]).then(canvas => {
                    //             // Create an <a> element to trigger the download
                    //             let link = $('<a>').attr({
                    //                 href: canvas.toDataURL('image/png'),
                    //                 download: 'capture.png'
                    //             });
            
                    //             // Trigger the download
                    //             link[0].click();
                    //             $('#loading_bar').hide();
                    //         });
                    //     });
                    // });
                    
                    $(document).ready(function() {
                        $('#loading_bar').hide();
                        $('#btn_download').on('click', function() {
                             $('#loading_bar').show();
                            // Get resolution scale factor (default to 2x for high quality)
                            const scale = 16;
                            
                            // Configuration for html2canvas with resolution control
                            const config = {
                                scale: scale,
                                useCORS: true,
                                allowTaint: true,
                                backgroundColor: '#ffffff',
                                logging: false,
                                width: $('#captureArea')[0].scrollWidth,
                                height: $('#captureArea')[0].scrollHeight,
                                scrollX: 0,
                                scrollY: 0,
                                windowWidth: $('#captureArea')[0].scrollWidth * scale,
                                windowHeight: $('#captureArea')[0].scrollHeight * scale
                            };
                            
                            html2canvas($('#captureArea')[0], config).then(canvas => {
                                // Create an <a> element to trigger the download
                                let link = $('<a>').attr({
                                    href: canvas.toDataURL('image/png'),
                                    download: 'calamus-certificate'+certificate_id+'.png'
                                });
                    
                                // Trigger the download
                                link[0].click();
                                $('#loading_bar').hide();
                            });
                        });
                    });



                    var qrcode = new QRCode(document.getElementById("qrcode"), {
                        text: `www.calamuseducation.com/qr.php?id=${certificate_id}`,
                        width: 55,
                        height: 55,
                        colorDark : "#000000",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.M
                    });
                </script>

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