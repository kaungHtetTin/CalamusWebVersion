<?php 
    session_start();
  
    include('classes/connect.php');
  
    include('classes/lesson.php');
    include ('classes/auth.php');
    include('classes/app.php');
    include('classes/lesson_category.php');

    $page_title="Additional Lessons";
    $course_id=1;
   

    $channel=$_GET['channel'];
    $app_id=$_GET['app'];

    if($channel == 'english'){
        $course_ids = [14,10,12];
    }else{
        $course_ids = [14,8];
    }

    $Auth=new Auth();
    $user = false;
	if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
        $user_id=$_SESSION['calamus_userid'];
    }
    
    $App=new App();
    $LessonCategory=new LessonCategory();

    $app=$App->detail($app_id);
    

    $Lesson=new Lesson();
    $categories = $LessonCategory->getAdditionalLesson($channel);

    $additional_courses = $LessonCategory->getAdditionalCourse($channel);

    function checkCourse($id, $course_ids){
        $result = false;
        foreach($course_ids as $course_id){
            if($course_id == $id) $result = true;
        }
        return $result;
    }
    
    include('layouts/header.php');

?>

<style>
    .category_title{
    
        border-radius:7px;
        font-weight:bold;
        font-size:16px;
    }

    .under_line{
        background: #ed2a26; height:3px;
        margin-bottom:20px;
        margin-top:5px;
        width:35%
    }

    .category{
        padding:7px;
    }

    .category img{
        height: 30px;
        width: 30px;
        border-radius:50px;
        margin-bottom:5px;
    }

    .category .title{
        font-weight: bold;
    }

    .fcrse_1{
        padding:7px;
        margin:3px;
    }

</style>
 
<div class="wrapper _bg4586">
    <div class="_215b15 _byt1458">
        <div class="container-fluid">
            <div class="row">
                <div class="col-lg-12">
                    <div class="user_dt5">
                        <div class="user_dt_left">
                            <div class="live_user_dt">
                                <div  style="border-radius:50%">
                                     <img style="width: 150px;height: 150px;"  src="<?php echo $app['icon']; ?>" alt=""> 											
                                </div>
                                <div class="user_cntnt">
                                    <br>
                                    <div class="_df7852"><?php echo $app['name']; ?></div>
                                    <p>Additonal Lessons</d>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-12">
                    <?php foreach($additional_courses as $course){?>
                        <?php if(checkCourse($course['course_id'],$course_ids)) {?>
                            <div class="category_title"><?php echo $course['title'] ?></div>
                            <div class="under_line"></div>
                            <div class="row" >
                                <?php foreach($course['categories'] as $category){ ?>
                                    <div class="col-lg-4 col-md-6 col-sm-12">
                                        <div class="fcrse_1">
                                            <a href="additional_lesson_list.php?category_id=<?php echo $category['id'] ?>">
                                                <div class="category">
                                                    <img class="card" src="<?php echo $category['image_url'] ?>" alt="">
                                                    <div class="crse14s title"><?php echo $category['category_title'] ?></div>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                <?php }?>
                            </div>
                            <br><br>
                        <?php }?>
                    <?php }?>
                </div>
            </div>
        </div>
    </div>

  
<?php 
    include('layouts/footer.php');
?>

