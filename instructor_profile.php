<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/course.php');
    include('classes/teacher.php');
    include ('classes/auth.php');
    $page_title="Instructor Profile";
    

    $Auth=new Auth();
    $user =$Auth->check_login($_SESSION['calamus_userid']);

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
									<a href="#" class="_216b22">										
										<span><i class="uil uil-windsock"></i></span>Report Profile
									</a>
									<div class="dp_dt150">						
										<div class="img148">
											<img src="<?php echo $profile['profile']; ?>" alt="">										
										</div>
										<div class="prfledt1">
											<h2><?php echo $profile['name']; ?></h2>
											<span><?php  echo $profile['rank']; ?></span>
										</div>										
									</div>
									<ul class="_ttl120">
										<li>
											<div class="_ttl121">
												<div class="_ttl122">Enroll Students</div>
												<div class="_ttl123"><?php echo $Teacher->getNumberOfStudent($teacher_id); ?></div>
											</div>
										</li>
										<li>
											<div class="_ttl121">
												<div class="_ttl122">Courses</div>
												<div class="_ttl123"><?php echo $profile['total_course']; ?></div>
											</div>
										</li>
										<li>
											<div class="_ttl121">
												<div class="_ttl122">Reviews</div>
												<div class="_ttl123">115K</div>
											</div>
										</li>
										<li>
											<div class="_ttl121">
												<div class="_ttl122">Subscribers</div>
												<div class="_ttl123">452K</div>
											</div>
										</li>
									</ul>
								</div>
								<div class="col-lg-5">
									<a href="#" class="_216b12">										
										<span><i class="uil uil-windsock"></i></span>Report Profile
									</a>
									<div class="rgt-145">
										<ul class="tutor_social_links">
											<li><a href="#" class="fb"><i class="fab fa-facebook-f"></i></a></li>
											<li><a href="#" class="tw"><i class="fab fa-twitter"></i></a></li>
											<li><a href="#" class="ln"><i class="fab fa-linkedin-in"></i></a></li>
											<li><a href="#" class="yu"><i class="fab fa-youtube"></i></a></li>
										</ul>
									</div>
									<ul class="_bty149">
										<li><button class="subscribe-btn btn500">Subscribe</button></li>								
										<li><button class="msg125 btn500">Message</button></li>								
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
									<a class="nav-item nav-link active" id="nav-about-tab" data-toggle="tab" href="#nav-about" role="tab" aria-selected="true">About</a>
									<a class="nav-item nav-link" id="nav-courses-tab" data-toggle="tab" href="#nav-courses" role="tab" aria-selected="false">Courses</a>
									<a class="nav-item nav-link" id="nav-reviews-tab" data-toggle="tab" href="#nav-reviews" role="tab" aria-selected="false">Discussion</a>
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
								<div class="tab-pane fade show active" id="nav-about" role="tabpanel">
									<div class="_htg451">
										<div class="_htg452">
											<h3>About Me</h3>
											<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum scelerisque nibh sed ligula blandit, quis faucibus lorem pellentesque. Suspendisse pulvinar dictum pellentesque. Vestibulum at sagittis lectus, sit amet aliquam turpis. In quis elit tempus, semper justo vitae, lacinia massa. Etiam sagittis quam quis fermentum lacinia. Curabitur blandit sapien et risus congue viverra. Mauris auctor risus sit amet cursus sollicitudin. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla feugiat sodales massa, in viverra dolor condimentum ut. In imperdiet, justo nec volutpat blandit, tellus justo tempor quam, sed pretium nibh nunc nec mauris. Mauris vel malesuada magna. Quisque iaculis molestie purus, non luctus mauris porta id. Maecenas imperdiet tincidunt mauris vestibulum vulputate. Aenean sollicitudin pretium nibh, et sagittis risus tincidunt ac. Phasellus scelerisque rhoncus massa, ac euismod massa pharetra non. Phasellus dignissim, urna in iaculis varius, turpis libero mollis velit, sit amet euismod arcu mi ac nibh. Praesent tincidunt eros at ligula pellentesque elementum. Fusce condimentum enim a tellus egestas, sit amet rutrum elit gravida. Pellentesque in porta sapien. Fusce tristique maximus ipsum et mollis. Sed at massa ac est dapibus vulputate at eu nibh.</p>
										</div>																	
									</div>							
								</div>
								<div class="tab-pane fade" id="nav-courses" role="tabpanel">
									<div class="crse_content">
										<h3>My courses (<?php echo $profile['total_course'] ?>)</h3>
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
											</div>		
										</div>		
									</div>
								</div>
								<div class="tab-pane fade" id="nav-reviews" role="tabpanel">
									<div class="student_reviews">
										<div class="row">
											<div class="col-lg-12">
												<div class="review_right">
													<div class="review_right_heading">
														<h3>Discussions</h3>
													</div>
												</div>
												<div class="cmmnt_1526">
													<div class="cmnt_group">
														<div class="img160">
															<img src="images/left-imgs/img-1.jpg" alt="">										
														</div>
														<textarea class="_cmnt001" placeholder="Add a public comment"></textarea>
													</div>
													<button class="cmnt-btn" type="submit">Comment</button>
												</div>
												<div class="review_all120">
													<div class="review_item">
														<div class="review_usr_dt">
															<img src="images/left-imgs/img-1.jpg" alt="">
															<div class="rv1458">
																<h4 class="tutor_name1">John Doe</h4>
																<span class="time_145">2 hour ago</span>
															</div>
															<div class="eps_dots more_dropdown">
																<a href="#"><i class="uil uil-ellipsis-v"></i></a>
																<div class="dropdown-content">
																	<span><i class='uil uil-comment-alt-edit'></i>Edit</span>
																	<span><i class='uil uil-trash-alt'></i>Delete</span>
																</div>																											
															</div>
														</div>
														<p class="rvds10">Nam gravida elit a velit rutrum, eget dapibus ex elementum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce lacinia, nunc sit amet tincidunt venenatis.</p>
														<div class="rpt101">
															<a href="#" class="report155"><i class='uil uil-thumbs-up'></i> 10</a>
															<a href="#" class="report155"><i class='uil uil-thumbs-down'></i> 1</a>
															<a href="#" class="report155"><i class='uil uil-heart'></i></a>
															<a href="#" class="report155 ml-3">Reply</a>
														</div>
													</div>
													<div class="review_reply">
														<div class="review_item">
															<div class="review_usr_dt">
																<img src="images/left-imgs/img-3.jpg" alt="">
																<div class="rv1458">
																	<h4 class="tutor_name1">Rock Doe</h4>
																	<span class="time_145">1 hour ago</span>
																</div>
																<div class="eps_dots more_dropdown">
																	<a href="#"><i class="uil uil-ellipsis-v"></i></a>
																	<div class="dropdown-content">
																		<span><i class='uil uil-trash-alt'></i>Delete</span>
																	</div>																											
																</div>
															</div>
															<p class="rvds10">Fusce lacinia, nunc sit amet tincidunt venenatis.</p>
															<div class="rpt101">
																<a href="#" class="report155"><i class='uil uil-thumbs-up'></i> 4</a>
																<a href="#" class="report155"><i class='uil uil-thumbs-down'></i> 2</a>
																<a href="#" class="report155"><i class='uil uil-heart'></i></a>
																<a href="#" class="report155 ml-3">Reply</a>
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
			</div>
		</div>
<?php 
    include('layouts/footer.php');
?>