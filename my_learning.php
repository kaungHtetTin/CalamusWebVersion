<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/course.php');
    include('classes/teacher.php');
    include ('classes/auth.php');
    include ('classes/study.php');
    $page_title="My Learning";
    

    $Auth=new Auth();
    $user =$Auth->check_login($_SESSION['calamus_userid']);

    $Course=new Course();
    $Teacher=new Teacher();
    $Study=new Study();

    $courses=$Course->get();
    $my_learning_courses=$Course->learnningCourse($user['learner_phone']);
    $learn_counts=$Study->getCountByCourse($user['learner_phone']);
 
    include('layouts/header.php');
?>
<style>
    .my-spinner {
        width: 100px;
        height:100px;
        border:0px solid green;
    }
</style>
<div class="wrapper">
    <div class="sa4d25">
        <div class="container-fluid">			
            <div class="row">
                <div class="col-xl-12 col-lg-12">
                    <div class="section3125">
                        <div class="explore_search">
                            <h4 class="item_title">My Learning</h4>
                            <div class="ui selection dropdown skills-search vchrt-dropdown" style="float:right">
                                <input name="date" type="hidden" value="default" id="selector">
                                <i class="dropdown icon d-icon"></i>
                                <div class="text">Filter</div>
                                <div class="menu">
                                    <div class="item" data-value="all">All</div>
                                    <div class="item" data-value="english">Easy English</div>
                                    <div class="item" data-value="korea">Easy Koean</div>
                                </div>
                            </div>
                        </div>							
                    </div>							
                </div>
                 
                <div class="col-md-12">
                    <div class="_14d25">
                        
                        <div class="row" id="course_container">
                                   
                        </div>				
                    </div>				
                </div>				
            </div>
        </div>
    </div>

    <script>
        var courses= <?php echo json_encode($courses) ?>;
        var my_courses= <?php echo json_encode($my_learning_courses) ?>;
        var learn_counts=<?php echo json_encode($learn_counts) ?>;

       console.log('my course',my_courses);

        var course_container=document.getElementById('course_container');
        var selector=document.getElementById('selector');
       // var input_search=document.getElementById('input_search');
    
        setCourse(courses);


        function setCourse(courseArr){
            for(var i=0;i<courseArr.length;i++){
                var course=courseArr[i];
                for(var j=0;j<my_courses.length;j++){
                    var my_course=my_courses[j];
                    if(course.course_id==my_course.course_id){
                        course_container.innerHTML+=courseComponent(course);
                       
                    }
                }
            }
        }

        
         function courseComponent(course){
           
            return `
                <div class="col-lg-4 col-md-4  col-sm-6 col-xs-6">
                    <div class="fcrse_1 mt-30">
                        <a href="course_detail.php?course_id=${course.course_id}" class="fcrse_img">
                            <div style=" position: relative; height: 100px;background:${course.background_color}">
                                <img src="${course.cover_url}"style="height:80px; width: 80px; position: absolute;bottom:0; left:50px;" alt="">
                            </div>

                            <div class="course-overlay">
                                <div class="badge_seller">${course.major}</div>
                                
                                <span class="play_btn1"><i class="uil uil-play"></i></span>
                                <div class="crse_timer">
                                    ${course.lessons_count} lectures
                                </div>
                            </div>
                        </a>
                        <div class="fcrse_content">
                            <div class="vdtodt">
                                <span class="vdt14">${course.duration} Days</span>
                            </div>
                            <a href="course_detail.php?course_id=${course.course_id}" class="crse14s">${course.title}</a>
                            <div align="center" id="progress_bar${course.course_id}">
                                <canvas class="my-spinner"  id="spinner${course.course_id}" width="300" height="300"></canvas>
                            </div>
                            <div class="auth1lnkprce">
                                <p class="cr1fot">By <a href="instructor_profile.php?teacher_id=${course.teacher_id}">${course.teacher_name}</a></p>
                                <div class="prce142">
                                    <a href="course_detail.php?course_id=${course.course_id}" class="upload_btn">Learn Now</a>
                                </div>
                            </div>
                        </div>
                    </div>													
                </div>
            
            `;
        }
              
        function formatRating(rating){
            rating=rating*10;
            rating=Math.round(rating);
            rating=rating/10;
            return rating;
        }
        
        selector.addEventListener("change",()=>{
            selected=selector.value;
            filterCourse(selected);
        });

        function filterCourse(selected){
            course_container.innerHTML="";
             var filteredResults;
            if(selected=='all'){
                 filteredResults=courses;
            }else{
                filteredResults=courses.filter(check)
            }

            setCourse(filteredResults);
            setProgress(filteredResults);
        }

        function check(course){
            return course.major==selector.value;
        }

        function drawProgressBar(course_id) {

            let degrees=getProgessDegree(course_id);
            let spinner = document.getElementById("spinner"+course_id);
            let ctx = spinner.getContext("2d");
            let width = spinner.width;
            let height = spinner.height;
            let color = "#0f0";
            let bgcolor = "#ccc";
            let text;
            
            let animation_loop, redraw_loop;

            ctx.clearRect(0, 0, width, height);
        
            ctx.beginPath();
            ctx.strokeStyle = bgcolor;
            ctx.lineWidth = 30;
            ctx.arc(width/2, width/2, 100, 0, Math.PI*2, false);
            ctx.stroke();
            let radians = degrees * Math.PI / 180;
        
            ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 30;
                ctx.arc(width/2, height/2, 100, 0 - 90*Math.PI/180, radians - 90*Math.PI/180, false); 
                ctx.stroke();
                ctx.fillStyle = color;
                    ctx.font = "50px arial";
                    text = Math.floor(degrees/360*100) + "%";
                    text_width = ctx.measureText(text).width;
                ctx.fillText(text, width/2 - text_width/2, height/2 + 15);
        }


       setProgress(courses);
        
        function setProgress(courseArr){
            for(var i=0;i<courseArr.length;i++){
                var course=courseArr[i];
                for(var j=0;j<my_courses.length;j++){
                    var my_course=my_courses[j];
                    if(course.course_id==my_course.course_id){
                        drawProgressBar(course.course_id);
                    }
                }
            }
        }

        function getProgessDegree(course_id){
            var result=10;
            for(var i=0;i<learn_counts.length;i++){
                var counter=learn_counts[i];
                if(counter.course_id==course_id){
                    var learned=counter.count;
                    var total=counter.lessons_count;
                    if(learned==0){
                        result=0;
                    }else{
                        result=(learned/total)*360;
                         
                    }
                    
                    break;
                }
            }
            return result;
        }
        
       
      




    </script>

<?php 
    include('layouts/footer.php');
?>

