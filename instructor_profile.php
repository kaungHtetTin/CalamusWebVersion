<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/course.php');
    include('classes/teacher.php');
    include ('classes/auth.php');
    $page_title="Instructor Profile";
    

    $Auth=new Auth();
	$user = false;
	if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
    }
    
    $Teacher=new Teacher();
    $teacher_id=$_GET['teacher_id'];
    $profile=$Teacher->detail($teacher_id);
    $courses=$Teacher->courses($teacher_id);
        
    include('layouts/header.php');
?>
	<!-- Body Start -->
<div class="wrapper _bg4586">
		<div class="_216b01">
			<div class="container">			
				<div class="row justify-content-md-center">
					<div class="col-md-10">
						<div class="section3125 rpt145">							
							<div class="row">						
								<div class="col-lg-7">
									 
									<div class="dp_dt150">						
										<div class="img148">
											<img src="<?php echo $profile['profile']; ?>" alt="">										
										</div>
										<div class="prfledt1">
											<h2><?php echo $profile['name']; ?></h2>
											<span><?php  echo $profile['rank']; ?></span>
										</div>	
										<div class="rgt-145 prfledt1">
											<ul class="tutor_social_links">
												<li><a href="<?php echo $profile['facebook']; ?>" target="_blank" class="fb"><i class="fab fa-facebook-f"></i></a></li>
												<?php if($profile['telegram']!='null') { ?>
												<li><a href="<?php echo $profile['telegram']; ?>" target="_blank" class="tw"><i class="fab fa-telegram"></i></a></li>
												<?php } ?>
											</ul>
										</div>
																			
									</div>
									<ul class="_ttl120">
										<li>
											<div class="_ttl121">
												<div class="_ttl122">Students</div>
												<div class="_ttl123"><?php echo $Teacher->getNumberOfStudent($teacher_id); ?></div>
											</div>
										</li>
										<li>
											<div class="_ttl121">
												<div class="_ttl122">Courses</div>
												<div class="_ttl123"><?php echo $profile['total_course']; ?></div>
											</div>
										</li>
									</ul>
								</div>									
							</div>							
						</div>							
					</div>															
				</div>
			</div>
		</div>
		<div class="_215b15">
			<div class="container">
				<div class="row">
					<div class="col-lg-12">						
						<div class="course_tabs">
							<nav>
								<div class="nav nav-tabs tab_crse" id="nav-tab" role="tablist">
									
									<a class="nav-item nav-link active" id="nav-courses-tab" data-toggle="tab" href="#nav-courses" role="tab" aria-selected="false">Courses</a>
									<a class="nav-item nav-link" id="nav-about-tab" data-toggle="tab" href="#nav-about" role="tab" aria-selected="true">About</a>
								</div>
							</nav>						
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="_215b17">
			<div class="container">
				<div class="row">
					<div class="col-lg-12">
						<div class="course_tab_content">
							<div class="tab-content" id="nav-tabContent">
								<div class="tab-pane fade " id="nav-about" role="tabpanel">
									<div class="_htg451">
										<div class="_htg452">
											<h3>About Me</h3>
											<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum scelerisque nibh sed ligula blandit, quis faucibus lorem pellentesque. Suspendisse pulvinar dictum pellentesque. Vestibulum at sagittis lectus, sit amet aliquam turpis. In quis elit tempus, semper justo vitae, lacinia massa. Etiam sagittis quam quis fermentum lacinia. Curabitur blandit sapien et risus congue viverra. Mauris auctor risus sit amet cursus sollicitudin. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla feugiat sodales massa, in viverra dolor condimentum ut. In imperdiet, justo nec volutpat blandit, tellus justo tempor quam, sed pretium nibh nunc nec mauris. Mauris vel malesuada magna. Quisque iaculis molestie purus, non luctus mauris porta id. Maecenas imperdiet tincidunt mauris vestibulum vulputate. Aenean sollicitudin pretium nibh, et sagittis risus tincidunt ac. Phasellus scelerisque rhoncus massa, ac euismod massa pharetra non. Phasellus dignissim, urna in iaculis varius, turpis libero mollis velit, sit amet euismod arcu mi ac nibh. Praesent tincidunt eros at ligula pellentesque elementum. Fusce condimentum enim a tellus egestas, sit amet rutrum elit gravida. Pellentesque in porta sapien. Fusce tristique maximus ipsum et mollis. Sed at massa ac est dapibus vulputate at eu nibh.</p>
										</div>																	
									</div>							
								</div>
								<div class="tab-pane fade show active" id="nav-courses" role="tabpanel">
									<div class="crse_content">
										<h3>My courses (<?php echo $profile['total_course'] ?>)</h3>
										<div class="_14d25">
											<div class="row">
                                                <?php foreach($courses as $course){ ?>
                                                    <div class="col-lg-4 col-md-4  col-sm-6 col-xs-12">
                                                        <div class="fcrse_1 mt-30">
                                                            <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="fcrse_img">
                                                                 <img src="<?php echo $course['web_cover'];?>"style="" alt="">

                                                                <div class="course-overlay">
                                                                    <div class="badge_seller"><?php echo ucfirst($course['major']) ?></div>
                                                                    <div class="crse_reviews">
                                                                        <i class="uil uil-star"></i><?php echo round($course['rating'],1); ?>
                                                                    </div>
                                                                    <span class="play_btn1"><i class="uil uil-play"></i></span>
                                                                    <div class="crse_timer">
                                                                        <?php echo $course['lessons_count']; ?> lectures
                                                                    </div>
                                                                </div>
                                                            </a>
                                                            <div class="fcrse_content">
                                                                
                                                                <div class="vdtodt">
                                                                    
                                                                    <span class="vdt14"><?php echo $course['duration'] ?> Days</span>
                                                                </div>
                                                                <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse14s"><?php echo $course['title']; ?></a>
                                                                <a href="course_detail.php?course_id=<?php echo $course['course_id']; ?>" class="crse-cate"><?php echo ucfirst($course['major'])." | ".$course['description']; ?></a>
                                                                <div class="auth1lnkprce">
                                                                    <p class="cr1fot">By <b><?php echo $course['teacher_name']; ?></b></p>
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