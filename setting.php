<?php
    session_start();
    include('classes/connect.php');
    include ('classes/auth.php');
    $page_title="Setting";

    $Auth=new Auth();
    if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
    }else{
        header('Location:login.php');
    }
 

    include('layouts/header.php');
?>

    <link href="assets/css/jquery.mCustomScrollbar.min.css" rel="stylesheet">
 

	<!-- Body Start -->
	<div class="wrapper">
		<div class="sa4d25">
			<div class="container-fluid">			
                <div class="row">
					<div class="col-lg-12">
						<h2 class="st_title"><i class='uil uil-cog'></i> Setting</h2>
						<div class="setting_tabs">
							<ul class="nav nav-pills mb-4" id="pills-tab" role="tablist">
								<li class="nav-item">
									<a class="nav-link active" id="pills-account-tab" data-toggle="pill" href="#pills-account" role="tab" aria-selected="true">Account</a>
								</li>
								<li class="nav-item">
									<a class="nav-link" id="pills-notification-tab" data-toggle="pill" href="#pills-notification" role="tab" aria-selected="false">Password Reset</a>
								</li>
								<!-- <li class="nav-item">
									<a class="nav-link" id="pills-privacy-tab" data-toggle="pill" href="#pills-privacy" role="tab" aria-selected="false">Blocked</a>
								</li> -->
								 
							</ul>
						</div>
						<div class="tab-content" id="pills-tabContent">
							<div class="tab-pane fade show active" id="pills-account" role="tabpanel" aria-labelledby="pills-account-tab">
								<div class="account_setting">
									 
									<div class="basic_profile">
										<div class="basic_ptitle">
											<h4>Basic Profile</h4>
											<p>Add information about yourself</p>
										</div>
										<br><br>
										<div class="basic_form">
											<div class="row">
												<div class="col-lg-8">
													<div class="row">
														<div class="col-lg-12">
															<a href="javascript:void(0)" class="card" title="Account" style="float:left;cursor:pointer;padding:3px;border-radius:50%">
																<img src="<?php echo $user['learner_image']; ?>" style="width: 120px;height: 120px; border-radius:50%" alt="" id="img_profile">
															
															</a>
															<i id="pick_profile" class='uil uil-camera' style="font-size:30px;position:absolute;bottom:0;cursor:pointer"></i>
															<form enctype="multipart/form-data">
																<input type="file" id="input_profile" style="display: none;" accept="image/*" />
															</form>
														</div>
														
														<div class="col-lg-12">
															<div class="ui search focus mt-30">
																<h6>Name</h6> <span  style="color:red;float-right;" id="name_required">Required *</span>
																<div class="ui left icon input swdh11 swdh19">
																	<input class="prompt srch_explore" type="text" value="<?php echo $user['learner_name'] ?>" id="input_name" required="" maxlength="64" placeholder="Enter your name">															
																</div>
															</div>
														</div>
														<div class="col-lg-12">
															<div class="ui search focus mt-30">
																<h6>Email</h6> 
																<div class="ui left icon input swdh11 swdh19">
																	<input class="prompt srch_explore" type="text" value="<?php echo $user['learner_email'] ?>" id="input_email" required="" maxlength="64" placeholder="Enter your name">															
																</div>
															</div>
														</div>
														<div class="col-lg-12 mt-30">
															<h6>Gender</h6>
															<div class="ui fluid search selection dropdown focus  cntry152">
																
																<input type="hidden" name="gender" class="prompt srch_explore" id="selector_gender">
																<i class="dropdown icon"></i>
																	<div class="default text"><?php echo $user['gender'] ?></div>
																	<div class="menu">
																	<div class="item" data-value="Male"></i>Male</div>
																	<div class="item" data-value="Female"></i>Female</div>
																</div>
															</div>
														</div>

														<div class="col-lg-12 mt-30"><h6>Birthday</h6></div>
														<div class="col-lg-4 col-4 col-md-4">
															Day
															<div class="ui fluid search selection dropdown focus  cntry152">
																
																<input type="hidden" name="gender" class="prompt srch_explore" id="selector_day">
																<i class="dropdown icon"></i>
																<div class="default text"><?php echo $user['bd_day']; ?></div>
																<div class="menu" id="day_container">
																	 
																</div>
															</div>
														</div>

														<div class="col-lg-4 col-4 col-md-4">
															Month
															<div class="ui fluid search selection dropdown focus  cntry152">
																
																<input type="hidden" name="gender" class="prompt srch_explore" id="selector_month">
																<i class="dropdown icon"></i>
																<div class="default text"><?php echo $user['bd_month']; ?></div>
																<div class="menu" id="month_container">
																	
																</div>
															</div>
														</div>

														<div class="col-lg-4 col-4 col-md-4">
															Year
															<div class="ui fluid search selection dropdown focus  cntry152">
																<input type="hidden" name="gender" class="prompt srch_explore" id="selector_year">
																<i class="dropdown icon"></i>
																<div class="default text"><?php echo $user['bd_year']; ?></div>
																<div class="menu" id="year_container">
																	 
																</div>
															</div>
														</div>

														<div class="col-lg-12">
															<div class="ui search focus mt-30">
																<h6>Education</h6>
																<div class="ui left icon input swdh11 swdh19">
																	<input class="prompt srch_explore" type="text" value="<?php echo $user['education'] ?>" id="input_education" required="" placeholder="Education">															
																</div>
															</div>
														</div>

														<div class="col-lg-12">
															<div class="ui search focus mt-30">
																<h6>Work</h6>
																<div class="ui left icon input swdh11 swdh19">
																	<input class="prompt srch_explore" type="text" value="<?php echo $user['work'] ?>" id="input_work" required="" placeholder="Education">															
																</div>
															</div>
														</div>

														<div class="col-lg-12">
															<div class="ui search focus mt-30">
																<h6>Address</h6>
																<div class="ui left icon input swdh11 swdh19">
																	<input class="prompt srch_explore" type="text" value="<?php echo $user['region'] ?>" id="input_region" required="" placeholder="Education">															
																</div>
															</div>
														</div>
														
							
													</div>
												</div>
											</div>
										</div>
									</div>
									<div style="display:flex;">
										<button class="save_btn" id="bt_save_profile">Save Changes</button> 
										<div style="position:absolute;bottom:30px;left:180px;" id="profile_uploading">
											<div class="spinner">
												<div class="bounce1"></div>
												<div class="bounce2"></div>
												<div class="bounce3"></div>
											</div>	
										</div>
										<div style="position:absolute;bottom:30px;left:180px; color:red" id="profile_upload_error">
											This is error
										</div>

										<div id="profile_finish" style="position:absolute;bottom:20px;left:180px; color:green;font-size:35px;">
											<i class='uil uil-check-circle'></i>
										</div>

									</div>
									
								</div>
							</div>
							<div class="tab-pane fade" id="pills-notification" role="tabpanel" aria-labelledby="pills-notification-tab">
								<div class="account_setting">
									<div class="basic_profile">
										<div class="basic_ptitle">
											<h4>Password Reset</h4>
											<p>Reset your password here</p>
										</div>
										<div class="basic_form">
											<div class="row">
												<div class="col-lg-8">
													<div class="row">
														<div class="col-lg-12">
															<div class="ui search focus mt-30">
																<h6>Current Password</h6>
																<div class="ui left icon input swdh11 swdh19">
																	<input class="prompt srch_explore" type="password" value="" id="input_current_pw" required="" placeholder="Current Password">															
																</div>
															</div>
														</div>

														<div class="col-lg-12">
															<div class="ui search focus mt-30">
																<h6>New Password</h6>
																<div class="ui left icon input swdh11 swdh19">
																	<input class="prompt srch_explore" type="password" value="" id="input_new_pw" required="" placeholder="New Password">															
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
									
									<div style="display:flex;">
										<button class="save_btn" id="bt_reset_pw">Reset Password</button> 
										<div style="position:absolute;bottom:30px;left:180px;" id="pw_uploading">
											<div class="spinner">
												<div class="bounce1"></div>
												<div class="bounce2"></div>
												<div class="bounce3"></div>
											</div>	
										</div>
										<div style="position:absolute;bottom:30px;left:180px; color:red" id="pw_reset_error">
											This is error
										</div>
										<div id="pw_finish" style="position:absolute;bottom:20px;left:180px; color:green;font-size:35px;">
											<i class='uil uil-check-circle'></i>
										</div>

									</div>
								</div>
							</div>
							<div class="tab-pane fade" id="pills-privacy" role="tabpanel" aria-labelledby="pills-privacy-tab">
								<div class="account_setting">
									<h4>Privacy</h4>
									<p>Modify your privacy settings here.</p>
									<div class="basic_profile">										
										<div class="basic_form">
											<div class="nstting_content">
												<div class="basic_ptitle">
													<h4>Profile page settings</h4>
												</div>
												<div class="ui toggle checkbox _1457s2">
													<input type="checkbox" name="stream_ss8" checked>
													<label>Show your profile on search engines</label>
												</div>
												<div class="ui toggle checkbox _1457s2">
													<input type="checkbox" name="stream_ss9">
													<label>Show courses you're taking on your profile page</label>
												</div>																																			
											</div>
										</div>
									</div>	
									<button class="save_btn" type="submit">Save Changes</button>
								</div>
							</div>
						</div>
					</div>						
				</div>
			</div>
		</div>

	<script>

		let user=<?php echo json_encode($user) ?>;

		console.log(user);

		let months =[
            "Jan",
            "Feb",
            "March",
            "April",
            "May",
            "June",
            "July",
            "Aug",
            "Sept",
            "Oct",
            "Nov",
            "Dec"
        ];

		var dateObj = new Date();
		var currentYear=dateObj.getUTCFullYear();

		$(document).ready(()=>{

			$('#name_required').hide();
			$('#profile_uploading').hide();
			$('#profile_upload_error').hide();
			$('#profile_finish').hide();

			for(var i=1;i<32;i++){
				$('#day_container').append(`<div class="item" data-value="${i}"></i>${i}</div>`);
			}

			for(var i=0;i<months.length;i++){
				$('#month_container').append(`<div class="item" data-value="${months[i]}"></i>${months[i]}</div>`);
			}

			for(var i=currentYear-18;i>1950;i--){
				$('#year_container').append(`<div class="item" data-value="${i}"></i>${i}</div>`);
			}

			let imageSrc="";

			$('#bt_save_profile').click(()=>{
				let name=$('#input_name').val();
				let email=$('#input_email').val();
				let education=$('#input_education').val();
				let work=$('#input_work').val();
				let region=$('#input_region').val();
				let gender=user.gender;
				let bd_day=user.bd_day;
				let bd_month=user.bd_month;
				let bd_year=user.bd_year;

				var form_data = new FormData();
				form_data.append('phone',user.learner_phone);
				form_data.append('name',name);
				form_data.append('email',email);
				form_data.append('bd_day',bd_day);
				form_data.append('bd_month',bd_month);
				form_data.append('bd_year',bd_year);
				form_data.append('work',work);
				form_data.append('education',education );
				form_data.append('region',region);
				form_data.append('gender',gender);
				if(imageSrc!=""){
					var files=$('#input_profile').prop('files');
					var file=files[0];
					form_data.append('myfile',file);
				}


				$('#name_required').hide();
				$('#profile_finish').hide();
				$('#profile_uploading').show();
				if(name=="" || name==null){
					alert('Please enter your name');
					$('#name_required').show();
					$('#profile_uploading').hide();
				}else{
					var ajax=new XMLHttpRequest();
					ajax.onload =function(){
						if(ajax.status==200 || ajax.readyState==4){
							console.log(ajax.responseText);
							$('#profile_uploading').hide();
							$('#profile_finish').show();
						}else{
							console.log('Error');
							$('#profile_uploading').hide();
						}
					};
					ajax.open("post",`https://www.calamuseducation.com/calamus-v2/api/korea/editprofile`,true);
					ajax.send(form_data);

				}
			});

			$('#selector_gender').change(()=>{
				user.gender=$('#selector_gender').val();
			});

			$('#selector_day').change(()=>{
				user.bd_day=$('#selector_day').val();
			});
			$('#selector_month').change(()=>{
				user.bd_month=$('#selector_month').val();
			});
			$('#selector_year').change(()=>{
				user.bd_year=$('#selector_year').val();
			});

			$('#pick_profile').click(()=>{
				$('#input_profile').click();
			});

			$('#input_profile').change(()=>{
				var files=$('#input_profile').prop('files');
				var file=files[0];
				 
				var reader = new FileReader();

				reader.onload = function (e) {
					imageSrc=e.target.result;
					$('#img_profile').attr('src', imageSrc);
					 
				};

				reader.readAsDataURL(file);
				  
			});


			$('#pw_uploading').hide();
			$('#pw_reset_error').hide();
			$('#pw_finish').hide();

			$('#bt_reset_pw').click(()=>{
				$('#pw_uploading').show();
				$('#pw_reset_error').hide();
				$('#pw_finish').hide();

				let currentPw=$('#input_current_pw').val();
				let newPw=$('#input_new_pw').val();

				if(currentPw==""){
					showErrorPw('Please enter current password');
					return;
				}

				if(newPw==""){
					showErrorPw('Please enter new password');
					return;
				}

				if(newPw.length<5){
					showErrorPw('New password must have at least 5 letters');
					return;
				}

				var form_data = new FormData();
				form_data.append('phone',user.learner_phone);
				form_data.append('currentPassword',currentPw);
				form_data.append('newPassword',newPw);

				var ajax=new XMLHttpRequest();
				ajax.onload =function(){
					if(ajax.status==200 || ajax.readyState==4){
						var response=JSON.parse(ajax.responseText);
						console.log(response);
						if(response.code=="51"){
							showErrorPw("Incorrect Password! Please enter your current password again");
						}else if(response.code=="50"){
							$('#pw_uploading').hide();
							$('#pw_reset_error').hide();
							$('#pw_finish').show();
						}
					}else{
						showErrorPw('Unexpected Error!');
					}
				};
				ajax.open("post",`https://www.calamuseducation.com/calamus-v2/api/korea/resetpasswordbyuser`,true);
				ajax.send(form_data);


			});

		});

		function showErrorPw(error){
			$('#pw_reset_error').show();
			$('#pw_reset_error').html(error);
			$('#pw_uploading').hide();
		}
		
	</script>

 <?php 
    include('layouts/footer.php');
?>