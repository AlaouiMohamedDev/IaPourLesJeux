class Vehicle {
  static debug = false;
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.4;
    
    this.r_pourDessin = 8;
    // rayon du véhicule pour l'évitement
    this.r = this.r_pourDessin * 3;

    // Pour évitement d'obstacle
    this.largeurZoneEvitementDevantVaisseau = 40;
    this.rayonZoneDeFreinage = 200;
    this.perceptionRadius=100;
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  
  separation(boids) {
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (other != this && d < this.perceptionRadius) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.vel);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  // applyBehaviors(target, obstacles) {

  //   let seekForce = this.arrive(target);
  //   let avoidForce = this.avoidAmeliore(obstacles, vehicules);
  //   //let avoidForce = this.avoidAmeliore(obstacles);

  //   seekForce.mult(0.2);
  //   avoidForce.mult(0.9);

  //   this.applyForce(seekForce);
  //   this.applyForce(avoidForce);
  // }




  arrive(target) {
    // 2nd argument true enables the arrival behavior
    return this.seek(target, true);
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  seek(target, arrival = false) {
    let force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;
    
    if (arrival) {
      // On définit un rayon de 100 pixels autour de la cible
      // si la distance entre le véhicule courant et la cible
      // est inférieure à ce rayon, on ralentit le véhicule
      // desiredSpeed devient inversement proportionnelle à la distance
      // si la distance est petite, force = grande
      // Vous pourrez utiliser la fonction P5 
      // distance = map(valeur, valeurMin, valeurMax, nouvelleValeurMin, nouvelleValeurMax)
      // qui prend une valeur entre valeurMin et valeurMax et la transforme en une valeur
      // entre nouvelleValeurMin et nouvelleValeurMax

      // TODO !
      
      let rayon = this.rayonZoneDeFreinage;
      // 0 - ceci est un test, on essaye de faire varier la taille
      // de la zone de freinage en fonction de la vitesse
      //rayon = rayon * this.vel.mag() * 0.25;
      //rayon = max(50, rayon);

      // 1 - dessiner le cercle de rayon 100 autour du véhicule
      if(Vehicle.debug)
      {
        noFill();
        stroke(random(255),random(255),random(255))
        circle(this.pos.x, this.pos.y, rayon);
      }
     


      
      // 2 - calcul de la distance entre la cible et le véhicule
      let distance = p5.Vector.dist(this.pos, target);

      // 3 - si distance < rayon du cercle, alors on modifie desiredSPeed
      // qui devient inversement proportionnelle à la distance.
      // si d = rayon alors desiredSpeed = maxSpeed
      // si d = 0 alors desiredSpeed = 0

      if(distance < rayon) {
        desiredSpeed = map(distance, 0, rayon, 0, this.maxSpeed);
      }
    }

    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  show() {
    stroke(255);
    strokeWeight(2);
    fill(255);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    triangle(-this.r_pourDessin, -this.r_pourDessin / 2, -this.r_pourDessin, this.r_pourDessin / 2, this.r_pourDessin, 0);
    pop();
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }

  avoid(vehicule) {
    // calcul d'un vecteur ahead devant le véhicule
    // il regarde par exemple 50 frames devant lui
    let ahead = vehicule.vel.copy();
    ahead.normalize();
    ahead.mult(50);

    if(Vehicle.debug){
// on le dessine
this.drawVector(vehicule.pos, ahead, "blue");
    }
    

    // On calcule la distance entre le cercle et le bout du vecteur ahead
    let pointAuBoutDeAhead = p5.Vector.add(vehicule.pos, ahead);
    if(Vehicle.debug){

      // On dessine ce point pour debugger
      fill("red");
      noStroke();
      circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);
   

    // On dessine la zone d'évitement
    // On trace une ligne large qui va de la position du vaisseau
    // jusqu'au point au bout de ahead
    stroke(color(255, 200, 0, 30)); // gros, semi transparent
    strokeWeight(20);
    line(vehicule.pos.x, vehicule.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
  }
    let distance = pointAuBoutDeAhead.dist(vehicule.pos);
    //console.log("distance = " + distance)

    // si la distance est < rayon de l'obstacle
    if (distance < vehicule.r + this.largeurZoneEvitementDevantVaisseau + this.r ) {
      // calcul de la force d'évitement. C'est un vecteur qui va
      // du centre de l'obstacle vers le point au bout du vecteur ahead
      let force = p5.Vector.sub(pointAuBoutDeAhead, vehicule.pos);
      // on le dessine pour vérifier qu'il est ok (dans le bon sens etc)
      if(Vehicle.debug){

      this.drawVector(vehicule.pos, force, "red");
      }
      // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
      // on limite ce vecteur à la longueur maxSpeed
      force.setMag(this.maxSpeed);
      // on calcule la force à appliquer pour atteindre la cible
      force.sub(this.vel);
      // on limite cette force à la longueur maxForce
      force.limit(this.maxForce);
      return force;
    } else {
      // pas de collision possible
      return createVector(0, 0);
    }
  }

  drawVector(pos, v, color) {
    push();
    // Dessin du vecteur vitesse
    // Il part du centre du véhicule et va dans la direction du vecteur vitesse
    strokeWeight(3);
    stroke(color);
    line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
    // dessine une petite fleche au bout du vecteur vitesse
    let arrowSize = 5;
    translate(pos.x + v.x, pos.y + v.y);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

}



class Target extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(5);
  }

  show() {
    stroke(255);
    strokeWeight(2);
    fill("#F063A4");
    push();
    translate(this.pos.x, this.pos.y);
    circle(0, 0, this.r * 2);
    pop();
  }
}
