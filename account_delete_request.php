<?php 
include('classes/connect.php');
include('classes/user.php');

include ("classes/auth.php");
    
   	$login=new Auth();
	$result="";
    if($_SERVER['REQUEST_METHOD']=='POST'){
        
        $result=$login->login($_POST);
        
        if($result!=""){
           
        }else {
            header("Location: account_delete.php");
            die;
        }
        
    }

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
						<div class="sign_form">
							<h2>Account Delete</h2>
							<p>Request to delete your account</p>
							
							<form action="" method="POST">
								<div class="ui search focus mt-15">
									<div class="ui left icon input swdh95">
										<input class="prompt srch_explore" type="phone" name="phone" value="" id="phone" required="" maxlength="64" placeholder="Phone (0912345678)">															
										<i class="uil uil-phone icon icon2"></i>
									</div>
								</div>
								<div class="ui search focus mt-15">
									<div class="ui left icon input swdh95">
										<input class="prompt srch_explore" type="password" name="password" value="" id="id_password" required="" maxlength="64" placeholder="Password">
										<i class="uil uil-key-skeleton-alt icon icon2"></i>
									</div>
								</div>
							
								<button class="login-btn" type="submit">Request</button>
								<?php 
								 
									if($result!=""){
										echo "<div style='text-align:center;font-size:12px; color:white;background-color:grey;'>";
										echo "<br>The following errors occured<br>";
										print_r($result);
										echo "<br></div>";
									}
								?>
							</form>
						</div>
						<div class="sign_footer"><img src="images/logo.png" alt="" style="width:50px;">© 2023 <strong>Calamuseducation</strong>. All Rights Reserved.</div>
					</div>				
				</div>				
			</div>				
		</div>
	<!-- Signup End -->	
	</div>
		
<?php include('layouts/footer.php') ?>