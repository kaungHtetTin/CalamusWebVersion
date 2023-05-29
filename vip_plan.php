<?php
    session_start();
    include('classes/connect.php');
    include ('classes/auth.php');
    $page_title="Payment";

    $Auth=new Auth();
    if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
    }else{
        header('Location: login.php');
    }
 

    include('layouts/header.php');
?>

    <link href="assets/css/jquery.mCustomScrollbar.min.css" rel="stylesheet">

    <style>
        h2 {
            font-size: 1.3em;
            margin-top: 10px;
            font-weight: bold;
        }

        p {
            font-size: 1em;
        }

        .payment {
            font-size: 1em;

        }

        .card {
            margin-bottom: 5px !important;
        }

    </style>
	

	<!-- Body Start -->
	<div class="wrapper">
		<div class="sa4d25">
			<div class="container-fluid">		
                <h2>Vip အဖြစ် မှတ်ပုံတင်ခြင်း &#128081;</h2>
                <P>VIP User အဖြစ် အောက်ပါ Plan များအတိုင်း မိမိကြိုက်နှစ်သက်ရာကို မှတ်ပုံတင်နိုင်ပါသည်။</P>
                <div class="card text-left">
                    <div class="card-header bg-warning text-white">သင်တန်းများ </div>
                    <div class="card-body">
                        <div>
                            <div class="payment">&#x1F4DD; English Language
                                <br>
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th scope="col">Course</th>
                                            <th>Fees</th>
                                            <th>Blue Mark</th>
                                            <th>Remark</th>
                                        </tr>

                                    </thead>
                                    <tbody>

                                        <tr>
                                            <td>Basic Course</td>
                                            <td>10,000 kyats</td>
                                            <td>Yes</td>
                                            <td></td>
                                        </tr>

                                        <tr>
                                            <td>Elementary Course</td>
                                            <td>10,000 kyats</td>
                                            <td>Yes</td>
                                            <td></td>
                                        </tr>

                                        <tr>
                                            <td>Elementary Translation Course</td>
                                            <td>10,000 kyats</td>
                                            <td>Yes</td>
                                            <td></td>
                                        </tr>

                                        <tr>
                                            <td>Essential Speaking Course</td>
                                            <td>10,000 kyats</td>
                                            <td>Yes</td>
                                            <td></td>
                                        </tr>

                                        <tr>
                                            <td>Listening Course</td>
                                            <td>မေတ္တာလက်ဆောင်</td>
                                            <td>Yes</td>
                                            <td></td>
                                        </tr>

                                        <tr style="background:rgb(213, 255, 213);;font-weight:bold">
                                            <td>Gold Plan</td>
                                            <td><sub style="color:red;text-decoration:line-through">30,000 kyats</sub> <br>25,000 kyats </td>
                                            <td>Yes</td>
                                            <td>Basic to Intermediate (All course)</td>
                                        </tr>
                                    </tbody>

                                </table>

                            </div>
                        </div>

                        <div>
                            <div  class="payment">&#x1F4DD; Korean Language
                            <br>
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th  scope="col">Course</th>
                                        <th>Fees</th>
                                        <th>Blue Mark</th>
                                        <th>Remark</th>
                                    </tr>
                                    
                                </thead>
                                <tbody>

                                    <tr>
                                        <td>Basic Course</td>
                                        <td>5,000 kyats</td>
                                        <td>Yes</td>
                                        <td></td>
                                    </tr>

                                    <tr>
                                        <td>Level 1 Course</td>
                                        <td>10,000 kyats</td>
                                        <td>Yes</td>
                                        <td></td>
                                    </tr>

                                    <tr>
                                        <td>Level 2 Course</td>
                                        <td>10,000 kyats</td>
                                        <td>Yes</td>
                                        <td></td>
                                    
                                    </tr>

                                    <tr>
                                        <td>Level 3-1 Course</td>
                                        <td>15,000 kyats</td>
                                        <td>Yes</td>
                                        <td></td>
                                    </tr>

                                    <tr>
                                        <td>Level 3-2 Course</td>
                                        <td>15,000 kyats</td>
                                        <td>Yes</td>
                                        <td></td>
                                    </tr>

                                    <tr>
                                        <td>Level 4-1 Course</td>
                                        <td>15,000 kyats</td>
                                        <td>Yes</td>
                                        <td></td>
                                    </tr>

                                    <tr>
                                        <td>Level 4-2 Course</td>
                                        <td>15,000 kyats</td>
                                        <td>Yes</td>
                                        <td>On going</td>
                                    </tr>

                                    <tr>
                                            <td>Basic Vocabulary Course</td>
                                            <td>မေတ္တာလက်ဆောင်</td>
                                            <td></td>
                                            <td></td>
                                    </tr>


                                    <tr style="background:rgb(213, 255, 213);;font-weight:bold">
                                        <td>Gold Plan</td>
                                        <td><sub style="color:red;text-decoration:line-through">50,000 kyats</sub> <br>35,000 kyats </td>
                                        <td>Yes</td>
                                        <td>Basic to Level 4-2 (All course) </td>
                                    </tr>
                                </tbody>
                                    
                                </table>
                        
                            </div>
                        </div>
                    </div>
                </div>	

                <hr>
                <p>
                    <h5>Blue Mark</h5>
                    Calamus Education ရဲ့ Mobile App/ website တွေထဲမှ Additional Lessons နှင့် Feature အားလုံးကို သက်ဆိုင်ရာ Language အလိုက် ဝင်ရောက်အသုံးပြုနိုင်ခွင့်ရရှိမှာဖြစ်ပါတယ် ...
                     
                </p>

                <hr>
                
                <div style="background: rgb(213, 255, 213); padding:7px; border:1px solid green">
                    <p>
                        <h5>Gold Plan </h5>
                        Calamus Education မှ ဖွင့်လစ်သော သက်ဆိုင်ရာသင်တန်းများ အားလုံးကို ဝင်ရောက် လေ့လာခွင့်ရရှိမှာဖြစ်ပါတယ်...<br>
                        ဥပမာ Easy Korean ရဲ့ Gold plan package ကိုဝယ်ယူထားပါက Easy Korean မှ ဖွင့်လစ်သော ကိုရီးယားဘာသာစကား သင်တန်းအားလုံးကို ဝင်ရောက် လေ့လာနိုင်မှာဖြစ်ပါတယ်။
                    </p>
                </div>

                <br><br>

                <div class="card text-left">
                    <div class="card-header bg-primary text-white">ငွေပေးချေနိုင်သည့်နည်းလမ်းများ </div>
                <div class="card-body">
                    <div>
                        
                        <div  class="payment">&#128179; Wavepay<br> <b>09979638384</b></div>
                        <div  class="payment">&#128179; KBZpay / Mytel pay<br> <b>09682537158</b> <br>Kaung Htet Tin </div>
                </div>

                <br><br>

                <div class="card text-left">
                    <div class="card-body">
                    <h5 class="card-title">ကျသင့်ငွေပေးချေပြီးပါက </h5>
                    <p class="card-text">
                        ကျသင့်ငွေအားပေးချေပြီးပါက ငွေပေးချေထားသည့်ဖြတ်ပိုင်း Screentshot အား Calamus Education ၏ Easy English - Calamus Education , Easy Korean - Calamus Education စသော Official Facebook Page များသို့ ပေးပို့နိုင်ပါသည်။ 
                    </p>

                        <a href="https://www.facebook.com/easyenglishcalamus">
                            <i style="color:white; background:#3b5998;padding:10px;border-radius:4px;" class="fab fa-facebook-f"></i> 
                            Easy English - Calamus Education 
                        </a> 
                        <br><br>
                       
                        <a href="https://www.facebook.com/easykoreancalamus">
                            <i style="color:white; background:#3b5998;padding:10px;border-radius:4px;" class="fab fa-facebook-f"></i> 
                            Easy Korean - Calamus Education 
                        </a> 
                        <br><br>
                    
                    </div>
                </div>
               
			</div>
		</div>

 <?php 
    include('layouts/footer.php');
?>