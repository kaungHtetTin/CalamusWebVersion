<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/course.php');
    include('classes/teacher.php');
    include('classes/lesson.php');
    include ('classes/auth.php');
    include('classes/study.php');
    include('classes/rating.php');
    $page_title="Detail";
    
    $course_id=$_GET['course_id'];
    


    $Auth=new Auth();
    $user = false;
    $isRegister = false;
    $user_id = 0;
    if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
        $isRegister=$Auth->checkVIP($course_id,$user_id);
        $user_id=$_SESSION['calamus_userid'];
    }
    
   

    $Course=new Course();
    $Teacher=new Teacher();
    $Lesson=new Lesson();
    $Study=new Study();
    $Rating=new Rating();

    if($user){
        $learned_count=$Study->getCount($user_id,$course_id);
        $progress=($learned_count/$course['lessons_count'])*100;
        $progress=round($progress);
    }
   
    $course=$Course->detail($course_id);
    $enrollStudents=$Course->getEnrollStudents($course_id);
    $teacher_id=$course['teacher_id'];
    $teacher=$Teacher->detail($teacher_id);
    $days=$Lesson->getLessonsByDayPlan($course_id,$user_id);
    
    $reviews=$Rating->getReviews($course_id);

    
    
    include('layouts/header.php');
?>

<style>
    .user_dt_right ul li {
        width: 23.3%;
    }
</style>
 
