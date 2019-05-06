function init() {
  var scene = new THREE.Scene();
  var gui = new dat.GUI();
  var clock = new THREE.Clock();

  var enableFog = false;
  if(enableFog) {
    scene.fog = new THREE.FogExp2(0xffffff, 0.2);
  }

  var plane = getPlane(100);
  var Light = getDirectionalLight(1);
  var sphere = getSphere(0.05);
  var boxGrid = getBoxGrid(20, 2.5);
  var helper = new THREE.CameraHelper(Light.shadow.camera);
  var ambientLight = getAmbientLight(1);
  boxGrid.name = 'boxGrid';

  plane.name = 'plane-1';

  plane.rotation.x = Math.PI/2;
  Light.position.x = 13;
  Light.position.y = 10;
  Light.position.z = 10;
  Light.intensity = 2;

  //Objects can be added as children of other objects. Like HTML elements.
  scene.add(plane);
  Light.add(sphere);
  scene.add(Light);
  scene.add(ambientLight);
  scene.add(boxGrid);
  scene.add(helper);
  
  var perspectiveCamera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    1,
    1000
  );

  var orthographicCamera = new THREE.OrthographicCamera(
    -15,
    15,
    15,
    -15,
    1,
    1000
  );

  var camera = perspectiveCamera;


    //Animation "rig"
  var cameraZRotation = new THREE.Group();
  var cameraYPosition = new THREE.Group();
  var cameraZPosition = new THREE.Group();
  var cameraXRotation = new THREE.Group();
  var cameraYRotation = new THREE.Group();
  
  cameraZRotation.name = 'cameraZRotation';
  cameraYPosition.name = 'cameraYPosition';
  cameraXRotation.name = 'cameraXRotation';
  cameraZPosition.name = 'cameraZPosition';
  cameraYRotation.name = 'cameraYRotation';

  cameraZRotation.add(camera);
  cameraYPosition.add(cameraZRotation);
  cameraZPosition.add(cameraYPosition);
  cameraXRotation.add(cameraZPosition);
  cameraYRotation.add(cameraXRotation);
  scene.add(cameraYRotation);

  cameraXRotation.rotation.x = -Math.PI/2;
  cameraYPosition.position.y = 1;
  cameraZPosition.position.z = 100;

  gui.add(cameraZPosition.position, 'z', 0, 100);
  gui.add(cameraYRotation.rotation, 'y', -Math.PI, Math.PI);
  gui.add(cameraXRotation.rotation, 'x', -Math.PI, Math.PI);
  gui.add(cameraZRotation.rotation, 'z', -Math.PI, Math.PI);
  
  var renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x999999);
  document.getElementById('webgl').appendChild(renderer.domElement);

  var controls = new THREE.OrbitControls(camera, renderer.domElement)

  update(renderer, scene, camera, controls, clock);

  return scene;
}

function getBox(w, h, d) {
  var geometry = new THREE.BoxGeometry(w,h,d);
  var material = new THREE.MeshPhongMaterial({
    color: 0x999999
  });
  var mesh = new THREE.Mesh(
    geometry,
    material
  );
  mesh.castShadow = true;

  return mesh;
}

function getBoxGrid(amount, separationMultiplier) {
  var group = new THREE.Group();

  for(var i=0; i<amount; i++) {
    var obj = getBox(1,3,1);
    obj.position.x = i * separationMultiplier;
    obj.position.y = obj.geometry.parameters.height/2;
    group.add(obj);
    for(var j=1; j<amount; j++) {
      var obj = getBox(1,3,1);
      obj.position.x = i * separationMultiplier;
      obj.position.y = obj.geometry.parameters.height/2;
      obj.position.z = j * separationMultiplier;
      group.add(obj);
    }
  }

  group.position.x = -(separationMultiplier * (amount-1))/2;
  group.position.z = -(separationMultiplier * (amount-1))/2;

  return group;

}

function getSphere(radius) {
  var geometry = new THREE.SphereGeometry(radius, 24, 24);
  var material = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });
  var mesh = new THREE.Mesh(
    geometry,
    material
  );
  
  return mesh;
}

function getPlane(size) {
  var geometry = new THREE.PlaneGeometry(size, size);
  var material = new THREE.MeshPhongMaterial({
    color: 0x999999,
    side: THREE.DoubleSide
  });
  var mesh = new THREE.Mesh(
      geometry,
      material
    );
    mesh.receiveShadow = true;
    
    return mesh;
  }

function getPointLight(intensity) {
  var light = new THREE.PointLight(0xffffff, intensity);
  light.castShadow = true;
  return light;
}

function getSpotLight(intensity) {
  var light = new THREE.SpotLight(0xffffff, intensity);
  light.castShadow = true;

  light.shadow.bias = 0.01;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;

  return light;
}

function getDirectionalLight(intensity) {
  var light = new THREE.DirectionalLight(0xffffff, intensity);
  light.castShadow = true;

  //Set the size of the box in which shadows will be casted by the directional light.
  light.shadow.camera.left = -40;
  light.shadow.camera.bottom = -40;
  light.shadow.camera.right = 40;
  light.shadow.camera.top = 40;

  light.shadow.mapSize.width = 4096;
  light.shadow.mapSize.height = 4096;

  return light;
}

function getAmbientLight(intensity) {
  var light = new THREE.AmbientLight(0x01026, intensity);
  return light;
}

function update(renderer, scene, camera, controls, clock) {

  renderer.render(
    scene,
    camera
  );

  controls.update();

  var timeElapsed = clock.getElapsedTime();

  var cameraXRotation = scene.getObjectByName('cameraXRotation');
  if (cameraXRotation.rotation.x < 0) {
    cameraXRotation.rotation.x += 0.002;
  }

  var cameraZPosition = scene.getObjectByName('cameraZPosition');
  cameraZPosition.position.z -= 0.1;

  var cameraZRotation = scene.getObjectByName('cameraZRotation');
  cameraZRotation.rotation.z = noise.simplex2(timeElapsed * 1.5, timeElapsed * 1.5) * 0.01;

  var boxGrid = scene.getObjectByName('boxGrid');
  boxGrid.children.forEach((child, index) => {
    var x = (timeElapsed + index) / 2;
    child.scale.y = (noise.simplex2(x,x) + 1.001) / 2 ;
    child.position.y = child.scale.y/2;
  });

  requestAnimationFrame(() => {
    update(renderer, scene, camera, controls, clock);
  })
}

var scene = init();