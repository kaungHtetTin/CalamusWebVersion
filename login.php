
<?php 
 session_start();

    include ("classes/connect.php");
    include ("classes/auth.php");
    
   
    if($_SERVER['REQUEST_METHOD']=='POST'){
        
        $login=new Auth();
        $result=$login->login($_POST);
        
        if($result!=""){
            echo "<div style='text-align:center;font-size:12px; color:white;background-color:grey;'>";
            echo "<br>The following errors occured<br><br>";
            print_r($result);
            echo "</div>";
        }else {
            
            header("Location: index.php");
            die;
          //  echo "login access";
        }
        
    }

?>
<!DOCTYPE html>
<html lang="en">

	<head>
		<meta charset="utf-8">		
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, shrink-to-fit=9">
		<meta name="description" content="Gambolthemes">
		<meta name="author" content="Gambolthemes">
		<title>Calamus | Sign In</title>
		
		<!-- Favicon Icon -->
		<link rel="icon" type="image/png" href="images/logo.png">
		
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
	<!-- Signup Start -->
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
						<h2>Welcome Back</h2>
						<p>Log In to Your Calamus Account!</p>
						
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
							<div class="ui form mt-30 checkbox_sign">
								<div class="inline field">
									<div class="ui checkbox mncheck">
										<input type="checkbox" tabindex="0" class="hidden">
										<label>Remember Me</label>
									</div>
								</div>
							</div>
							<button class="login-btn" type="submit">Sign In</button>
						</form>
						<p class="sgntrm145">Or <a href="forgot_password.html">Forgot Password</a>.</p>
						<p class="mb-0 mt-30 hvsng145">Don't have an account? <a href="signup.php">Sign Up</a></p>
					</div>
					<div class="sign_footer"><img src="images/logo.png" alt="" style="width:50px;">© 2023 <strong>Calamuseducation</strong>. All Rights Reserved.</div>
				</div>				
			</div>				
		</div>				
	</div>
	<!-- Signup End -->	

	<script src="assets/js/jquery-3.3.1.min.js"></script>
	<script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
	<script src="assets/vendor/OwlCarousel/owl.carousel.js"></script>
	<script src="assets/vendor/semantic/semantic.min.js"></script>
	<script src="assets/js/custom.js"></script>	
	<script src="assets/js/night-mode.js"></script>	
	
</body>
</html>