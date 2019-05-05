function init() {
  var scene = new THREE.Scene();
  var gui = new dat.GUI();

  var enableFog = false;
  if(enableFog) {
    scene.fog = new THREE.FogExp2(0xffffff, 0.2);
  }

  var plane = getPlane(30);
  var Light = getDirectionalLight(1);
  var sphere = getSphere(0.05);
  var boxGrid = getBoxGrid(10, 1.5);
  var helper = new THREE.CameraHelper(Light.shadow.camera);
  var ambientLight = getAmbientLight(1);

  plane.name = 'plane-1';

  plane.rotation.x = Math.PI/2;
  Light.position.x = 13;
  Light.position.y = 10;
  Light.position.z = 10;
  Light.intensity = 2;

  gui.add(Light, 'intensity', 0, 2);
  gui.add(Light.position, 'x', 1, 16);
  gui.add(Light.position, 'y', 1, 16);
  gui.add(Light.position, 'z', 1, 16);

  //Objects can be added as children of other objects. Like HTML elements.
  scene.add(plane);
  Light.add(sphere);
  scene.add(Light);
  scene.add(ambientLight);
  scene.add(boxGrid);
  scene.add(helper);
  
  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    1,
    1000
  );

  camera.position.x = 2;
  camera.position.y = 2;
  camera.position.z = 5;

  camera.lookAt(new THREE.Vector3(0,0,0));
  
  var renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x999999);
  document.getElementById('webgl').appendChild(renderer.domElement);

  var controls = new THREE.OrbitControls(camera, renderer.domElement)

  update(renderer, scene, camera, controls);

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
    var obj = getBox(1,1,1);
    obj.position.x = i * separationMultiplier;
    obj.position.y = obj.geometry.parameters.height/2;
    group.add(obj);
    for(var j=1; j<amount; j++) {
      var obj = getBox(1,1,1);
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
  light.shadow.camera.left = -10;
  light.shadow.camera.bottom = -10;
  light.shadow.camera.right = 10;
  light.shadow.camera.top = 10;

  return light;
}

function getAmbientLight(intensity) {
  var light = new THREE.AmbientLight(0x01026, intensity);
  return light;
}

function update(renderer, scene, camera, controls) {
  renderer.render(
    scene,
    camera
  );

  controls.update();

  requestAnimationFrame(() => {
    update(renderer, scene, camera, controls);
  })
}

var scene = init();