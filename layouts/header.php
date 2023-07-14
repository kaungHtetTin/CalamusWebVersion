<?php
include('classes/notification.php');

$Notification=new Notification();

$unreadCount=$Notification->unreadCount($user['learner_phone']);



?>

<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, shrink-to-fit=9">
		<meta name="description" content="Calamus Education">
		<meta name="author" content="Calamus Education">		
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
		<script src="assets/js/jquery-3.3.1.min.js"></script>

	 	<!-- <link href="assets/css/vertical-responsive-menu1.min.css" rel="stylesheet"> -->

			<!-- Stylesheets -->
		
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
			<a href="index.php"><img src="assets/images/calamuslogo.png" alt="" style="height:40px"></a>
			<a href="index.php"><img class="logo-inverse" src="images/ct_logo.svg" alt=""></a>
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
					<a href="my_learning.php" style="padding:10px;" class="subscribe-btn" title="Create New Course">My Learning</a>
				</li>
				<li class="ui dropdown" onclick="fetchNoti()">
					<a href="javascript:void(0)" onclick="fetchNoti()" class="option_links" title="Notifications">
						<i class='uil uil-bell'></i>
						<?php if($unreadCount>0) {?>
						<span id="unread_count" class="noti_count" <?php if($unreadCount>10) echo "style='width:20px;'"?> > <?php echo $unreadCount ?> </span>
						<?php }?>
					</a>
					<div class="menu dropdown_mn" style="height:400px;overflow:auto;" id='notification_container' >
						
					</div>

					<script>
						var noti_container=document.getElementById('notification_container');

						function fetchNoti(){

							noti_container.innerHTML=`
								<div class="col-md-12 channel_my item">
									<div class="main-loader mt-50">													
										<div class="spinner">
											<div class="bounce1"></div>
											<div class="bounce2"></div>
											<div class="bounce3"></div>
										</div>																										
									</div>
								</div>
							`;

							var ajax=new XMLHttpRequest();
							ajax.onload =function(){
								if(ajax.status==200 || ajax.readyState==4){
									var data=JSON.parse(ajax.responseText);
									var notifications=data.notifications;
									var unread=data.unread;
									noti_container.innerHTML="";
									
									$('#unread_count').text(unread);
									for(var i=0;i<notifications.length;i++){
										var notification=notifications[i];
										noti_container.innerHTML+=notificationComponent(notification);
									}
								}
							};
							ajax.open("GET","api/notifications/get.php?user_id=<?php echo $_SESSION['calamus_userid'] ?>",true);
							ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
							ajax.send();
						}

						function notificationComponent(notification){
							 
							var body=notification.body;
							if(body.length>50){
								body=body.substr(0,50)+":";
							}
							var seen="";
							if(notification.seen==0){
								seen="background:#E7F3FF"
							}
							return `
								<a href="discuss_detail.php?post_id=${notification.post_id}&check=${notification.time}" class="channel_my item" style="${seen}" >
									<div class="profile_link">
										<img src="${notification.writer_image}" alt="">
										<div class="pd_content">
											<h6>${notification.writer_name}</h6>
											<p>${notification.takingAction} <strong>${body} </strong>.</p>
											<span class="nm_time">${formatDateTime(notification.time)}</span>
										</div>							
									</div>							
								</a>
							`;
						}

						function formatDateTime(cmtTime){
							var currentTime = Date.now();
							var min=60;
							var h=min*60;
							var day=h*24;

							var diff =currentTime-cmtTime
							diff=diff/1000;
							
							if(diff<day*3){
								if(diff<min){
									return "a few second ago";
								}else if(diff>=min&&diff<h){
									return Math.floor(diff/min)+'min ago';
								}else if(diff>=h&&diff<day){
									return Math.floor(diff/h)+'h ago';
								}else{
									return Math.floor(diff/day)+'d ago';
								}
							}else{
								var date = new Date(Number(cmtTime));
								return date.toLocaleDateString("en-GB");
							}
						}

					</script>

				</li>
				
				<li class="ui dropdown">
					<a href="#" class="card" title="Account" style="padding:2px;border-radius:50%;">
						<img src="<?php echo $user['learner_image']; ?>" style="width: 40px;height: 40px;border-radius:50%" alt="">
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
						<a href="setting.php" class="item channel_item">Setting</a>
						<a href="signout.php" class="item channel_item">Sign Out</a>
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
					<li class="menu--item">
						<a href="my_learning.php" class="menu--link  <?php if($page_title=='My Learning') echo 'active' ?>" title="My Learning">
							<i class='uil uil-book-open menu--icon'></i>
							<span class="menu--label">My Learning</span>
						</a>
					</li>
					<li class="menu--item menu--item__has_sub_menu">
						<label class="menu--link" title="Video Channel">
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

					<li class="menu--item menu--item__has_sub_menu">
						<label class="menu--link <?php if($page_title=='Discussion') echo 'active' ?>" title="Discussion">
							<i class="uil uil-document-layout-left menu--icon"></i>
							<span class="menu--label">Discussion</span>
						</label>
						<ul class="sub_menu">
							<li class="sub_menu--item">
								<a href="discuss.php?mcode=ee&category=english" class="sub_menu--link">Easy English</a>
							</li>
							<li class="sub_menu--item">
								<a href="discuss.php?mcode=ko&category=korea" class="sub_menu--link">Easy Korean</a>
							</li>
						</ul>
					</li>

					<li class="menu--item menu--item__has_sub_menu">
						<label class="menu--link <?php if($page_title=='Lyrics') echo 'active' ?>" title="Lyrics">
							<i class="uil uil-music menu--icon"></i>
							<span class="menu--label">Song with Lyrics</span>
						</label>
						<ul class="sub_menu">
							<li class="sub_menu--item">
								<a href="song.php?mcode=ee&category=english" class="sub_menu--link">English Song</a>
							</li>
							<li class="sub_menu--item">
								<a href="song.php?mcode=ko&category=korea" class="sub_menu--link">Korean Song</a>
							</li>
						</ul>
					</li>

					
				</ul>
			</div>
			
			<div class="left_section">
				<h6 class="left_title">ADMIN  TEAM (Help)</h6>
				<ul>
					<li class="menu--item">
						<a style="padding-top:5px;" href="admin_team.php?team=english" class="menu--link user_img <?php if($page_title=='Admin Team - English') echo 'active' ?>">
							<img src="icon/easyenglish_icon.png" alt="">
							Easy English 
							<div class="alrt_dot"></div>
						</a>
					</li>
					<li class="menu--item">
						<a style="padding-top:5px;" href="admin_team.php?team=korea"  class="menu--link user_img <?php if($page_title=='Admin Team - Korea') echo 'active' ?>">
							<img src="icon/easykorean_icon.png" alt="">
							Easy Korean
						</a>
						<div class="alrt_dot"></div>
					</li>
				</ul>
			</div>
			<div class="left_section pt-2">
				<ul>
					<li class="menu--item">
						<a href="setting.php" class="menu--link" title="Setting">
							<i class='uil uil-cog menu--icon'></i>
							<span class="menu--label">Setting</span>
						</a>
					</li>
					<li class="menu--item">
						<a href="vip_plan.php" class="menu--link" title="Report History">
							<i class='uil-dollar-sign-alt menu--icon'></i>
							<span class="menu--label">Purchase VIP Plan</span>
						</a>
					</li>
					<li class="menu--item">
						<a href="signout.php" class="menu--link" title="Send Feedback">
							<i class='uil-sign-out-alt menu--icon'></i>
							<span class="menu--label">Sign Out</span>
						</a>
					</li>
				</ul>
			</div>
			<div class="left_footer">
				<ul>
					<li><a href="about_us.php">About</a></li>
					<li><a href="contact_us.php">Contact Us</a></li>
					<li><a href="term.php">Terms</a></li>
					<li><a href="privacy.php">Privacy</a></li>
				</ul>
				<div class="left_footer_content">
					<p>© 2023 <strong>Calamuseducation</strong>. All Rights Reserved.</p>
				</div>
			</div>
		</div>
	</nav>
	<!-- Left Sidebar End -->

	<?php if($page_title!='Discussion') {?>
		<script>
			localStorage.setItem("post_arr",null);
			localStorage.setItem("post_page",0);
		</script>
	<?php }?>
