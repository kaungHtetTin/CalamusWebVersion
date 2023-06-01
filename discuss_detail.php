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

    input{   
        border-width:0 0 1px 0;
        border-style:sold;
        background: #00000000;
        flex:1;
        margin-right:100px;
        margin-left:20px;
    }

    .cmt-reply{
        display:flex;
        position:relative; 
        margin-left:40px;
    }

    .react-icon{
        width:20px;
        height:20px;
    }

    .add-btn{
        background:red;
        color:white;
        padding:10px;
        border-radius:3px;
        margin-left:10px;
        text-decoration:none;
    }

    .add-btn:hover{
        background:black;
        color:white;
        text-decoration:none;
    }

</style>

	<!-- Body Start -->
<div class="wrapper" onresize="adjustLayout()">
    <div class="sa4d25">
        <div class="container-fluid">	
            <div class="row">
                
                <div align="center" class="col-xl-9 col-lg-8" id="post-section">
                 
                    <div class="" style="padding-left:20px;padding-right:20px;">
                        <div id="post_container">
                        </div>

                        <div class="cmmnt_1526">
                            <div class="cmnt_group">
                                <div class="img160">
                                    <img src="<?php echo $user['learner_image'] ?>" alt="">										
                                </div>
                                <textarea id="input_comment" class="_cmnt001" placeholder="Add a comment"></textarea>
                                <button onclick="addComment()" class="subscribe-btn" style="margin-left:10px; margin-top:5px;" >Add</button>
                                 
                            </div>
                            
                        </div>

                        <div id="comment_container" class="review_all120">                    
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
                                            <img src="https://www.calamuseducation.com/uploads/placeholder.png" style="width:35px; height:35px;" alt="">
                                            <div class="rv1458" align="left">
                                                <h4 class="tutor_name1" style="width:100px; height:15px; background:#ccc;border-radius:3px;"></h4>
                                                <span class="time_145" style="width:50px; height:15px; background:#ccc;border-radius:3px;"></span>
                                            </div>
                                        </div>
                                        <p class="rvds10" style="width:100%; height:15px; background:#ccc;border-radius:3px;"></p>
                                        
                                    </div>
                                    <br><br>
                                    <div class="shimmer" style="width:100%;">
                                        <div class="review_usr_dt">
                                            <img src="https://www.calamuseducation.com/uploads/placeholder.png" style="width:35px; height:35px;" alt="">
                                            <div class="rv1458" align="left">
                                                <h4 class="tutor_name1" style="width:100px; height:15px; background:#ccc;border-radius:3px;"></h4>
                                                <span class="time_145" style="width:50px; height:15px; background:#ccc;border-radius:3px;"></span>
                                            </div>
                                        </div>
                                        <p class="rvds10" style="width:100%; height:15px; background:#ccc;border-radius:3px;"></p>
                                        
                                    </div>
                                    <br><br>
                                    <div class="shimmer" style="width:100%;">
                                        <div class="review_usr_dt">
                                            <img src="https://www.calamuseducation.com/uploads/placeholder.png" style="width:35px; height:35px;" alt="">
                                            <div class="rv1458" align="left">
                                                <h4 class="tutor_name1" style="width:100px; height:15px; background:#ccc;border-radius:3px;"></h4>
                                                <span class="time_145" style="width:50px; height:15px; background:#ccc;border-radius:3px;"></span>
                                            </div>
                                        </div>
                                        <p class="rvds10" style="width:100%; height:15px; background:#ccc;border-radius:3px;"></p>
                                        
                                    </div>
                                </div>
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

    var userid=<?php echo $user['learner_phone']; ?>;
    var post_id=<?php echo $_GET['post_id'] ?>;
    var currentUser=<?php echo json_encode($user) ?>;
     
    var mCode="<?php 
        if(isset($_GET['mCode'])){
            echo $_GET['mCode'];
        }else{
            echo 'ee';
        }
    ?>";
    var category="<?php 
        if(isset($_GET['category'])){
            echo $_GET['category'];
        }else{
            echo 'english';
        }
    ?>";

    var checkTime="<?php 
        if(isset($_GET['check'])){
            echo $_GET['check'];
        }else{
            echo 0;
        }
    ?>";
    var post;
    var comments;
    
    var comment_container=document.getElementById('comment_container');

    adjustLayout()

    $(document).ready(function(){
        fetchPost();
         
    });

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

    function fetchPost(){
        var url=`https://www.calamuseducation.com/calamus-v2/api/${category}/comments?mCode=${mCode}&postId=${post_id}&time=${checkTime}&userId=${userid}`;
        $.get(url,function(data,status){
            post=data.post[0];
            $('#shimmer').hide();
            $('#post_container').append(postComponent(post));

            comments=arrangeComment(data.comments);;
            setComments(comments);
        })
    }

    function arrangeComment(comments){
        var result=[];
        for(var i=0;i<comments.length;i++){
            var comment=comments[i];
            if(comment.parent!=0){
                for(var j=0;j<comments.length;j++){
                    var parentCmt=comments[j];
                    if(comment.parent==parentCmt.time){
                        if(parentCmt.child){
                            parentCmt.child.push(comment);
                        }else{
                            parentCmt.child=[comment];
                        }
                        
                    }
                }
            }
        }

        for(var i=0;i<comments.length;i++){
            var comment=comments[i];
            if(comment.parent==0){
                result.push(comment);
            }
        }

        return result;
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
                                <a href="javascript:void(0)">
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

   
    function likePost(postId){
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
   
     

    function setComments(comments){
        comment_container.innerHTML="";
        for(var i=0;i<comments.length;i++){
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
        if(comment.userId==userid){
            editMenu =`
            <br>
            <div class="eps_dots more_dropdown">
                <a href="javascript:void(0)"><i class="uil uil-ellipsis-v"></i></a>
                <div class="dropdown-content" align="left">
                    <span onclick="showCmtEditInput(${comment.time})"><i class='uil uil-comment-alt-edit'></i>Edit</span>
                    <span onclick="showCmtDelDiague(${comment.time},${index})"><i class='uil uil-trash-alt'></i>Delete</span>
                </div>																											
            </div>
            `;
        }

        return `
            <div class="review_item" style="padding-top:10px;padding-bottom:10px;">
                <div class="review_usr_dt">
                    <img src="${comment.userImage}" style="width:35px; height:35px;" alt="">
                    <div class="rv1458" align="left">
                        <h4 class="tutor_name1">${comment.userName}</h4>
                        <span class="time_145">${formatDateTime(comment.time)}</span>

                        <div  id="cmt_body_${comment.time}">
                        <div class="rvds10" style="margin-top: 7px;">${comment.body}</div>
                        <div class="rpt100">
                            <div class="radio--group-inline-container">
                                <div class="radio-item">
                                    <a href="javascript:void(0)" class="report145" id="cmt_like_${comment.time}" onclick="likeParentComment(${userid},${comment.post_id},${comment.time},${index})"> 
                                        <i id="cmt_like_icon_${comment.time}" style="${defineLikeThumb(comment.is_liked)};" class="uil uil-thumbs-up"></i> 
                                        <label for="cmt_like_${comment.time}" class="radio-label">
                                            <span id="cmt_like_count_${comment.time}">${formatReact(comment.likes)}</span>
                                        </label>
                                    </a>
                                </div>
                                <div class="radio-item" >
                                    <a href="javascript:void(0)" class="report145" id="cmt_like_${comment.time}" onclick="showReplyInput(${comment.time});"> 
                                        <i class="uil uil-comments"></i>
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
                            <img style="width:30px;height:30px;border-radius:50%;" src="${currentUser.learner_image}" />
                        </div>

                        <input  id="input_reply_${comment.time}" type="text" placeholder="Reply the comment"/>

                        <button onclick="addReply(${comment.time})" style="position:absolute;bottom:0;right:0" class="subscribe-btn">Add</button>

                    </div>
                </div>

                <div id="cmt_child_${comment.time}"></div>

            </div>
        `;
    }
   
    function childComment(comment,index,j){
        var editMenu="";
        if(comment.userId==userid){
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
    
        return `
            <div style="margin-left:40px;padding:7px;">
                <div class="review_usr_dt">
                    <img src="${comment.userImage}" style="width:27px; height:27px;" alt="">
                    <div class="rv1458" align="left">
                        <h5 class="tutor_name1">${comment.userName}</h5>
                        <span class="time_145">${formatDateTime(comment.time)}</span>
                    
                        <div id="cmt_body_${comment.time}">
                            <div class="rvds10" style="margin-top: 7px;">${comment.body}</div>
                            
                            <div class="rpt100">
                                <div class="radio--group-inline-container">
                                    <div class="radio-item">
                                        <a href="javascript:void(0)" class="report145" id="cmt_like_${comment.time}" onclick="likeChildComment(${userid},${comment.post_id},${comment.time},${index},${j})"> 
                                            <i id="cmt_like_icon_${comment.time}" style="${defineLikeThumb(comment.is_liked)};" class="uil uil-thumbs-up"></i> 
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

    function defineLikeThumb(like){
        if(like==1){
            return "color:red"
        }else{
            return "";
        }
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
        setComments(comments);
    }

    function likeChildComment(user_id,post_id,comment_id,index,j){
            
        console.log('children',comments[index].child);

        likeComment(user_id,post_id,comment_id);
        if(comments[index].child[j].is_liked==1){
            comments[index].child[j].is_liked=0;
            comments[index].child[j].likes= comments[index].child[j].likes-1;
        }else{
            comments[index].child[j].is_liked=1;
            comments[index].child[j].likes= comments[index].child[j].likes+1;
        }
        setComments(comments);
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
         
        sentComment(post_id,userid,10000,body,0,0,(newCmt)=>{
            newCmt.userImage=currentUser.learner_image;
            newCmt.userName=currentUser.learner_name;
            comments.push(newCmt);
            setComments(comments);
        });
        
    }

    function addReply(parentId){
        var input_reply=document.getElementById('input_reply_'+parentId);
        var body=input_reply.value;
        input_reply.value="";
    
        sentComment(post_id,userid,10000,body,parentId,1,(newCmt)=>{
            newCmt.userImage=currentUser.learner_image;
            newCmt.userName=currentUser.learner_name;
            var parentCmt=comments.find(o=> o.time==parentId)
            if(parentCmt.child){
                parentCmt.child.push(newCmt);
            }else{
                var arr=[newCmt];
                parentCmt.child=arr;
            }
            setComments(comments);
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