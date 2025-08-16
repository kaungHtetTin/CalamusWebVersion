<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/course.php');
    include('classes/teacher.php');
    include ('classes/auth.php');
    include('classes/app.php');
    include('classes/study.php');

    $page_title="Home";
 

    $Auth=new Auth();

    if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
    }else{
        header('Location:login.php');
    }
    

    $Course=new Course();
    $Teacher=new Teacher();
    $App=new App();
    $Study=new Study();

    $feature_courses=$Course->getFeatureCourses();
    $new_courses=$Course->getNewCourses();
    $my_learning_courses=$Course->learnningCourse($user['learner_phone']);
    $teachers=$Teacher->index();
    $app=$App->getRand();

    
    
    include('layouts/header.php');
?>
	<!-- Body Start -->
<div class="wrapper">
    <div class="sa4d25">
        <div class="container-fluid">	
            <div class="row">
                
                <div class="col-xl-9 col-lg-8">
                    <div class="section3125">
                        <h4 class="item_title">Featured Courses</h4>
                        <a href="explore.php" class="see150">See all</a>
                        <div class="la5lo1">
                            <div class="owl-carousel featured_courses owl-theme">
                                <?php foreach($feature_courses as $course){ ?>
                                <div class="item">
                                    <div class="fcrse_1 mb-20">
                                        <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="fcrse_img">
                                            <img src="<?php echo $course['web_cover'] ?>"style="" alt="">
                                            <div class="course-overlay">
                                                <div class="badge_seller"><?php echo ucfirst($course['major']) ?></div>
                                                <div class="crse_reviews">
                                                    <i class='uil uil-star'></i> <?php echo $course['rating']; ?>
                                                </div>
                                              
                                                <div class="crse_timer">
                                                    <?php echo $course['lessons_count'] ?> lectures
                                                </div>
                                            </div>
                                        </a>
                                        <div class="fcrse_content">
                                            <div class="vdtodt">
                                                <span class="vdt14"><?php echo $course['duration']; ?> Days</span>
                                            </div>
                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse14s"><?php echo $course['title'];?></a>
                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse-cate"><?php echo ucfirst($course['major']) ." | ". $course['description']; ?></a>
                                            <div class="auth1lnkprce">
                                                <p class="cr1fot">By <a href="instructor_profile.php?teacher_id=<?php echo $course['teacher_id'];?>"><?php echo $course['teacher_name']; ?></a></p>
                                                <div class="prce142"><?php echo $course['fee']." MMK"; ?></div>
                                                <button onclick="window.location.href='vip_plan.php'" class="shrt-cart-btn" title="cart"><i class="uil uil-shopping-cart-alt"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <?php }?>
                            </div>
                        </div>
                    </div>
                    <div class="section3125 mt-30">
                        <h4 class="item_title">Newest Courses</h4>
                        <a href="explore.php" class="see150">See all</a>
                        <div class="la5lo1">
                            <div class="owl-carousel featured_courses owl-theme">
                                <?php foreach($new_courses as $course){ ?>
                                <div class="item">
                                    <div class="fcrse_1 mb-20">
                                        <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="fcrse_img">
                                            <img src="<?php echo $course['web_cover'] ?>"style="" alt="">
                                            <div class="course-overlay">
                                                <div class="badge_seller"><?php echo ucfirst($course['major']) ?></div>
                                                <div class="crse_reviews">
                                                    <i class='uil uil-star'></i> <?php echo $course['rating']; ?>
                                                </div>
                                              
                                                <div class="crse_timer">
                                                    <?php echo $course['lessons_count'] ?> lectures
                                                </div>
                                            </div>
                                        </a>
                                        <div class="fcrse_content">
                                            <div class="vdtodt">
                                                
                                                <span class="vdt14"><?php echo $course['duration']; ?> Days</span>
                                            </div>
                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse14s"><?php echo $course['title'];?></a>
                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse-cate"><?php echo ucfirst($course['major']) ." | ". $course['description']; ?></a>
                                            <div class="auth1lnkprce">
                                                <p class="cr1fot">By <a href="instructor_profile.php?teacher_id=<?php echo $course['teacher_id'];?>"><?php echo $course['teacher_name']; ?></a></p>
                                                <div class="prce142"><?php echo $course['fee']." MMK"; ?></div>
                                                <button onclick="window.location.href='vip_plan.php'" class="shrt-cart-btn" title="cart"><i class="uil uil-shopping-cart-alt"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <?php }?>

                            </div>
                        </div>
                    </div>
                    <div class="section3125 mt-50">
                        <h4 class="item_title">Our Instructors</h4>
                        <a href="all_instructor.php" class="see150">See all</a>
                        <div class="la5lo1">
                            <div class="owl-carousel top_instrutors owl-theme">
                                <?php foreach($teachers as $teacher){ ?>
                                    <div class="item">
                                        <div class="fcrse_1 mb-20">
                                            <div class="tutor_img">
                                                <a href="instructor_profile.php?teacher_id=<?php echo $teacher['id']; ?>"><img src="<?php echo $teacher['profile']; ?>" alt=""></a>												
                                            </div>
                                            <div class="tutor_content_dt">
                                                <div class="tutor150">
                                                    <a href="instructor_profile.php?teacher_id=<?php echo $teacher['id']; ?>" class="tutor_name"><?php echo $teacher['name']; ?></a>
                                                    <div class="mef78" title="Verify">
                                                        <i class="uil uil-check-circle"></i>
                                                    </div>
                                                </div>
                                                <div class="tutor_cate"><?php echo $teacher['rank'];?></div>
                                                <ul class="tutor_social_links">
                                                    <li><a href="<?php echo $teacher['facebook']; ?>" target="_blank" class="fb"><i class="fab fa-facebook-f"></i></a></li>
                                                    <?php if($teacher['telegram']!='null') { ?>
                                                    <li><a href="<?php echo $teacher['telegram']; ?>" target="_blank" class="tw"><i class="fab fa-telegram"></i></a></li>
                                                    <?php } ?>
                                                </ul>
                                                <div class="tut1250">
                                                    <span class="vdt15"><?php echo $Teacher->getNumberOfStudent($teacher['id']); ?> Students</span>
                                                    <span class="vdt15">
                                                        <?php echo $teacher['total_course']; 
                                                            if($teacher['total_course']>1) echo " courses";
                                                            else echo " course";
                                                        ?>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                <?php } ?>
                            </div>
                        </div>
                    </div>	
                </div>

                <div class="col-xl-3 col-lg-4 col-md-12">
                    <div class="right_side">
                      
                        <h4>My Learning</h4>
                        <div class="row">
                            <?php if($my_learning_courses) {?>
                                <?php foreach($my_learning_courses as $course){
                                    $learned_count=$Study->getCount($user['learner_phone'],$course['course_id']);
                                    if($course['lessons_count']==0){
                                        $progress=0;
                                    }else{
                                        $progress=($learned_count/$course['lessons_count'])*100;
                                        $progress=round($progress);
                                    }
                                    
                                    ?>
                                    <div class="col-lg-12 col-12 col-md-6">
                                        <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>">
                                            <div class="fcrse_3" style="background:<?php echo $course['background_color']?>;color:white">
                                                <div style="display:flex;">
                                                    <div style="width:70px;">
                                                        <img src="<?php echo $course['cover_url'] ?>" alt="" style="height:70px;margin-top:20px;margin-left:10px;margin-right:10px;margin-bottom:-10px;">
                                                    </div>

                                                    <div style="flex:1;margin-right:10px;">
                                                        <h6 style="margin-top:15px;overflow:hidden;height:17px;"> <?php echo $course['title']; ?> </h6>
                                                        <?php echo ucfirst($course['major'])  ?>
                                                        <div style="width:100%;background:white;border-radius:3px; padding:2px;margin-top:3px;"> 
                                                            <div style="width:<?php echo $progress?>%;padding: 3px; background:<?php echo $course['background_color'] ?>;text-align:center;border-radius:3px;">
                                                                
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        </a>
                                    </div>
                                    
                                <?php } ?>
                            <?php } ?>
                        </div>
                        
                        <div class="row">
                            <div class="col-lg-12 col-12 col-md-6">
                               <a href="vip_plan.php">
                                    <img class="mb-30" style="width:100%;" src="https://www.calamuseducation.com/uploads/icons/easyenglish_vip.png"/>
                               </a>
                            </div>

                            <div class="col-lg-12 col-12 col-md-6">
                               <a href="vip_plan.php">
                                    <img class="mb-30" style="width:100%;" src="https://www.calamuseducation.com/uploads/icons/easykoreanvipbanner.png"/>
                               </a>
                            </div>
                        </div>
                        
                       
                         
                        <div class="fcrse_3">
                            <div class="cater_ttle">
                                <h4>Use Mobile App</h4>
                            </div>
                            <div><img style="width: 100%" src="<?php echo $app['cover'];?>"/></div>
                            <a href="<?php echo $app['url']; ?>">
                                <div style=" background:#1B2730;padding:10px;display:flex;">
                                    <div>
                                        <img src="<?php echo $app['icon']; ?>" style="width: 40px; height:40px; float:left;margin-right:10px;"/>  
                                    </div>
                                    <div style="flex:1">
                                            <div style="color:white; font-size:12px;"><?php echo $app['name'] ?></div>
                                            <div style="color:#44CB6D; font-size:10px;"> <?php echo $app['description']; ?> </div>
                                    </div>
                                                    
                                    <div style="color:#4B93FF;text-align:center;"> Install</div>
                                </div>
                            </a>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </div>
<?php 
    include('layouts/footer.php');
?>