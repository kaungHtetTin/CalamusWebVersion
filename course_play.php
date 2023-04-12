<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/course.php');
    include('classes/teacher.php');
    include('classes/lesson.php');
    include ('classes/auth.php');
 
    $page_title="Detail";
    $course_id=$_GET['course_id'];
    $user_id=$_SESSION['calamus_userid'];
    

    $Auth=new Auth();
    $user =$Auth->check_login($user_id);

    if(!$Auth->checkVIP($course_id,$user_id)) header("Location: vip_plan.php");
    $Course=new Course();
    $Teacher=new Teacher();
    $Lesson=new Lesson();
    $course=$Course->detail($course_id);
    $enrollStudents=$Course->getEnrollStudents($course_id);
    $teacher_id=$course['teacher_id'];
    $teacher=$Teacher->detail($teacher_id);
    $days=$Lesson->getLessonsByDayPlan($course_id,$user_id);
?>


<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, shrink-to-fit=9">
		<meta name="description" content="Gambolthemes">
		<meta name="author" content="Gambolthemes">		
		<title>Calamus | <?php echo $page_title; ?> </title>
		
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
            .fixedLessonContainer
            {
                
                height: 100%;
                position: relative;
            }
            .scrollLessonContent
            {
                height: 100%;
                width:100%;
                overflow:auto;
              
            }
            .fixContainer{
                position: fixed;
                bottom: 0;
                right: 0;
            }
        </style>

	</head>

