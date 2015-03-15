/**
 * Created by Yusaira on 2/28/2015.
 */
var potato = {
 "what am i doing with my life?" : "i don't know"
};
var koala_test = {
    "what am i?" : "a lethargic poop"
};

(function(){
    function avgColor(x, y, z, w) {
        return [
            (x[0] + y[0] + z[0] + w[0]) / 4,
            (x[1] + y[1] + z[1] + w[1]) / 4,
            (x[2] + y[2] + z[2] + w[2]) / 4
        ];
    };

    function Circle(vis, xi, yi, size, color, children, layer, onSplit) {
        this.vis = vis;
        this.x = size * (xi + 0.5);
        this.y = size * (yi + 0.5);
        this.size = size;
        this.color = color;
        this.rgb = d3.rgb(color[0], color[1], color[2]);
        this.children = children;
        this.layer = layer;
        this.onSplit = onSplit;
    };

    Circle.prototype.isSplitable = function() {
        return this.node && this.children
    };

    Circle.prototype.split = function() {
        if (!this.isSplitable()) return;
        d3.select(this.node).remove();
        delete this.node;
        Circle.addToVis(this.vis, this.children);
        this.onSplit(this);
    };

    Circle.prototype.checkIntersection = function(startPoint, endPoint) {
        var edx = this.x - endPoint[0],
            edy = this.y - endPoint[1],
            sdx = this.x - startPoint[0],
            sdy = this.y - startPoint[1],
            r2  = this.size / 2;

        r2 = r2 * r2; // Radius squared

        // End point is inside the circle and start point is outside
        return edx * edx + edy * edy <= r2 && sdx * sdx + sdy * sdy > r2;
    }

    Circle.addToVis = function(vis, circles, init) {
        var circle = vis.selectAll('.nope').data(circles)
            .enter().append('circle');

        if (init) {
            // Setup the initial state of the initial circle
            circle = circle
                .attr('cx',   function(d) { return d.x; })
                .attr('cy',   function(d) { return d.y; })
                .attr('r', 4)
                .attr('fill', '#ffffff')
                .transition()
                .duration(1000);
        } else {
            // Setup the initial state of the opened circles
            circle = circle
                .attr('cx',   function(d) { return d.parent.x; })
                .attr('cy',   function(d) { return d.parent.y; })
                .attr('r',    function(d) { return d.parent.size / 2; })
                .attr('fill', function(d) { return String(d.parent.rgb); })
                .attr('fill-opacity', 0.68)
                .transition()
                .duration(300);
        }

        // Transition the to the respective final state
        circle
            .attr('cx',   function(d) { return d.x; })
            .attr('cy',   function(d) { return d.y; })
            .attr('r',    function(d) { return d.size / 2; })
            .attr('fill', function(d) { return String(d.rgb); })
            .attr('fill-opacity', 1)
            .each('end',  function(d) { d.node = this; });
    }
    koala_test.loadImage= function (imageData){
        var canvas = document.createElement('canvas').getContext('2d');
        canvas.drawImage(imageData,0,0, 128, 128);
        return canvas.getImageData(0,0,128,128).data;
    };


    var vis,
        maxSize = 512,
        minSize = 4,
        dim = maxSize / minSize;

    koala_test.makeCircles = function(selector, colorData) {
        function onSplit(circle) {}

        // Make sure that the SVG exists and is empty
        if (!vis) {
            // Create the SVG ellement
            vis = d3.select(selector)
                .append("svg")
                .attr("width", maxSize)
                .attr("height", maxSize);
        } else {
            vis.selectAll('circle')
                .remove();
        }

        // Got the data now build the tree
        var finestLayer = array2d(dim, dim);
        var size = minSize;

        // Start off by populating the base (leaf) layer
        var xi, yi, t = 0, color;
        for (yi = 0; yi < dim; yi++) {
            for (xi = 0; xi < dim; xi++) {
                color = [colorData[t], colorData[t+1], colorData[t+2]];
                finestLayer(xi, yi, new Circle(vis, xi, yi, size, color));
                t += 4;
            }
        }

        // Build up successive nodes by grouping
        var layer, prevLayer = finestLayer;
        var c1, c2, c3, c4, currentLayer = 0;
        while (size < maxSize) {
            dim /= 2;
            size = size * 2;
            layer = array2d(dim, dim);
            for (yi = 0; yi < dim; yi++) {
                for (xi = 0; xi < dim; xi++) {
                    c1 = prevLayer(2 * xi    , 2 * yi    );
                    c2 = prevLayer(2 * xi + 1, 2 * yi    );
                    c3 = prevLayer(2 * xi    , 2 * yi + 1);
                    c4 = prevLayer(2 * xi + 1, 2 * yi + 1);
                    color = avgColor(c1.color, c2.color, c3.color, c4.color);
                    c1.parent = c2.parent = c3.parent = c4.parent = layer(xi, yi,
                        new Circle(vis, xi, yi, size, color, [c1, c2, c3, c4], currentLayer, onSplit)
                    );
                }
            }
            splitableByLayer.push(dim * dim);
            splitableTotal += dim * dim;
            currentLayer++;
            prevLayer = layer;
        }

        // Create the initial circle
        Circle.addToVis(vis, [layer(0, 0)], true);
    }
})();