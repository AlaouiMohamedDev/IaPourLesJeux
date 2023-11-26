let vehicle,target,follow;
let vehicles=[];

function setup() {
  createCanvas(windowWidth, windowHeight);
   for(let i =0;i<10;i++){
    let v= new Vehicle(random(width),random(height));
    v.maxSpeed=5;
    v.maxForce=2;
    vehicles.push(v);
   }


}

function draw() {
  background(0);
  //background(0, 0, 0,10);


  // Cible qui suit la souris, cercle rouge de rayon 32
  target = createVector(mouseX, mouseY);
  fill(82,221,137);
  noStroke();
  ellipse(target.x, target.y, 32);

  
  for(let i =0;i<vehicles.length;i++){
    let v= vehicles[0].vel.copy();
    v.normalize();
    v.mult(-100);
    v.add(vehicles[0].pos);
    fill(0,255,0);
    circle(v.x,v.y,15);
    
    if(i===0)
    {
      let steering =vehicles[i].arrive(target);
      vehicles[i].applyForce(steering);
    }
    else{
    let avoidForce = vehicles[i].avoid(vehicles[0]);
    avoidForce.mult(0.3)
    vehicles[i].applyForce(avoidForce);
     // let t = createVector(vehicles[i-1].pos.x, vehicles[i-1].pos.y);
     let separation = vehicles[i].separation(vehicles);
      separation.mult(0.2);
      vehicles[i].applyForce(separation);
      let steering =vehicles[i].arrive(v);
      steering.mult(0.6);
      vehicles[i].applyForce(steering);
     
    }
    
    vehicles[i].update();
    vehicles[i].show();
   }
 

  // comportement arrive
  // let steering = vehicle1.arrive(target);
  // let target2 =createVector(vehicle1.pos.x, vehicle1.pos.y);

  // let steering2 = vehicle2.arrive(target2);

  // On applique la force au véhicule
  // vehicle1.applyForce(steering);
  // vehicle2.applyForce(steering2);

  // On met à jour la position et on dessine le véhicule


  // let distance = dist(vehicle.pos.x,vehicle.pos.y,target.x,target.y);
  // if(distance<5)
  // {
  //   target = createVector(random(width),random(height));
  // }
   
}

function keyPressed() {
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  }
}