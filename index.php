<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/course.php');
    include('classes/teacher.php');
    include ('classes/auth.php');
    include('classes/app.php');

    $page_title="Home";
    

    $Auth=new Auth();
    $user =$Auth->check_login($_SESSION['calamus_userid']);

    $Course=new Course();
    $Teacher=new Teacher();
    $App=new App();

    $feature_courses=$Course->getFeatureCourses();
    $new_courses=$Course->getNewCourses();
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
                                            <div style=" position: relative; height: 250px;background:<?php echo $course['background_color']; ?>">
                                                <img src="<?php echo $course['cover_url'];?>"style="height:150px; width: 150px; position: absolute;bottom:0; left:70px;" alt="">
                                            </div>
                                            <div class="course-overlay">
                                                <div class="badge_seller">Bestseller</div>
                                                <div class="crse_reviews">
                                                    <i class='uil uil-star'></i> <?php echo $course['rating']; ?>
                                                </div>
                                                <span class="play_btn1"><i class="uil uil-play"></i></span>
                                                <div class="crse_timer">
                                                    25 hours
                                                </div>
                                            </div>
                                        </a>
                                        <div class="fcrse_content">
                                            <div class="eps_dots more_dropdown">
                                                <a href="#"><i class='uil uil-ellipsis-v'></i></a>
                                                <div class="dropdown-content">
                                                    <span><i class='uil uil-share-alt'></i>Share</span>
                                                    <span><i class="uil uil-heart"></i>Save</span>
                                                    <span><i class='uil uil-ban'></i>Not Interested</span>
                                                    <span><i class="uil uil-windsock"></i>Report</span>
                                                    </div>																										
                                            </div>
                                            <div class="vdtodt">
                                                <span class="vdt14">109k views</span>
                                                <span class="vdt14"><?php echo $course['duration']; ?> Days</span>
                                            </div>
                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse14s"><?php echo $course['title'];?></a>
                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse-cate"><?php echo ucfirst($course['major']) ." | ". $course['description']; ?></a>
                                            <div class="auth1lnkprce">
                                                <p class="cr1fot">By <a href="instructor_profile.php?teacher_id=<?php echo $course['teacher_id'];?>"><?php echo $course['teacher_name']; ?></a></p>
                                                <div class="prce142"><?php echo $course['fee']." MMK"; ?></div>
                                                <button class="shrt-cart-btn" title="cart"><i class="uil uil-shopping-cart-alt"></i></button>
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
                                            <div style=" position: relative; height: 250px;background:<?php echo $course['background_color']; ?>">
                                                <img src="<?php echo $course['cover_url'];?>"style="height:150px; width: 150px; position: absolute;bottom:0; left:70px;" alt="">
                                            </div>
                                            <div class="course-overlay">
                                                <div class="badge_seller">Bestseller</div>
                                                <div class="crse_reviews">
                                                    <i class='uil uil-star'></i> <?php echo $course['rating']; ?>
                                                </div>
                                                <span class="play_btn1"><i class="uil uil-play"></i></span>
                                                <div class="crse_timer">
                                                    25 hours
                                                </div>
                                            </div>
                                        </a>
                                        <div class="fcrse_content">
                                            <div class="eps_dots more_dropdown">
                                                <a href="#"><i class='uil uil-ellipsis-v'></i></a>
                                                <div class="dropdown-content">
                                                    <span><i class='uil uil-share-alt'></i>Share</span>
                                                    <span><i class="uil uil-heart"></i>Save</span>
                                                    <span><i class='uil uil-ban'></i>Not Interested</span>
                                                    <span><i class="uil uil-windsock"></i>Report</span>
                                                    </div>																										
                                            </div>
                                            <div class="vdtodt">
                                                <span class="vdt14">109k views</span>
                                                <span class="vdt14"><?php echo $course['duration']; ?> Days</span>
                                            </div>
                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse14s"><?php echo $course['title'];?></a>
                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse-cate"><?php echo ucfirst($course['major']) ." | ". $course['description']; ?></a>
                                            <div class="auth1lnkprce">
                                                <p class="cr1fot">By <a href="instructor_profile.php?teacher_id=<?php echo $course['teacher_id'];?>"><?php echo $course['teacher_name']; ?></a></p>
                                                <div class="prce142"><?php echo $course['fee']." MMK"; ?></div>
                                                <button class="shrt-cart-btn" title="cart"><i class="uil uil-shopping-cart-alt"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <?php }?>

                            </div>
                        </div>
                    </div>
                    <div class="section3126">
                        <div class="row">
                            <div class="col-xl-6 col-lg-12 col-md-6">
                                <div class="value_props">
                                    <div class="value_icon">
                                        <i class='uil uil-history'></i>
                                    </div>
                                    <div class="value_content">
                                        <h4>Go at your own pace</h4>
                                        <p>Enjoy lifetime access to courses on Edututs+'s website</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-xl-6 col-lg-12 col-md-6">
                                <div class="value_props">
                                    <div class="value_icon">
                                        <i class='uil uil-user-check'></i>
                                    </div>
                                    <div class="value_content">
                                        <h4>Learn from industry experts</h4>
                                        <p>Select from top instructors around the world</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-xl-6 col-lg-12 col-md-6">
                                <div class="value_props">
                                    <div class="value_icon">
                                        <i class='uil uil-play-circle'></i>
                                    </div>
                                    <div class="value_content">
                                        <h4>Find video courses on almost any topic</h4>
                                        <p>Build your library for your career and personal growth</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-xl-6 col-lg-12 col-md-6">
                                <div class="value_props">
                                    <div class="value_icon">
                                        <i class='uil uil-presentation-play'></i>
                                    </div>
                                    <div class="value_content">
                                        <h4>100,000 online courses</h4>
                                        <p>Explore a variety of fresh topics</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="section3125 mt-50">
                        <h4 class="item_title">Popular Instructors</h4>
                        <a href="all_instructor.html" class="see150">See all</a>
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
                <div class="col-xl-3 col-lg-4">
                    <div class="right_side">

                        <img class="mb-30" style="width:100%;" src="https://www.calamuseducation.com/uploads/icons/easyenglish_vip.png"/>
                        <img class="mb-30" style="width:100%;" src="https://www.calamuseducation.com/uploads/icons/easykoreanvipbanner.png"/>
                         
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