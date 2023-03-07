mapboxgl.accessToken = 'pk.eyJ1IjoiZ2hhc3NhbmdoYW5lbSIsImEiOiJjbGVrbjl5dnUwbjJ0M3ZwZ3QyNGZpZjJhIn0.1KSVkfun4SKcX17dCGei5A';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11?optimize=true',
  zoom: 16,
  center: [-74.0135, 40.705],
  pitch: 0,
  bearing: -45,
  antialias: true
});

const modelOrigin = [-74.01312930932917, 40.702178828796235];
const modelAltitude = 0;
const modelRotate = [Math.PI / 2, 50.3, 0];
const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
  modelOrigin,
  modelAltitude
);

const modelTransform = {
  translateX: modelAsMercatorCoordinate.x,
  translateY: modelAsMercatorCoordinate.y,
  translateZ: modelAsMercatorCoordinate.z,
  rotateX: modelRotate[0],
  rotateY: modelRotate[1],
  rotateZ: modelRotate[2],
  scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
};

const THREE = window.THREE;

const customLayer = {
  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',
  onAdd: function (map, gl) {
    this.camera = new THREE.Camera();
    this.scene = new THREE.Scene();

    const light = new THREE.AmbientLight(0x404040, 8);
    this.scene.add(light);

    const loader = new THREE.GLTFLoader();
    loader.load(
      'https://raw.githubusercontent.com/EddyNCNL/gltf/main/FULL/scene.gltf',
      (gltf) => {
        this.scene.add(gltf.scene);
        document.getElementById('loader').style.display = 'none';
        document.querySelector('#map .mapboxgl-3d-layer').style.display = 'block';
      }
    );
    this.map = map;

    this.renderer = new THREE.WebGLRenderer({
      canvas: map.getCanvas(),
      context: gl,
      antialias: true
    });

    this.renderer.autoClear = false;
  },
  render: function (gl, matrix) {
    const rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      modelTransform.rotateX
    );
    const rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      modelTransform.rotateY
    );
    const rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      modelTransform.rotateZ
    );

    const m = new THREE.Matrix4().fromArray(matrix);
    const l = new THREE.Matrix4()
      .makeTranslation(
        modelTransform.translateX,
        modelTransform.translateY,
        modelTransform.translateZ
      )
      .scale(
        new THREE.Vector3(
          modelTransform.scale,
          -modelTransform.scale,
          modelTransform.scale
        )
      )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);

      this.camera.projectionMatrix = m.multiply(l);
      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);
      this.map.triggerRepaint();
    }
  };
  
  map.on('style.load', () => {
    map.addLayer(customLayer, 'waterway-label');
  });  