<div class="wrapper _bg4586">
    <div class="_215b01">
        <div class="container-fluid">			
            <div class="row">
                <div class="col-lg-12">
                    <div class="section3125">							
                        <div class="row justify-content-center">						
                            <div class="col-xl-4 col-lg-5 col-md-6">						
                                <div class="preview_video">	

                                    <?php if($course['preview']==""){ ?>
                                        <a href="#" class="fcrse_img" data-toggle="modal" data-target="#videoModal">
                                       <div style=" position: relative; height: 150px;background:<?php echo $course['background_color']; ?>">
                                            <img src="<?php echo $course['cover_url'];?>"style="height:100px; width: 100px; position: absolute;bottom:0; left:30px;" alt="">
                                        </div>
                                        <div class="course-overlay">
                                             
                                            <span class="play_btn1"><i class="uil uil-play"></i></span>
                                            <span class="_215b02">Preview this course</span>
                                        </div>
                                    </a>
                                    <?php }else{ ?>
                                        <div style="padding:56.25% 0 0 0;position:relative;">
                                            <iframe src="<?php echo $course['preview']; ?>" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Korean Basic Course Preview"></iframe>
                                        </div>
                                        <script src="https://player.vimeo.com/api/player.js"></script>
                                    <?php } ?>
                                </div>
                            </div>
                            <div class="col-xl-8 col-lg-7 col-md-6">
                                <div class="_215b03">
                                    <h2><?php echo $course['title']; ?></h2>
                                    <span class="_215b04"><?php echo $course['description']; ?></span>
                                </div>
                                <div class="_215b05">
                                    <div class="crse_reviews mr-2">
                                        <i class="uil uil-star"></i><?php echo round($course['rating'],1); ?>
                                    </div>
                                    <span id="tv_total_rating"></span>
                                </div>
                                <div class="_215b05">										
                                    <?php echo $enrollStudents; ?> students enrolled
                                </div>
                                <?php if($user) {?>
                                    <div class="_215b05">										
                                        <a href="certificate.php">Get certificate <i class="uil uil-arrow-to-bottom"></i></a>
                                    </div>
                                <?php }?>
                                <?php if($isRegister){ ?>
                                    <div class="_215b05">										
                                        <div style="width:100%;background:#444;border-radius:3px;"> 
                                            <div style="width:<?php echo $progress?>%;padding: 5px; background:#02d021;text-align:center;border-radius:3px;">
                                                <?php 
                                                    if($progress>10 && $progress<100){
                                                        echo $progress ." %";
                                                    }else if($progress==100){
                                                        echo "Completed";
                                                    }
                                                ?>
                                            </div>
                                        </div>
                                    </div>
                                <?php } else { ?>
                                    <ul class="_215b31">										
                                        <li><button onclick="location.href='vip_plan.php'" class="btn_adcart" >Buy Now</button></li>

                                    </ul>
                                <?php } ?>

                            </div>							
                        </div>							
                    </div>							
                </div>															
            </div>
        </div>
    </div>
    
    <div class="_215b15 _byt1458">
        <div class="container-fluid">
            <div class="row">
                <div class="col-lg-12">
                    <div class="user_dt5">
                        <div class="user_dt_left">
                            <div class="live_user_dt">
                                <div class="user_img5">
                                    <a href="instructor_profile.php?teacher_id=<?php echo $teacher['id']; ?>"><img src="<?php echo $teacher['profile']; ?>" alt=""></a>												
                                </div>
                                <div class="user_cntnt">
                                    <a href="instructor_profile.php?teacher_id=<?php echo $teacher['id']; ?>" class="_df7852"><?php echo $teacher['name']; ?></a>
                                    <button class="subscribe-btn">Subscribe</button>
                                </div>
                            </div>
                        </div>
                        <div class="user_dt_right">
                            <ul>
                                <li>
                                    <a href="#" class="lkcm152"><i class="uil uil-eye"></i><span>1452</span></a>
                                </li>
                                <li>
                                    <a href="#" class="lkcm152"><i class="uil uil-thumbs-up"></i><span>100</span></a>
                                </li>
                                <li>
                                    <a href="#" class="lkcm152"><i class="uil uil-comment-alt"></i><span>20</span></a>
                                </li>
                                <li>
                                    <a href="#" class="lkcm152"><i class="uil uil-share-alt"></i><span>9</span></a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="course_tabs">
                        <nav>
                            <div class="nav nav-tabs tab_crse justify-content-center" id="nav-tab" role="tablist">
                                <?php if($isRegister){ ?>
                                    <a class="nav-item nav-link active" id="nav-courses-tab" data-toggle="tab" href="#nav-courses" role="tab" aria-selected="false">Courses Content</a>
                                    <a class="nav-item nav-link" id="nav-reviews-tab" data-toggle="tab" href="#nav-reviews" role="tab" aria-selected="false">Reviews</a>    
                                    <a class="nav-item nav-link" id="nav-about-tab" data-toggle="tab" href="#nav-about" role="tab" aria-selected="true">About</a>
                                <?php } else { ?>
                                    <a class="nav-item nav-link active" id="nav-about-tab" data-toggle="tab" href="#nav-about" role="tab" aria-selected="true">About</a>
                                    <a class="nav-item nav-link" id="nav-courses-tab" data-toggle="tab" href="#nav-courses" role="tab" aria-selected="false">Courses Content</a>
                                    <a class="nav-item nav-link" id="nav-reviews-tab" data-toggle="tab" href="#nav-reviews" role="tab" aria-selected="false">Reviews</a>
                                <?php } ?>

                               
                            </div>
                        </nav>						
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="_215b17">
        <div class="container-fluid">
            <div class="row">
                <div class="col-lg-12">
                    <div class="course_tab_content">
                        <div class="tab-content" id="nav-tabContent">
                            <div class="tab-pane fade  <?php if(!$isRegister) echo 'show active' ?>" id="nav-about" role="tabpanel">
                                <?php
                                    include("course-abouts/$course_id.php");
                                ?>
                            </div>

                            <div class="tab-pane fade  <?php if($isRegister) echo 'show active' ?>" id="nav-courses" role="tabpanel">
                                <div class="crse_content">
                                    <h3>Course content</h3>
                                    
                                    <div class="_112456">
                                        <ul class="accordion-expand-holder">
                                            <li><span class="accordion-expand-all _d1452">Expand all</span></li>
                                            <li><span class="_fgr123"> <?php echo $course['lessons_count']; ?> lectures</span></li>
                                            <li><span class="_fgr123"><?php echo $Lesson->formatDuration($Course->getDuration($course_id)); ?></span></li>
                                        </ul>
                                    </div>
                                    
                                    <?php for($i=0;$i<count($days);$i++){ $day=$days[$i]; ?> 
                                    <div id="accordion" class="ui-accordion ui-widget ui-helper-reset" style="margin-top:0px;">
                                        <a href="javascript:void(0)" class="accordion-header ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all">												
                                            <div class="section-header-left">
                                                <span class="section-title-wrapper">
                                                    <i class='uil uil-calendar-alt crse_icon'></i>
                                                    <span class="section-title-text">Day <?php echo $i+1; ?> </span>
                                                </span>
                                            </div>
                                            <div class="section-header-right">
                                                <span class="num-items-in-section" style="font-size:unset"><?php echo count($day) ?> lectures</span>
                                                <span class="section-header-length" style="font-size:unset"><?php echo $Lesson->formatDuration($Lesson->getTotalDuration($day)); ?></span>
                                            </div>
                                        </a>

                                        <div class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom">
                                            <?php foreach($day as $key=>$lesson){ ?>
                                                <?php if(!$user && $i ==0){ ?>
                                                <a href="course-explore.php?course_id=<?php echo $course_id.'&outer='.$i.'&inner='.$key ?>">
                                                <?php }else {?>
                                                <a href="course_play.php?course_id=<?php echo $course_id.'&outer='.$i.'&inner='.$key ?>">
                                                <?php }?>
                                                    <div class="lecture-container">
                                                        <div class="left-content">
                                                            <?php if($lesson['isVideo']==1){ ?>
                                                                <i class='uil uil-play-circle icon_142'></i>
                                                            <?php }else{ ?>
                                                                <i class='uil uil-file icon_142'></i>
                                                            <?php } ?>
                                                            <div class="top">
                                                                <div class="title">
                                                                    <?php echo $lesson['lesson_title']; if($lesson['learned']==1){ ?> 
                                                                    <i class='uil uil-check-circle icon_142' style="color:green"></i>
                                                                    <?php }?>
                                                                </div>
                                                                
                                                            </div>
                                                        </div>
                                                        <div class="details">
                                                            <?php echo $lesson['category_title']; ?>
                                                            <span class="content-summary">
                                                                <?php echo $Lesson->formatDuration($lesson['duration']); ?>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </a>
                                            <?php }?>
                                        </div>
                                    </div>
                                    <?php } ?>

                                    <!-- <a class="btn1458" href="#">20 More Sections</a> -->
                                </div>
                            </div>
                            <div class="tab-pane fade" id="nav-reviews" role="tabpanel">
                                <div class="student_reviews">
                                    <div class="row">
                                        <div class="col-lg-5">
                                            <div class="reviews_left">
                                                <h3>Student Feedback</h3>
                                                <div class="total_rating">
                                                    <div class="_rate001"> <?php echo round($course['rating'],1); ?> </div>														
                                                    <div class="rating-box">
                                                        <?php 
                                                            $star=$course['rating'];
                                                            for($i=0;$i<$star;$i++){
                                                                if($star-$i>=1) echo "<span class='rating-star full-star'></span>";
                                                                else echo "<span class='rating-star half-star'></span>";
                                                             
                                                            }
                                                            $empty_star=5-$star;
                                                            for($i=0;$i<$empty_star;$i++){
                                                                if($empty_star-$i>=1) echo "<span class='rating-star empty-star'></span>";
                                                            }
                                                        ?>
                                                    </div>
                                                    <div class="_rate002">Course Rating</div>	
                                                </div>
                                                <div class="_rate003">
                                                    <div class="_rate004">
                                                        <div class="progress progress1">
                                                            <div class="progress-bar" id="pb_star_5" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
                                                        </div>
                                                        <div class="rating-box">
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star full-star"></span>
                                                        </div>
                                                        <div class="_rate002" id="tv_star_5"></div>
                                                    </div>
                                                    <div class="_rate004">
                                                        <div class="progress progress1">
                                                            <div class="progress-bar" id="pb_star_4" role="progressbar" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100"></div>
                                                        </div>
                                                        <div class="rating-box">
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star empty-star"></span>
                                                        </div>
                                                        <div class="_rate002" id="tv_star_4"></div>
                                                    </div>
                                                    <div class="_rate004">
                                                        <div class="progress progress1">
                                                            <div class="progress-bar" id="pb_star_3" role="progressbar" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
                                                        </div>
                                                        <div class="rating-box">
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star empty-star"></span>
                                                            <span class="rating-star empty-star"></span>
                                                        </div>
                                                        <div class="_rate002" id="tv_star_3"></div>
                                                    </div>
                                                    <div class="_rate004">
                                                        <div class="progress progress1">
                                                            <div class="progress-bar" id="pb_star_2" style="width:95%" role="progressbar" aria-valuenow="2" aria-valuemin="0" aria-valuemax="100"></div>
                                                        </div>
                                                        <div class="rating-box">
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star empty-star"></span>
                                                            <span class="rating-star empty-star"></span>
                                                            <span class="rating-star empty-star"></span>
                                                        </div>
                                                        <div class="_rate002" id="tv_star_2"></div>
                                                    </div>
                                                    <div class="_rate004">
                                                        <div class="progress progress1">
                                                            <div class="progress-bar" id="pb_star_1" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                                                        </div>
                                                        <div class="rating-box">
                                                            <span class="rating-star full-star"></span>
                                                            <span class="rating-star empty-star"></span>
                                                            <span class="rating-star empty-star"></span>
                                                            <span class="rating-star empty-star"></span>
                                                            <span class="rating-star empty-star"></span>
                                                        </div>
                                                        <div class="_rate002" id="tv_star_1"></div>
                                                    </div>
                                                </div>
                                            </div>												
                                        </div>
                                        <div class="col-lg-7">
                                            <div class="review_right">
                                                <div class="review_right_heading">
                                                    <h3>Reviews</h3>
                                                </div>
                                            </div>
                                            <div class="review_all120">
                                                <?php foreach($reviews as $review){ ?>
                                                    <div class="review_item">
                                                        <div class="review_usr_dt">
                                                            <img src="<?php echo $review['learner_image'] ?>" alt="">
                                                            <div class="rv1458">
                                                                <h4 class="tutor_name1"><?php echo $review['learner_name'] ?></h4>
                                                                <span class="time_145">2 hour ago</span>
                                                            </div>
                                                        </div>
                                                        <div class="rating-box mt-20">
                                                            <?php 
                                                                $star=$review['star'];
                                                                for($i=0;$i<$star;$i++){
                                                                    echo "<span class='rating-star full-star'></span>";
                                                                }
                                                                $empty_star=5-$star;
                                                                for($i=0;$i<$empty_star;$i++){
                                                                    echo "<span class='rating-star empty-star'></span>";
                                                                }
                                                            ?>
  
                                                        </div>
                                                        <p class="rvds10"><?php echo $review['review']; ?></p>
                                                    </div>
                                                <?php } ?>
                                                <!-- <div class="review_item">
                                                    <a href="#" class="more_reviews">See More Reviews</a>
                                                </div> -->
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

    <script>

        var reviews=<?php echo json_encode($reviews) ?>;

        const pb_star_5=document.getElementById('pb_star_5');
        const pb_star_4=document.getElementById('pb_star_4');
        const pb_star_3=document.getElementById('pb_star_3');
        const pb_star_2=document.getElementById('pb_star_2');
        const pb_star_1=document.getElementById('pb_star_1');

        const tv_star_5=document.getElementById('tv_star_5');
        const tv_star_4=document.getElementById('tv_star_4');
        const tv_star_3=document.getElementById('tv_star_3');
        const tv_star_2=document.getElementById('tv_star_2');
        const tv_star_1=document.getElementById('tv_star_1');

        const tv_total_rating=document.getElementById('tv_total_rating');
   

        var star_1=0;
        var star_2=0;
        var star_3=0;
        var star_4=0;
        var star_5=0;
        var star_total=0;

        for(var i=0;i<reviews.length;i++){
            var review=reviews[i];
            var star=review.star;

            if(star==1) star_1++;
            if(star==2) star_2++;
            if(star==3) star_3++;
            if(star==4) star_4++;
            if(star==5) star_5++;
            
        }

        star_total=star_1+star_2+star_3+star_4+star_5;


        var percent_star_1=Math.round((star_1/star_total)*100);
        var percent_star_2=Math.round((star_2/star_total)*100);
        var percent_star_3=Math.round((star_3/star_total)*100);
        var percent_star_4=Math.round((star_4/star_total)*100);
        var percent_star_5=Math.round((star_5/star_total)*100);

        pb_star_5.setAttribute('style','width:'+percent_star_5+"%");
        pb_star_4.setAttribute('style','width:'+percent_star_4+"%");
        pb_star_3.setAttribute('style','width:'+percent_star_3+"%");
        pb_star_2.setAttribute('style','width:'+percent_star_2+"%");
        pb_star_1.setAttribute('style','width:'+percent_star_1+"%");


        tv_star_1.innerHTML=percent_star_1+"%";
        tv_star_2.innerHTML=percent_star_2+"%";
        tv_star_3.innerHTML=percent_star_3+"%";
        tv_star_4.innerHTML=percent_star_4+"%";
        tv_star_5.innerHTML=percent_star_5+"%";
        if(star_total>1) tv_total_rating.innerHTML="("+star_total+" ratings)";
        else tv_total_rating.innerHTML="("+star_total+" rating)";

    </script>

<?php 
    include('layouts/footer.php');
?>

