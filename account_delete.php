<?php 
session_start();
include('classes/connect.php');
include('classes/user.php');

include ("classes/auth.php");

$Auth=new Auth();

if(isset($_SESSION['calamus_userid'])){
    $user =$Auth->check_login($_SESSION['calamus_userid']);
}else{
    header('Location:login.php');
}
$User=new User();
$registrations = $User->checkMobileAppRegistration($user['learner_phone']);

?>

<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="utf-8">		
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, shrink-to-fit=9">
		<meta name="description" content="CalamusEducation">
		<meta name="author" content="CalamusEducation">
		<title>Calamus | Account Delete</title>
		
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

		<style>
			.div{
				margin-top:20px;
			}
            .border-div{
				border: 1px solid black; padding:7px;margin:7px;border-radius:3px;
			}
			  
		</style>
		<link href="assets/css/jquery.mCustomScrollbar.min.css" rel="stylesheet">
        <script src="assets/js/jquery-3.3.1.min.js"></script>
	</head> 

<body>
	<!-- Header Start -->
	<header class="header clearfix">
		<div class="container">
			<div class="row">
				<div class="col-12">
					<div class="back_link">
						<a href="index.php" class="hde151">Back To Calamus</a>
						<a href="index.php" class="hde152">Back</a>
					</div>
					<div class="ml_item">
						<div class="main_logo main_logo15" id="logo">
							<a href="index.php"><img src="assets/images/calamuslogo.png" style="width:100px;" alt=""></a>
							<a href="index.php"><img class="logo-inverse" src="images/ct_logo.svg" alt=""></a>
						</div>				
					</div>					
				</div>		
			</div>
		</div>
	</header>
	<!-- Header End -->
	<!-- Body Start -->
	<div class="wrapper _bg4586 _new89">		
		<div class="sign_in_up_bg">
			<div class="container">
				<div class="row justify-content-lg-center justify-content-md-center">
					<div class="col-lg-12">
						<div class="main_logo25" id="logo">
							<a href="index.html"><img src="images/calamuslogo.png" style="width:150px;" alt=""></a>
						</div>
					</div>
				
					<div class="col-lg-6 col-md-8">
						<div class="account_setting">
                            <h4>Account Deletion</h4>
                            <p>By deleting your account, all of the records and data associated to this application will permanently
                                be deleted and cannot be undone!
                            </p>
                            <div class="basic_profile">										
                                <div class="basic_form">
                                    <div class="nstting_content">
                                        
                                        <br><br>
                                        <div class="row">
                                            <div class="col-lg-8">
                                                <div class="row">
                                                    <div class="col-lg-12" style="text-align:center;">
                                                        
                                                        <img src="<?php echo $user['learner_image']; ?>" style="width: 80px;height: 80px; border-radius:50%" alt="">
                                                    
                                                    </div>
                                                    
                                                    <div class="col-lg-12">
                                                        <div class="ui search focus mt-30">
                                                            <h6 style="text-align:center"><?php echo $user['learner_name'] ?></h6>
                                                            <div class="ui left icon input swdh11 swdh19">
                                                                <input class="prompt srch_explore" type="password" value="" id="password_del" required="" maxlength="64" placeholder="Enter your password">															
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        <br>
                                        <p>Delete related to </p>
                                
                                        <?php foreach($registrations as $registration){ ?>
                                            <?php if($registration['status']==1){ ?>
                                                <div class="ui toggle checkbox _1457s2" id="del_<?php echo $registration['major'] ?>_container">
                                                    <input type="checkbox" name="" id="Del_<?php echo $registration['major']?>">
                                                    <label><?php echo $registration['app'] ?></label>
                                                </div>	
                                            <?php }?>
                                            
                                        <?php }?>	
                                    
                                    </div>
                                </div>
                            </div>	
                            <br>
                            <button class="save_btn" id="btn_acc_del">Delete Account Now</button>
                            <div style="position:absolute;bottom:30px;left:200px; color:red" id="acc_del_error"></div>
                            <div style="position:absolute;bottom:30px;left:200px;" id="del_uploading">
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
	<!-- Signup End -->	
	</div>
	
    <script>
        let user=<?php echo json_encode($user) ?>;

        $(document).ready(()=>{
            // delete account
			
            let registrations = <?php echo json_encode($registrations) ?>;
            $('#del_uploading').hide();
            $('#btn_acc_del').click(()=>{
                
                let password = $('#password_del').val();
                $('#acc_del_error').html("");
                if(password==""){
                    $('#acc_del_error').html("Please enter your password");
                    return;
                }	

                let checkApp=false;

                var form_data = new FormData();
                form_data.append('password',password);
                

                registrations.map((reg,index)=>{
                if(reg.status){
                    if ($('#Del_'+reg.major).is(':checked')) {
                            checkApp=true;
                            form_data.append('mCode',reg.mCode);
                            var ajax=new XMLHttpRequest();
                            $('#del_uploading').show();
                            ajax.onload =function(){
                                
                                if(ajax.status==200 || ajax.readyState==4){
                                    console.log(ajax.responseText);
                                    var response=JSON.parse(ajax.responseText);
                                    if(response.status=="success"){
                                        $('#del_'+reg.major+'_container').html("");
                                        $('#del_uploading').hide();
                                        if(response.remove_type=="delete_all") window.location.href = "signout.php";
                                    }else{
                                        $('#acc_del_error').html(response.error);
                                        $('#del_uploading').hide();
                                    }
                                }else{
                                    
                                    $('#acc_del_error').html("Unexpected error");
                                    $('#del_uploading').hide();
                                }
                                
                            };
                            
                            ajax.open("post",`https://www.calamuseducation.com/calamus-v2/api/${reg.major}/delete-account/${user.learner_phone}`,true);
                            ajax.send(form_data);
                            
                        } 
                    }
                })

                if(!checkApp){
                    $('#acc_del_error').html("Please select an app you want to delete.");
                    $('#del_uploading').hide();
                }
                
            })
        })
    </script>
<?php include('layouts/footer.php') ?>