<body onresize="adjustLayout()">
    <div class="fixedLessonContainer">
    <div class="row">
        <div class="col-lg-8 col-md-6">
             <div id="video_player">
            </div>
            <script src="https://player.vimeo.com/api/player.js"></script>
            
            <div id="course_display_1" class="_215b15 _byt1458">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="user_dt5">
                                <div class="user_dt_left">
                                    <div class="live_user_dt">
                                        
                                        <div class="user_cntnt">
                                            
                                            <h5 id="tv_course_title"><?php echo $course['title']; ?> </h5>
                                            <span id="tv_title" class="_df7852"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="user_dt_right">
                                    <ul>
                                        <li>
                                            <a href="#" class="lkcm152"><i class="uil uil-eye"></i><span id="tv_view"></span></a>
                                        </li>
                                        <li>
                                            <a href="#" class="lkcm152"><i class="uil uil-thumbs-up"></i><span id="tv_like"></span></a>
                                        </li>
                                        <li>
                                            <a href="#" class="lkcm152"><i class="uil uil-share-alt"></i><span id="tv_share"></span></a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="course_tabs" id="nav-bar-section">
                                <nav>
                                    <div class="nav nav-tabs tab_crse justify-content-center" id="nav-tab" role="tablist">
                                        <a class="nav-item nav-link active" id="nav-about-tab" data-toggle="tab" href="#nav-about" role="tab" aria-selected="true">About</a>
                                        <a class="nav-item nav-link" id="nav-reviews-tab" data-toggle="tab" href="#nav-reviews" role="tab" aria-selected="false">Reviews</a>
                                    </div>
                                </nav>						
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="detail-section" class="_215b17">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="course_tab_content">
                                <div class="tab-content" id="nav-tabContent">
                                    <div class="tab-pane fade show active" id="nav-about" role="tabpanel">
                                        <?php
                                            include("course-abouts/$course_id.php");
                                        ?>
                                    </div>

                                    <div class="tab-pane fade" id="nav-reviews" role="tabpanel">
                                        <div class="student_reviews">
                                            <div class="row">
                                                <div class="col-lg-5">
                                                    <div class="reviews_left">
                                                        <h3>Student Feedback</h3>
                                                        <div class="total_rating">
                                                            <div class="_rate001">4.6</div>														
                                                            <div class="rating-box">
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star half-star"></span>
                                                            </div>
                                                            <div class="_rate002">Course Rating</div>	
                                                        </div>
                                                        <div class="_rate003">
                                                            <div class="_rate004">
                                                                <div class="progress progress1">
                                                                    <div class="progress-bar w-70" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                                                                </div>
                                                                <div class="rating-box">
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star full-star"></span>
                                                                </div>
                                                                <div class="_rate002">70%</div>
                                                            </div>
                                                            <div class="_rate004">
                                                                <div class="progress progress1">
                                                                    <div class="progress-bar w-30" role="progressbar" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                                                                </div>
                                                                <div class="rating-box">
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star empty-star"></span>
                                                                </div>
                                                                <div class="_rate002">40%</div>
                                                            </div>
                                                            <div class="_rate004">
                                                                <div class="progress progress1">
                                                                    <div class="progress-bar w-5" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
                                                                </div>
                                                                <div class="rating-box">
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star empty-star"></span>
                                                                    <span class="rating-star empty-star"></span>
                                                                </div>
                                                                <div class="_rate002">5%</div>
                                                            </div>
                                                            <div class="_rate004">
                                                                <div class="progress progress1">
                                                                    <div class="progress-bar w-2" role="progressbar" aria-valuenow="2" aria-valuemin="0" aria-valuemax="100"></div>
                                                                </div>
                                                                <div class="rating-box">
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star empty-star"></span>
                                                                    <span class="rating-star empty-star"></span>
                                                                    <span class="rating-star empty-star"></span>
                                                                </div>
                                                                <div class="_rate002">1%</div>
                                                            </div>
                                                            <div class="_rate004">
                                                                <div class="progress progress1">
                                                                    <div class="progress-bar w-1" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                                                </div>
                                                                <div class="rating-box">
                                                                    <span class="rating-star full-star"></span>
                                                                    <span class="rating-star empty-star"></span>
                                                                    <span class="rating-star empty-star"></span>
                                                                    <span class="rating-star empty-star"></span>
                                                                    <span class="rating-star empty-star"></span>
                                                                </div>
                                                                <div class="_rate002">1%</div>
                                                            </div>
                                                        </div>
                                                    </div>												
                                                </div>
                                                <div class="col-lg-7">
                                                    <div class="review_right">
                                                        <div class="review_right_heading">
                                                            <h3>Reviews</h3>
                                                            <div class="review_search">
                                                                <input class="rv_srch" type="text" placeholder="Search reviews...">
                                                                <button class="rvsrch_btn"><i class='uil uil-search'></i></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="review_all120">
                                                        <div class="review_item">
                                                            <div class="review_usr_dt">
                                                                <img src="images/left-imgs/img-1.jpg" alt="">
                                                                <div class="rv1458">
                                                                    <h4 class="tutor_name1">John Doe</h4>
                                                                    <span class="time_145">2 hour ago</span>
                                                                </div>
                                                            </div>
                                                            <div class="rating-box mt-20">
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star half-star"></span>
                                                            </div>
                                                            <p class="rvds10">Nam gravida elit a velit rutrum, eget dapibus ex elementum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce lacinia, nunc sit amet tincidunt venenatis.</p>
                                                            <div class="rpt100">
                                                                <span>Was this review helpful?</span>
                                                                <div class="radio--group-inline-container">
                                                                    <div class="radio-item">
                                                                        <input id="radio-1" name="radio" type="radio">
                                                                        <label for="radio-1" class="radio-label">Yes</label>
                                                                    </div>
                                                                    <div class="radio-item">
                                                                        <input id="radio-2" name="radio" type="radio">
                                                                        <label  for="radio-2" class="radio-label">No</label>
                                                                    </div>
                                                                </div>
                                                                <a href="#" class="report145">Report</a>
                                                            </div>
                                                        </div>
                                                        <div class="review_item">
                                                            <div class="review_usr_dt">
                                                                <img src="images/left-imgs/img-2.jpg" alt="">
                                                                <div class="rv1458">
                                                                    <h4 class="tutor_name1">Jassica William</h4>
                                                                    <span class="time_145">12 hour ago</span>
                                                                </div>
                                                            </div>
                                                            <div class="rating-box mt-20">
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star empty-star"></span>
                                                            </div>
                                                            <p class="rvds10">Nam gravida elit a velit rutrum, eget dapibus ex elementum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce lacinia, nunc sit amet tincidunt venenatis.</p>
                                                            <div class="rpt100">
                                                                <span>Was this review helpful?</span>
                                                                <div class="radio--group-inline-container">
                                                                    <div class="radio-item">
                                                                        <input id="radio-3" name="radio1" type="radio">
                                                                        <label for="radio-3" class="radio-label">Yes</label>
                                                                    </div>
                                                                    <div class="radio-item">
                                                                        <input id="radio-4" name="radio1" type="radio">
                                                                        <label  for="radio-4" class="radio-label">No</label>
                                                                    </div>
                                                                </div>
                                                                <a href="#" class="report145">Report</a>
                                                            </div>
                                                        </div>
                                                        <div class="review_item">
                                                            <div class="review_usr_dt">
                                                                <img src="images/left-imgs/img-3.jpg" alt="">
                                                                <div class="rv1458">
                                                                    <h4 class="tutor_name1">Albert Dua</h4>
                                                                    <span class="time_145">5 days ago</span>
                                                                </div>
                                                            </div>
                                                            <div class="rating-box mt-20">
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star half-star"></span>
                                                                <span class="rating-star empty-star"></span>
                                                            </div>
                                                            <p class="rvds10">Nam gravida elit a velit rutrum, eget dapibus ex elementum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce lacinia, nunc sit amet tincidunt venenatis.</p>
                                                            <div class="rpt100">
                                                                <span>Was this review helpful?</span>
                                                                <div class="radio--group-inline-container">
                                                                    <div class="radio-item">
                                                                        <input id="radio-5" name="radio2" type="radio">
                                                                        <label for="radio-5" class="radio-label">Yes</label>
                                                                    </div>
                                                                    <div class="radio-item">
                                                                        <input id="radio-6" name="radio2" type="radio">
                                                                        <label  for="radio-6" class="radio-label">No</label>
                                                                    </div>
                                                                </div>
                                                                <a href="#" class="report145">Report</a>
                                                            </div>
                                                        </div>
                                                        <div class="review_item">
                                                            <div class="review_usr_dt">
                                                                <img src="images/left-imgs/img-4.jpg" alt="">
                                                                <div class="rv1458">
                                                                    <h4 class="tutor_name1">Zoena Singh</h4>
                                                                    <span class="time_145">15 days ago</span>
                                                                </div>
                                                            </div>
                                                            <div class="rating-box mt-20">
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                            </div>
                                                            <p class="rvds10">Nam gravida elit a velit rutrum, eget dapibus ex elementum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce lacinia, nunc sit amet tincidunt venenatis.</p>
                                                            <div class="rpt100">
                                                                <span>Was this review helpful?</span>
                                                                <div class="radio--group-inline-container">
                                                                    <div class="radio-item">
                                                                        <input id="radio-7" name="radio3" type="radio">
                                                                        <label for="radio-7" class="radio-label">Yes</label>
                                                                    </div>
                                                                    <div class="radio-item">
                                                                        <input id="radio-8" name="radio3" type="radio">
                                                                        <label  for="radio-8" class="radio-label">No</label>
                                                                    </div>
                                                                </div>
                                                                <a href="#" class="report145">Report</a>
                                                            </div>
                                                        </div>
                                                        <div class="review_item">
                                                            <div class="review_usr_dt">
                                                                <img src="images/left-imgs/img-5.jpg" alt="">
                                                                <div class="rv1458">
                                                                    <h4 class="tutor_name1">Joy Dua</h4>
                                                                    <span class="time_145">20 days ago</span>
                                                                </div>
                                                            </div>
                                                            <div class="rating-box mt-20">
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star full-star"></span>
                                                                <span class="rating-star empty-star"></span>
                                                                <span class="rating-star empty-star"></span>
                                                            </div>
                                                            <p class="rvds10">Nam gravida elit a velit rutrum, eget dapibus ex elementum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce lacinia, nunc sit amet tincidunt venenatis.</p>
                                                            <div class="rpt100">
                                                                <span>Was this review helpful?</span>
                                                                <div class="radio--group-inline-container">
                                                                    <div class="radio-item">
                                                                        <input id="radio-9" name="radio4" type="radio">
                                                                        <label for="radio-9" class="radio-label">Yes</label>
                                                                    </div>
                                                                    <div class="radio-item">
                                                                        <input id="radio-10" name="radio4" type="radio">
                                                                        <label  for="radio-10" class="radio-label">No</label>
                                                                    </div>
                                                                </div>
                                                                <a href="#" class="report145">Report</a>
                                                            </div>
                                                        </div>
                                                        <div class="review_item">
                                                            <a href="#" class="more_reviews">See More Reviews</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer id="footer" class="footer mt-30">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="about_us.html">About</a>
                                <a href="our_blog.html">Blog</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="help.html">Help</a>
                                <a href="contact_us.html">Contact Us</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="terms_of_use.html">Terms</a>
                                <a href="terms_of_use.html">Privacy Policy</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f3">
                                <a href="#" class="btn1542">Teach on Cursus</a>
                            </div>
                        </div>
                        <div class="col-lg-12">
                            <div class="footer_bottm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <ul class="fotb_left">
                                            <li>
                                                <a href="index.html">
                                                    <div class="footer_logo">
                                                        <img src="{{asset('images/logo.png')}}" alt="">
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <p>© 2023 <strong>Calamuseducation</strong>. All Rights Reserved.</p>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="edu_social_links">
                                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                                            <a href="#"><i class="fab fa-twitter"></i></a>
                                            <a href="#"><i class="fab fa-google-plus-g"></i></a>
                                            <a href="#"><i class="fab fa-linkedin-in"></i></a>
                                            <a href="#"><i class="fab fa-instagram"></i></a>
                                            <a href="#"><i class="fab fa-youtube"></i></a>
                                            <a href="#"><i class="fab fa-pinterest-p"></i></a>
                                        </div>
                                    </div>		
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

        </div>

        <div class="col-lg-4 col-md-6 scrollLessonContent fixContainer" id="lesson-section">
            <div class="user_cntnt"><h4>Course content</h4></div>
            <div class="_112456">
                <ul class="accordion-expand-holder">
                    <li><span class="accordion-expand-all _d1452">Expand all</span></li>
                    <li><span class="_fgr123"> <?php echo $course['lessons_count']; ?> lectures</span></li>
                    <li><span class="_fgr123"><?php echo $Lesson->formatDuration($Course->getDuration($course_id)); ?></span></li>
                </ul>
            </div>
            <?php for($i=0;$i<count($days);$i++){ $day=$days[$i]; ?> 

            <div id="accordion" class="ui-accordion ui-widget ui-helper-reset">
                <a href="javascript:void(0)" class="accordion-header ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all">												
                    <div class="section-header-left">
                        <span class="section-title-wrapper">
                            <i class='uil uil-presentation-play crse_icon'></i>
                            <span class="section-title-text">Day <?php echo $i+1; ?> </span>
                        </span>
                    </div>
                    <div class="section-header-right">
                        <span class="num-items-in-section"><?php echo count($day) ?> lectures</span>
                        <span class="num-items-in-section"><?php echo $Lesson->formatDuration($Lesson->getTotalDuration($day)); ?></span>
                    </div>
                </a>

                <div class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom">
                    <?php foreach($day as $key=>$lesson){ ?>
                    <a href="#video_player" onclick="playLesson(<?php echo $i?>,<?php echo $key; ?>)">
                        <div class="lecture-container"  id="lesson_item<?php echo $lesson['id'];?>">
                            <?php if($lesson['learned']==1){ ?> 
                                <i class='uil uil-check-circle icon_142' style="color:green"></i>
                            <?php }else {?>
                                <i class='uil uil-check-circle icon_142'></i>
                            <?php }?>
                           
                            <div class="top">
                                <div class="title">
                                    <div style="margin-bottom:5px;"><?php echo $lesson['lesson_title']; ?></div>
                                 
                                    <?php if($lesson['isVideo']==1){ ?>
                                        <i class='uil uil-play-circle icon_142'></i>
                                    <?php }else{ ?>
                                        <i class='uil uil-file icon_142'></i>
                                    <?php } ?>
                                
                                    <?php echo $Lesson->formatDuration($lesson['duration']); ?>
                                
                                </div>
                                
                            </div>
                        </div>
                    </a>
                    <?php }?>
                </div>
                                                        
            </div>
            <?php } ?>
    

                <!-- <a class="btn1458" href="#">20 More Sections</a> -->
            <footer id="footer2" style="display:none" class="footer mt-30">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="about_us.html">About</a>
                                <a href="our_blog.html">Blog</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="help.html">Help</a>
                                <a href="contact_us.html">Contact Us</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="terms_of_use.html">Terms</a>
                                <a href="terms_of_use.html">Privacy Policy</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f3">
                                <a href="#" class="btn1542">Teach on Cursus</a>
                            </div>
                        </div>
                        <div class="col-lg-12">
                            <div class="footer_bottm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <ul class="fotb_left">
                                            <li>
                                                <a href="index.html">
                                                    <div class="footer_logo">
                                                        <img src="{{asset('images/logo.png')}}" alt="">
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <p>© 2023 <strong>Calamuseducation</strong>. All Rights Reserved.</p>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="edu_social_links">
                                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                                            <a href="#"><i class="fab fa-twitter"></i></a>
                                            <a href="#"><i class="fab fa-google-plus-g"></i></a>
                                            <a href="#"><i class="fab fa-linkedin-in"></i></a>
                                            <a href="#"><i class="fab fa-instagram"></i></a>
                                            <a href="#"><i class="fab fa-youtube"></i></a>
                                            <a href="#"><i class="fab fa-pinterest-p"></i></a>
                                        </div>
                                    </div>		
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        
        <script>

            var days=<?php echo json_encode($days) ?>;
            var user_id=<?php echo $user['learner_phone'] ?>;

            window.onload= playLesson(<?php echo $_GET['outer']?>,<?php echo $_GET['inner'];?>);
            adjustLayout();
                      
            function playLesson(outerIndex,innerIndex){
                
                var lesson=days[outerIndex][innerIndex];
                console.log(lesson);
                highLightLessonItem('lesson_item'+lesson.id);
                if(lesson.isVideo==1){
                    var video_player=document.getElementById('video_player');
                    video_player.innerHTML=`
                        <div style="padding:56.25% 0 0 0;position:relative;">
                            <iframe src="${lesson.vimeo}" 
                                frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Lesson 6 Rules for word stress"></iframe>
                        </div>
                    `;

                    document.getElementById('tv_view').innerHTML=lesson.view_count;
                    document.getElementById('tv_like').innerHTML=lesson.post_like;
                    document.getElementById('tv_share').innerHTML=lesson.share_count;
                    document.getElementById('tv_title').innerHTML=lesson.lesson_title;
                    updateData(user_id,lesson.id,lesson.post_id);

                }else{
                    loadBlogLesson(lesson.link);
                    updateData(user_id,lesson.id,null);

                }
            }

            function loadBlogLesson(link){
                window.location.href = "lesson-display.php?link="+link;
            }

            function updateData(user_id,lesson_id,post_id){
                var ajax=new XMLHttpRequest();
                ajax.onload =function(){
                    if(ajax.status==200 || ajax.readyState==4){
                        console.log("lesson click" ,ajax.responseText);  
                    }
                };
                ajax.open("POST","api/play-lesson.php",true);
                ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                ajax.send(`user_id=${user_id}&lesson_id=${lesson_id}&post_id=${post_id}`);
            }

            function highLightLessonItem(id){
                var lessonItems=document.getElementsByClassName('lecture-container');
                for(var i=0;i<lessonItems.length;i++){
                    var item=lessonItems[i];
                    const ID=item.getAttribute("id");
                    console.log("id",id,"ID",ID);
                    if(id==ID){
                        item.setAttribute('style','background:#ed292621');
                    }else{
                        item.setAttribute('style','');
                    }
                    
                }
            }

            function adjustLayout(){
                var w = window.innerWidth;
                var lesson_section=document.getElementById('lesson-section');
                var footer=document.getElementById('footer');
                var footer2=document.getElementById('footer2');
                var nav_bar_section=document.getElementById('nav-bar-section');
                var detail_section=document.getElementById('detail-section');

                var w_lesson_section=lesson_section.offsetWidth;
                console.log('windown',w,'lesson section',w_lesson_section);

                if(w<=w_lesson_section){
                    lesson_section.setAttribute('class','col-lg-4 col-md-6 scrollLessonContent');
                    
                    footer.setAttribute('style','display:none');
                    footer2.setAttribute('style','display:block');
                    nav_bar_section.setAttribute('style','display:none');
                    detail_section.setAttribute('style','display:none');
                }else{
                    lesson_section.setAttribute('class','col-lg-4 col-md-6 scrollLessonContent fixContainer');
                    footer.setAttribute('style','');
                    footer2.setAttribute('style','display:none');
                    nav_bar_section.setAttribute('style','');
                    detail_section.setAttribute('style','');
                }
            }

        </script>

	</div>
    </div>
	<!-- Body End -->

	<script src="assets/js/vertical-responsive-menu.min.js"></script>
	<script src="assets/js/jquery-3.3.1.min.js"></script>
	<script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
	<script src="assets/vendor/OwlCarousel/owl.carousel.js"></script>
	<script src="assets/vendor/semantic/semantic.min.js"></script>
	<script src="assets/js/custom.js"></script>
	<script src="assets/js/night-mode.js"></script>
	
	
</body>
</html>