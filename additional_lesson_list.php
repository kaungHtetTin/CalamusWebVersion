<?php 
    session_start();
  
    include('classes/connect.php');
  
    include('classes/lesson.php');
    include ('classes/auth.php');
    include('classes/app.php');
    include('classes/lesson_category.php');

    $page_title="Additional Lessons";
    $category_id = $_GET['category_id'];

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

    include('layouts/header.php');

?>

<style>

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
                                <div  style="border-radius:50%;margin-right:15px;">
                                     <img style="width: 70px;height: 70px;border-radius:50px;"  src="<?php echo $category['image_url'] ?>" alt=""> 											
                                </div>
                                <div class="user_cntnt">
                                    <div class="_df7852"><?php echo $category['category_title']; ?></div>
                                    <p>Easy English</d>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom">
        <?php foreach($lessons as $key=>$lesson){ ?>
            <a href="lesson-display.php?link=<?php echo $lesson['link'] ?>">
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


  
<?php 
    include('layouts/footer.php');
?>

