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
		
	</head>

<body>
	<!-- Header Start -->
	<header class="header clearfix">
		<button type="button" id="toggleMenu" class="toggle_menu">
		  <i class='uil uil-bars'></i>
		</button>
		<button id="collapse_menu" class="collapse_menu">
			<i class="uil uil-bars collapse_menu--icon "></i>
			<span class="collapse_menu--label"></span>
		</button>
		<div class="main_logo" id="logo">
			<a href="index.html"><img src="assets/images/calamuslogo.png" alt="" style="height:40px"></a>
			<a href="index.html"><img class="logo-inverse" src="images/ct_logo.svg" alt=""></a>
		</div>
		<div class="top-category">
			<div class="ui compact menu cate-dpdwn">
				<div class="ui simple dropdown item">
					<a href="#" class="option_links p-0" title="categories"><i class="uil uil-apps"></i></a>
					<div class="menu dropdown_category5">
						<a href="#" class="item channel_item">English Language</a>
						<a href="#" class="item channel_item">Korean Language</a>
					</div>
				</div>
			</div>
		</div>
		<div class="search120">
			<div class="ui search">
			  <div class="ui left icon input swdh10">
				<input class="prompt srch10" type="text" placeholder="Search for Tuts Videos, Tutors, Tests and more..">
				<i class='uil uil-search-alt icon icon1'></i>
			  </div>
			</div>
		</div>
		<div class="header_right">
			<ul>
				<li>
					<a href="shopping_cart.html" class="option_links" title="cart"><i class='uil uil-shopping-cart-alt'></i><span class="noti_count">2</span></a>
				</li>
				<li class="ui dropdown">
					<a href="#" class="option_links" title="Messages"><i class='uil uil-envelope-alt'></i><span class="noti_count">3</span></a>
					<div class="menu dropdown_ms">
						<a href="#" class="channel_my item">
							<div class="profile_link">
								<img src="images/left-imgs/img-6.jpg" alt="">
								<div class="pd_content">
									<h6>Zoena Singh</h6>
									<p>Hi! Sir, How are you. I ask you one thing please explain it this video price.</p>
									<span class="nm_time">2 min ago</span>
								</div>							
							</div>							
						</a>
						<a href="#" class="channel_my item">
							<div class="profile_link">
								<img src="assets/images/left-imgs/img-5.jpg" alt="">
								<div class="pd_content">
									<h6>Joy Dua</h6>
									<p>Hello, I paid you video tutorial but did not play error 404.</p>
									<span class="nm_time">10 min ago</span>
								</div>							
							</div>							
						</a>
						<a href="#" class="channel_my item">
							<div class="profile_link">
								<img src="images/left-imgs/img-8.jpg" alt="">
								<div class="pd_content">
									<h6>Jass</h6>
									<p>Thanks Sir, Such a nice video.</p>
									<span class="nm_time">25 min ago</span>
								</div>							
							</div>							
						</a>
						<a class="vbm_btn" href="instructor_messages.html">View All <i class='uil uil-arrow-right'></i></a>
					</div>
				</li>

				

				<li class="ui dropdown">
					<a href="#" class="option_links" title="Notifications"><i class='uil uil-bell'></i><span class="noti_count">3</span></a>
					<div class="menu dropdown_mn">
						<a href="#" class="channel_my item">
							<div class="profile_link">
								<img src="images/left-imgs/img-1.jpg" alt="">
								<div class="pd_content">
									<h6>Rock William</h6>
									<p>Like Your Comment On Video <strong>How to create sidebar menu</strong>.</p>
									<span class="nm_time">2 min ago</span>
								</div>							
							</div>							
						</a>
						<a href="#" class="channel_my item">
							<div class="profile_link">
								<img src="images/left-imgs/img-2.jpg" alt="">
								<div class="pd_content">
									<h6>Jassica Smith</h6>
									<p>Added New Review In Video <strong>Full Stack PHP Developer</strong>.</p>
									<span class="nm_time">12 min ago</span>
								</div>							
							</div>							
						</a>
						<a href="#" class="channel_my item">
							<div class="profile_link">
								<img src="images/left-imgs/img-9.jpg" alt="">
								<div class="pd_content">
									<p> Your Membership Approved <strong>Upload Video</strong>.</p>
									<span class="nm_time">20 min ago</span>
								</div>							
							</div>							
						</a>
						<a class="vbm_btn" href="instructor_notifications.html">View All <i class='uil uil-arrow-right'></i></a>
					</div>
				</li>
				
				<li class="ui dropdown">
					<a href="#" class="opts_account" title="Account">
						<img src="<?php echo $user['learner_image']; ?>" style="width: 40px;height: 40px;" alt="">
					</a>
					<div class="menu dropdown_account">
						<div class="channel_my">
							<div class="profile_link">
								<img src="<?php echo $user['learner_image']; ?>" alt="">
								<div class="pd_content">
									<div class="rhte85">
										<h6><?php echo $user['learner_name']; ?></h6>
										<div class="mef78" title="Verify">
											<i class='uil uil-check-circle'></i>
										</div>
									</div>
									<span> <?php echo $user['learner_email']; ?></span>
								</div>							
							</div>
							<a href="my_instructor_profile_view.html" class="dp_link_12">View Profile</a>						
						</div>
						<div class="night_mode_switch__btn">
							<a href="#" id="night-mode" class="btn-night-mode">
								<i class="uil uil-moon"></i> Night mode
								<span class="btn-night-mode-switch">
									<span class="uk-switch-button"></span>
								</span>
							</a>
						</div>
						<a href="setting.html" class="item channel_item">Setting</a>
						<a href="help.html" class="item channel_item">Help</a>
						<a href="feedback.html" class="item channel_item">Send Feedback</a>
						<a href="sign_in.html" class="item channel_item">Sign Out</a>
					</div>
				</li>
			</ul>
		</div>
	</header>
	<!-- Header End -->
	<!-- Left Sidebar Start -->
	<nav class="vertical_nav">
		<div class="left_section menu_left" id="js-menu" >
			<div class="left_section">
				<ul>
					<li class="menu--item">
						<a href="index.php" class="menu--link  <?php if($page_title=='Home') echo 'active' ?>" title="Home">
							<i class='uil uil-home-alt menu--icon'></i>
							<span class="menu--label">Home</span>
						</a>
					</li>

					<li class="menu--item">
						<a href="explore.php" class="menu--link  <?php if($page_title=='Explore') echo 'active' ?>" title="Explore">
							<i class='uil uil-search menu--icon'></i>
							<span class="menu--label">Explore</span>
						</a>
					</li>
					<li class="menu--item menu--item__has_sub_menu">
						<label class="menu--link" title="Categories">
							<i class='uil uil-play-circle menu--icon'></i>
							<span class="menu--label">Video Channels</span>
						</label>
						<ul class="sub_menu">
							<li class="sub_menu--item">
								<a href="video_channel.php?channel=english&app=2" class="sub_menu--link">English Language</a>
							</li>
							<li class="sub_menu--item">
								<a href="video_channel.php?channel=korea&app=1" class="sub_menu--link">Korean Language</a>
							</li>
						</ul>
					</li>

					<li class="menu--item">
						<a href="saved_courses.html" class="menu--link" title="Saved Courses">
						  <i class="uil uil-heart-alt menu--icon"></i>
						  <span class="menu--label">Saved Courses</span>
						</a>
					</li>

				</ul>
			</div>
			<div class="left_section">
				<h6 class="left_title">ADMIN  TEAM</h6>
				<ul>
					<li class="menu--item">
						<a href="instructor_profile_view.html" class="menu--link user_img">
							<img src="images/left-imgs/img-1.jpg" alt="">
							Teacher 
							<div class="alrt_dot"></div>
						</a>
					</li>
					<li class="menu--item">
						<a href="instructor_profile_view.html" class="menu--link user_img">
							<img src="images/left-imgs/img-2.jpg" alt="">
							Developer
						</a>
						<div class="alrt_dot"></div>
					</li>
				</ul>
			</div>
			<div class="left_section pt-2">
				<ul>
					<li class="menu--item">
						<a href="setting.html" class="menu--link" title="Setting">
							<i class='uil uil-cog menu--icon'></i>
							<span class="menu--label">Setting</span>
						</a>
					</li>
					<li class="menu--item">
						<a href="help.html" class="menu--link" title="Help">
							<i class='uil uil-question-circle menu--icon'></i>
							<span class="menu--label">Help</span>
						</a>
					</li>
					<li class="menu--item">
						<a href="report_history.html" class="menu--link" title="Report History">
							<i class='uil uil-windsock menu--icon'></i>
							<span class="menu--label">Report History</span>
						</a>
					</li>
					<li class="menu--item">
						<a href="feedback.html" class="menu--link" title="Send Feedback">
							<i class='uil uil-comment-alt-exclamation menu--icon'></i>
							<span class="menu--label">Send Feedback</span>
						</a>
					</li>
				</ul>
			</div>
			<div class="left_footer">
				<ul>
					<li><a href="about_us.html">About</a></li>
					<li><a href="press.html">Press</a></li>
					<li><a href="contact_us.html">Contact Us</a></li>
					<li><a href="coming_soon.html">Advertise</a></li>
					<li><a href="coming_soon.html">Developers</a></li>
					<li><a href="terms_of_use.html">Copyright</a></li>
					<li><a href="terms_of_use.html">Privacy Policy</a></li>
					<li><a href="terms_of_use.html">Terms</a></li>
				</ul>
				<div class="left_footer_content">
					<p>© 2023 <strong>Calamuseducation</strong>. All Rights Reserved.</p>
				</div>
			</div>
		</div>
	</nav>
	<!-- Left Sidebar End -->
