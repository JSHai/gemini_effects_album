import { CFG } from '../constants';
import { ModelType, ShapeData } from '../types';

export const calculateShapes = (): ShapeData => {
  const shapes: ShapeData = {
    [ModelType.HEART]: [],
    [ModelType.PYRAMID]: [],
    [ModelType.TORUS]: [],
    [ModelType.SATURN]: [],
    [ModelType.DIAMOND]: [],
    [ModelType.ATOM]: [],
    [ModelType.VORTEX]: [],
    [ModelType.HOURGLASS]: [],
    [ModelType.DNA]: [],
    [ModelType.SPHERE]: [],
    [ModelType.CYLINDER]: [],
    [ModelType.MOBIUS]: [],
    [ModelType.CUBE]: [],
    [ModelType.STAR]: [],
    [ModelType.KNOT]: [],
    [ModelType.FLOWER]: [],
    [ModelType.KLEIN]: [],
    [ModelType.CONE]: [],
    [ModelType.SHELL]: [],
    [ModelType.KNOT_CN]: [],
    [ModelType.TREE]: [],
    SPIRAL: [],
    GRID: []
  };

  for (let i = 0; i < CFG.count; i++) {
    const p = i / CFG.count;

    // Spiral
    const a = i * 0.15;
    const rSpiral = 65 * Math.pow(p, 0.8);
    shapes.SPIRAL.push(
      Math.cos(a) * rSpiral + (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 8,
      Math.sin(a) * rSpiral + (Math.random() - 0.5) * 4
    );

    // Heart
    let t = Math.random() * Math.PI * 2;
    let hx = 16 * Math.pow(Math.sin(t), 3);
    let hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    let hz = (Math.random() - 0.5) * 15; 
    let s = Math.pow(Math.random(), 0.4) * 2.5;
    shapes[ModelType.HEART].push(hx * s, hy * s, hz * s);

    // Pyramid
    let yPyr = (p - 0.5) * 100;
    let scalePyr = Math.max(0, (50 - yPyr) / 100);
    let xPyr = (Math.random() - 0.5) * 120 * scalePyr;
    let zPyr = (Math.random() - 0.5) * 120 * scalePyr;
    shapes[ModelType.PYRAMID].push(xPyr, yPyr, zPyr);

    // Torus
    let uT = Math.random() * Math.PI * 2;
    let vT = Math.random() * Math.PI * 2;
    let R_T = 60, r_T = 20;
    let xT = (R_T + r_T * Math.cos(vT)) * Math.cos(uT);
    let yT = (R_T + r_T * Math.cos(vT)) * Math.sin(uT);
    let zT = r_T * Math.sin(vT);
    shapes[ModelType.TORUS].push(xT, zT * 0.6, yT);

    // Saturn
    if (Math.random() > 0.4) {
      let ang = Math.random() * Math.PI * 2;
      let rad = 100 + Math.random() * 40;
      shapes[ModelType.SATURN].push(Math.cos(ang) * rad, (Math.random() - 0.5) * 4, Math.sin(ang) * rad);
    } else {
      let ang = Math.random() * Math.PI * 2;
      let phi = Math.acos(2 * Math.random() - 1);
      let rad = 50;
      shapes[ModelType.SATURN].push(rad * Math.sin(phi) * Math.cos(ang), rad * Math.sin(phi) * Math.sin(ang), rad * Math.cos(phi));
    }

    // Diamond
    let hD = (Math.random() - 0.5) * 100;
    let radD;
    if (hD > 20) radD = (50 - hD) / 30 * 40;
    else if (hD > 0) radD = 40;
    else radD = (50 + hD) / 50 * 40;
    let angD = Math.random() * Math.PI * 2;
    radD *= Math.pow(Math.random(), 0.2);
    shapes[ModelType.DIAMOND].push(radD * Math.cos(angD), hD, radD * Math.sin(angD));

    // Atom
    if (Math.random() > 0.3) {
      let orbit = Math.floor(Math.random() * 3);
      let angA = Math.random() * Math.PI * 2;
      let radA = 90 + (Math.random() - 0.5) * 10;
      if (orbit === 0) shapes[ModelType.ATOM].push(radA * Math.cos(angA), radA * Math.sin(angA), (Math.random() - 0.5) * 5);
      else if (orbit === 1) shapes[ModelType.ATOM].push(radA * Math.cos(angA), (Math.random() - 0.5) * 5, radA * Math.sin(angA));
      else shapes[ModelType.ATOM].push((Math.random() - 0.5) * 5, radA * Math.cos(angA), radA * Math.sin(angA));
    } else {
      let ang = Math.random() * Math.PI * 2;
      let phi = Math.acos(2 * Math.random() - 1);
      let rad = 25;
      shapes[ModelType.ATOM].push(rad * Math.sin(phi) * Math.cos(ang), rad * Math.sin(phi) * Math.sin(ang), rad * Math.cos(phi));
    }

    // Vortex
    let tV = p * 4 * Math.PI;
    let yV = p * 120 - 60;
    let rV = (10 + p * 80) + (Math.random() - 0.5) * 25;
    shapes[ModelType.VORTEX].push(rV * Math.cos(tV), yV, rV * Math.sin(tV));

    // Hourglass
    let hH = (Math.random() - 0.5) * 100;
    let rH = Math.abs(hH) * 0.8 + 5;
    let angH = Math.random() * Math.PI * 2;
    shapes[ModelType.HOURGLASS].push(rH * Math.cos(angH), hH, rH * Math.sin(angH));

    // DNA
    const rDNA = 30;
    const yRange = 160; 
    const turns = 3.5;
    const c1 = Math.floor(CFG.count * 0.4);
    const c2 = Math.floor(CFG.count * 0.4);
    
    if (i < c1) {
        let p = i / c1;
        let ang = p * Math.PI * 2 * turns;
        let y = (p - 0.5) * yRange;
        shapes[ModelType.DNA].push(rDNA * Math.cos(ang), y, rDNA * Math.sin(ang));
    } else if (i < c1 + c2) {
        let p = (i - c1) / c2;
        let ang = p * Math.PI * 2 * turns + Math.PI;
        let y = (p - 0.5) * yRange;
        shapes[ModelType.DNA].push(rDNA * Math.cos(ang), y, rDNA * Math.sin(ang));
    } else {
        let p = (i - c1 - c2) / (CFG.count - c1 - c2);
        const numRungs = 25;
        let rungID = Math.floor(p * numRungs);
        let pRung = rungID / numRungs;
        let tInRung = (p * numRungs) % 1; 
        
        let ang = pRung * Math.PI * 2 * turns;
        let y = (pRung - 0.5) * yRange;
        
        let x1 = rDNA * Math.cos(ang);
        let z1 = rDNA * Math.sin(ang);
        let x2 = rDNA * Math.cos(ang + Math.PI);
        let z2 = rDNA * Math.sin(ang + Math.PI);
        shapes[ModelType.DNA].push(x1 + (x2 - x1) * tInRung, y, z1 + (z2 - z1) * tInRung);
    }

    // Cylinder
    let thetaCyl = Math.random() * Math.PI * 2;
    let yCyl = (Math.random() - 0.5) * 120;
    let rCyl = 40 + (Math.random()-0.5) * 5; 
    shapes[ModelType.CYLINDER].push(rCyl * Math.cos(thetaCyl), yCyl, rCyl * Math.sin(thetaCyl));

    // Mobius Strip
    let uMob = (i / CFG.count) * Math.PI * 2; 
    let vMob = (Math.random() - 0.5) * 20; // Width
    let radiusMob = 55;
    let xMob = (radiusMob + vMob * Math.cos(uMob / 2)) * Math.cos(uMob);
    let yMob = (radiusMob + vMob * Math.cos(uMob / 2)) * Math.sin(uMob);
    let zMob = vMob * Math.sin(uMob / 2);
    shapes[ModelType.MOBIUS].push(xMob, yMob, zMob);

    // Sphere
    let phiS = Math.acos(2 * Math.random() - 1);
    let thetaS = Math.random() * Math.PI * 2;
    let radS = (Math.random() > 0.2 ? 70 : Math.random() * 70); 
    shapes[ModelType.SPHERE].push(
        radS * Math.sin(phiS) * Math.cos(thetaS),
        radS * Math.sin(phiS) * Math.sin(thetaS),
        radS * Math.cos(phiS)
    );

    // CUBE
    const cubeSize = 90;
    const face = Math.floor(Math.random() * 6);
    let xc, yc, zc;
    const offset = (Math.random() - 0.5) * cubeSize;
    const offset2 = (Math.random() - 0.5) * cubeSize;
    const limit = cubeSize / 2;
    
    switch(face) {
        case 0: xc = limit; yc = offset; zc = offset2; break; // Right
        case 1: xc = -limit; yc = offset; zc = offset2; break; // Left
        case 2: xc = offset; yc = limit; zc = offset2; break; // Top
        case 3: xc = offset; yc = -limit; zc = offset2; break; // Bottom
        case 4: xc = offset; yc = offset2; zc = limit; break; // Front
        case 5: xc = offset; yc = offset2; zc = -limit; break; // Back
        default: xc=0; yc=0; zc=0;
    }
    shapes[ModelType.CUBE].push(xc, yc, zc);

    // STAR (Optimized: Smaller, Sharper)
    let uS = Math.random() * Math.PI * 2;
    let vS = Math.random() * Math.PI;
    let rBase = 15; // Reduced from 40 to 15
    // 5 sharp spikes
    let spike = 45 * Math.pow(Math.abs(Math.sin(2.5 * uS) * Math.sin(vS)), 6); // Power increased for sharpness
    let rStar = rBase + spike;
    shapes[ModelType.STAR].push(
       rStar * Math.sin(vS) * Math.cos(uS),
       rStar * Math.sin(vS) * Math.sin(uS),
       rStar * Math.cos(vS)
    );

    // KNOT (Torus Knot)
    let tK = (i / CFG.count) * Math.PI * 2 * 3; 
    let pK = 2, qK = 3;
    let rK = 40 + 15 * Math.cos(qK * tK);
    let xK = rK * Math.cos(pK * tK);
    let yK = rK * Math.sin(pK * tK);
    let zK = 25 * Math.sin(qK * tK);
    shapes[ModelType.KNOT].push(
        xK + (Math.random()-0.5)*5, 
        yK + (Math.random()-0.5)*5, 
        zK + (Math.random()-0.5)*5
    );

    // FLOWER
    let uF = Math.random() * Math.PI * 2;
    let vF = Math.random() * Math.PI;
    let rF = 20 + 50 * Math.abs(Math.sin(2.5 * uF)) * Math.sin(vF);
    shapes[ModelType.FLOWER].push(
       rF * Math.sin(vF) * Math.cos(uF),
       rF * Math.sin(vF) * Math.sin(uF),
       (rF * Math.cos(vF) * 0.4) + (Math.random()-0.5)*8
    );

    // KLEIN BOTTLE
    let uKl = (i / CFG.count) * Math.PI * 2;
    let vKl = Math.random() * Math.PI * 2;
    // Figure-8 Klein Bottle Parametric
    let rKl = 4 * (1 - Math.cos(uKl) / 2);
    let xKl, yKl, zKl;
    if (uKl < Math.PI) {
        xKl = 6 * Math.cos(uKl) * (1 + Math.sin(uKl)) + rKl * Math.cos(uKl) * Math.cos(vKl);
        yKl = 16 * Math.sin(uKl) + rKl * Math.sin(uKl) * Math.cos(vKl);
    } else {
        xKl = 6 * Math.cos(uKl) * (1 + Math.sin(uKl)) + rKl * Math.cos(vKl + Math.PI);
        yKl = 16 * Math.sin(uKl);
    }
    zKl = rKl * Math.sin(vKl);
    // Scale up
    const scaleKl = 3.5;
    shapes[ModelType.KLEIN].push(xKl * scaleKl, yKl * scaleKl - 10, zKl * scaleKl);

    // CONE (Spiral Cone) - Thickened (Tube-like)
    let tCo = i / CFG.count; // 0 to 1
    let hCo = (tCo - 0.5) * 120; // Height
    let rCo = (1 - tCo) * 90; // Base Radius
    let angCo = tCo * Math.PI * 15; // Spiral
    
    // Add thickness scatter (tube effect)
    let tubeRadCo = 4.0; // Thickness radius
    let tubeAngCo = Math.random() * Math.PI * 2;
    
    let baseXCo = rCo * Math.cos(angCo);
    let baseZCo = rCo * Math.sin(angCo);
    
    shapes[ModelType.CONE].push(
        baseXCo + tubeRadCo * Math.cos(tubeAngCo),
        hCo + (Math.random()-0.5) * 2, // Minor height scatter
        baseZCo + tubeRadCo * Math.sin(tubeAngCo)
    );

    // SHELL (Nautilus) - Scaled Up and Moved Up
    let tSh = i / CFG.count * 6 * Math.PI; 
    let radSh = 2.5 * Math.exp(0.12 * tSh); 
    
    let xSh = radSh * Math.cos(tSh);
    let ySh = radSh * Math.sin(tSh) - 40; 
    
    // Thicker tube for bigger shell
    let tubeRad = radSh * 0.5; 
    let tubeAng = Math.random() * Math.PI * 2;
    
    xSh += tubeRad * Math.cos(tubeAng) * Math.cos(tSh);
    ySh += tubeRad * Math.cos(tubeAng) * Math.sin(tSh);
    let zSh = tubeRad * Math.sin(tubeAng);
    
    // Scale 1.5x and Move Up (+50 Y)
    shapes[ModelType.SHELL].push(xSh * 1.5, ySh * 1.5 + 50, zSh * 1.5); 

    // KNOT_CN (Real Chinese Knot)
    let xCn = 0, yCn = 0, zCn = 0;
    if (i < CFG.count * 0.1) {
        let subP = i / (CFG.count * 0.1);
        let ang = subP * Math.PI * 2;
        let rLoop = 8;
        xCn = rLoop * Math.cos(ang);
        yCn = 55 + rLoop * Math.sin(ang); 
        zCn = (Math.random() - 0.5) * 4;
    } 
    else if (i < CFG.count * 0.75) {
        let range = 35;
        let rx = (Math.random() - 0.5) * 2 * range;
        let ry = (Math.random() - 0.5) * 2 * range;
        let spacing = 7;
        let thickness = 2.0;
        if (Math.random() > 0.5) {
            rx = Math.round(rx / spacing) * spacing + (Math.random()-0.5)*thickness;
        } else {
            ry = Math.round(ry / spacing) * spacing + (Math.random()-0.5)*thickness;
        }
        let xRot = (rx - ry) * 0.707;
        let yRot = (rx + ry) * 0.707;
        xCn = xRot;
        yCn = yRot + 10; 
        zCn = (Math.random() - 0.5) * 5; 
    } else {
        let subI = i - CFG.count * 0.75;
        let totalTassel = CFG.count * 0.25;
        let pT = subI / totalTassel;
        let strands = 5;
        let strandId = Math.floor(pT * strands); 
        let pStrand = (pT * strands) % 1; 
        let tasselW = 15;
        let startX = (strandId / (strands - 1) - 0.5) * tasselW;
        let startY = -30;
        let length = 50 + Math.random() * 10;
        xCn = startX + Math.sin(pStrand * 10) * 2; 
        yCn = startY - pStrand * length;
        zCn = (Math.random() - 0.5) * 5;
    }
    shapes[ModelType.KNOT_CN].push(xCn, yCn, zCn);

    // CHRISTMAS TREE (New Feature)
    // 3 Layers of cones + star on top
    let xTree = 0, yTree = 0, zTree = 0;
    
    // Top Star (small portion of particles)
    if (i < CFG.count * 0.05) {
       // Star shape
       let subI = i;
       let uS = Math.random() * Math.PI * 2;
       let vS = Math.random() * Math.PI;
       let rS = 8;
       let spike = 15 * Math.pow(Math.abs(Math.sin(2.5 * uS) * Math.sin(vS)), 4);
       let rStar = rS + spike;
       xTree = rStar * Math.sin(vS) * Math.cos(uS);
       yTree = 60 + rStar * Math.cos(vS); // Moved to top
       zTree = rStar * Math.sin(vS) * Math.sin(uS);
    } else {
       // Tree Body (Cones)
       let subI = i - CFG.count * 0.05;
       let totalBody = CFG.count * 0.95;
       let p = subI / totalBody; 
       
       // 3 Segments: Top(0-0.3), Mid(0.3-0.6), Bot(0.6-1.0)
       let levelYBase = 0;
       let levelHeight = 0;
       let levelRadTop = 0;
       let levelRadBot = 0;

       if (p < 0.25) {
          // Top Cone
          let lp = p / 0.25;
          levelYBase = 30;
          levelHeight = 25;
          levelRadTop = 2;
          levelRadBot = 25;
          yTree = levelYBase + levelHeight * (1-lp);
          let r = levelRadTop + (levelRadBot - levelRadTop) * lp;
          let ang = lp * Math.PI * 20;
          xTree = r * Math.cos(ang);
          zTree = r * Math.sin(ang);
       } else if (p < 0.6) {
          // Mid Cone
          let lp = (p - 0.25) / 0.35;
          levelYBase = 0;
          levelHeight = 35;
          levelRadTop = 8;
          levelRadBot = 45;
          yTree = levelYBase + levelHeight * (1-lp);
          let r = levelRadTop + (levelRadBot - levelRadTop) * lp;
          let ang = lp * Math.PI * 25;
          xTree = r * Math.cos(ang);
          zTree = r * Math.sin(ang);
       } else {
          // Bottom Cone
          let lp = (p - 0.6) / 0.4;
          levelYBase = -40;
          levelHeight = 45;
          levelRadTop = 15;
          levelRadBot = 65;
          yTree = levelYBase + levelHeight * (1-lp);
          let r = levelRadTop + (levelRadBot - levelRadTop) * lp;
          let ang = lp * Math.PI * 30;
          xTree = r * Math.cos(ang);
          zTree = r * Math.sin(ang);
       }
       
       // Add some scatter for leaves
       xTree += (Math.random()-0.5) * 3;
       yTree += (Math.random()-0.5) * 3;
       zTree += (Math.random()-0.5) * 3;
    }
    shapes[ModelType.TREE].push(xTree, yTree, zTree);

    // Initial GRID - Will be overwritten by Scene.tsx for Helix Gallery
    shapes.GRID.push(0,0,0);
  }

  return shapes;
};