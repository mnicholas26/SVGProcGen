var svg = "http://www.w3.org/2000/svg";

function groupPoints(points, distance){
	let remaining = [...points];
	let output = [];
	while(remaining.length > 0){
		let group = [];
		group.push(remaining.splice(0, 1)[0]);
		let processed = 0;
		while(processed < group.length){
			let p = group[processed];
			let next = nearestPoint(p, remaining);
			let d = Math.sqrt(Math.pow((p.x - next.x), 2) + Math.pow((p.y - next.y), 2));
			if(d < distance){
				group.push(remaining.splice(remaining.indexOf(next), 1)[0]);
			}
			processed++;
		}
		output.push(group);
	}
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
			let npd = Math.sqrt(Math.pow((np.x - pp.x), 2) + Math.pow((np.y - pp.y), 2));
			let nppd = Math.sqrt(Math.pow((npp.x - pp.x), 2) + Math.pow((npp.y - pp.y), 2));
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


function drawpoints(points, parent){
	let g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
	for(let i = 0; i < points.length; i++){
		let c = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
		let point = points[i];
		c.setAttribute('cx', point.x);
		c.setAttribute('cy', point.y);
		c.setAttribute('r', 1);
		c.setAttribute('fill', 'black');
		g.appendChild(c);
	}
	parent.appendChild(g);
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


//test area
window.onload = () => {
    let parent = document.querySelector('svg');
    let path = document.getElementById('originalpath');
    // let points = getPoints(100, path);
    
    let origpoints = getPoints(12, path);
    let wp = wobblepoints(5, origpoints);
    drawpoints(wp, parent);
    let newpath = document.createElementNS(svg, 'path');
    newpath.setAttribute('d', catmullRomFitting(wp, 0.5));
    newpath.setAttribute('stroke', 'red');
    newpath.setAttribute('fill', 'none');
    parent.appendChild(newpath);
    let points = getPoints(100, newpath);
    
    
    let tp = tangentPoints(points, 10);
    let rmtp = removePoints(points, tp, 10, 0);
    let gptp = groupPoints(rmtp, 10);

    function testRemove(arr, parent){
        let g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        for(let i = 0; i < arr.length; i++){
        let p = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        //p.setAttribute('d', catmullRomFitting(wobblepoints(0.1, arr[i]), 0.5));
        p.setAttribute('d', catmullRomFitting(arr[i], 0.5));
        p.setAttribute('stroke', 'blue');
        p.setAttribute('fill', 'none');
        g.appendChild(p);
        }
        parent.appendChild(g);
    }

    //drawpoints(rmtp, parent);
    testRemove(gptp, parent);
}