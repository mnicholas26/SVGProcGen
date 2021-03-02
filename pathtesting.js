var svg = "http://www.w3.org/2000/svg";

function groupPoints(points, pathpoints){
	let remaining = [...points];
	let output = [];
    let lines = makeLines(pathpoints);
	while(remaining.length > 0){
		let group = [];
		group.push(remaining.splice(0, 1)[0]);
		let processed = 0;
		while(processed < group.length){
			let p = group[processed];
            let nointersects = [];
            for(let i = 0; i < remaining.length; i++){
                let passed = true;
                intersectloop:
                for(let j = 0; j < lines.length; j++){
                    if(checksForIntersect(p, remaining[i], lines[j].start, lines[j].end)){
                        passed = false;
                        break intersectloop;
                    }
                }
                if(passed) nointersects.push(remaining[i])
            }
			let next = nearestPoint(p, nointersects);
            if(next.x != undefined) group.push(remaining.splice(remaining.indexOf(next), 1)[0]);
			processed++;
		}
		output.push(group);
	}
    console.log(output);
	return output;
}

function nearestPoint(point, points){
	let min = Infinity;
	let minpoint = {};
	for(let i = 0; i < points.length; i++){
		let p = points[i];
		let d = Math.sqrt(Math.pow((point.x - p.x), 2) + Math.pow((point.y - p.y), 2));
		if(d < min){
			min = d;
			minpoint = p;
		}
	}
	return minpoint;
}

function makeLines(pathpoints){
    let lines = [];
    for(let i = 0; i < pathpoints.length - 1; i++){
        let line = {};
        line.start = pathpoints[i];
        line.end = pathpoints[i+1];
        lines.push(line);
    }
    let line = {start: pathpoints[pathpoints.length-1], end: pathpoints[0]};
    lines.push(line);
    return lines;
}


function wobblepoints(amplitude, points){
	for(let i = 0; i < points.length; i++){
		let roll1 = Math.random()*amplitude;
		let roll2 = Math.random()*amplitude;
		let d = roll1+roll2;
		let angle = Math.random() * 2 * Math.PI;
		points[i].x = points[i].x + (d * Math.cos(angle));
		points[i].y = points[i].y + (d * Math.sin(angle));
	}
	return points;
}


function tangentPoints(points, distance){
	let output = [];
	for(let i = 0; i < points.length; i++){
		let p = points[i];
		let pb = (i == 0) ? points[points.length - 1] : points[i-1];
		let pa = (i == points.length - 1) ? points[0] : points[i+1];

		//find grad between pa and pb
		let m = -1 * ((pa.x - pb.x)/(pa.y - pb.y));
		let newp1 = {}, newp2 = {};
		newp1.x = p.x + (distance/Math.sqrt(1+(m*m)));
		newp2.x = p.x - (distance/Math.sqrt(1+(m*m)));
		newp1.y = (m * (newp1.x - p.x)) + p.y;
		newp2.y = (m * (newp2.x - p.x)) + p.y;

		output.push(newp1);
		output.push(newp2);
	}
	return output;
}

function removePoints(pathpoints, newpoints, distance, remove, epsilon = 0.01){
	let output = [];
	for(let i = 0; i < newpoints.length; i+=2){
		let np = newpoints[i];
		let npp = newpoints[i+1];
		let nppassed = true;
		let npppassed = true;
		let npds = [], nppds = [];
		for(let j = 0; j < pathpoints.length; j++){
			let pp = pathpoints[j];
			let npd = findDistance(np, pp);
			let nppd = findDistance(npp, pp);
			if(npd < (distance - epsilon)) nppassed = false;
			if(nppd < (distance - epsilon)) npppassed = false;
			npds.push(npd);
			nppds.push(nppd);
			if(!nppassed && !npppassed) break;
		}
		if(remove == 0){
			if(nppassed) output.push(np);
			if(npppassed) output.push(npp);
		} else {
			let npad = npds.reduce((a,b) => (a+b)) / npds.length;
			let nppad = nppds.reduce((a,b) => (a+b)) / nppds.length;
			if(remove < 0){
				if(npad - nppad >=0 && npppassed) output.push(npp);
				else if(nppad - npad >=0 && nppassed) output.push(np);
			} else {
				if(npad - nppad >=0 && nppassed) output.push(np);
				else if(nppad - npad >=0 && npppassed) output.push(npp);
			}
		}
	}
	return output;
}


