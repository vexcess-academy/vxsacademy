(function () {
    const $ = Q$;

    const loadIconCanvas = $("canvas").attr({
        width: 202,
        height: 202
    });
    const ctx = loadIconCanvas.getContext('2d');
    
    const halfWidth = loadIconCanvas.width / 2;
    const halfHeight = loadIconCanvas.height / 2;
    var size = 70;
    var spin = 0;
    var activeIcons = [];
            
    function drawSquiggle (a, b, c) {
        const TWO_PI = Math.PI * 2;
        const incr = TWO_PI / 6;
        
        ctx.beginPath();
        for(var i = 0; i <= TWO_PI + 1.2; i += incr){
            var rad = b + Math.cos(i * 6 + spin) * Math.pow(Math.cos(i + spin) + 1, 3.1) * a;
            var j = spin / 10 * c + i;
            ctx.lineTo(halfWidth + Math.cos(j) * rad, halfHeight + Math.sin(j) * rad);
        }
        ctx.stroke();
    }

    function updateLoadIcon () {
        if (activeIcons.length > 0) {
            ctx.clearRect(0, 0, loadIconCanvas.width, loadIconCanvas.height);
            
            ctx.strokeStyle = "black";
            
            ctx.filter = 'none';
            ctx.lineWidth = 20;
            drawSquiggle(1, size, 1);
            drawSquiggle(-1, size, 1);
            
            ctx.strokeStyle = "rgb(50, 255, 125)";
            
            ctx.filter = 'blur(5px)';
            ctx.lineWidth = 3;
            drawSquiggle(1, size, 1);
            drawSquiggle(-1, size, 1);
            
            ctx.filter = 'none';
            ctx.lineWidth = 2;
            drawSquiggle(1, size, 1);
            drawSquiggle(-1, size, 1);
            
            ctx.textAlign = "center";
            ctx.font = 'bold 16px sans-serif';
            ctx.strokeStyle = "rgb(50, 255, 125)";
            ctx.lineWidth = 4;
            ctx.strokeText('Loading' + ".".repeat(-spin / 2.5 % 4), halfWidth, halfHeight + 4);
            ctx.fillStyle = "black";
            ctx.fillText('Loading' + ".".repeat(-spin / 2.5 % 4), halfWidth, halfHeight + 4);
            
            spin = -Date.now() / 166;
    
            for (var i = 0; i < activeIcons.length; i++) {
                let c = activeIcons[i].el;
                let cctx = c.getContext("2d");
                cctx.clearRect(0, 0, loadIconCanvas.width, loadIconCanvas.height);
                cctx.drawImage(loadIconCanvas.el, 0, 0, c.width, c.height);
            }
        }
        
    }

    var loadIconInterval = setInterval(updateLoadIcon, 1000 / 30);

    window.loadIconManager = {
        new: sz => {
            let c = $("canvas").attr({
                width: sz,
                height: sz
            }).css({
                borderRadius: "100px"
            });
            activeIcons.push(c);
            return c;
        },
        delete: icon => {
            if (icon !== null) {
                icon.remove();
                activeIcons.splice(activeIcons.indexOf(icon), 1);
            }
        }
    };
})()

