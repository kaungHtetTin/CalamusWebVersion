<?php 
    session_start();
  
    include('classes/connect.php');
    include('classes/course.php');
    include('classes/teacher.php');
    include ('classes/auth.php');
    $page_title="Explore";
    

    $Auth=new Auth();
    $user = false;
	if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
    }

    $Course=new Course();
    $Teacher=new Teacher();
    $courses=$Course->get();
 
    include('layouts/header.php');
?>
<div class="wrapper">
    <div class="sa4d25">
        <div class="container-fluid">			
            <div class="row">
                <!-- <div class="col-xl-8 col-lg-8">
                    <div class="section3125">
                        <div class="explore_search">
                            <div class="ui search focus">
                                <div class="ui left icon input swdh11">
                                    <input id="input_search" class="prompt srch_explore" type="text" placeholder="Search for a course">
                                    <i class="uil uil-search-alt icon icon2"></i>
                                </div>
                            </div>
                        </div>							
                    </div>							
                </div> -->
                <div class="col-xl-4 col-lg-4">
                    <div class="ui selection dropdown skills-search vchrt-dropdown">
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
        var course_container=document.getElementById('course_container');
        var selector=document.getElementById('selector');
       // var input_search=document.getElementById('input_search');
    
        setCourse(courses);


        function setCourse(courseArr){
            
            for(var i=0;i<courseArr.length;i++){
                
                var course=courseArr[i];
              
                course_container.innerHTML+=courseComponent(course);
            }
        }

        
        function courseComponent(course){
           
            return `
                <div class="col-lg-4 col-md-4  col-sm-6 col-xs-12">
                    <div class="fcrse_1 mt-30">
                        <a href="course_detail.php?course_id=${course.course_id}" class="fcrse_img">
                            
                            <img src="${course.web_cover}"alt="">
                            
                            <div class="course-overlay">
                                <div class="badge_seller">${course.major}</div>
                                <div class="crse_reviews">
                                    <i class="uil uil-star"></i>${formatRating(course.rating,1)}
                                </div>
                                
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
                            <a href="course_detail.php?course_id=${course.course_id}" class="crse-cate">${course.major} | ${course.description}</a>
                            <div class="auth1lnkprce">
                                <p class="cr1fot">By <a href="instructor_profile.php?teacher_id=${course.teacher_id}">${course.teacher_name}</a></p>
                                <div class="prce142">${course.fee} MMK</div>
                                <button onclick="window.location.href='vip_plan.php'" class="shrt-cart-btn" title="cart"><i class="uil uil-shopping-cart-alt"></i></button>
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
        }

        function check(course){
            return course.major==selector.value;
        }

        // input_search.addEventListener('input', function (txt) {
        //     console.log('input text',input_search.value);
        // });

    </script>

<?php 
    include('layouts/footer.php');
?>

