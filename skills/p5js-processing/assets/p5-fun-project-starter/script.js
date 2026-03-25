const starterSketch = (p) => {
    let parent;
    let side = 640;

    p.setup = () => {
        parent = document.getElementById("p5-stage");
        const canvas = p.createCanvas(side, side, p.WEBGL);
        canvas.parent(parent);
        p.pixelDensity(1);
    };

    p.draw = () => {
        p.background(6, 12, 18);
        p.orbitControl();
        p.noFill();
        p.stroke(120, 255, 180);
        p.strokeWeight(2.2);
        p.rotateY(p.frameCount * 0.008);
        p.box(side * 0.22);
    };

    p.windowResized = () => {
        if (!parent) {
            return;
        }

        side = Math.min(parent.clientWidth, window.innerWidth - 32, 860);
        p.resizeCanvas(side, side);
    };
};

new p5(starterSketch);
