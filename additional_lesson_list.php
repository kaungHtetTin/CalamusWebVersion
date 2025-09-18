<?php 
    session_start();
  
    include('classes/connect.php');
  
    include('classes/lesson.php');
    include ('classes/auth.php');
    include('classes/app.php');
    include('classes/lesson_category.php');

    $page_title="Additional Lessons";
    $category_id = $_GET['category_id'];
    $app_id=$_GET['app'];
    $App=new App();
    $app=$App->detail($app_id);

    $Auth=new Auth();
    $user = false;
	if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
        $user_id=$_SESSION['calamus_userid'];
    }

    $Lesson = new Lesson();
    $lessons = $Lesson->getAdditionalLesson($category_id);

    $Category = new LessonCategory();
    $category = $Category->detail($category_id);
    $major = $category['major'];

    if($major == 'english'){
        $course_ids = [14,10,12];
    }else{
        $course_ids = [14,8];
    }
    $LessonCategory=new LessonCategory();
    $additional_courses = $LessonCategory->getAdditionalCourse($major);

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

    .fcrse_1{
        padding:7px;
        margin:3px;
    }

</style>

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
        padding:5px;
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
        padding:5px;
        margin:3px;
    }

    .active{
        background:#ffecec;
        color:#ed2a26 !important
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
                                <div  style="border-radius:50%;margin-right:15px;">
                                     <img style="width: 70px;height: 70px;border-radius:50px;"  src="<?php echo $category['image_url'] ?>" alt=""> 											
                                </div>
                                <div class="user_cntnt">
                                    <div class="_df7852"><?php echo $category['category_title']; ?></div>
                                    <p><?php echo $app['name']; ?></d>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-lg-8 col-md-6">
            <div class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom">
                <?php foreach($lessons as $key=>$lesson){ ?>
                    <?php if($lesson['isVideo'] == 1) {?>
                        <a href="watch_video.php?index=<?php echo $key?>&channel_id=<?php echo $category_id; ?>&channel=<?php echo $app['name']; ?>">
                    <?php }else {?>
                       <a href="lesson-display.php?link=<?php echo $lesson['link'] ?>">
                    <?php }?>
                        <div class="lecture-container">
                            <div class="left-content">
                                <?php if($lesson['isVideo']==1){ ?>
                                    <i class='uil uil-play-circle icon_142'></i>
                                <?php }else{ ?>
                                    <i class='uil uil-file icon_142'></i>
                                <?php } ?>
                                <div class="top">
                                    <div class="title">
                                        <?php echo $lesson['title']; ?>
                                    </div>
                                    
                                </div>
                            </div>
                            <div class="details">
                                <?php echo  $category['category_title'] ?>
                                <span class="content-summary">
                                    <?php echo $Lesson->formatDuration($lesson['duration']); ?>
                                </span>
                            </div>
                        </div>
                    </a>
                <?php }?>
            </div>
            <br><br>
        </div>
    
        <div class="col-lg-4 col-md-6">
            <?php foreach($additional_courses as $course){?>
                <?php if(checkCourse($course['course_id'],$course_ids)) {?>
                    <div class="category_title"><?php echo $course['title'] ?></div>
                    <div class="under_line"></div>
                    <div class="row" >
                        <?php foreach($course['categories'] as $index=>$category){ ?>
                            <div class="col-12">
                                <div class="fcrse_1 <?php if($category['id']==$category_id) echo "active" ?>">
                                    <a href="additional_lesson_list.php?category_id=<?php echo $category['id']?>&app=<?php echo $app_id ?>">
                                        <div class="category">
                                            <img class="card" src="<?php echo $category['image_url'] ?>" alt="">
                                            <div class="crse14s title" style="<?php if($category['id']==$category_id) echo "color:#ed2a26" ?>"><?php echo $category['category_title'] ?></div>
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

<?php 
    include('layouts/footer.php');
?>

