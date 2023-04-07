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
 
    include('layouts/header.php');
?>
<div class="wrapper">
    <div class="sa4d25">
        <div class="container-fluid">			
            <div class="row">
                <div class="col-xl-12 col-lg-8">
                    <div class="section3125">
                        <div class="explore_search">
                            <div class="ui search focus">
                                <div class="ui left icon input swdh11">
                                    <input class="prompt srch_explore" type="text" placeholder="Search for Tuts Videos, Tutors, Tests and more..">
                                    <i class="uil uil-search-alt icon icon2"></i>
                                </div>
                            </div>
                        </div>							
                    </div>							
                </div>
                <div class="col-md-12">
                    <div class="_14d25">
                        <div class="row">
                            <?php foreach($courses as $course){ ?>
                                <div class="col-lg-4 col-md-4  col-sm-6 col-xs-12">
                                    <div class="fcrse_1 mt-30">
                                        <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="fcrse_img">
                                            <div style=" position: relative; height: 200px;background:<?php echo $course['background_color']; ?>">
                                                <img src="<?php echo $course['cover_url'];?>"style="height:120px; width: 120px; position: absolute;bottom:0; left:50px;" alt="">
                                            </div>

                                            <div class="course-overlay">
                                                <div class="badge_seller">Bestseller</div>
                                                <div class="crse_reviews">
                                                    <i class="uil uil-star"></i><?php echo round($course['rating'],1); ?>
                                                </div>
                                                <span class="play_btn1"><i class="uil uil-play"></i></span>
                                                <div class="crse_timer">
                                                    25 hours
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
                                                <span class="vdt14"><?php echo $course['duration'] ?> Days</span>
                                            </div>
                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse14s"><?php echo $course['title']; ?></a>
                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse-cate"><?php echo ucfirst($course['major'])." | ".$course['description']; ?></a>
                                            <div class="auth1lnkprce">
                                                <p class="cr1fot">By <a href="#"><?php echo $course['teacher_name']; ?></a></p>
                                                <div class="prce142"><?php echo $course['fee']." MMK"; ?></div>
                                                <button class="shrt-cart-btn" title="cart"><i class="uil uil-shopping-cart-alt"></i></button>
                                            </div>
                                        </div>
                                    </div>													
                                </div>
                            <?php }?>

                            <div class="col-md-12">
                                <div class="main-loader mt-50">													
                                    <div class="spinner">
                                        <div class="bounce1"></div>
                                        <div class="bounce2"></div>
                                        <div class="bounce3"></div>
                                    </div>																										
                                </div>
                            </div>
                        </div>				
                    </div>				
                </div>				
            </div>
        </div>
    </div>
<?php 
    include('layouts/footer.php');
?>