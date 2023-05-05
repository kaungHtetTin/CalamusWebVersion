<?php 
    session_start();
  
    include('classes/connect.php');
    include ('classes/auth.php');
    include('classes/app.php');

    $page_title="Discussion";
    

    $Auth=new Auth();
    $user =$Auth->check_login($_SESSION['calamus_userid']);

    $App=new App();
    $app=$App->getRand();
    
    include('layouts/header.php');
?>
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
        top: 0;
        right: 0;
    }

    .post{
        margin-bottom:10px;
    }

    .shimmer {
        color: grey;
        display:inline-block;
        -webkit-mask:linear-gradient(-60deg,#000 30%,#0005,#000 70%) right/300% 100%;
        background-repeat: no-repeat;
        animation: shimmer 2.5s infinite;
        font-size: 50px;
        
    }

</style>

	<!-- Body Start -->
<div class="wrapper">
    <div class="sa4d25">
        <div class="container-fluid">	
            <div class="row">
                
                <div align="center" class="col-xl-9 col-lg-8">
                 
                    <div class="container" style="padding-left:50px;padding-right:50px;">
                        <div class="cmmnt_1526">
                            <div class="cmnt_group">
                                <div class="img160">
                                    <img src="<?php echo $user['learner_image'] ?>" alt="">										
                                </div>
                                <textarea class="_cmnt001" placeholder="Add a new post"></textarea>
                            </div>
                            <button class="cmnt-btn" type="submit">Add</button>
                        </div>

                        <div id="post_container">
                           
                        </div>
                        <div id="shimmer">
                             <div class="review_all120 post">
                                <div class="review_item" style="width:100%;">
                                    <div class="shimmer" style="width:100%;">
                                        <div class="review_usr_dt">
                                            <img src="https://www.calamuseducation.com/uploads/placeholder.png" style="width:50px; height:50px;" alt="">
                                            
                                            <div align="left">
                                                <div style="width:100px; height:17px; background:#ddd;border-radius:3px;"></div>
                                                <div style="width:65px; height:17px; margin-top:5px; background:#ddd;border-radius:3px;"></div>
                                            </div>
                                            
                                        </div>
                                        <p class="rvds10" style="width:100%; height:60px; background:#ddd;border-radius:3px;"></p>
                                        
                                    </div>
                                </div>
                            </div>
                            <div class="review_all120 post">
                                <div class="review_item" style="width:100%;">
                                    <div class="shimmer" style="width:100%;">
                                        <div class="review_usr_dt">
                                            <img src="https://www.calamuseducation.com/uploads/placeholder.png" style="width:50px; height:50px;" alt="">
                                            
                                            <div align="left">
                                                <div style="width:100px; height:17px; background:#ddd;border-radius:3px;"></div>
                                                <div style="width:65px; height:17px; margin-top:5px; background:#ddd;border-radius:3px;"></div>
                                            </div>
                                            
                                        </div>
                                        <p class="rvds10" style="width:100%; height:60px; background:#ddd;border-radius:3px;"></p>
                                        
                                    </div>
                                </div>
                            </div>
                            <div class="review_all120 post">
                                <div class="review_item" style="width:100%;">
                                    <div class="shimmer" style="width:100%;">
                                        <div class="review_usr_dt">
                                            <img src="https://www.calamuseducation.com/uploads/placeholder.png" style="width:50px; height:50px;" alt="">
                                            
                                            <div align="left">
                                                <div style="width:100px; height:17px; background:#ddd;border-radius:3px;"></div>
                                                <div style="width:65px; height:17px; margin-top:5px; background:#ddd;border-radius:3px;"></div>
                                            </div>
                                            
                                        </div>
                                        <p class="rvds10" style="width:100%; height:60px; background:#ddd;border-radius:3px;"></p>
                                        
                                    </div>
                                </div>
                            </div>
                           
                        </div>
                        <div class="review_all120 post" onclick="loadMore();">
                            <div class="review_item">
                                <a href="javascript:void(0)" class="more_reviews">See More</a>
                            </div>
                        </div>
                         
                    </div>
                   
                </div>


                <div class="col-xl-3 col-lg-3 scrollLessonContent fixContainer">
                    <div class="right_side">
                        <br><br><br><br><br>
                        <img class="mb-30" style="width:100%;" src="https://www.calamuseducation.com/uploads/icons/easyenglish_vip.png"/>
                        <img class="mb-30" style="width:100%;" src="https://www.calamuseducation.com/uploads/icons/easykoreanvipbanner.png"/>
                         
                        <div class="fcrse_3">
                            <div class="cater_ttle">
                                <h4>Use Mobile App</h4>
                            </div>
                            <div><img style="width: 100%" src="<?php echo $app['cover'];?>"/></div>
                            <a href="<?php echo $app['url']; ?>">
                                <div style=" background:#1B2730;padding:10px;display:flex;">
                                    <div>
                                        <img src="<?php echo $app['icon']; ?>" style="width: 40px; height:40px; float:left;margin-right:10px;"/>  
                                    </div>
                                    <div style="flex:1">
                                            <div style="color:white; font-size:12px;"><?php echo $app['name'] ?></div>
                                            <div style="color:#44CB6D; font-size:10px;"> <?php echo $app['description']; ?> </div>
                                    </div>
                                                    
                                    <div style="color:#4B93FF;text-align:center;"> Install</div>
                                </div>
                            </a>
                        </div>

                        <br><br><br>

                    </div>
                </div>

            </div>
        </div>
    </div>
</div>

<!-- Body End -->
<script>
    var mCode="<?php echo $_GET['mcode']; ?>";
    var userid=<?php echo $user['learner_phone']; ?>;
    var category="<?php echo $_GET['category']?> ";
    var page=1;
    $(document).ready(function(){
        fetchPost(page);
    });

    function loadMore(){
        $('#shimmer').show();
        page++;
        fetchPost(page);
    }

    function fetchPost(page){
        var url=`https://www.calamuseducation.com/calamus-v2/api/${category}/posts?mCode=${mCode}&userId=${userid}&page=${page}`;
        $.get(url,function(data,status){
            var posts=data.posts;
            $('#shimmer').hide();
            posts.map((post)=>{
                console.log(post);
                 $('#post_container').append(postComponent(post));
            })
        })
    }

    function postComponent(post){

        var blueMark="";
        if(post.vip==1){
            blueMark=`<i style="color:#1da1f2" class='uil uil-check-circle'></i>`;
        }

        var image="";
        if(post.postImage!==""){
            image=`
            <div>
                <img style="width:100%" src="${post.postImage}"/>
            </div>
            `;
        }

        return `
            <div class="review_all120 post">
                <div class="">
                    <div class="review_usr_dt" style="margin:15px;">
                        <img src="${post.userImage}" style="width:40px;height:40px;" alt="">
                        <div class="rv1458" align="left">
                            <h4 class="tutor_name1">
                                ${post.userName} ${blueMark}
                            </h4>
                            <span class="time_145">${formatDateTime(post.postId)}</span>
                        </div>
                        <div class="eps_dots more_dropdown">
                            <a href="#"><i class="uil uil-ellipsis-v"></i></a>
                            <div class="dropdown-content">
                                <span><i class='uil uil-comment-alt-edit'></i>Edit</span>
                                <span><i class='uil uil-trash-alt'></i>Delete</span>
                            </div>																											
                        </div>
                    </div>
                    <p style="margin-left:15px;margin-right:15px;" class="rvds10">${post.body}</p>
                    ${image}
                    <div class="rpt100" style="margin:15px;">
                        <span>Was this review helpful?</span>
                        <div class="radio--group-inline-container">
                            <div class="radio-item">
                                <input id="radio-1" name="radio" type="radio">
                                <label for="radio-1" class="radio-label">Yes</label>
                            </div>
                            <div class="radio-item">
                                <input id="radio-2" name="radio" type="radio">
                                <label  for="radio-2" class="radio-label">No</label>
                            </div>
                        </div>
                        <a href="#" class="report145">Report</a>
                    </div>
                </div>
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


</script>


<script src="assets/js/vertical-responsive-menu.min.js"></script>
<script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="assets/vendor/OwlCarousel/owl.carousel.js"></script>
<script src="assets/vendor/semantic/semantic.min.js"></script>
<script src="assets/js/custom.js"></script>
<script src="assets/js/night-mode.js"></script>


	
</body>
</html>