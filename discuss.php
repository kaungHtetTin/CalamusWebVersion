<?php 
    session_start();
  
    include('classes/connect.php');
    include ('classes/auth.php');
    include('classes/app.php');
    include('classes/post.php');

    $page_title="Discussion";
    

    $Auth=new Auth();
    $user =$Auth->check_login($_SESSION['calamus_userid']);

    $App=new App();
    $app=$App->getRand();

    $Post=new Post();
    $blogs=$Post->getBlogPost();

    $mCode=$_GET['mcode'];
    $category=$_GET['category'];
    
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

    .react-icon{
        width:20px;
        height:20px;
    }

    

</style>

	<!-- Body Start -->
<div class="wrapper" onresize="adjustLayout()">
    <div class="sa4d25">
        <div class="container-fluid">	
            <div class="row">
                
                <div align="center" class="col-xl-9 col-lg-9" id="post-section">
                 
                    <div class="" style="padding-left:20px;padding-right:20px;">
                        <div class="cmmnt_1526">
                            <div class="cmnt_group">
                                <div class="img160">
                                    <img src="<?php echo $user['learner_image'] ?>" alt="">										
                                </div>
                                <textarea id="post_input" class="_cmnt001" placeholder="Add a new post"></textarea>
                            </div>
                            <button  class="cmnt-btn" onclick="addPost()" >Add</button>
                        </div>
                        <div class="section3125">
                            <h6 class="item_title">Pinned Blog</h6>
                            <a href="explore.php" class="see150">See all</a>
                            <div class="la5lo1">
                                <div class="owl-carousel featured_courses owl-theme">
                                    <?php foreach($blogs as $blog){ 
                                        $post_id=$blog['post_id'];
                                        ?>
                                    <div class="item">
                                        <div class="fcrse_1 mb-20">
                                            <a href="blog_single_view.html" class="hf_img">
                                            <img src="<?php echo $blog['image']; ?>" alt="" style="height:100px;">
                                                <div class="course-overlay"></div>
                                            </a>
                                            <div class="hs_content">
                                                <div class="vdtodt">
                                                    <span class="vdt14"><?php echo $Post->formatDateTime($blog['post_id']) ?></span>
                                                </div>
                                                <a href="blog_single_view.html" class="crse14s title900"><?php echo $blog['blog_title'] ?></a>
                                                <p class="blog_des"><?php echo $blog['body']; ?></p>
                                                <a href="<?php echo "discuss_detail.php?mCode=$mCode&category=$category&post_id=$post_id" ?>" class="view-blog-link">Read More<i class="uil uil-arrow-right"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                    <?php }?>
                                </div>
                            </div>
                        </div>
                         

                        <div id="post_adding">
                            <div class="col-md-12 channel_my item">
                                <div class="main-loader">													
                                    <div class="spinner">
                                        <div class="bounce1"></div>
                                        <div class="bounce2"></div>
                                        <div class="bounce3"></div>
                                    </div>																										
                                </div>
                            </div>
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
                                        <p class="rvds10" style="width:100%; height:150px; background:#ddd;border-radius:3px;"></p>
                                        
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
                                        <p class="rvds10" style="width:100%; height:150px; background:#ddd;border-radius:3px;"></p>
                                        
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
                                        <p class="rvds10" style="width:100%; height:150px; background:#ddd;border-radius:3px;"></p>
                                        
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


                <div class="col-xl-3 col-lg-3 scrollLessonContent fixContainer" id="right-section">
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
    <div id="modalContainer"></div>
</div>