function drawPoints(points, parent, colour = 'black'){
	let g = document.createElementNS(svg, 'g');
	for(let i = 0; i < points.length; i++){
		let c = document.createElementNS(svg, 'circle');
		let point = points[i];
		c.setAttribute('cx', point.x);
		c.setAttribute('cy', point.y);
		c.setAttribute('r', 1);
		c.setAttribute('fill', colour);
        c.addEventListener('click', () => {
            console.log(`x: ${point.x} y: ${point.y} i: ${i}`);
        })
		g.appendChild(c);
	}
	parent.appendChild(g);
}

function drawLines(lines, parent){
    let g = document.createElementNS(svg, 'g');
    for(let i = 0; i < lines.length; i++){
        let l = document.createElementNS(svg, 'line');
        let line = lines[i];
        l.setAttribute('x1', line.start.x);
		l.setAttribute('x2', line.end.x);
        l.setAttribute('y1', line.start.y);
		l.setAttribute('y2', line.end.y);
		l.setAttribute('stroke', 'green');
        l.addEventListener('click', () => {
            console.log(`Start: (${line.start.x}, ${line.start.y}) End: (${line.end.x}, ${line.end.y})`);
        })
		g.appendChild(l);
    }
    parent.appendChild(g);
}

function drawPath(points, parent, colour = 'blue'){
	let p = document.createElementNS(svg, 'path');
	p.setAttribute('d', catmullRomFitting(points, 0.5));
	p.setAttribute('stroke', colour);
    p.setAttribute('fill', 'none');
	parent.appendChild(p);
}



function catmullRomFitting(data,alpha) {

    if (alpha == 0 || alpha === undefined) return false;
    else {
        var p0, p1, p2, p3, bp1, bp2, d1, d2, d3, A, B, N, M;
        var d3powA, d2powA, d3pow2A, d2pow2A, d1pow2A, d1powA;
        var d = 'M' + Math.round(data[0].x) + ',' + Math.round(data[0].y) + ' ';
        data.push(data[0]);
        var length = data.length;
        for (var i = 0; i < length - 1; i++) {

            p0 = i == 0 ? data[length - 2] : data[i - 1];
            p1 = data[i];
            p2 = data[i + 1];
            p3 = i + 2 < length ? data[i + 2] : data[1];

            d1 = Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2));
            d2 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            d3 = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));

            // Catmull-Rom to Cubic Bezier conversion matrix

            // A = 2d1^2a + 3d1^a * d2^a + d3^2a
            // B = 2d3^2a + 3d3^a * d2^a + d2^2a

            // [   0             1            0          0          ]
            // [   -d2^2a /N     A/N          d1^2a /N   0          ]
            // [   0             d3^2a /M     B/M        -d2^2a /M  ]
            // [   0             0            1          0          ]

            d3powA = Math.pow(d3, alpha);
            d3pow2A = Math.pow(d3, 2 * alpha);
            d2powA = Math.pow(d2, alpha);
            d2pow2A = Math.pow(d2, 2 * alpha);
            d1powA = Math.pow(d1, alpha);
            d1pow2A = Math.pow(d1, 2 * alpha);

            A = 2 * d1pow2A + 3 * d1powA * d2powA + d2pow2A;
            B = 2 * d3pow2A + 3 * d3powA * d2powA + d2pow2A;
            N = 3 * d1powA * (d1powA + d2powA);
            if (N > 0) {
            N = 1 / N;
            }
            M = 3 * d3powA * (d3powA + d2powA);
            if (M > 0) {
            M = 1 / M;
            }

            bp1 = { x: (-d2pow2A * p0.x + A * p1.x + d1pow2A * p2.x) * N,
            y: (-d2pow2A * p0.y + A * p1.y + d1pow2A * p2.y) * N };

            bp2 = { x: (d3pow2A * p1.x + B * p2.x - d2pow2A * p3.x) * M,
            y: (d3pow2A * p1.y + B * p2.y - d2pow2A * p3.y) * M };

            if (bp1.x == 0 && bp1.y == 0) {
            bp1 = p1;
            }
            if (bp2.x == 0 && bp2.y == 0) {
            bp2 = p2;
            }

            if(i < length-2) d += 'C' + bp1.x.toFixed(2) + ',' + bp1.y.toFixed(2) + ' ' + bp2.x.toFixed(2) + ',' + bp2.y.toFixed(2) + ' ' + p2.x.toFixed(2) + ',' + p2.y.toFixed(2) + ' ';
            else d += 'C' + bp1.x.toFixed(2) + ',' + bp1.y.toFixed(2) + ' ' + bp2.x.toFixed(2) + ',' + bp2.y.toFixed(2) + ' ' + data[0].x.toFixed() + ',' + data[0].y.toFixed() + 'z';
        }

        return d;
    }
}

