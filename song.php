<?php 
    session_start();
  
    include('classes/connect.php');
    include ('classes/auth.php');
    include('classes/song.php');

    $page_title="Lyrics";
    

    $Auth=new Auth();
    if(isset($_SESSION['calamus_userid'])){
        $user =$Auth->check_login($_SESSION['calamus_userid']);
    }else{
        header('Location:login.php');
    }
    
     
    
    include('layouts/header.php');

?>

    <style>
        .music-button{
            border-radius:30px;
            width:90px;
            font-family:Pyidaungsu;
        }

        .fcrse_3{
            padding:8px;
        }

        .player_buttons{
            display: flex;
            flex-direction: row;
            align-items: center;
        }
        
        /* Modify the appearance of the slider */
        .seek_slider {
            width:100%;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            height: 5px;
            background: #555;
          
            -webkit-transition: .2s;
            transition: opacity .2s;
    
        }

        /* Modify the appearance of the slider thumb */
        .seek_slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            width: 10px;
            height: 10px;
            background: #555;
            cursor: pointer;
            border-radius: 50%;
        }

        i.fa-play-circle, i.fa-pause-circle, i.fa-step-forward, i.fa-step-backward {
            cursor: pointer;
        }

    </style>
	<!-- Body Start -->
<div class="wrapper" onresize="adjustLayout()">
    <div class="sa4d25">
        <div class="container-fluid">	
            <div class="row">
                
                <div class="col-xl-7 col-lg-7">
                    <div class="section3125">
                        <h4 class="item_title">Most Popular Song</h4>
                        <a href="explore.php" class="see150">See all</a>
                        <div class="la5lo1">
                            <div class="owl-carousel live_stream owl-theme owl-loaded owl-drag" id="popular_container">
                            
                                <?php for($i=0;$i<50;$i++){ ?>
                                    <div class="item popular_song">
                                        <div class=" mb-20">
                                            <a href="" class="fcrse_img" style="height:200px; overflow:hidden;border-radius:20px 0;text-decoration:none">
                                                <img src="" style="" alt="">
                                                <div class="course-overlay">
                                                  
                                                </div>
                                                <div style="background:#eee;text-align:center;padding:10px;position:absolute;top:160px;width:100%;color:#333;">
                                                    <h6> ... </h6>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                <?php } ?>

                            </div>
                        </div>
                    </div>


                    <div class="section3125  mt-30">
                        <h4 class="item_title">My Music</h4>
                         
                        <div class="la5lo1">
                            <div class="" id="song_container">
                                  
                            </div>
                        </div>
                        
                        <div class="main-loader" id="loader_bounces">		
                            <br><br><br><br>									
                            <div class="spinner">
                                <div class="bounce1"></div>
                                <div class="bounce2"></div>
                                <div class="bounce3"></div>
                            </div>																										
                        </div>

                    </div>
                    
                </div>

                <div class="col-xl-5 col-lg-5 col-md-12">
                    <a id="download_mp3" href="" download=""></a>
                    <a id="download_lyrics" href="" download=""></a>
                    <div class="right_side">
                      
                        <div class="fcrse_3"  style="position: relative;z-index:2">
                            <div id="player">
                                <div class="fcrse_3"  style="display:flex;position:relative;">
                                    <img id="thumbnail" alt="" srcset="" style="width:80px;height:90px;border-radius:5px">
                                    <div style="margin-left:15px;flex:1">
                                        <h6 style="margin-top:5px;" id="song_title"> </h6>
                                        <span id="artist_name"></span>
                                        
                                        <div style="margin-top:10px;">
                                            <div class="player_buttons">
                                                <div class="prev-track" onclick="prevTrack()">
                                                    <i class='fas fa-step-backward' style="margin-right:10px;color:#555"></i>
                                                </div>
                                                <div class="playpause-track" onclick="playpauseTrack()">
                                                    <i class='fas fa-play-circle' style='font-size:28px;color:#555'></i>
                                                </div>
                                                <div class="next-track" onclick="nextTrack()">
                                                    <i class='fas fa-step-forward' style="margin-left:10px;color:#555"></i>
                                                </div>

                                            </div>
                                            <input type="range" min="1" max="100" value="0" class="seek_slider" onchange="seekTo()">
                                        </div>

                                        <div align="right" style="margin-top:15px;">
                                            <span style="margin-right:10px;cursor:pointer" id="react_song">
                                                <i class='far fa-heart' style="font-size:18px;"></i> 
                                            </span>
                                            <i class='fas fa-arrow-circle-down' style="font-size:18px;" id="btn_download_song"></i> 
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                            
                            <div>

                                <div class="course_tabs" style="margin-top:0px;">
                                    <nav>
                                        <div class="nav nav-tabs tab_crse justify-content-center" id="nav-tab" role="tablist">
                                            <a class="nav-item nav-link active" id="nav-courses-tab" data-toggle="tab" href="#nav-artist" role="tab" aria-selected="false">Artist</a>
                                            <a class="nav-item nav-link" id="nav-reviews-tab" data-toggle="tab" href="#nav-lyrics" role="tab" aria-selected="false">Lyrics</a>    
                                        </div>
                                    </nav>						
                                </div>
                                <div class="course_tab_content">
                                    <div class="tab-content" id="nav-tabContent">
                                        <div class="tab-pane fade show active" id="nav-artist" role="tabpanel">
                                           
                                            <div class="row" id="singer_container">
                                                
                                            </div>   

                                        </div>

                                        <div class="tab-pane fade" id="nav-lyrics" role="tabpanel">
                                            <div id="lyrics" style="font-family: Pyidaungsu, 'Times New Roman', Times, serif">
                                            
                                            </div>
                                        </div>
                                    </div>
                                </div>  
                            </div>
                        </div>
                         

                    </div>
                </div>

            </div>
        </div>

    </div>

    <script>
        var route='https://www.calamuseducation.com/calamus-v2/api/<?php echo $_GET['category'] ?>/';
        let song_route,popular_route;

        var user=<?php echo json_encode($user) ?>;

        var singers=[];
        var mainTrack;
        var all_songs=[];
        var popular_songs=[];
        var current_song=null;
        var W = window.innerWidth;
        let curr_track = document.createElement('audio');

        let playpause_btn = document.querySelector(".playpause-track");
        let next_btn = document.querySelector(".next-track");
        let prev_btn = document.querySelector(".prev-track");

        let seek_slider = document.querySelector(".seek_slider");
        let track_index = 0;
        let isPlaying = false;
        let updateTimer;
        let isFetching=false;
        let page=1;
        let artist_page=1;
       
        let react_song=document.getElementById('react_song');

        $(document).ready(()=>{
            setRoutesForAllSong();
            fetchPopularSongs();
            fetchSongs();
            fetchArtists();
            $(window).scroll(()=>{
               
                adjustLayout();

                if($(window).scrollTop() + $(window).height() > $(document).height() - 500) {
                    if(!isFetching){
                        page++;
                        artist_page++;
                        fetchSongs();
                        fetchArtists();
                    }
                }
                
            });

            react_song.addEventListener('click',()=>{
                like_song(react_song,current_song,true);
            });

            $('#btn_download_song').click(()=>{
                downloadSong(current_song.url);
            })
             
        });

        function adjustLayout(){
            var scrollBarPosition=$(window).scrollTop();
            var player=$('#player');
            var playerPosition=player.position();
            var footerPosition=$('#footer').position();
        
           
            if(W>1000){
                if(scrollBarPosition>=playerPosition.top+200){
                    
                    player.css({
                        'position':'fixed',
                        'top':60,
                        'width':'320px'
                    });
                    
                }

                if(scrollBarPosition<playerPosition.top+100){
                    
                    player.css({
                        'position':'relative',
                        'top':0,
                        'width':'100%'
                    });
                    
                }
                 
            }else{
                $('#lyrics').remove();
                    
                if($(window).scrollTop() + $(window).height() > $(document).height() - 400) {
                    
                    player.css({
                        'position':'relative',
                        'top':0,
                        'bottom':'',
                        'width':'100%'
                    });
                }

                if($(window).scrollTop() + $(window).height() < $(document).height()-600) {
                    
                    player.css({
                        'position':'fixed',
                        'bottom':0,
                        'top':'',
                        'right':3,
                        'width':'100%'
                    });
                }
            }
        }

        function setRoutesForAllSong(){
            song_route=`${route}songs?userId=${user.learner_phone}`;
            popular_route=`${route}songs/popular?userId=${user.learner_phone}`;
        }

        function setRoutesForEachArtist(artist){
            page=0;
            song_route=`${route}songs/by/artist?userId=${user.learner_phone}&artist=${artist}`;
            popular_route=`${route}songs/by/artist/popular?userId=${user.learner_phone}&artist=${artist}`;
        }

        function fetchSongs(){
            isFetching=true;
            $('#loader_bounces').show();
            var url=`${song_route}&page=${page}`;
            $.get(url,(data,status)=>{
                $('#loader_bounces').hide();
                isFetching=false;
                var songs=data.songs;
                if(songs){
                    songs.map((song)=>{
                        all_songs.push(song);
                        $('#song_container').append(songComponent(song))
                    });
                    
                    mainTrack=all_songs;
                    var items=document.querySelectorAll('.song_item');
                    items.forEach(function (item, index) {
						item.addEventListener("click", function () {
                            mainTrack=all_songs;
							loadTrack(index);
                            if(isPlaying){
                                pauseTrack()
                            }
                            playpauseTrack();
						});
					});

                    var reacts=document.querySelectorAll('.song_react');
                    reacts.forEach(function (item, index) {
						item.addEventListener("click", function () {
                            like_song(item,all_songs[index],false);
						});
					});

                    var downloads=document.querySelectorAll('.download_song');
                    downloads.forEach(function (item, index) {
						item.addEventListener("click", function () {
                            downloadSong(all_songs[index].url);
						});
					});

                    if(current_song==null){
                        loadTrack(0);
                    }

                  

                }else{
                   
                }
                
            });
        }

        function fetchPopularSongs(){
           
            $.get(popular_route,(data,status)=>{
                var songs=data;
                 document.getElementsByClassName('owl-stage')[0].innerHTML="";
                if(songs){
                    songs.map((song)=>{
                        popular_songs.push(song);
                        document.getElementsByClassName('owl-stage')[0].innerHTML+=popularSongComponent(song);
                    })

                    var items=document.querySelectorAll('.popular_song');
                    items.forEach(function (item, index) {
						item.addEventListener("click", function () {

                            mainTrack=popular_songs;
							loadTrack(index);
                            if(isPlaying){
                                pauseTrack()
                            }
                            playpauseTrack();
						});
					});

                    var reacts=document.querySelectorAll('.popular_react_item');
                    reacts.forEach(function (item, index) {
						item.addEventListener("click", function () {
                            like_song(item,popular_songs[index],false);
						});
					});
                }
            });
        }

        function fetchArtists(){
            var url=`${route}songs/artists?page=${artist_page}`;
            $.get(url,(data,status)=>{
                
                if(data.artists){
                    data.artists.map((singer)=>{
                        singers.push(singer);
                        $('#singer_container').append(singerComponent(singer));
                    });

                    var items=document.querySelectorAll('.singer_item');
                    
                    items.forEach(function (item, index) {
						item.addEventListener("click", function () {
                            all_songs=[];
                            popular_songs=[];
                            mainTrack=[];
                           
                            $('#song_container').html(" ");
                            setRoutesForEachArtist(singers[index].artist);
                            fetchPopularSongs();
                            fetchSongs();
						});
					});

                }
            });
        }


        function loadTrack(index){
            track_index=index;
            current_song=mainTrack[index];
            getLyrics(current_song.url);
            $('#song_title').html(current_song.title);
            $('#artist_name').html(current_song.artist);
            $('#thumbnail').attr('src',`https://www.calamuseducation.com/uploads/songs/image/${current_song.url}.png`);

            if(current_song.is_liked==1){
                $('#react_song').html(' <i class="fas fa-heart" style="font-size:18px;color:red"></i> ');
            }else{
                $('#react_song').html('<i class="far fa-heart" style="font-size:18px;"></i>');
            }
        
            clearInterval(updateTimer);
            seek_slider.value = 0;
            curr_track.src =`https://www.calamuseducation.com/uploads/songs/audio/${current_song.url}.mp3`;
            curr_track.load();

            updateTimer = setInterval(seekUpdate, 1000);
            curr_track.addEventListener("ended", nextTrack);

            
        }

        

        function getLyrics(url){
            url=`https://www.calamuseducation.com/uploads/songs/lyrics/${url}.txt`;
            $.get(url,function(data,status){
                $("#lyrics").html(data.replace(/(?:\r\n|\r|\n)/g, '<br>'));
            })
        }

        function popularSongComponent(song){
            if(song.is_liked==1){
                var react='<i class="fas fa-heart" style="color:red"></i>';
            }else{
                var react='<i class="far fa-heart" style="color:white"></i>';
            }


            return `
               <div class="owl-item active" style="width: 145.905px; margin-right: 10px;">
                    <div class="item popular_song">
                        <div class=" mb-20">
                            <a href="javascript:void(0)" class="fcrse_img" style="height:200px; overflow:hidden;border-radius:20px 0;text-decoration:none">
                                <img src="https://www.calamuseducation.com/uploads/songs/image/${song.url}.png" style="" alt="">
                                <div class="course-overlay">
                                    
                                    <div class="crse_reviews popular_react_item">
                                        ${react}
                                        ${formatCounting(song.like_count)} 
                                    </div>
                                </div>

                                <div style="background:#eee;text-align:center;padding:10px;position:absolute;top:162px;width:100%;color:#333;">
                                    <h6> ${song.title} </h6>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
        
        function songComponent(song){
            if(song.is_liked==1){
                var react=`<i class='fas fa-heart' style="color:red;font-size:18px"></i>`;
            }else{
                var react=`<i class='far fa-heart' style="font-size:18px"></i>`;
            }
            return `
                <div class="fcrse_1" style="margin-bottom:3px;padding:10px;position:relative">
                    <div style="display:flex">
                        <div style="display:flex;cursor:pointer;flex:1" class="song_item">
                            <img src="https://www.calamuseducation.com/uploads/songs/image/${song.url}.png" alt="" srcset="" style="width:50px;height:50px;border-radius:50%">
                            <div style="margin-left:15px;">
                                <h6 style="margin-top:5px;">${song.title}</h6>
                                ${song.artist}
                            </div>
                        </div>
                        <div style="position:absolute;top:25px;right:10px;display:flex">
                            <div style="width:60px;position:relative;z-index:2;cursor:pointer">
                                <span class="song_react" >${react} ${formatCounting(song.like_count)} </span>
                                
                            </div>

                            <div style="width:60px;cursor:pointer" class="download_song">
                                <i class='fas fa-arrow-circle-down' style="font-size:18px;"></i>
                                ${formatCounting(song.download_count)}
                            </div>

                        </div>
                    </div>
                </div>
            `
        }

        function singerComponent(singer){
            return `
                <div style="flex:0 0 50%;max-width:50%">
                    <div align="center" class="singer_item" style="cursor:pointer;">
                        <img src="https://www.calamuseducation.com/uploads/songs/image/${singer.url}.png" alt="" srcset="" style="width:50px;height:50px;border-radius:50%">
                        <h6 align="center" style="margin-top:10px;">${singer.artist}</h6>
                    </div>
                </div>
            `;
        }

        function like_song(react,song,playerClick){
            console.log(react);
            console.log(song);
            if(song.is_liked==1){
                song.is_liked=0;
                song.like_count--;
                react.innerHTML='<i class="far fa-heart" style="font-size:18px;"></i>';
            }else{
                song.like_count++;
                song.is_liked=1;
                react.innerHTML=' <i class="fas fa-heart" style="font-size:18px;color:red"></i> ';
            }

            console.log(song.like_count);

            if(!playerClick){
                var link=`${route}songs/like`;
                var data={
                    "user_id":user.learner_phone,
                    "post_id":song.song_id,
                };
                react.innerHTML+=' '+formatCounting(song.like_count);
                

                $.post(link,data,()=>{
                    console.log('liked');
                });                
            }

        }

        function downloadSong(url){
            $('#download_mp3').attr('href',`https://www.calamuseducation.com/uploads/songs/audio/${url}.mp3`);
            document.getElementById('download_mp3').click();

            $('#download_lyrics').attr('href',`https://www.calamuseducation.com/uploads/songs/lyrics/${url}.txt`);
            document.getElementById('download_lyrics').click();
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

        // Load the first track in the tracklist
        function playpauseTrack() {
            if (!isPlaying) playTrack();
            else pauseTrack();
        }

        function playTrack() {
            curr_track.play();
            isPlaying = true;
            playpause_btn.innerHTML = '<i class="fa fa-pause-circle" style="font-size:28px;color:#555"></i>';
        }

        function pauseTrack() {
            curr_track.pause();
            isPlaying = false;
            playpause_btn.innerHTML = '<i class="fas fa-play-circle" style="font-size:28px;color:#555"></i>';;
        }

        function nextTrack() {
            if (track_index < mainTrack.length - 1)
                track_index += 1;
            else track_index = 0;
            loadTrack(track_index);
            playTrack();
        }

        function prevTrack() {
            if (track_index > 0)
                track_index -= 1;
            else track_index = mainTrack.length;
            loadTrack(track_index);
            playTrack();
        }

        function seekTo() {
            let seekto = curr_track.duration * (seek_slider.value / 100);
            curr_track.currentTime = seekto;
        }

        
        function seekUpdate() {
            let seekPosition = 0;

            if (!isNaN(curr_track.duration)) {
                seekPosition = curr_track.currentTime * (100 / curr_track.duration);
                seek_slider.value = seekPosition;
            }
        }


    </script>

<?php 
    include('layouts/footer.php');
?>