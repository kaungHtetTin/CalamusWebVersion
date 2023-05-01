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
                <div class="col-lg-12">	
                    <h2 class="st_title"><i class="uil uil-bell"></i> Notifications</h2>
                </div>					
            </div>		

            <div class="row">
                <div class="col-xl-9 col-lg-8">
                    <div class="all_msg_bg">
                        <div class="channel_my item all__noti5">
                            <div class="profile_link">
                                <img src="images/left-imgs/img-1.jpg" alt="">
                                <div class="pd_content">
                                    <h6>Rock William</h6>
                                    <p class="noti__text5">Like Your Comment On Video <strong>How to create sidebar menu</strong>.</p>
                                    <span class="nm_time">2 min ago</span>
                                </div>							
                            </div>							
                        </div>
                        <div class="channel_my item all__noti5">
                            <div class="profile_link">
                                <img src="images/left-imgs/img-2.jpg" alt="">
                                <div class="pd_content">
                                    <h6>Jassica Smith</h6>
                                    <p class="noti__text5">Added New Review In Video <strong>Full Stack PHP Developer</strong>.</p>
                                    <span class="nm_time">12 min ago</span>
                                </div>							
                            </div>							
                        </div>
                        <div class="channel_my item all__noti5">
                            <div class="profile_link">
                                <img src="images/left-imgs/img-9.jpg" alt="">
                                <div class="pd_content">
                                    <p class="noti__text5"> Your Membership Activated.</p>
                                    <span class="nm_time">20 min ago</span>
                                </div>							
                            </div>							
                        </div>
                        <div class="channel_my item all__noti5">
                            <div class="profile_link">
                                <img src="images/left-imgs/img-9.jpg" alt="">
                                <div class="pd_content">
                                    <p class="noti__text5"> Your Course Approved Now. <a href="#" class="crse_bl">How to create sidebar menu</a>.</p>
                                    <span class="nm_time">20 min ago</span>
                                </div>							
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