function getPoints(gran, path){
	let points = [];
	let len = path.getTotalLength();
	for(let i = 0; i < gran; i++){
		let point = path.getPointAtLength((len/gran)*i);
		points.push(point);
	}
	return points;
}

function checksForIntersect(point1, point2, point3, point4){
    return intersects(point1.x, point1.y, point2.x, point2.y, point3.x, point3.y, point4.x, point4.y);
}

function intersects(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
        return false;
    }else{
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}

function intersectionPoint(line1, line2){
    let m1 = findGradient(line1.start, line1.end);
    let m2 = findGradient(line2.start, line2.end);
    let c1 = line1.start.y - (m1 * line1.start.x);
    let c2 = line2.start.y - (m2 * line2.start.x);

    let x = Math.abs(c1 - c2) /  Math.abs(m1 - m2);
    let y = (m1 * x) + c1;
    return {x: x, y: y};
}

function findGradient(p1, p2){
    return (p1.y - p2.y)/(p1.x - p2.x);
}

function findDistance(p1, p2){
    return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
}

function findIntersections(points){
    let lines = makeLines(points);
    let intpoints = [];
    for(let i = 0; i < lines.length; i++){
        let line = lines[i];
        for(let j = 0; j < lines.length; j++){
            let line2 = lines[j];
            if(line != line2){
                if(checksForIntersect(line.start, line.end, line2.start, line2.end)){
                    let point = intersectionPoint(line, line2);
                    let passed = true;
                    uniqueloop:
                    for(let k = 0; k < intpoints.length; k++){
                        let ip = intpoints[k];
                        if(point.x == ip.x && point.y == ip.y){
                            passed = false;
                            break uniqueloop;
                        }
                    }
                    if(passed) intpoints.push(point);
                }
            }
        }
    }
    return intpoints;
}

function trimPoints(points, intpoints, gradtolerance, inttolerance, sampletolerance){
    let output = [];
    for(let i = 0; i < points.length; i++){
        let prev = (i == 0) ? points[points.length - 1] : points[i - 1];
        let curr = points[i];
        let next = (i == points.length - 1) ? points[0] : points[i + 1];

        let gradab = findGradient(prev, curr);
        let gradbc = findGradient(curr, next);

        let angle = Math.atan( Math.abs( (gradab - gradbc) / (1 + (gradab * gradbc)) ) );
        if(angle > gradtolerance){
            output.push(curr)
            continue;
        }
        intcheck:
        for(let j = 0; j < intpoints.length; j++){
            let d = findDistance(curr, intpoints[j]);
            // if(d < inttolerance){
            if(Math.abs(d - inttolerance) <= inttolerance / 5){
                output.push(curr);
                break intcheck;
            }
        }
        if(i % sampletolerance == 0) output.push(curr);
    }
    return output;
}


