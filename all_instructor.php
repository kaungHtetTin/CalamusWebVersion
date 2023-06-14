<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/course.php');
    include('classes/teacher.php');
    include ('classes/auth.php');
    $page_title="Explore";
    

    $Auth=new Auth();
    $user =$Auth->check_login($_SESSION['calamus_userid']);

    $Course=new Course();
    $Teacher=new Teacher();
    $courses=$Course->get();

    $teachers=$Teacher->index();
 
    include('layouts/header.php');
?>
<div class="wrapper">
    <div class="sa4d25">
        <div class="container-fluid">			
            <div class="row">
                <div class="col-md-12">
                    <div class="_14d25">
                        <div class="row">
                            <?php foreach($teachers as $teacher){ ?>
                                <div class="col-xl-3 col-lg-4 col-md-6">
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
        </div>
    </div>
 

<?php 
    include('layouts/footer.php');
?>