<!-- Body End -->
<script>
    var mCode="<?php echo $_GET['mcode']; ?>";
    var userid=<?php echo $user['learner_phone']; ?>;
    var currentUser=<?php echo json_encode($user) ?>;
    var category="<?php echo $_GET['category']?>";

    console.log(currentUser);

    var page=1;
    var postArr=[];
    $(document).ready(function(){
        fetchPost(page);
        $('#post_adding').hide();
    });

    function loadMore(){
        $('#shimmer').show();
        page++;
        fetchPost(page);
    }
    adjustLayout()

    function adjustLayout(){
        var w = window.innerWidth;
        var right_section=document.getElementById('right-section');
        var post_section=document.getElementById('post-section');

        var w_post_section=post_section.offsetWidth;
       
        console.log('width ',w, 'post ',w_post_section);

        if(w<=w_post_section){
           
            right_section.setAttribute('style','display:none');
        
        }else{
            
             post_section.setAttribute('style','padding-left:70px;padding-right:70px;');
        }
    }

    function fetchPost(page){
        var url=`https://www.calamuseducation.com/calamus-v2/api/${category}/posts?mCode=${mCode}&userId=${userid}&page=${page}`;
        $.get(url,function(data,status){
            var posts=data.posts;
            $('#shimmer').hide();
            posts.map((post,index)=>{
                postArr.push(post);
                if(post.hidden!=1 && post.blocked!=1){
                    $('#post_container').append(postComponent(post));
                }
                 
            })
        })
    }

    function postComponent(post){

        var blueMark="";
        if(post.vip==1){
            blueMark=`<i style="color:#1da1f2" class='uil uil-check-circle'></i>`;
        }

        var media="";
        if(post.postImage!==""){
            media=`
                <div>
                    <img style="width:100%" src="${post.postImage}"/>
                </div>
            `;
        }

        if(post.has_video==1){
            media=`
                <div id="video_player">
                     <div style="padding:56.25% 0 0 0;position:relative;">
                        <iframe src="${post.vimeo}" 
                            frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Lesson 6 Rules for word stress"></iframe>
                    </div>
                </div>
                
            `;
        }

        var likeIcon=`<img class="react-icon" src="icon/icon_post_normal_react.png"/>`;
        if(post.is_liked==1){
            likeIcon=`<img class="react-icon" src="icon/icon_post_reacted.png"/>`;
        }

        var editMenu="";
        if(post.userId==userid){
            editMenu =`
            <br>
            <div class="eps_dots more_dropdown" align="left">
                <a href="javascript:void(0)"><i class="uil uil-ellipsis-v"></i></a>
                <div class="dropdown-content">
                    <span onclick=""><i class='uil uil-comment-alt-edit'></i>Edit</span>
                    <span onclick="showPostDelDiague(${post.postId})"><i class='uil uil-trash-alt'></i>Delete</span>
                    <span onclick=""><i class='uil uil-exclamation-circle'></i>Report</span>
                    <span onclick=""><i class='uil uil-arrow-circle-down'></i>Save</span>
                    <span onclick=""><i class='uil uil-heart-sign'></i>Reacts</span>
                </div>																											
            </div>
            `;
        }else{
            editMenu =`
            <br>
            <div class="eps_dots more_dropdown" align="left">
                <a href="javascript:void(0)"><i class="uil uil-ellipsis-v"></i></a>
                <div class="dropdown-content">
                    <span onclick="showPostHideDiague(${post.postId})"><i class='uil uil-eye-slash'></i>Hide</span>
                    <span onclick="report()"><i class='uil uil-exclamation-circle'></i>Report</span>
                    <span onclick="savePost()"><i class='uil uil-arrow-circle-down'></i>Save</span>
                    <span onclick=""><i class='uil uil-heart-sign'></i>Reacts</span>

                </div>																											
            </div>
            `;
        }

        return `
            <div class="review_all120 post" id="post_${post.postId}">
                <div class="">
                
                    <div class="review_usr_dt" style="margin:15px;">
                        <img src="${post.userImage}" style="width:40px;height:40px;" alt="">
                        <div class="rv1458" align="left">
                            <h4 class="tutor_name1">
                                ${post.userName} ${blueMark}
                            </h4>
                            <span class="time_145">${formatDateTime(post.postId)}</span>
                        </div>
                        ${editMenu}
                    </div>
                    <p style="margin-left:15px;margin-right:15px;" class="rvds10">${post.body}</p>
                    ${media}
                    <div class="rpt100" style="margin:15px;">
                        <div class="radio--group-inline-container">
                            <div class="radio-item">
                                <a href="javascript:void(0)" onclick="likePost(${post.postId})">
                                    ${likeIcon}
                                    <span for="radio-1" class="radio-label"> ${formatReact(post.postLikes)}</span>
                                </a>
                            </div>

                            <div class="radio-item">
                                <a href="discuss_detail.php?mCode=${mCode}&category=${category}&post_id=${post.postId}">
                                    <img class="react-icon" src="icon/icon_post_comment.png"/>
                                    <span for="radio-1" class="radio-label"> ${formatReact(post.comments)}</span>
                                </a>
                            </div>

                            <div class="radio-item">
                                <a href="javascript:void(0)">
                                    <img class="react-icon" src="icon/icon_post_share.png"/>
                                    <span for="radio-1" class="radio-label"> ${formatReact(post.shareCount)}</span>
                                </a>
                            </div>

                            
                        </div>
                        
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

    function addPost(){
        var link=`https://www.calamuseducation.com/calamus-v2/api/${category}/posts/add`;
        var body=$('#post_input').val();
         
        var data={
            "learner_id":userid,
            "body":body,
            "major":category,
            "hasVideo":0
        }

        $('#post_adding').show();
        $('#post_input').val("");
        $.post(link,data,(post)=>{
            $('#post_adding').hide();
            post.userName=currentUser.learner_name;
            post.userId=currentUser.learner_phone;
            post.userImage=currentUser.learner_image;
            post.vip=0;
            post.hidden=0;
            post.block;
            post.postImage=post.image;
            post.postLikes=0;
            post.comments=0;
            post.shareCount=0;
            console.log(post);
            $('#post_container').prepend(postComponent(post));
            
        })


    }

    function likePost(postId){
        postArr.find(post=>{
            if(post.postId==postId){
                if(post.is_liked==0){
                    post.is_liked=1;
                    post.postLikes=parseInt(post.postLikes)+1;
                }else{
                    post.is_liked=0;
                    post.postLikes=post.postLikes-1;
                }
                
                var link=`https://www.calamuseducation.com/calamus-v2/api/${category}/posts/like`;
                var data={
                    "user_id":userid,
                    "post_id":post.postId,
                }
                $.post(link,data,()=>{
                    
                })

               $(`#post_${post.postId}`).html(postComponent(post));
                
            }
        })
    }

    function showPostDelDiague(postId){
        var modalContainer=document.getElementById('modalContainer');
        modalContainer.innerHTML=`
            <div id="myModal" class="modal">
                <div class="modal-content" style="width:50%;margin:auto;margin-top:70px;">
        
                    <h4 style="margin: 30px;">Do you really want to delete?</h4>
                    <br>
                    <div style="margin:30px; padding-left:10%;padding-right:10%;">
                        <button class="btn btn-primary" id="modalCanel" style="float:left">Cancel</button>
                        <button class="btn btn-danger" onclick="deletePost(${postId})" id="modalDelete" style="float:right">Delete</button>
                    </div>

                </div>
            </div>
            `;

            $('#myModal').modal('show');
            $("#modalCanel").click(function () {
                
            });
    }

    function deletePost(postId){
        var link=`https://www.calamuseducation.com/calamus-v2/api/${category}/posts/delete`;
        var data={
            "postId":postId
        };

        $(`#post_${postId}`).empty();
        $.post(link,data,()=>{
            console.log('post deleted');
        })
    }

    function showPostHideDiague(postId){
        var modalContainer=document.getElementById('modalContainer');
        modalContainer.innerHTML=`
        <div id="myModal" class="modal">
            <div class="modal-content" style="width:50%;margin:auto;margin-top:70px;">
    
                <h4 style="margin: 30px;">Do you really want to hide?</h4>
                <br>
                <div style="margin:30px; padding-left:10%;padding-right:10%;">
                    <button class="btn btn-primary" id="modalCanel" style="float:left">Cancel</button>
                    <button class="btn btn-danger" onclick="hidePost(${postId})" id="modalDelete" style="float:right">Hide</button>
                </div>

            </div>
        </div>
        `;

        $('#myModal').modal('show');
        $("#modalCanel").click(function () {
            
        });
    }

    function hidePost(postId){
        var link=`https://www.calamuseducation.com/calamus-v2/api/${category}/posts/hide`;
        var data={
            "post_id":postId,
            "user_id":userid
        };

        $(`#post_${postId}`).empty();
        $.post(link,data,()=>{
            console.log('post hidden');
        })
    }

    function formatReact(like){

        if(like>0 && like<1000){
            return like
        }

        if(like>=1000&&like<1000000){
            like=like/1000;
            like= Math.round(like * 10) / 10
            return like+"k"; 
        }

        if(like>=1000000){
            like=like/1000000;
            like= Math.round(like * 10) / 10
            return like+"M"; 
        }

        if(like==0){
            return "";
        }
    }


    function savePost(){
        alert('Post Saved');
    }
   
     
   


</script>

<script src="https://player.vimeo.com/api/player.js"></script>
<script src="assets/js/vertical-responsive-menu.min.js"></script>
<script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="assets/vendor/OwlCarousel/owl.carousel.js"></script>
<script src="assets/vendor/semantic/semantic.min.js"></script>
<script src="assets/js/custom.js"></script>
<script src="assets/js/night-mode.js"></script>


	
</body>
</html>