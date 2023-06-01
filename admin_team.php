<?php
    session_start();
    include('classes/connect.php');
    include ('classes/auth.php');

    $team=$_GET['team'];

    if($team=='english'){
        $page_title="Admin Team - English";
        $project="Easy English";
    }else if($team=='korea') {
        $page_title="Admin Team - Korea";
        $project="Easy Korean";
    }

    $Auth=new Auth();
    if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
    }else{
        header('Location:login.php');
    }
 

    include('layouts/header.php');
?>

    <link href="assets/css/vertical-responsive-menu1.min.css" rel="stylesheet">
    <link href="assets/css/instructor-dashboard.css" rel="stylesheet">
    <link href="assets/css/instructor-responsive.css" rel="stylesheet">
    <link href="assets/css/jquery.mCustomScrollbar.min.css" rel="stylesheet">
	<style>
		.user-status-tag {
			display: inline-block;
			height: 20px;
			font-weight: 500;
			font-family: 'Roboto', sans-serif;
			padding: 0 8px;
			border-radius: 3px;
			background-color: #afafaf;
			color: #fff;
			font-size: .75rem;
			font-weight: 700;
			line-height: 20px;
			text-transform: uppercase;
			position: relative;
			margin-bottom: 0;
		}

		.online {
			background-color: #40d04f;
		}

		.image-upload{
			background:rgb(245,245,245);
 
			padding:10px;
			border-radius:50%;
			cursor: pointer;
			margin-right:3px;
		}

		.image-upload:hover{
			color:#555;
			background:rgb(240,240,240);
			
		}

		#preview-img{
			width:100px;
			border-radius:5px;
		}

		.cancel{
			padding:3px;
			border-radius:50%;
			margin-left:3px;
			color:red;
			position:absolute;
			top: 0;
			left:100px;
			cursor: pointer;
			 
		}

		.cancel:hover{
			background:red;
			color:white;
		}

	</style>

	<!-- Body Start -->
	<div class="wrapper">
		<div class="sa4d25">
			<div class="container-fluid">			
				<div class="row">
					<div class="col-lg-12">	
						<h2 class="st_title"><i class="uil uil-comments"></i> Admin Team (<?php echo $project ?>)</h2>
					</div>					
				</div>				
				<div class="row">
					<div class="col-12">
						<div class="all_msg_bg">
							<div class="row no-gutters">
								<div class="col-xl-4 col-lg-5 col-md-5 col-sm-12">					
									<div class="">
										<div class="group_messages">
											<div class="chat__message__dt active" id="teacher">
												<div class="user-status">											
													<div class="user-avatar">
														<img src="icon/teacher.png" alt="">
														<div class="msg__badge" style="width:15px; height:15px;" id="Teacher_red_noti"></div>
													</div>
													<p class="user-status-title"><span class="bold">Teacher</span></p>
													<p class="user-status-text" id="Teacher_conversation_msg">Loading ... </p>
													<p class="user-status-time floaty" id="Teacher_conversation_time">...</p>
												</div>
											</div>
											<div class="chat__message__dt" id="developer">
												<div class="user-status">											
													<div class="user-avatar">
														<img src="icon/developer.png" alt="">
														<div class="msg__badge" style="width:15px; height:15px;" id="Developer_red_noti"></div>
													</div>
													<p class="user-status-title"><span class="bold">Developer</span></p>
													<p class="user-status-text" id="Developer_conversation_msg">Loading ... </p>
													<p class="user-status-time floaty" id="Developer_conversation_time">...</p>
												</div>
											</div>
										</div>
									</div>					
								</div>
								<div class="col-xl-8 col-lg-7 col-md-7 col-sm-12">			
									<div>
										
										<div style="width: 100%;padding: 15px 20px;border-bottom: 1px solid #efefef;">
											<div style="min-height: 44px;padding: 0;position: relative;width: 100%;">											
												<div class="user-avatar">
													<img src="icon/teacher.png" alt="" id="cb_img">
												</div>
												<p class="user-status-title"><span class="bold" id="cb_name">Teacher</span></p>
												<p class="user-status-tag online">Online</p>																								
											</div>
										</div>
									
										<div> 											
											<div style="height:300px;overflow:auto;display:block"  id="chat_box"> 											
			
											</div>
										</div>

										<div class="message-send-area">
											<!-- uploads/chats/IMG_3165.jpeg -->
											<div style="position:relative;">
												<img src="" alt="" id="preview-img">
												<span id="unselect" class="cancel"><i class="uil  uil-minus-circle"></i> </span>
											</div>

											<div class="mf-field">
												<form enctype="multipart/form-data">
													<div class="ui search focus input__msg">
														<div class="ui left icon input swdh19">
															<span class="image-upload" id="select_image"><i style="font-size:15px;color:#444" class="uil uil-image-upload"></i></span>
															<input class="prompt srch_explore" type="text" id="input_msg" placeholder="Write a message...">
														</div>
														<input type="file" id="my_file" style="display: none;" accept="image/*" />
													</div>
												</form>
												
												<button href="javascript:void(0)" class="add_msg" id="btn_send"><i class="uil uil-message"></i></button>
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
 
   <script type="module">

		var user=<?php echo json_encode($user) ?>;
		var userid=user.learner_phone;
		var major="<?php echo $_GET['team'] ?>";
		var team="Teacher";
		let hasImage=false;

		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	
		// Import the functions you need from the SDKs you need
		import { initializeApp} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
  		import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-analytics.js";
		//import { getDatabase, ref, child, get} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
		import { getDatabase, ref, onValue,set, update,onChildAdded, onChildChanged, onChildRemoved,query} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
		// TODO: Add SDKs for Firebase products that you want to use
		// https://firebase.google.com/docs/web/setup#available-libraries

		// Your web app's Firebase configuration
		// For Firebase JS SDK v7.20.0 and later, measurementId is optional
		const firebaseConfig = {
		apiKey: "AIzaSyD9Zx5ni67AUezMblV33AqT68kiaSunYl4",
		authDomain: "learn-room.firebaseapp.com",
		databaseURL: "https://learn-room.firebaseio.com",
		projectId: "learn-room",
		storageBucket: "learn-room.appspot.com",
		messagingSenderId: "940634236446",
		appId: "1:940634236446:web:9dd9264a1fbf4b7c9cb00f",
		measurementId: "G-2NK6X2J0C8",
		databaseURL: "https://learn-room.firebaseio.com/",
		};

		// Initialize Firebase
		const app = initializeApp(firebaseConfig);
		const analytics = getAnalytics(app);
		const database = getDatabase(app);


		const db = getDatabase();
		fetchMessage();

		function fetchConversation(){
			$('#Developer_red_noti').hide();
			$('#Teacher_red_noti').hide();
			const teacherRef=ref(db,`${major}/Teacher/Conservation/${userid}`);
			const developerRef=ref(db,`${major}/Developer/Conservation/${userid}`);
			onValue(teacherRef, (snapshot) => {
				if (snapshot.exists()) {
					let msg=snapshot.val();
					let seen=msg.seen;
					if(seen==2){
						$('#Teacher_conversation_msg').html(`<span style="color:black;font-weight:bold;">${msg.message}</span>`);
						$('#Teacher_red_noti').show();
					}else{
						$('#Teacher_conversation_msg').html(msg.message);
						$('#Teacher_red_noti').hide();
					}
					if(msg.time) $('#Teacher_conversation_time').html(formatDate(msg.time));
					 
				} else {
					$('#Teacher_conversation_msg').html('Ask something about lessons');
				}
			});

			onValue(developerRef, (snapshot) => {
			
				if (snapshot.exists()) {
					let msg=snapshot.val();
					let seen=msg.seen;
					if(seen==2){
						$('#Developer_conversation_msg').html(`<span style="color:black;font-weight:bold;">${msg.message}</span>`);
						$('#Developer_red_noti').show();
					}else{
						$('#Developer_conversation_msg').html(msg.message);
						$('#Developer_red_noti').hide();
					}
					if(msg.time) $('#Developer_conversation_time').html(formatDate(msg.time));
				} else {
					$('#Developer_conversation_msg').html('Ask something about app');
				}
			});
		}
		 
		function fetchMessage(){
			$('#chat_box').html(loadingBounce());
			const dbRef = ref(db, `${major}/${team}/ChatRoom/${userid}`);
			$(`#${team}_red_noti`).hide();
		
			onValue(dbRef, (snapshot) => {
				$('#chat_box').html("");
				if (snapshot.exists()) {
					var messages=snapshot.val();
					Object.keys(messages).forEach(key => {
						var msg=messages[key];
						const senderId=msg.senderId;
						if(senderId===userid){
							$('#chat_box').append(myMessage(msg));
						}else{
							$('#chat_box').append(otherMessage(msg));
						}
						
					});
					scrollToBottom();
				} else {
					$('#chat_box').html(`<div style="margin:50px;text-align:center">No message here</div>`);
				}
			});

			const conservationRef=ref(db,`${major}/${team}/Conservation/${userid}/seen`);
			set(conservationRef,0);
		}

		function scrollToBottom() {
			const element = document.getElementById('chat_box');
			element.scrollTop = element.scrollHeight;

		}


		$(document).ready(function(){
            $('#teacher').click(function(){
                $('#teacher').attr('class','chat__message__dt active');
                $('#developer').attr('class','chat__message__dt');
                $('#cb_img').attr('src','icon/teacher.png');
                $('#cb_name').text('Teacher');
				
				team="Teacher";
				fetchMessage();
            })

            $('#developer').click(()=>{
                $('#developer').attr('class','chat__message__dt active');
                $('#teacher').attr('class','chat__message__dt');
                $('#cb_img').attr('src','icon/developer.png');
                $('#cb_name').text('Developer');
			
				team="Developer";
				fetchMessage();
            })

			$('#btn_send').click(()=>{
				if(hasImage){
					uploadImage();
				}else{
					sendMessage("");
				}
			})

			fetchConversation();

			$('#select_image').click(()=>{
				$('#my_file').click();
			});

			$('#unselect').hide();

			$('#unselect').click(()=>{
				$('#preview-img').attr('src','');
				$('#unselect').hide();
				hasImage=false;
			});

			$('#my_file').change(()=>{
				var files=$('#my_file').prop('files');
				var file=files[0];
				 
				var reader = new FileReader();

				reader.onload = function (e) {
					$('#preview-img').attr('src', e.target.result);
					$('#unselect').show();
					hasImage=true;
				};

				reader.readAsDataURL(file);
				  
			});
        });

		 
		function uploadImage(){
			var files=$('#my_file').prop('files');
			var file=files[0];
			var form_data = new FormData();
                form_data.append('file',file);
				 
				var ajax=new XMLHttpRequest();
                ajax.onload =function(){
                    if(ajax.status==200 || ajax.readyState==4){
                        var response=JSON.parse(ajax.responseText);
						if(response.status=="success"){
							sendMessage(response.image);
							 
						}
                    }
                };
                ajax.open("post",`api/chats/upload-image.php`,true);
				ajax.upload.onprogress = e => {
					if (e.lengthComputable) {
						const percentComplete = (e.loaded / e.total) * 100;
						console.log('percent ',percentComplete);
					}
				};
				ajax.send(form_data);
		}

		function sendMessage(image){
			let msgVal=$('#input_msg').val();
			$('#input_msg').val("");
			let time=Date.now();
			var messageSet={
				imageUrl:image,
				msg:msgVal,
				seen:0,
				senderId:userid,
				time:time
			};
			
			writeUserData(team,messageSet);
		}

		function writeUserData(team,message) {
			const dbRef = ref(db, `${major}/${team}/ChatRoom/${userid}/${message.time}`);
			set(dbRef, message);	
			const conservationRef=ref(db,`${major}/${team}/Conservation/${userid}`) 
			var conserMsg={
				
				imageUrl:user.learner_image,
				list:message.time*(-1),
				message:message.msg,
				seen:0,
				senderId:message.senderId,
				time:message.time+"",
				token:"",
				userId:message.senderId,
				userName:user.learner_name
			}
			if(team=='Teacher'){
				conserMsg.Teacher=1;
			}else{
				conserMsg.Developer=1;
			}

			console.log('conservation message',conserMsg);

			set(conservationRef, conserMsg);
		}

		function loadingBounce(){
			return `
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
		}


		function myMessage(msg){
			return `
				<div class="main-message-box ta-right" style="text-align:right;">
					<div class="message-dt" style="float:right;">
						<div class="message-inner-dt" style="float:right;">
							<p>${msg.msg}</p>
						</div><!--message-inner-dt end-->
						<br>
						<span>${formatDate(msg.time)}</span>
					</div><!--message-dt end-->
				</div><!--main-message-box end-->
			`;
		}

		function otherMessage(msg){
			return `
				<div class="main-message-box st3">
					<div class="message-dt st3">
						<div class="message-inner-dt">
							<p>${msg.msg}</p>
						</div><!--message-inner-dt end-->
						<span>${formatDate(msg.time)}</span>
					</div><!--message-dt end-->
				</div><!--main-message-box end-->
			`;
		}

		function formatDate(time){
			var currentTime = Date.now();
			var min=60;
			var h=min*60;
			var day=h*24;

			var diff =currentTime-time
			diff=diff/1000;

			var date = new Date(Number(time));
			 
			
			if(diff<day){
				if(diff<min){
					return "a few second ago";
				}else if(diff>=min&&diff<h){
					return Math.floor(diff/min)+'min ago';
				}else if(diff>=h&&diff<day){
					return Math.floor(diff/h)+'h ago';
				}else{
					return formatHour(date.getHours(),date.getMinutes());
				}
			}else{
				return `
					${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${formatHour(date.getHours(),date.getMinutes())}
				`;
        	}
		}

		function formatHour(hr,min){
			if(hr>12){
				hr=hr-12;
				if(hr<=9){
					return `0${hr}:${min} PM`;
				}else{
					return `${hr}:${min} PM`;
				}
			}else{
				if(hr<=9){
					return `0${hr}:${min} AM`;
				}else{
					return `${hr}:${min} AM`;
				}
			}
		}

	</script>

 <?php 
    include('layouts/footer.php');
?>