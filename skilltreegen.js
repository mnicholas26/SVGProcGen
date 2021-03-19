window.onload = function(){
    
    var svg = document.querySelector('svg');
    var svgNS = "http://www.w3.org/2000/svg";

    svg.scalar = (6/5);
    svg.minscale = 1;
    svg.maxscale = Math.pow(svg.scalar, 18);
    svg.scale = 1;
    svg.xbounds = 2500;
    svg.ybounds = 2500;
    svg.lineoffset = 50
    svg.fragments = [];

    function drawGrid(){
        //calcs based on scale how far apart lines should be
        let lineoffset = svg.lineoffset;

        let d = "";
        for(let i = 0; i <= svg.xbounds; i += lineoffset){
            d += "M" + i + "," + 0 + " ";
            d += "v" + svg.ybounds + " ";
        }
        for(let i = 0; i <= svg.ybounds; i += lineoffset){
            d += "M" + 0 + "," + i + " ";
            d += "h" + svg.xbounds + " ";
        }
        document.getElementById('grid').setAttribute('d', d);
    }

    function zoom(e){
        let vb = svg.viewBox.baseVal;
        // let centre = {
        //     x: (vb.x + vb.width) / 2,
        //     y: (vb.y + vb.height) / 2
        // }
        let pos = getMousePosition(e);

        let scalar = (e.deltaY < 0) ? svg.scalar : (1/svg.scalar);

        svg.scale *= scalar;
        svg.scale = Math.min(Math.max(svg.minscale, svg.scale), svg.maxscale);

        vb.height = 2500 / svg.scale;
        vb.width = 2500 / svg.scale;

        let newpos = getMousePosition(e);

        pan({x: -(newpos.x - pos.x), y: -(newpos.y - pos.y)});
    }

    window.addEventListener('keyup', (e) => {
        // console.log(e.key);
        if(e.key == 'ArrowRight') pan({x: 10, y: 0});
        else if(e.key == 'ArrowLeft') pan({x: -10, y: 0});
        else if(e.key == 'ArrowUp') pan({x: 0, y: -10});
        else if(e.key == 'ArrowDown') pan({x: 0, y: 10});
    });

    function pan(amount){
        let vb = svg.viewBox.baseVal

        let x = vb.x + amount.x;
        let y = vb.y + amount.y;

        if(x < 0) x = 0;
        else if(x + vb.width > svg.xbounds) x = svg.xbounds - vb.width;
        if(y < 0) y = 0;
        else if(y + vb.height > svg.ybounds) y = svg.ybounds - vb.height;

        svg.viewBox.baseVal.x = x;
        svg.viewBox.baseVal.y = y;
    }

    svg.addEventListener('wheel', zoom);
    svg.addEventListener('mousedown', (e) => {
        svg.addEventListener('mousemove', drag);
        svg.addEventListener('mouseup', enddrag);
        svg.addEventListener('mouseleave', enddrag);

        let lastpos = getMousePosition(e);

        function drag(e){
            let pos = getMousePosition(e);
            pan({x: lastpos.x - pos.x, y: lastpos.y - pos.y});
        }

        function enddrag(){
            svg.removeEventListener('mousemove', drag);
            svg.removeEventListener('mouseup', enddrag);
            svg.removeEventListener('mouseleave', enddrag);
        }        
    });

    let visibile = [];


    // let shape = document.createElementNS(svgNS, 'path');
    // shape.pos = {x: 0, y: 0};
    // shape.pathdesc = " h150 v50 h-50 v50 h-50 v-50 h-50 v-50";
    // shape.setOrigin = function(pos){
    //     if(pos.x == this.pos.x && pos.y == this.pos.y) return;
    //     let d = 'M' + pos.x + ',' + pos.y + 'm-50,0';
    //     d += this.pathdesc;
    //     this.pos = pos;
    //     shape.setAttribute('d', d);
    // }
    // shape.setOrigin({x: 500, y: 500});
    // shape.setAttribute('fill', 'blue');
    // svg.appendChild(shape);
    // setDraggable(shape);
    // setRotatable(shape);

    // let shape2 = document.createElementNS(svgNS, 'path');
    // shape2.pos = {x: 0, y: 0};
    // shape2.pathdesc = "r d r d2 l u l u2";
    // shape2.rotation = 0;
    // shape2.rotate = function(angle){
    //     shape2.rotation = Math.floor((angle + 360)/90)%4;
    //     let desc = this.pathdesc;
    //     if(shape2.rotation == 1)
    //     {
    //         desc.replace('r', 'd');
    //         desc.replace('')
    // }
    
    // shape2.setOrigin({x: 200, y: 200});
    // shape2.setAttribute('fill', 'red');
    // svg.appendChild(shape2);
    // setDraggable(shape2);
    // setRotatable(shape2);

    function gridRound(pos){
        let x = Math.floor(pos.x / svg.lineoffset) * svg.lineoffset;
        let y = Math.floor(pos.y / svg.lineoffset) * svg.lineoffset;
        return {x, y};
    }

    function getMousePosition(evt) {
        var CTM = svg.getScreenCTM();
        return {
          x: (evt.clientX - CTM.e) / CTM.a,
          y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    function findDistance(p1, p2){
        return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
    }

    function createfragment(id){
        let shapes = [
            {
                points: [[{x: 0, y: 0}, {x: 50, y: 0}, {x: 50, y: 50}, {x: 100, y: 50}, {x: 100, y: 150}, {x: 50, y: 150}, {x: 50, y: 100}, {x: 0, y: 100}]],
                interior: [{x: 25, y: 25}, {x: 25, y: 75}, {x: 75, y: 75}, {x: 75, y: 125}],
                centre: 1
            },
            {
                points: [[{x: 0, y: 0}, {x: 150, y: 0}, {x: 150, y: 50}, {x: 100, y: 50}, {x: 100, y: 100}, {x: 50, y: 100}, {x: 50, y: 50}, {x: 0, y:50}]],
                interior: [{x: 25, y: 25}, {x: 75, y: 25}, {x: 75, y: 75}, {x: 1255, y: 25}],
                centre: 1
            },
            {
                points: [[{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 100}, {x: 0, y: 100}]],
                interior: [{x: 25, y: 25}, {x: 25, y: 75}, {x: 75, y: 25}, {x: 75, y: 75}],
                centre: {x: 50, y: 50}
            },
            {
                points: [[{x: 0, y: 0}, {x: 200, y: 0}, {x: 200, y: 50}, {x: 0, y: 50}]],
                interior: [{x: 25, y: 25}, {x: 75, y: 25}, {x: 125, y: 25}, {x: 175, y: 25}],
                centre: 1
            },
            {
                points: [
                    [{x: 0, y: 0}, {x: 150, y: 0}, {x: 150, y: 150}, {x: 0, y: 150}],
                    [{x: 50, y: 50}, {x: 100, y: 50}, {x: 100, y: 100}, {x: 50, y: 100}]
                ],
                interior: [{x: 25, y: 25}, {x: 75, y: 25}, {x: 125, y: 25}, {x: 125, y: 75}, {x: 125, y: 125}, {x: 75, y: 125}, {x: 25, y: 125}, {x: 25, y: 75}],
                centre: {x: 75, y: 75}
            },
            {
                points: [[{x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}, {x: 150, y: 50}, {x: 150, y: 100}, {x: 50, y: 100}, {x: 50, y: 50}, {x: 0, y: 50}]],
                interior: [{x: 25, y: 25}, {x: 75, y: 25}, {x: 75, y: 75}, {x: 125, y: 75}],
                centre: 1
            },
            {
                points: [
                    [{x: 0, y: 0}, {x: 250, y: 0}, {x: 250, y: 150}, {x: 0, y: 150}],
                    [{x: 50, y: 50}, {x: 100, y: 50}, {x: 100, y: 100}, {x: 50, y: 100}],
                    [{x: 150, y: 50}, {x: 200, y: 50}, {x: 200, y: 100}, {x: 150, y: 100}]
                ],
                interior: [{x: 25, y: 25}, {x: 75, y: 25}, {x: 125, y: 25}, {x: 125, y: 75}, {x: 125, y: 125}, {x: 75, y: 125}, {x: 25, y: 125}, {x: 25, y: 75},
                            {x: 175, y: 25}, {x: 225, y: 25}, {x: 225, y: 75}, {x: 225, y: 125}, {x: 175, y: 125}],
                centre: 3
            },
            {
                points: [[{x: 50, y: 0}, {x: 100, y: 0}, {x: 100, y: 50}, {x: 150, y: 50}, {x: 150, y: 100}, {x: 100, y: 100}, {x: 100, y: 150},
                            {x: 50, y: 150}, {x: 50, y: 100}, {x: 0, y: 100}, {x: 0, y: 50}, {x: 50, y: 50}]],
                interior: [{x: 75, y: 25}, {x: 75, y: 75}, {x: 75, y: 125}, {x: 25, y: 75}, {x: 125, y: 75}],
                centre: 1
            },
            {
                points: [[{x: 0, y: 0}, {x: 50, y: 0}, {x: 50, y: 100}, {x: 100, y: 100}, {x: 100, y: 150}, {x: 0, y: 150}]],
                interior: [{x: 25, y: 25}, {x: 25, y: 75}, {x: 25, y: 125}, {x: 75, y: 125}],
                centre: 1
            },
            {
                points: [[{x: 0, y: 0}, {x: 150, y: 0}, {x: 150, y: 100}, {x: 100, y: 100}, {x: 100, y: 50}, {x: 0, y: 50}]],
                interior: [{x: 25, y: 25}, {x: 75, y: 25}, {x: 125, y: 25}, {x: 125, y: 75}],
                centre: 1
            }
        ]

        let fragment = document.createElementNS(svgNS, 'g');
        let shape = document.createElementNS(svgNS, 'path');

        fragment.shape = shape;

        shape.points = shapes[id].points;
        fragment.points = [];
        for(let i = 0; i < shape.points.length; i++){
            for(let j = 0; j < shape.points[i].length; j++){
                fragment.points.push(shape.points[i][j]);
            }
        }

        shape.interior = shapes[id].interior;
        for(const p of shape.interior){
            fragment.points.push(p);
        }

        if(typeof shapes[id].centre == 'number') shape.centre = shapes[id].interior[shapes[id].centre];
        else{
            shape.centre = shapes[id].centre;
            console.log(shape.centre)
            fragment.points.push(shape.centre);
        }

        shape.pointsToString = function(){
            let arrs = this.points;
            let str = "";
            for(let j = 0; j < arrs.length; j++){
                let arr = arrs[j];
                str += 'M' + arr[0].x + ',' + arr[0].y + ' ';
                for(let i = 1; i < arr.length; i++){
                    str += 'L' + arr[i].x + ',' + arr[i].y + ' ';
                }
                str += 'L' + arr[0].x + ',' + arr[0].y + ' ';
            }
            return str;
        }

        shape.setAttribute('d', shape.pointsToString());
        shape.setAttribute('fill', 'blue');
        shape.setAttribute('fill-rule', 'evenodd');

        shape.setBBox = function(){
            let minx = Infinity, miny = Infinity, maxx = 0, maxy = 0;
            let arr = this.points[0];
            for(let i = 0; i < arr.length; i++){
                let p = arr[i];
                if(p.x < minx) minx = p.x;
                else if(p.x > maxx) maxx = p.x;
                if(p.y < miny) miny = p.y;
                else if(p.y > maxy) maxy = p.y;
            }
            //tl, tr, br, bl
            shape.bbox = {points: [{x: minx, y: miny}, {x: maxx, y: miny}, {x: maxx, y: maxy}, {x: minx, y: maxy}]};
        }

        shape.setBBox();
        for(let i = 0; i < shape.bbox.points.length; i++){
            fragment.points.push(shape.bbox.points[i]);
        }

        fragment.translate = function(amount){
            let arr = this.points;
            for(let i = 0; i < arr.length; i++){
                arr[i].x += amount.x;
                arr[i].y += amount.y;
            }
            this.shape.setAttribute('d', this.shape.pointsToString());
        }

        fragment.rotate = function(){
            let centre = this.shape.centre;
            let arr = this.points;
            for(let i = 0; i < arr.length; i++){
                let x = -arr[i].y + centre.y + centre.x;
                let y = arr[i].x - centre.x + centre.y;
                // p'x = cos(theta) * (px-ox) - sin(theta) * (py-oy) + ox
                // p'y = sin(theta) * (px-ox) + cos(theta) * (py-oy) + oy
                arr[i].x = x;
                arr[i].y = y;
            }
            this.shape.setAttribute('d', this.shape.pointsToString());
            //cycle array
            this.shape.bbox.points.splice(0, 0, this.shape.bbox.points.pop());
            fragment.bound();
        }

        fragment.bound = function(){
            let bb = this.shape.bbox;
            let topleft = bb.points[0], bottomright = bb.points[2];
            let dy = 0, dx = 0;
            if(topleft.x < 0) dx = -topleft.x;
            else if(bottomright.x > svg.xbounds) dx = svg.xbounds - bottomright.x;
            if(topleft.y < 0) dy = -topleft.y;
            else if(bottomright.y > svg.ybounds) dy = svg.ybounds - bottomright.y;
            this.translate({x: dx, y: dy});
        }

        setDraggable(fragment);

        fragment.appendChild(shape);
        svg.fragments.push(fragment);
        svg.appendChild(fragment);
    }

    
    function setDraggable(fragment){
        fragment.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            if(e.which == 3){
                fragment.rotate();
            }
            else{
                svg.addEventListener('mousemove', drag);
                svg.addEventListener('mouseup', enddrag);
                svg.addEventListener('mouseleave', enddrag);

                let lastpos = gridRound(getMousePosition(e));
        
                function drag(e){
                    fragment.shape.setAttribute('fill-opacity', 0.6);
                    let pos = getMousePosition(e);
                    pos = gridRound(pos);
                    let dx = pos.x - lastpos.x;
                    let dy = pos.y - lastpos.y;
                    if(dx != 0 || dy != 0){
                        let amount = collisionCheck(dx, dy);
                        if(amount.x != 0 || amount.y != 0){
                            fragment.translate(amount);
                            lastpos = {x: lastpos.x + amount.x, y: lastpos.y + amount.y};
                        }
                    }
                }
        
                function enddrag(){
                    svg.removeEventListener('mousemove', drag);
                    svg.removeEventListener('mouseup', enddrag);
                    svg.removeEventListener('mouseleave', enddrag);
                    fragment.shape.setAttribute('fill-opacity', 1);
                }

                function collisionCheck(dx, dy){
                    //boundary check
                    let topleft = fragment.shape.bbox.points[0];
                    let bottomright = fragment.shape.bbox.points[2];
                    if(topleft.x + dx < 0) dx = 0;
                    else if(bottomright.x + dx > svg.xbounds) dx = 0;
                    if(topleft.y + dy < 0) dy = 0;
                    else if(bottomright.y + dy > svg.ybounds) dy = 0;

                    //fragments check
                    for(let i = 0; i < svg.fragments.length; i++){
                        let frag = svg.fragments[i];
                        if(frag == fragment) continue;
                        //bbox check
                        let fragtl = frag.shape.bbox.points[0], fragbr = frag.shape.bbox.points[2];
                        if(topleft.x + dx < fragbr.x && topleft.y + dy < fragbr.y 
                            && bottomright.x + dx > fragtl.x && bottomright.y + dy > fragtl.y){
                            // console.log(`collision: ${fragment} and ${frag}`);
                            // check interiors
                            let coll = false;
                            fullcollcheck:
                            for(let j = 0, int = fragment.shape.interior; j < int.length; j++){
                                for(let k = 0, fint = frag.shape.interior; k < fint.length; k++){
                                    if(fint[k].x == int[j].x + dx && fint[k].y == int[j].y + dy){
                                        coll = true;
                                        break fullcollcheck;
                                    }
                                }
                            }
                            if(coll){
                                dx = 0;
                                dy = 0;
                                break;
                            }
                        }
                    }
                    return {x: dx, y: dy};
                }
            }
        });
    }

    drawGrid();
    createfragment(0);
    createfragment(1);
    createfragment(2);
    createfragment(3);
    createfragment(4);
    createfragment(5);
    createfragment(6);
    createfragment(7);
    createfragment(8);
    createfragment(9);
}