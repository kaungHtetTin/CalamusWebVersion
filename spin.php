<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <style>
        body {
            background: #333;
        }
        #spinner {
            width: 100px;
          
        }
    </style>
</head>
<body>

<canvas id="spinner" width="300" height="300">


<script>

    function drawProgressBar(degrees) {
        let spinner = document.getElementById("spinner");
        let ctx = spinner.getContext("2d");
        let width = spinner.width;
        let height = spinner.height;
        let color = "turquoise";
        let bgcolor = "#222";
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
	
    drawProgressBar(90);
	
</script>
</body>
</html>