//test area
window.onload = () => {
    let parent = document.querySelector('svg');
    let path = document.getElementById('originalpath');
    
    let lowrespoints = getPoints(path.getTotalLength()/20, path);
    let intpoints = findIntersections(lowrespoints);

    let highrespoints = getPoints(path.getTotalLength(), path);
    let trimmedpoints = [...highrespoints];

    trimmedpoints = trimPoints(trimmedpoints, intpoints, Math.PI/90, 10, 5);
    drawPoints(trimmedpoints, parent);
    drawPath(trimmedpoints, parent, 'red');
    
    let tanpoints = tangentPoints(trimmedpoints, 10);
    let rempoints = removePoints(highrespoints, tanpoints, 10, 0);
    let grppoints = groupPoints(rempoints, lowrespoints);
    for(let i = 0; i < grppoints.length; i++){
        drawPath(grppoints[i], parent, 'blue');
    }

    // let points = getPoints(path.getTotalLength(), path);
    // let tp = tangentPoints(points, 10);
    // let rmtp = removePoints(points, tp, 10, 0);
    // let gptp = groupPoints(rmtp, getPoints(20, path));
    // for(let i = 0; i < gptp.length; i++){
    //     drawPath(gptp[i], parent, 'blue');
    // }
    
    // let points = getPoints(100, path);
    
    // // let origpoints = getPoints(12, path);
    // // let wp = wobblepoints(5, origpoints);
    // // drawPoints(wp, parent);
    // // let newpath = document.createElementNS(svg, 'path');
    // // newpath.setAttribute('d', catmullRomFitting(wp, 0.5));
    // // newpath.setAttribute('stroke', 'red');
    // // newpath.setAttribute('fill', 'none');
    // // parent.appendChild(newpath);
    // // let points = getPoints(100, newpath);
    
    
    // let tp = tangentPoints(points, 10);
    // let rmtp = removePoints(points, tp, 10, 0);
    // let gptp = groupPoints(rmtp, getPoints(20, path));
    // // let gptp = groupPoints(rmtp, getPoints(20, newpath));

    // // function testRemove(arr, parent){
    // //     let g = document.createElementNS(svg, 'g');
    // //     for(let i = 0; i < arr.length; i++){
    // //         let p = document.createElementNS(svg, 'path');
    // //         // p.setAttribute('d', catmullRomFitting(wobblepoints(0.1, arr[i]), 0.5));
    // //         p.setAttribute('d', catmullRomFitting(arr[i], 0.5));
    // //         p.setAttribute('stroke', 'blue');
    // //         p.setAttribute('fill', 'none');
    // //         g.appendChild(p);
    // //     }
    // //     parent.appendChild(g);
    // // }

    // function testRemove(arr, parent){
    //     let d = "";
    //     let p = document.createElementNS(svg, 'path');
    //     p.setAttribute('stroke', 'blue');
    //     p.setAttribute('fill', 'none');
    //     p.setAttribute('fill-rule', 'evenodd');
    //     for(let i = 0; i < arr.length; i++){
    //         d += catmullRomFitting(arr[i], 0.5);
    //     }
    //     p.setAttribute('d', d);
    //     p.id = "outlined"
    //     parent.appendChild(p)
    // }

    // //drawPoints(rmtp, parent);
    // //drawLines(makeLines(points), parent);
    // testRemove(gptp, parent);
    // //drawPoints(rmtp, parent);

    // let point = parent.createSVGPoint();
    // point.x = 40;
    // point.y = 40;
    // drawPoints([point], parent);
    // let outlined = document.getElementById('outlined');
    // console.log(outlined.isPointInFill(point));
}