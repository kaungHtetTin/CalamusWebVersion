<?php 
    session_start();
  
    include('classes/connect.php');
  
    include('classes/lesson.php');
    include ('classes/auth.php');
    include('classes/app.php');
    include('classes/lesson_category.php');

    $page_title="Video Channel";
    
    $course_id=1;
    $user_id=$_SESSION['calamus_userid'];

    $channel=$_GET['channel'];
    $app_id=$_GET['app'];
     

    $Auth=new Auth();
    $user =$Auth->check_login($user_id);
   
   
    $App=new App();
    $LessonCategory=new LessonCategory();

    $app=$App->detail($app_id);
    $videoChannels=$LessonCategory->getVideoChannel($channel);

    $Lesson=new Lesson();
    
    include('layouts/header.php');
?>
 
<div class="wrapper _bg4586">
    <div class="_215b15 _byt1458">
        <div class="container-fluid">
            <div class="row">
                <div class="col-lg-12">
                    <div class="user_dt5">
                        <div class="user_dt_left">
                            <div class="live_user_dt">
                                <div  style="border-radius:50%">
                                     <img style="width: 150px;height: 150px;"  src="<?php echo $app['icon']; ?>" alt=""> 											
                                </div>
                                <div class="user_cntnt">
                                    <br>
                                    <div class="_df7852"><?php echo $app['name']; ?></div>
                                    <p><?php echo $app['description']; ?></d>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="course_tabs">
                        <nav>
                            <div class="nav nav-tabs tab_crse justify-content-center" id="nav-tab" role="tablist">
                                <?php foreach($videoChannels as $key=>$channel){ ?>
                                    <a class="nav-item nav-link <?php if($key==0) echo 'active'; ?> " id="bar_<?php echo $channel['category'];?>" data-toggle="tab" href="#<?php echo $channel['category'];?>" role="tab" aria-selected="true"><?php echo $channel['category_title']; ?></a>
                                <?php }?>
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
                            <?php foreach($videoChannels as $key=>$channel){ 
                                    $lessons=$Lesson->getLessonByCategory($channel['id']);
                                ?>
                                
                                <div class="tab-pane fade <?php if($key==0) echo 'show active'; ?>" id="<?php echo $channel['category'];?>" role="tabpanel">

                                    <div class="row">
                                        <?php foreach($lessons as $index=>$lesson) {?>
                                            <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
                                                <a href="watch_video.php?index=<?php echo $index?>&channel_id=<?php echo $channel['id']; ?>&channel=<?php echo $app['name']; ?>" class="fcrse_img">
                                                    <img src="<?php echo $lesson['thumbnail'];?>" alt="">
                                                    <div class="course-overlay">
                                                        <span  class="play_btn1"><i class="uil uil-play"></i></span>
                                                        <div class="crse_timer">
                                                            <?php echo $Lesson->formatVideoDuration($lesson['duration'])?>
                                                        </div>
                                                    </div>
                                                </a>
                                                <div class="fcrse_content">
                                                    <div class="eps_dots more_dropdown">
                                                        <a href="#"><i class="uil uil-ellipsis-v"></i></a>
                                                        <div class="dropdown-content">
                                                            <span><i class='uil uil-share-alt'></i>Share</span>
                                                            <span><i class="uil uil-heart"></i>Save</span>
                                                            <span><i class='uil uil-ban'></i>Not Interested</span>
                                                            <span><i class="uil uil-windsock"></i>Report</span>
                                                        </div>																											
                                                    </div>
                                                    <div class="vdtodt">
                                                        <span class="vdt14">109k views</span>
                                            
                                                    </div>
                                                    <a href="" class="crse14s"><?php echo $lesson['lesson_title']; ?></a>
                                                    <a href="" class="crse-cate"><?php echo $channel['category_title'] ?></a>
                                                
                                                </div>
                                            </div>
                                        <?php }?>
                                    </div>
                                </div>
                            <?php }?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

  
    <script>
        function channelClick(channel){

        }
    </script>
<?php 
    include('layouts/footer.php');
?>

