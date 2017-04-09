var kinectron = null;

// Set depth width and height same Kinect 
var DEPTHWIDTH = 512;
var DEPTHHEIGHT = 424;

var depthBuffer;
var renderer, camera, scene, controls;

var particles = new THREE.Geometry();
var colors = [];
var numParticles = DEPTHWIDTH * DEPTHHEIGHT;

var animFrame = null;
var busy = false;

var colorRenderer = null; 
var webGLCanvas = null;

// Wait for page to load to create webgl canvas and Kinectron connection
window.addEventListener('load', function() {
  // Create webgl canvas 
  webGLCanvas = document.getElementById('webGLCanvas');
  colorRenderer = new ImageBufferRendererWebgl(webGLCanvas);

  // Create point cloud
  initPointCloud();

  // Define and create an instance of kinectron
  var kinectronIpAddress = ""; // FILL IN YOUR KINECTRON IP ADDRESS HERE
  kinectron = new Kinectron();

  // Connect to the microstudio
  //kinectron = new Kinectron("kinectron.itp.tsoa.nyu.edu");

  // Connect remote to application
  kinectron.makeConnection();
  kinectron.startMultiFrame(["raw-depth", "depth-color"], rdCallback1);

  //kinectron.startRawDepth(rdCallback);
});

// Run this callback each time Kinect data is received
function rdCallback(dataReceived) {
  depthBuffer = dataReceived;

  // Update point cloud based on incoming Kinect data
  pointCloud(depthBuffer);
}

function rdCallback1(dataReceived) {
  if (dataReceived.rawDepth && dataReceived.depthColor) {
    pointCloud(dataReceived.rawDepth, dataReceived.depthColor);  
  }

}

function initPointCloud(){ 
  // Create three.js renderer
  renderer = new THREE.WebGLRenderer( {
    canvas: document.getElementById('cloudCanvas'),
    alpha: 0, antialias: true, clearColor: 0x000000
  } );

  // Create three.js camera and controls
  camera = new THREE.PerspectiveCamera( 40, renderer.domElement.width / renderer.domElement.height, 1, 10000 );
  camera.position.set( 0, 300, 3000 );
  controls = new THREE.TrackballControls( camera, renderer.domElement );

  // Create three.js scene
  scene = new THREE.Scene();
  
  createParticles();
  window.addEventListener( 'resize', onWindowResize, false );
  onWindowResize();   
  render();
}

function createParticles() {

  // Create particles
  
  for(var i = 0; i < numParticles; i++) {
    var x = i % DEPTHWIDTH - DEPTHWIDTH * 0.5;
    var y = DEPTHHEIGHT - Math.floor(i / DEPTHWIDTH);
    var vertex = new THREE.Vector3(x, y, Math.random());
    particles.vertices.push(vertex);

    // Assign each particle a color
    colors[i] = new THREE.Color(0xffffff);
  }

  // Add point cloud to scene
  particles.colors = colors;
  var material = new THREE.PointsMaterial( { size: 1, vertexColors: THREE.VertexColors, transparent: true } );
  mesh = new THREE.Points(particles, material);
  scene.add(mesh);
}

function pointCloud(depthBuffer, colorBuffer) {
  if(busy) {
    return;
  }

  busy = true;

  // Set desired depth resolution
  var nDepthMinReliableDistance = 500;
  var nDepthMaxDistance = 4500;
  var j = 0;
  var k = 0;

  //console.log(depthBuffer);
  //debugger;
  // Match depth buffer info to each particle
  for(var i = 0; i < depthBuffer.length; i++) {
    var depth = depthBuffer[i]; 
    if(depth <= nDepthMinReliableDistance || depth >= nDepthMaxDistance) depth = Number.MAX_VALUE; //push particles far far away so we don't see them
    particles.vertices[j].z = (nDepthMaxDistance - depth) - 2000;
    particles.colors[j].r = colorBuffer[k]/255;
    particles.colors[j].g = colorBuffer[k+1]/255;
    particles.colors[j].b = colorBuffer[k+2]/255;
    j++;
    k+=4;
  }

  // Update particles
  particles.verticesNeedUpdate = true;
  particles.colorsNeedUpdate = true;
  busy = false;
}

// Resize scene based on window size
function onWindowResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

// Render three.js scene
function render() {
  renderer.render( scene, camera );
  controls.update();
  animFrame = requestAnimationFrame(render);
}