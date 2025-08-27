<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/course.php');
    include('classes/teacher.php');
    include('classes/lesson.php');
    include ('classes/auth.php');
 
    $page_title="Detail";
    $course_id=$_GET['course_id'];
    $user_id=$_SESSION['calamus_userid'];
    

    $Auth=new Auth();
    $user =$Auth->check_login($user_id);

    if(!$Auth->checkVIP($course_id,$user_id)) header("Location: vip_plan.php");
    $Course=new Course();
    $Teacher=new Teacher();
    $Lesson=new Lesson();
    $course=$Course->detail($course_id);
    $enrollStudents=$Course->getEnrollStudents($course_id);
    $teacher_id=$course['teacher_id'];
    $teacher=$Teacher->detail($teacher_id);
    $days=$Lesson->getLessonsByDayPlan($course_id,$user_id);
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
        <script src="assets/js/jquery-3.3.1.min.js"></script>
		

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

            input{
                
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
            .cmt-reply{
                display:flex;
                position:relative; 
                margin-left:40px;
            }

            @keyframes shimmer {
                100% {-webkit-mask-position:left}
            }

            .user_dt_right ul li {
                width: 23.3%;
            }

        </style>

	</head>

<body onresize="adjustLayout()">
    <div class="fixedLessonContainer">
        <div class="row" style="padding-right:0px;">
            <div class="col-lg-8 col-md-6" style="padding-right:0px;" id="player-section">
                <div id="video_player">
                </div>
                <script src="https://player.vimeo.com/api/player.js"></script>
                
                <div id="course_display_1" class="_215b15 _byt1458">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-lg-12">
                                <div class="user_dt5">
                                    <div class="user_dt_left">
                                        <div class="live_user_dt">
                                            
                                            <div class="user_cntnt">
                                                
                                                <h5 id="tv_course_title"><?php echo $course['title']; ?> </h5>
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
                                                <a href="javascript:void(0)" onclick="likeVideo()" class="lkcm152"><i id="like_thumb" class="far fa-thumbs-up" style=""></i><span id="tv_like"></span></a>
                                            </li>
                                            <li>
                                                <a href="#" class="lkcm152"><i class="far fa-comment"></i><span id="tv_comment"></span></a>
                                            </li>

                                            <li>
                                                <a href="#" class="lkcm152"><i class="fas fa-share-alt"></i><span id="tv_share_count"></span></a>
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
                            <div class="col-lg-12" style="">
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
                                                        <img style="width:35px;height:35px;border-radius:50%;" src="<?php echo $user['learner_image']; ?>" />
                                                    </div>

                                                    <input id="input_comment" type="text" placeholder="Add a comment"/>

                                                    <button onclick="addComment()" style="position:absolute;bottom:0;right:0" class="subscribe-btn">Add</button>

                                                </div>
                                            </div>

                                            <br>

                                            <div id="comment_container" class="review_all120">
                                                
                                            </div>
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
                                    <?php if($authenticated ) {?>
                                        <a href="explore.php" class="btn1542">Explore</a>
                                    <?php }else { ?>
                                        <a href="login.php" class="btn1542">Log In</a>
                                    <?php } ?>
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
                                                <a href="https://www.facebook.com/easyenglishcalamus"><i class="fab fa-facebook-f" style="color:blue"></i></a>
                                                <a href="https://www.facebook.com/easykoreancalamus"><i class="fab fa-facebook-f" style="color:yellow"></i></a>
                                                <a href="https://www.youtube.com/@calamuseducationmyanmar5078"><i class="fab fa-youtube" style="color:red"></i></a>
                                            </div>
                                        </div>		
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>

            </div>

            <div class="col-lg-4 col-md-6 scrollLessonContent fixContainer" id="lesson-section">
               <br> 
                <div class="_112456" style="margin-bottom:10px;">
                    <ul class="accordion-expand-holder">
                        <li><span class="accordion-expand-all _d1452">Expand all</span></li>
                        <li><span class="_fgr123"> <?php echo $course['lessons_count']; ?> lectures</span></li>
                        <li><span class="_fgr123"><?php echo $Lesson->formatDuration($Course->getDuration($course_id)); ?></span></li>
                    </ul>
                </div>
                <?php for($i=0;$i<count($days);$i++){ $day=$days[$i]; ?> 

                <div id="accordion" class="ui-accordion ui-widget ui-helper-reset" style="margin-top:0px;">
                    <a href="javascript:void(0)" class="accordion-header ui-accordion-header ui-helper-reset ui-state-default ui-accordion-icons ui-corner-all">												
                        <div class="section-header-left">
                            <span class="section-title-wrapper">
                                <i class='uil uil-calendar-alt crse_icon'></i>
                                <span class="section-title-text">Day <?php echo $i+1; ?> </span>
                            </span>
                        </div>
                        <div class="section-header-right">
                            <span class="num-items-in-section" style="font-size:unset"><?php echo count($day) ?> lectures</span>
                            <span class="num-items-in-section" style="font-size:unset"><?php echo $Lesson->formatDuration($Lesson->getTotalDuration($day)); ?></span>
                        </div>
                    </a>

                    <div class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom">
                        <?php foreach($day as $key=>$lesson){ ?>
                        <a href="#video_player" onclick="playLesson(<?php echo $i?>,<?php echo $key; ?>)">
                            <div class="lecture-container"  id="lesson_item<?php echo $lesson['id'];?>">
                                <?php if($lesson['learned']==1){ ?> 
                                    <i class='uil uil-check-circle icon_142' style="color:green"></i>
                                <?php }else {?>
                                    <i class='uil uil-check-circle icon_142'></i>
                                <?php }?>
                            
                                <div class="top">
                                    <div class="title">
                                        <div style="margin-bottom:5px;"><?php echo $lesson['lesson_title']; ?></div>
                                    
                                        <?php if($lesson['isVideo']==1){ ?>
                                            <i class='uil uil-play-circle icon_142'></i>
                                        <?php }else{ ?>
                                            <i class='uil uil-file icon_142'></i>
                                        <?php } ?>
                                        
                                        <?php echo $Lesson->formatDuration($lesson['duration']); ?> . <?php echo $lesson['category_title']; ?>
                                    </div>
                                </div>
                            </div>
                            
                        </a>
                        <?php }?>
                    </div>
                                                            
                </div>
                <?php } ?>

                <div id="modalContainer">
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
                                    <?php if($authenticated ) {?>
                                        <a href="explore.php" class="btn1542">Explore</a>
                                    <?php }else { ?>
                                        <a href="login.php" class="btn1542">Log In</a>
                                    <?php } ?>
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
                                                <a href="https://www.facebook.com/easyenglishcalamus"><i class="fab fa-facebook-f" style="color:blue"></i></a>
                                                <a href="https://www.facebook.com/easykoreancalamus"><i class="fab fa-facebook-f" style="color:yellow"></i></a>
                                                <a href="https://www.youtube.com/@calamuseducationmyanmar5078"><i class="fab fa-youtube" style="color:red"></i></a>
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

                var days=<?php echo json_encode($days) ?>;
                var user_id=<?php echo $user['learner_phone'] ?>;
                var user=<?php echo json_encode($user); ?>;
                var comment_container=document.getElementById('comment_container');
                var currentVideo;
                var comments;
                var commentPage=10;
                var hasMoreComment=true;

                window.onload= playLesson(<?php echo $_GET['outer']?>,<?php echo $_GET['inner'];?>);
                adjustLayout();

                $(document).ready(()=>{
                    $(window).scroll(()=>{
                        if($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
                            if(hasMoreComment){
                             
                                loadMoreComment();
                            }
                        }
                    });
                })
                        
                function playLesson(outerIndex,innerIndex){
                    
                    var lesson=days[outerIndex][innerIndex];
                    currentVideo=lesson;
                    highLightLessonItem('lesson_item'+lesson.id);
                    if(lesson.isVideo==1){
                        var video_player=document.getElementById('video_player');
                        video_player.innerHTML=`
                            <div style="padding:56.25% 0 0 0;position:relative;">
                                <iframe src="${lesson.vimeo}" 
                                    frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Lesson 6 Rules for word stress"></iframe>
                            </div>
                        `;
                        document.getElementById('tv_course_title').innerHTML=lesson.category_title;
                        document.getElementById('tv_view').innerHTML=formatCounting(lesson.view_count);
                        document.getElementById('tv_like').innerHTML=formatCounting(lesson.post_like);
                        document.getElementById('tv_comment').innerHTML=formatCounting(lesson.comments);
                        document.getElementById('tv_title').innerHTML=lesson.lesson_title;  
                        $('#tv_share_count').html(formatCounting(lesson.share_count));

                        updateData(user_id,lesson.id,lesson.post_id);
                        isLiked(user_id,lesson.post_id);
                        
                        commentPage=10;
                        
                        fetchComments(user_id,lesson.post_id);
                    }else{
                        loadBlogLesson(lesson.link);
                        updateData(user_id,lesson.id,null);

                    }
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

                function isLiked(user_id,post_id){
                    var ajax=new XMLHttpRequest();
                    ajax.onload =function(){
                        if(ajax.status==200 || ajax.readyState==4){
                            var response=JSON.parse(ajax.responseText);
                            var like_thumb=document.getElementById('like_thumb');
                            if(response.like){
                                like_thumb.setAttribute('style','color:red');
                                like_thumb.setAttribute('class','fas fa-thumbs-up');
                                currentVideo.is_liked=true;
                                    
                            }else{
                                like_thumb.setAttribute('style','');
                                like_thumb.setAttribute('class','far fa-thumbs-up');
                                currentVideo.is_liked=false;
                            }
                            
                        }
                    };
                    ajax.open("GET",`api/posts/get.php?post_id=${post_id}&user_id=${user_id}`,true);
                    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    ajax.send();
                }

                function likeVideo(){
                    var like_thumb=document.getElementById('like_thumb');
                    if(currentVideo.is_liked){
                        currentVideo.is_liked=false;
                        currentVideo.post_like=currentVideo.post_like-1;
                        like_thumb.setAttribute('style','');
                        like_thumb.setAttribute('class','far fa-thumbs-up');
                    }else{
                        currentVideo.is_liked=true;
                        currentVideo.post_like=parseInt(currentVideo.post_like)+1;
                        like_thumb.setAttribute('style','color:red');
                        like_thumb.setAttribute('class','fas fa-thumbs-up');
                    }
                    
                    var link=`https://www.calamuseducation.com/calamus-v2/api/any/posts/like`;
                    var data={
                        "user_id":user_id,
                        "post_id":currentVideo.post_id,
                    }
                    $.post(link,data,(res)=>{
                        console.log(res);
                    })
                    document.getElementById('tv_like').innerHTML=formatCounting(currentVideo.post_like);
                }

                function highLightLessonItem(id){
                    var lessonItems=document.getElementsByClassName('lecture-container');
                    for(var i=0;i<lessonItems.length;i++){
                        var item=lessonItems[i];
                        const ID=item.getAttribute("id");
                        //console.log("id",id,"ID",ID);
                        if(id==ID){
                            item.setAttribute('style','background:#ed292621');
                        }else{
                            item.setAttribute('style','');
                        }
                        
                    }
                }

                function adjustLayout(){
                    var w = window.innerWidth;
                    var player_section=document.getElementById('player-section');
                    var lesson_section=document.getElementById('lesson-section');
                    var footer=document.getElementById('footer');
                    var footer2=document.getElementById('footer2');
                 
                    var detail_section=document.getElementById('detail-section');

                    var w_player_section=player_section.offsetWidth;
                    //console.log('windown',w,'lesson section',w_lesson_section);

                    if(w<=w_player_section+250){
                        lesson_section.setAttribute('class','col-lg-4 col-md-6 scrollLessonContent');
                        
                        footer.setAttribute('style','display:none');
                        footer2.setAttribute('style','display:block');
                   
                        detail_section.setAttribute('style','display:none');
                    }else{
                        lesson_section.setAttribute('class','col-lg-4 col-md-6 scrollLessonContent fixContainer');
                        footer.setAttribute('style','');
                        footer2.setAttribute('style','display:none');

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
                            comment_container.innerHTML="";
                            if(status=='success'){
                                comments=data.comments;
                                setComments(comments);
                            }else{
                                comment_container.innerHTML=`
                                <div style="padding:20px; text-align:center">
                                    No comment
                                </div>
                                `;
                                comments=[];
                            }
                            
                        }
                    };
                    ajax.open("GET",`api/comments/get.php?user_id=${user_id}&post_id=${post_id}`,true);
                    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    ajax.send();
                }

                function loadMoreComment(){
                    commentPage=commentPage+10;
                    setComments(comments);
                }

                function setComments(comments){
                    if(comments.length<=10){
                        loopComment(comments,0,comments.length);
                        hasMoreComment=false;
                    }else{
                        console.log('load more comment');
                        loopComment(comments,commentPage-10,commentPage);
                    }
                    
                }

                function updateState(){
                    comment_container.innerHTML="";
                    loopComment(comments,0,commentPage);
                }

                function loopComment(comments,start,end){
                    console.log(start, end );
                    for(var i=start;i<end;i++){
                        if(i>=comments.length){
                            hasMoreComment=false;
                            break;
                        } 
                        var comment=comments[i];
                        comment_container.innerHTML+=commentComponent(comment,i); 
                        if(comment.child){
                            var children=comment.child;
                            var child_container=document.getElementById('cmt_child_'+comment.time);
                            for(var j=0;j<children.length;j++){
                                var child=children[j];
                                child_container.innerHTML+= childComment(child,i,j);
                            }
                        }   
                    }
                }

                function commentComponent(comment,index){
                
                    var editMenu="";
                    if(comment.writer_id==user_id){
                        editMenu =`
                        <br>
                        <div class="eps_dots more_dropdown">
                            <a href="javascript:void(0)"><i class="uil uil-ellipsis-v"></i></a>
                            <div class="dropdown-content">
                                <span onclick="showCmtEditInput(${comment.time})"><i class='uil uil-comment-alt-edit'></i>Edit</span>
                                <span onclick="showCmtDelDiague(${comment.time},${index})"><i class='uil uil-trash-alt'></i>Delete</span>
                            </div>																											
                        </div>
                        `;
                    }

                    let like_thumb_btn;
                    if(comment.is_liked=="1"){
                        like_thumb_btn=`
                            <i id="cmt_like_icon_${comment.time}" style="color:red" class="fas fa-thumbs-up"></i> 
                        `;
                    }else{
                        like_thumb_btn=`
                            <i id="cmt_like_icon_${comment.time}"  class="far fa-thumbs-up"></i> 
                        `;
                    }

                    return `
                        <div class="review_item" style="padding-top:10px;padding-bottom:10px;">
                            <div class="review_usr_dt">
                                <img src="${comment.learner_image}" style="width:35px; height:35px;" alt="">
                                <div class="rv1458">
                                    <h4 class="tutor_name1">${comment.learner_name}</h4>
                                    <span class="time_145">${formatDateTime(comment.time)}</span>

                                    <div  id="cmt_body_${comment.time}">
                                    <div class="rvds10" style="margin-top: 7px;">${comment.body}</div>
                                    <div class="rpt100">
                                        <div class="radio--group-inline-container">
                                            <div class="radio-item">
                                                <a href="javascript:void(0)" class="report145" id="cmt_like_${comment.time}" onclick="likeParentComment(${user_id},${comment.post_id},${comment.time},${index})"> 
                                                    ${like_thumb_btn}
                                                    <label for="cmt_like_${comment.time}" class="radio-label">
                                                        <span id="cmt_like_count_${comment.time}">${formatReact(comment.likes)}</span>
                                                    </label>
                                                </a>
                                            </div>
                                            <div class="radio-item" >
                                                <a href="javascript:void(0)" class="report145" id="cmt_like_${comment.time}" onclick="showReplyInput(${comment.time});"> 
                                                    <i class="far fa-comment"></i>
                                                    <label  for="cmt_like_${comment.time}" class="radio-label">reply</label>
                                                </a>
                                            </div>
                                        </div>
                                    
                                    </div>
                                </div>

                                </div>
                                ${editMenu}
                            </div>

                        
                            <div id="edit_input_container_${comment.time}" style="display:none">
                                <div class="cmt-reply">
                                    <input  id="input_edit_${comment.time}" type="text" placeholder="Enter comment" value="${comment.body}" style="margin-right:200px;padding:5px;"/>
                                    <button onclick="cancelEditCmt(${comment.time})" style="position:absolute;bottom:0;right:100px;" class="btn">Cancel</button>
                                    <button onclick="updateComment(${comment.time},${index})" style="position:absolute;bottom:0;right:0" class="subscribe-btn">Save</button>

                                </div>
                            </div>


                            <div id="reply_input_container_${comment.time}" style="display:none;">
                                <div class="cmt-reply">
                                    <div>
                                        <img style="width:30px;height:30px;border-radius:50%;" src="${user.learner_image}" />
                                    </div>

                                    <input  id="input_reply_${comment.time}" type="text" placeholder="Reply the comment"/>

                                    <button onclick="addReply(${comment.time})" style="position:absolute;bottom:0;right:0" class="subscribe-btn">Add</button>

                                </div>
                            </div>

                            <div id="cmt_child_${comment.time}"></div>

                        </div>
                    `;
                }

                function showCmtDelDiague(cmtId,index,j){
                    var modalContainer=document.getElementById('modalContainer');
                    modalContainer.innerHTML=`
                    <div id="myModal" class="modal">
                        <div class="modal-content" style="width:50%;margin:auto;margin-top:70px;">
                
                            <h4 style="margin: 30px;">Do you really want to delete?</h4>
                            <br>
                            <div style="margin:30px; padding-left:10%;padding-right:10%;">
                                <button class="btn btn-primary" id="modalCanel" style="float:left">Cancel</button>
                                <button class="btn btn-danger" onclick="deleteComment(${cmtId},${index},${j})" id="modalDelete" style="float:right">Delete</button>
                            </div>

                        </div>
                    </div>
                    `;

                    $('#myModal').modal('show');
                    $("#modalCanel").click(function () {
                        
                    });
                }

                function deleteComment(cmtId,index,j){

                    if(j===undefined){
                        comments.splice(index,1);
                    }else{
                        var children=comments[index].child;
                        children.splice(j,1);
                    }
                    updateState();

                    var ajax=new XMLHttpRequest();
                    ajax.onload =function(){
                        if(ajax.status==200 || ajax.readyState==4){
                            
                        }
                    };
                    ajax.open("POST","https://www.calamuseducation.com/calamus-v2/api/korea/comments/delete",true);
                    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    ajax.send(`postId=${currentVideo.post_id}&time=${cmtId}`);
                }

                function childComment(comment,index,j){

                    var editMenu="";
                    if(comment.writer_id==user_id){
                        editMenu =`
                        <br>
                        <div class="eps_dots more_dropdown">
                            <a href="javascript:void(0)"><i class="uil uil-ellipsis-v"></i></a>
                            <div class="dropdown-content">
                                <span onclick="showCmtEditInput(${comment.time})"><i class='uil uil-comment-alt-edit'></i>Edit</span>
                                <span onclick="showCmtDelDiague(${comment.time},${index})"><i class='uil uil-trash-alt'></i>Delete</span>
                            </div>																											
                        </div>
                        `;
                    }

                    let like_thumb_btn;
                    if(comment.is_liked=="1"){
                        like_thumb_btn=`
                            <i id="cmt_like_icon_${comment.time}" style="color:red" class="fas fa-thumbs-up"></i> 
                        `;
                    }else{
                        like_thumb_btn=`
                            <i id="cmt_like_icon_${comment.time}"  class="far fa-thumbs-up"></i> 
                        `;
                    }
                
                    return `
                        <div style="margin-left:40px;padding:7px;">
                            <div class="review_usr_dt">
                                <img src="${comment.learner_image}" style="width:27px; height:27px;" alt="">
                                <div class="rv1458">
                                    <h5 class="tutor_name1">${comment.learner_name}</h5>
                                    <span class="time_145">${formatDateTime(comment.time)}</span>
                                
                                    <div id="cmt_body_${comment.time}">
                                        <div class="rvds10" style="margin-top: 7px;">${comment.body}</div>
                                        <div class="rpt100">
                                            <div class="radio--group-inline-container">
                                                <div class="radio-item">
                                                    <a href="javascript:void(0)" class="report145" id="cmt_like_${comment.time}" onclick="likeChildComment(${user_id},${comment.post_id},${comment.time},${index},${j})"> 
                                                        ${like_thumb_btn}
                                                    </a>
                                                    <label for="cmt_like_${comment.time}" class="radio-label">
                                                        <span id="cmt_like_count_${comment.time}">${formatReact(comment.likes)}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        
                                        </div>
                                    </div>

                                </div>
                                ${editMenu}
                            </div>
                            

                            <div id="edit_input_container_${comment.time}" style="display:none">
                                <div class="cmt-reply">
                                    <input  id="input_edit_${comment.time}" type="text" placeholder="Enter comment" value="${comment.body}" style="margin-right:200px;padding:5px;"/>
                                    <button onclick="cancelEditCmt(${comment.time})" style="position:absolute;bottom:0;right:100px;" class="btn">Cancel</button>
                                    <button onclick="updateComment(${comment.time},${index},${j})" style="position:absolute;bottom:0;right:0" class="subscribe-btn">Save</button>

                                </div>
                            </div>
                        
                            <div id="cmt_child_${comment.time}"></div>

                        </div>
                    `;
                }

                function showReplyInput(id){
                    var reply_input=document.getElementById("reply_input_container_"+id);
                    reply_input.setAttribute('style','display:block');
                }

                function showCmtEditInput(id){
                    var edit_container=document.getElementById("edit_input_container_"+id);
                    var cmtBody=document.getElementById('cmt_body_'+id);
                    edit_container.setAttribute('style','display:block');
                    cmtBody.setAttribute('style','display:none');

                }

                function cancelEditCmt(id){
                    var edit_container=document.getElementById("edit_input_container_"+id);
                    var cmtBody=document.getElementById('cmt_body_'+id);
                    edit_container.setAttribute('style','display:none');
                    cmtBody.setAttribute('style','display:block');
                }

                function updateComment(id,index,childIndex){
                    var input_edit=document.getElementById("input_edit_"+id);
                    var body=input_edit.value;

                    var ajax=new XMLHttpRequest();
                    ajax.onload =function(){
                        if(ajax.status==200 || ajax.readyState==4){
                            console.log(ajax.responseText);
                            
                            if(childIndex===undefined){
                                comments[index].body=body;
                            }else{
                                comments[index].child[childIndex].body=body;
                            }
                            updateState();
                        }
                    };
                    ajax.open("POST","api/comments/update.php",true);
                    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    ajax.send(`comment_id=${id}&body=${body}`);

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

                function likeParentComment(user_id,post_id,comment_id,index){
                    
                    console.log('index ',index);
                    
                    likeComment(user_id,post_id,comment_id);
                    if(comments[index].is_liked==1){
                        comments[index].is_liked=0;
                        comments[index].likes= comments[index].likes-1;
                    }else{
                        comments[index].is_liked=1;
                        comments[index].likes= parseInt(comments[index].likes)+1;
                    }

                    
                    updateState();
                }

                function likeChildComment(user_id,post_id,comment_id,index,j){
                
                    likeComment(user_id,post_id,comment_id);
                    if(comments[index].child[j].is_liked==1){
                        comments[index].child[j].is_liked=0;
                        comments[index].child[j].likes= comments[index].child[j].likes-1;
                    }else{
                        comments[index].child[j].is_liked=1;
                        comments[index].child[j].likes= parseInt(comments[index].child[j].likes)+1;
                    }
                    updateState();
                }

                function likeComment(user_id,post_id,comment_id){
                    
                    var ajax=new XMLHttpRequest();
                    ajax.onload =function(){
                        if(ajax.status==200 || ajax.readyState==4){
                        
                        }
                    };
                    ajax.open("POST","https://www.calamuseducation.com/calamus-v2/api/korea/comments/like",true);
                    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    ajax.send(`user_id=${user_id}&post_id=${post_id}&comment_id=${comment_id}`);

                }


                function addComment(){
                    var input_comment=document.getElementById('input_comment');
                    var body=input_comment.value;
                    input_comment.value="";
                    var post_id=currentVideo.post_id;
                    sentComment(post_id,user_id,10000,body,0,0,(newCmt)=>{
                        newCmt.learner_image=user.learner_image;
                        newCmt.learner_name=user.learner_name;
                        comments.push(newCmt);
                        updateState();
                    });
                
                }

                function addReply(parentId){
                    var input_reply=document.getElementById('input_reply_'+parentId);
                    var body=input_reply.value;
                    input_reply.value="";
                    var post_id=currentVideo.post_id;

                    sentComment(post_id,user_id,10000,body,parentId,1,(newCmt)=>{
                        newCmt.learner_image=user.learner_image;
                        newCmt.learner_name=user.learner_name;
                        console.log('parent id id ',parentId);
                        var parentCmt=comments.find(o=> o.time==parentId)
                        if(parentCmt.child){
                            parentCmt.child.push(newCmt);
                        }else{
                            var arr=[newCmt];
                            parentCmt.child=arr;
                        }
                        updateState();
                    });
                }

                function sentComment(post_id,writer_id,owner_id,body,parent,action,callback){
                    
                    var ajax=new XMLHttpRequest();
                    ajax.onload =function(){
                        if(ajax.status==200 || ajax.readyState==4){
                            var newCmt=JSON.parse(ajax.responseText);
                            callback(newCmt);
                        }
                    };
                    ajax.open("POST","https://www.calamuseducation.com/calamus-v2/api/korea/comments/add",true);
                    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    ajax.send(`post_id=${post_id}&writer_id=${writer_id}&owner_id=${owner_id}&body=${body}&parent=${parent}&action=${action}`);
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

                function formatCounting(count){

                    if(count>=0 && count<1000){
                    return count;
                    }

                    if(count>=1000&&count<1000000){
                        count=count/1000;
                        count= Math.round(count * 10) / 10
                        return count +"k"; 
                    }

                    if(count>=1000000){
                        count=count/1000000;
                        count= Math.round(count * 10) / 10
                        return count+"M"; 
                    }
                }


            </script>

        </div>
    </div>
	<!-- Body End -->

	<script src="assets/js/vertical-responsive-menu.min.js"></script>
	<script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
	<script src="assets/vendor/OwlCarousel/owl.carousel.js"></script>
	<script src="assets/vendor/semantic/semantic.min.js"></script>
	<script src="assets/js/custom.js"></script>
	<script src="assets/js/night-mode.js"></script>
	
</body>
</html>