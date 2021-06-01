let startButton = document.querySelector(".start");
let restertButton = document.querySelector(".restart");
let startBox = document.querySelector(".box");
let canvas = document.querySelector(".board");
let scoreElem = document.querySelector("span");
let powlevelElem = document.querySelector(".meter span");
let tool = canvas.getContext("2d");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

let score=0;
let fullPower = 100;
let eHeight = 40;
let eWidth = 40;
let ePosX = canvas.width/2-20;
let ePosY = canvas.height/2-20;

let spaceImg = new Image();
spaceImg.src = "./media/space.jpg";

let earthImg = new Image();
earthImg.src = "./media/earth.png";

let coronaImg = new Image();
coronaImg.src = "./media/corona.png";

let bullets = [];
let coronas = [];
let particles = [];

let perSon;
let animId;
function animate(){
	tool.clearRect(0,0,canvas.width,canvas.height);

	tool.fillRect(0, 0, canvas.width, canvas.height);
	tool.drawImage(spaceImg, 0, 0, canvas.width, canvas.height);

	let earth = new Planet(ePosX,ePosY,eWidth,eHeight);
	earth.draw();

	particles.forEach((particle,index)=>{
		if(particle.alpha<=0){
			setTimeout(()=>{
				particles.splice(index,1);
			},0);
		}else {
			particle.update();		
		}
	});


	for(let i=0;i<bullets.length;i++){
		bullets[i].update();
		if(bullets[i].x<0||bullets[i].x>canvas.width||bullets[i]<0||bullets[i]>canvas.height){

			setTimeout(()=>{
				bullets.splice(i,1);
			});
		}
	}

	coronas.forEach((corona,i)=>{
		corona.update();
		// collision earth
		let enemy = corona
		if(colRect(earth.x,earth.y,earth.width,earth.height,enemy.x, enemy.y, enemy.width, enemy.height)){
			fullPower-=20;
			for(let j=0;j<enemy.width*6;j++){
				particles.push(new Particle(enemy.x, enemy.y,Math.random()*2,{
					x:(Math.random()-0.5)*(Math.random()*6),
					y:(Math.random()-0.5)*(Math.random()*6)
				},"green"));
			}
			powlevelElem.style.width = `${fullPower}%`;
			coronas.splice(i,1);
			if(fullPower==0){
				cancelAnimationFrame(animId);
				console.log('Hi');
				alert("Game Over, "+perSon+" Score 🏆🏆 "+score);

				scoreTable();

				restart()
			}
		}

		// // collision bullet
		bullets.forEach( function(bullet, bulletIndex) {
			if(colRect(enemy.x, enemy.y, enemy.width, enemy.height,bullet.x,bullet.y,bullet.width,bullet.height)){
				// explosion
				for(let j=0;j<enemy.width*6;j++){
					particles.push(new Particle(bullet.x,bullet.y,Math.random()*2,{
						x:(Math.random()-0.5)*(Math.random()*6),
						y:(Math.random()-0.5)*(Math.random()*6)
					},"red"));
				}
				setTimeout(()=>{
					coronas.splice(i,1);
					bullets.splice(bulletIndex,1);
					score+=100;
					scoreElem.innerText = score;
					// console.log(scoreElem);
				},0);
			}
		});
	})

	animId = requestAnimationFrame(animate);
}

function colRect(r1x, r1y, r1w, r1h, r2x, r2y, r2w, r2h) {
	return(r1x + r1w >= r2x && r1x <= r2x + r2w && r1y + r1h >= r2y && r1y <= r2y + r2h);
}

class Planet{
	constructor(x,y,width,height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	draw(){
		tool.drawImage(earthImg, this.x, this.y, this.width, this.height);
	}
}

class Bullet{
	constructor(x,y,width,height,velocity){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.velocity = velocity;
	}
	draw(){
		tool.fillStyle = "white";
		tool.fillRect(this.x,this.y,this.width,this.height)
	}
	update(){
		this.draw();
		this.x+=this.velocity.x;
		this.y+=this.velocity.y;
	}
}

class Corona{
	constructor(x,y,width,height,velocity){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.velocity = velocity;
	}
	draw(){
		tool.drawImage(coronaImg, this.x, this.y, this.width, this.height);
	}
	update(){
		this.draw();
		this.x+=this.velocity.x;
		this.y+=this.velocity.y;
	}
}

class Particle{
	constructor(x,y,radius,velocity,color){
		this.x=x;
		this.y=y;
		this.radius=radius;
		this.velocity=velocity;
		this.color = color;
		this.alpha=1;
	}
	draw(){
		tool.save()
		tool.globalAlpha = this.alpha;
		tool.beginPath();
		tool.fillStyle = this.color;
		tool.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
		tool.fill();
		tool.restore();
	}
	update(){
		this.draw();
		this.x+=this.velocity.x;
		this.y+=this.velocity.y;
		this.alpha -= 0.01;
	}
}	

function createCorona(){
	setInterval(function () {
		let x=Math.random()*canvas.width;
		let y=Math.random()*canvas.height;
		let delta = Math.random()
		if(delta<0.5){
			// horizontal
			x = Math.random()<0.5?0:canvas.width;
			y = Math.random()*canvas.height;

		} else{
			// vertical
			x = Math.random()*canvas.width;
			y = Math.random()<0.5?0:canvas.height;
		}

		let angle = Math.atan2(canvas.height/2-y,canvas.width/2-x);
		let velocity = {
			x:Math.cos(angle),
			y:Math.sin(angle)
		}
		let corona = new Corona(x,y,40,40,velocity);
		coronas.push(corona);
	}, 1000,);
}

startButton.addEventListener("click", function(e){
	e.stopPropagation();
	// alert("start the game");
	// hide box
	startBox.style.display = 'none';
	perSon = prompt("Please enter your name", "Harry Potter");

	animate();
	createCorona();


	window.addEventListener("click",function(e){
		let angle = Math.atan2(e.clientY-canvas.height/2, e.clientX-canvas.width/2);
		let velocity = {
			x:Math.cos(angle)*4,
			y:Math.sin(angle)*4
		}
		let bullet = new Bullet(canvas.width/2,canvas.height/2,7,7,velocity);
		bullet.draw();
		bullets.push(bullet);
	})
});

window.addEventListener("resize",()=>{
	window.location.reload();
})

function restart(){
	restertButton.style.display = "block";
	startButton.style.display  = "none";
	startBox.style.display = "flex";
	canvas.height="0px"
	powlevelElem.parentElement.style.display="none";
	document.body.style.backgroundColor = "white";
	restertButton.addEventListener("click", function(e) {
		console.log(e);
		window.location.reload();
	});
}

function scoreTable (argument) {
	// body... 
	let myObj_deseralizer = JSON.parse(localStorage.getItem('myObj'));
	if(perSon in myObj_deseralizer){
		myObj_deseralizer[perSon] = Math.max(myObj_deseralizer[perSon],score);
	} else {
		myObj_deseralizer[perSon] = score;
	}
	let myObj_seralizer = JSON.stringify(myObj_deseralizer);
	localStorage.setItem("myObj", myObj_seralizer);
	// console.log(localStorage.getItem('myObj'));
}
