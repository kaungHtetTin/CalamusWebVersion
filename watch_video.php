<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/lesson.php');
    include ('classes/auth.php');
    include('classes/lesson_category.php');
    include('classes/comment.php');
    include('classes/util.php');
 
    $page_title="Play";
    $user_id=$_SESSION['calamus_userid'];
    $category=$_GET['channel_id'];
    $channel_name=$_GET['channel'];

    $Auth=new Auth();
    $user =$Auth->check_login($user_id);

    $Lesson=new Lesson();
    $LessonCategory=new LessonCategory();
    $Comment=new Comment();
    
    $Util=new Util();

    $lessons=$Lesson->getLessonByCategory($category);
    $lessonCate=$LessonCategory->detail($category);
    $comments=$Comment->get($lessons[$_GET['index']]['post_id'],$user_id);

   // print_r($comments);
    

?>

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
		

        <style>
            .fixedLessonContainer
            {
                
                height: 100%;
                position: relative;
            }
            .scrollLessonContent
            {
                height: 100%;
                width:100%;
                overflow:auto;
              
            }
            .fixContainer{
                position: fixed;
                bottom: 0;
                right: 0;
            }

            .video_play_circle{
                position:absolute; 
                top: 25px;left:70px;
                border-radius:50%;
                background:rgba(0, 0, 0, 0.384);
                padding:10px;
                display:none;
            }

            a:hover .video_play_circle {
                display:block;
            }
            .video-thumbnail{
                width:160px;
                height: 90px;
                border-radius:5px;
                margin-left:10px;
            }
            #input_comment{
                padding:7px;
                border-width:0 0 1px 0;
                border-style:sold;
                background: #00000000;
                flex:1;
                margin-right:100px;
                margin-left:20px;
            }
            
            .shimmer {
                color: grey;
                display:inline-block;
                -webkit-mask:linear-gradient(-60deg,#000 30%,#0005,#000 70%) right/300% 100%;
                background-repeat: no-repeat;
                animation: shimmer 2.5s infinite;
                font-size: 50px;
                
            }

            @keyframes shimmer {
                100% {-webkit-mask-position:left}
            }

        </style>

	</head>

<body onresize="adjustLayout()">
    <div class="fixedLessonContainer">
    <div class="row">
        <div class="col-lg-8 col-md-6" style="padding-right:0px;">
            <div id="video_player">
            </div>
            <script src="https://player.vimeo.com/api/player.js"></script>
            
            <div id="course_display_1" class="_215b15 _byt1458" style="">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="user_dt5">
                                <div class="user_dt_left">
                                    <div class="live_user_dt">
                                        
                                        <div class="user_cntnt">
                                            
                                            <h5 id="tv_course_title"><?php echo $lessonCate['category_title'] ?> </h5>
                                            <span id="tv_title" class="_df7852"></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="user_dt_right">
                                    <ul>
                                        <li>
                                            <a href="#" class="lkcm152"><i class="uil uil-eye"></i><span id="tv_view"></span></a>
                                        </li>
                                        <li>
                                            <a href="#" class="lkcm152"><i class="uil uil-thumbs-up"></i><span id="tv_like"></span></a>
                                        </li>
                                        <li>
                                            <a href="#" class="lkcm152"><i class="uil uil-share-alt"></i><span id="tv_share"></span></a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                             
                        </div>
                    </div>
                </div>
            </div>

            <div id="detail-section" class="_215b17" style="">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-lg-12" style="padding-right:0px;">
                            <div class="student_reviews" style="margin:0px;">
                                <div class="row">
                                    <div class="col-lg-12">
                                        <div class="">
                                            <div class="">
                                                <h5>Comments</h5>
                                                <br>
                                            </div>
                                            <div style="display:flex;position:relative;">
                                                <div>
                                                    <img style="width:50px;height:50px;border-radius:50%;" src="<?php echo $user['learner_image']; ?>" />
                                                </div>

                                                <input id="input_comment" type="text" placeholder="Add a comment"/>

                                                <button style="position:absolute;bottom:0;right:0" class="subscribe-btn">Add</button>

                                            </div>
                                        </div>

                                        <br>

                                        <div id="comment_container" class="review_all120">
                                            
                                        </div>

                                        <!-- <div class="review_all120">
                                            
                                            <div class="review_item">
                                                <a href="#" class="more_reviews">See More Comments</a>
                                            </div>
                                        </div> -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer id="footer" class="footer mt-30">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="about_us.html">About</a>
                                <a href="our_blog.html">Blog</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="help.html">Help</a>
                                <a href="contact_us.html">Contact Us</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="terms_of_use.html">Terms</a>
                                <a href="terms_of_use.html">Privacy Policy</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f3">
                                <a href="#" class="btn1542">Teach on Cursus</a>
                            </div>
                        </div>
                        <div class="col-lg-12">
                            <div class="footer_bottm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <ul class="fotb_left">
                                            <li>
                                                <a href="index.html">
                                                    <div class="footer_logo">
                                                        <img src="{{asset('images/logo.png')}}" alt="">
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <p>© 2023 <strong>Calamuseducation</strong>. All Rights Reserved.</p>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="edu_social_links">
                                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                                            <a href="#"><i class="fab fa-twitter"></i></a>
                                            <a href="#"><i class="fab fa-google-plus-g"></i></a>
                                            <a href="#"><i class="fab fa-linkedin-in"></i></a>
                                            <a href="#"><i class="fab fa-instagram"></i></a>
                                            <a href="#"><i class="fab fa-youtube"></i></a>
                                            <a href="#"><i class="fab fa-pinterest-p"></i></a>
                                        </div>
                                    </div>		
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

        </div>

        <div class="col-lg-4 col-md-6 scrollLessonContent fixContainer" id="lesson-section" style="padding-right:0px;">
            <div class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom">
                <?php foreach($lessons as $key=>$lesson){ ?>
                <a href="#video_player" onclick="playVideo(<?php echo $key ?>)">
                    <div class="lecture-container" style="display:flex"  id="lesson_item<?php echo $lesson['id'];?>">

                        <div style="width:170px;height: 100px; position:relative;margin-right:10px;">
                            <img src="<?php echo $lesson['thumbnail']; ?>" class="video-thumbnail"/>
                            <div class="video_play_circle">
                                <i style="color:white;width:30px; height:30px;" class="uil uil-play"></i>
                            </div>
                            <div  style="position:absolute; bottom:15px;right: 5px;padding:5px; border-radius:3px; background:rgba(0, 0, 0, 0.384);color:white;font-size:10px;">
                                <?php echo $Lesson->formatVideoDuration($lesson['duration'])?>
                            </div>
                        </div>
                        

                        <div class="">
                            <div class="title">
                                <div style="margin-bottom:5px;color:#333"><h5><?php echo $lesson['lesson_title']; ?></h5></div>
                                <?php echo $channel_name; ?> <br>
                                <?php echo $Lesson->formatViewCount($lesson['view_count']) ?>
                               
                            
                            </div>
                            
                        </div>
                    </div>
                </a>
                <?php }?>
            </div>
            <!-- <a class="btn1458" href="#">20 More Sections</a> -->
            <footer id="footer2" style="display:none" class="footer mt-30">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="about_us.html">About</a>
                                <a href="our_blog.html">Blog</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="help.html">Help</a>
                                <a href="contact_us.html">Contact Us</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f1">
                                <a href="terms_of_use.html">Terms</a>
                                <a href="terms_of_use.html">Privacy Policy</a>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-3 col-sm-6">
                            <div class="item_f3">
                                <a href="#" class="btn1542">Teach on Cursus</a>
                            </div>
                        </div>
                        <div class="col-lg-12">
                            <div class="footer_bottm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <ul class="fotb_left">
                                            <li>
                                                <a href="index.html">
                                                    <div class="footer_logo">
                                                        <img src="{{asset('images/logo.png')}}" alt="">
                                                    </div>
                                                </a>
                                            </li>
                                            <li>
                                                <p>© 2023 <strong>Calamuseducation</strong>. All Rights Reserved.</p>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="edu_social_links">
                                            <a href="#"><i class="fab fa-facebook-f"></i></a>
                                            <a href="#"><i class="fab fa-twitter"></i></a>
                                            <a href="#"><i class="fab fa-google-plus-g"></i></a>
                                            <a href="#"><i class="fab fa-linkedin-in"></i></a>
                                            <a href="#"><i class="fab fa-instagram"></i></a>
                                            <a href="#"><i class="fab fa-youtube"></i></a>
                                            <a href="#"><i class="fab fa-pinterest-p"></i></a>
                                        </div>
                                    </div>		
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        
        <script>

            var lessons=<?php echo json_encode($lessons) ?>;
            var user_id=<?php echo $user['learner_phone'] ?>;
            var index=<?php echo $_GET['index']?>;
            var comment_container=document.getElementById('comment_container');

          

            window.onload=playVideo(index);
            adjustLayout();
                  
            function playVideo(index){
                
                
                var lesson=lessons[index];
                
               
                highLightLessonItem('lesson_item'+lesson.id);
                var video_player=document.getElementById('video_player');
                video_player.innerHTML=`
                    <div style="padding:56.25% 0 0 0;position:relative;">
                        <iframe src="${lesson.vimeo}" 
                            frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Lesson 6 Rules for word stress"></iframe>
                    </div>
                `;

                document.getElementById('tv_view').innerHTML=lesson.view_count;
                document.getElementById('tv_like').innerHTML=lesson.post_like;
                document.getElementById('tv_share').innerHTML=lesson.share_count;
                document.getElementById('tv_title').innerHTML=lesson.lesson_title;
                updateData(user_id,lesson.id,lesson.post_id);
                fetchComments(user_id,lesson.post_id);
               
            }

            function loadBlogLesson(link){
                window.location.href = "lesson-display.php?link="+link;
            }

            function updateData(user_id,lesson_id,post_id){
                var ajax=new XMLHttpRequest();
                ajax.onload =function(){
                    if(ajax.status==200 || ajax.readyState==4){
                        console.log("lesson click" ,ajax.responseText);  
                    }
                };
                ajax.open("POST","api/play-lesson.php",true);
                ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                ajax.send(`user_id=${user_id}&lesson_id=${lesson_id}&post_id=${post_id}`);
            }

            function highLightLessonItem(id){
                var lessonItems=document.getElementsByClassName('lecture-container');
                for(var i=0;i<lessonItems.length;i++){
                    var item=lessonItems[i];
                    const ID=item.getAttribute("id");
                   
                    if(id==ID){
                        item.setAttribute('style','background:#ed292621');
                    }else{
                        item.setAttribute('style','');
                    }
                    
                }
            }

            function adjustLayout(){
                var w = window.innerWidth;
                var lesson_section=document.getElementById('lesson-section');
                var footer=document.getElementById('footer');
                var footer2=document.getElementById('footer2');
                var nav_bar_section=document.getElementById('nav-bar-section');
                var detail_section=document.getElementById('detail-section');

                var w_lesson_section=lesson_section.offsetWidth;
                console.log('windown',w,'lesson section',w_lesson_section);

                if(w<=w_lesson_section){
                    lesson_section.setAttribute('class','col-lg-4 col-md-6 scrollLessonContent');
                    
                    footer.setAttribute('style','display:none');
                    footer2.setAttribute('style','display:block');
                    nav_bar_section.setAttribute('style','display:none');
                    detail_section.setAttribute('style','display:none');
                }else{
                    lesson_section.setAttribute('class','col-lg-4 col-md-6 scrollLessonContent fixContainer');
                    footer.setAttribute('style','');
                    footer2.setAttribute('style','display:none');
                    nav_bar_section.setAttribute('style','');
                    detail_section.setAttribute('style','');
                }
            }

            
            
            function loadCommentShimmer(){
               
                comment_container.innerHTML="";
                for(var i=0;i<3;i++){
                    comment_container.innerHTML+=`
                         <div class="review_item" style="width:100%;">
                            <div class="shimmer" style="width:100%;">
                                <div class="review_usr_dt">
                                    <img src="https://www.calamuseducation.com/uploads/placeholder.png" style="width:50px; height:50px;" alt="">
                                    <div class="rv1458">
                                        <h4 class="tutor_name1" style="width:100px; height:20px; background:#ccc;border-radius:3px;"></h4>
                                        <span class="time_145" style="width:50px; height:20px; background:#ccc;border-radius:3px;"></span>
                                    </div>
                                </div>
                                <p class="rvds10" style="width:100%; height:20px; background:#ccc;border-radius:3px;"></p>
                                 
                            </div>
                        </div>
                    
                    `;
                }
            }

            function fetchComments(user_id,post_id){
                console.log('post_id comment',post_id);
                loadCommentShimmer();
                var ajax=new XMLHttpRequest();
                ajax.onload =function(){
                    if(ajax.status==200 || ajax.readyState==4){
                        var data=JSON.parse(ajax.responseText);
                        var status=data.status;
                      
                        if(status=='success'){
                            var comments=data.comments;
                            comment_container.innerHTML="";
                            for(var i=0;i<comments.length;i++){
                                var comment=comments[i];
                                comment_container.innerHTML+=commentComponent(comment); 
                                if(comment.child){
                                    var children=comment.child;
                                    var child_container=document.getElementById('cmt_child_'+comment.time);
                                    for(var j=0;j<children.length;j++){
                                        var child=children[j];
                                        child_container.innerHTML+= childComment(child);
                                    }
                                }   
                            }
                        }else{
                            comment_container.innerHTML=`
                            <div style="padding:20px; text-align:center">
                                No comment
                            </div>
                            `;
                        }
                        
                    }
                };
                ajax.open("GET",`api/comments/get.php?user_id=${user_id}&post_id=${post_id}`,true);
                ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                ajax.send();
            }

            function commentComponent(comment){
                console.log('comment ',comment);
                return `
                    <div class="review_item">
                        <div class="review_usr_dt">
                            <img src="${comment.learner_image}" style="width:50px; height:50px;" alt="">
                            <div class="rv1458">
                                <h4 class="tutor_name1">${comment.learner_name}</h4>
                                <span class="time_145">${formatDateTime(comment.time)}</span>
                            </div>
                        </div>
                        <p class="rvds10">${comment.body}</p>
                        <div class="rpt100">
                            <div class="radio--group-inline-container">
                                <div class="radio-item">
                                     <a href="javascript:void(0)" class="report145" id="cmt_like_${comment.time}" onclick="likeComment(${user_id},${comment.post_id},${comment.time},${comment.is_liked},${comment.likes})"> 
                                        <i id="cmt_like_icon_${comment.time}" style="${defineLikeThumb(comment.is_liked)};" class="uil uil-thumbs-up"></i> 
                                     </a>
                                    <label for="cmt_like_${comment.time}" class="radio-label">
                                        <span id="cmt_like_count_${comment.time}">${formatReact(comment.likes)}</span>
                                    </label>
                                </div>
                                <div class="radio-item">
                                    <a href="#" class="report145" id="cmt_reply_${comment.time}"><i class="uil uil-comments"></i></a>
                                    <label  for="cmt_like_${comment.time}" class="radio-label">reply</label>
                                </div>
                            </div>
                           
                        </div>

                        <div id="cmt_child_${comment.time}"></div>

                    </div>
                `;
            }

            function childComment(comment){
              
                return `
                    <div class="review_item" style="margin-left:40px;">
                        <div class="review_usr_dt">
                            <img src="${comment.learner_image}" style="width:30px; height:30px;" alt="">
                            <div class="rv1458">
                                <h5 class="tutor_name1">${comment.learner_name}</h5>
                                <span class="time_145">${formatDateTime(comment.time)}</span>
                            </div>
                        </div>
                        <p class="rvds10">${comment.body}</p>
                        <div class="rpt100">
                            <div class="radio--group-inline-container">
                                <div class="radio-item">
                                     <a href="javascript:void(0)" class="report145" id="cmt_like_${comment.time}" onclick="likeComment(${user_id},${comment.post_id},${comment.time},${comment.is_liked},${comment.likes})"> 
                                        <i id="cmt_like_icon_${comment.time}" style="${defineLikeThumb(comment.is_liked)};" class="uil uil-thumbs-up"></i> 
                                     </a>
                                    <label for="cmt_like_${comment.time}" class="radio-label">
                                        <span id="cmt_like_count_${comment.time}">${formatReact(comment.likes)}</span>
                                    </label>
                                </div>
                                <div class="radio-item">
                                    <a href="#" class="report145" id="cmt_reply_${comment.time}"><i class="uil uil-comments"></i></a>
                                    <label  for="cmt_like_${comment.time}" class="radio-label">reply</label>
                                </div>
                            </div>
                           
                        </div>

                        <div id="cmt_child_${comment.time}"></div>

                    </div>
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
                        return diff+"s ago";
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

            function defineLikeThumb(like){
                if(like==1){
                    return "color:red"
                }else{
                    return "";
                }
            }

            function likeComment(user_id,post_id,comment_id,is_like,like_count){
                var ajax=new XMLHttpRequest();
                ajax.onload =function(){
                    if(ajax.status==200 || ajax.readyState==4){
                      
                    }
                };
                ajax.open("POST","https://www.calamuseducation.com/calamus-v2/api/korea/comments/like",true);
                ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                ajax.send(`user_id=${user_id}&post_id=${post_id}&comment_id=${comment_id}`);

                var cmt_like_icon=document.getElementById('cmt_like_icon_'+comment_id);
                var cmt_like_count=document.getElementById('cmt_like_count_'+comment_id);
                if(is_like==1){
                    cmt_like_icon.setAttribute('style','');
                    cmt_like_count.innerHTML=formatReact(like_count-1);
                }else{
                    cmt_like_icon.setAttribute('style','color:red');
                    cmt_like_count.innerHTML=formatReact(like_count+1);
                }

            }

            function formatReact(like){

                if(like>1 && like<1000){
                   return like+" likes"
                }

                if(like>=1000&&like<1000000){
                    like=like/1000;
                    like= Math.round(like * 10) / 10
                    return like+"k likes"; 
                }

                if(like>=1000000){
                    like=like/1000000;
                    like= Math.round(like * 10) / 10
                    return like+"M likes"; 
                }

                if(like==1){
                    return like +"like";
                }

                if(like==0){
                    return "no like";
                }
            }

        </script>

	</div>
    </div>
	<!-- Body End -->

	<script src="assets/js/vertical-responsive-menu.min.js"></script>
	<script src="assets/js/jquery-3.3.1.min.js"></script>
	<script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
	<script src="assets/vendor/OwlCarousel/owl.carousel.js"></script>
	<script src="assets/vendor/semantic/semantic.min.js"></script>
	<script src="assets/js/custom.js"></script>
	<script src="assets/js/night-mode.js"></script>
	
	
</body>
</html>