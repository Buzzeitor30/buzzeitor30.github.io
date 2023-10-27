import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"
import {TWEEN} from "../lib/tween.module.min.js";
import {GUI} from "../lib/lil-gui.module.min.js"
//variables estandar
let renderer, scene, camera;
let planta;
const L = 50;
let effectController;
let robot = new THREE.Object3D()
let brazo = new THREE.Object3D()
let antebrazo = new THREE.Object3D()
let nervios = new THREE.Object3D()
let pinzas = new THREE.Object3D()
//GUI
var gui;
//Texturas
let images_path="GPC/images/"
console.log(images_path)
let textsuelo;
let textbase
let textrotula;
let textante;
let textdedo;
//Cargador textura
let texture_loader = new THREE.TextureLoader()
//Robot
let base;
let pinzaGeometry;
let rotula;
let pinzaD;
let pinzaI;
//Materiales
let material_robot, material_suelo, material_brazo, material_ante, material_rotula, material_pinzas;
//Acciones
init();
loadScene();
setupGUI();
render();

function setupGUI() {
    effectController = {
        giroBase: 0.0,
        giroBrazo: 0.0,
        giroAnteBrazoY: 0.0,
        giroAnteBrazoZ: 0.0,
        giroPinza: 0.0,
        aperturaMano: 10.0,
        wireframe: false,
        animar: function() {animate()}
    }

    gui = new GUI()

    const h = gui.addFolder("Control robot")

    h.add(effectController, "giroBase", -180.0, 180.0, 0.025).name("Giro Base en Y").listen()
    h.add(effectController, "giroBrazo",-45.0, 45.0, 0.025).name("Giro Brazo en Z").listen()
    h.add(effectController, "giroAnteBrazoY", -180.0, 180.0, 0.025).name("Giro antebrazo en Y").listen()
    h.add(effectController, "giroAnteBrazoZ", -90.0, 90.0, 0.025).name("Giro antebrazo en Z").listen()
    h.add(effectController, "giroPinza", -40.0, 220.0, 0.025).name("Giro pinza").listen()
    h.add(effectController, "aperturaMano", 0, 15, 0.025).name("Apertura pinzas").listen()
    h.add(effectController, "wireframe").name("Wireframe").listen()
    h.add(effectController, "animar").name("Animate").listen()
}
function init() {
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0xB1BED0)
    renderer.autoClear = false;
    document.getElementById('container').appendChild(renderer.domElement)
    //Instanciar el nodo raíz
    scene = new THREE.Scene()
    //scene.background = new THREE.Color(1, 1, 1)
    //Instanciar la cámara perspectiva
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1500)
    camera.position.set(200, 300, 200)
    camera.lookAt(0, 1, 0)
    //Control camera
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.maxZoom = 10.0

    const ar = window.innerWidth / window.innerHeight
    setCameras(ar)

    //resize
    window.addEventListener('resize', updateAspectRatio)
    window.addEventListener('keydown', movimientoRobot)
}

function updateAspectRatio() {
    //Cambiamos las dimensiones del canvas
    renderer.setSize(window.innerWidth, window.innerHeight)

    const ar = window.innerWidth / window.innerHeight

    camera.aspect = ar;
    camera.updateProjectionMatrix()

    if(ar > 1) {
        planta.left = -L
        planta.right = L
        planta.bottom = -L
        planta.top = L
    } else {
        planta.left = -L
        planta.right = L
        planta.bottom = -L
        planta.top = L
    } 

    planta.updateProjectionMatrix()
}

function setCameras(ar) {
    let cameraOrto;

    if(ar > 1) {
        cameraOrto = new THREE.OrthographicCamera(-L, L, L, -L, 100, 700)
    } else {
        cameraOrto = new THREE.OrthographicCamera(L, L, L, -L, 100, 700)
    }

    planta = cameraOrto.clone()
    planta.position.set(0, 600, 0)
    planta.lookAt(0, 0, 0)
    planta.up = new THREE.Vector3(0, 0, -1)

}
function loadScene() {
    //Iluminacion
const directionalLight = new THREE.DirectionalLight(0xffff99,0.2)
    const ambientLight = new THREE.AmbientLight(0xfff999,0.1);
    const spotLight = new THREE.SpotLight(0xffffff,1,1000);
    spotLight.position.set(200,400,200)
    spotLight.castShadow = true
    spotLight.shadow.camera.far = 2000;
    spotLight.shadow.camera.near = 2;
    spotLight.angle = Math.PI/6
    spotLight.target.position.set(0,0,0)

    directionalLight.position.set(-1, 1, -1)
    directionalLight.castShadow = true

    scene.add(directionalLight)
    scene.add(ambientLight)
    scene.add(spotLight)
    
    
    //Texturas
    textsuelo = texture_loader.load(images_path+"pisometalico_1024.jpg")
    textbase = texture_loader.load(images_path+"metal_128.jpg")
    textante = texture_loader.load(images_path + "metal_128.jpg")
    const entorno = [images_path+"posx.jpg", images_path+"negx.jpg",
                    images_path+"posy.jpg", images_path+"negy.jpg",
                    images_path+"posz.jpg", images_path+"negz.jpg"]
    textrotula = new THREE.CubeTextureLoader().load(entorno)
    textdedo = texture_loader.load(images_path+"wood512.jpg")
    //Materiales
    material_robot = new THREE.MeshNormalMaterial({flatShading: true, wireframe:false})

    material_robot = new THREE.MeshPhongMaterial({color: '#8AC'});
    material_suelo = new THREE.MeshStandardMaterial({map:textsuelo})
    material_brazo = new THREE.MeshLambertMaterial({map:textbase})
    material_ante = new THREE.MeshPhongMaterial({map:textante, color:0xffff80, shininess:100,specular:0xffff80})
    material_rotula = new THREE.MeshPhongMaterial({envMap:textrotula, color:0xfff999, shininess:100})
    material_pinzas = new THREE.MeshLambertMaterial({map:textdedo})

    //Robot
    robot.position.y = 7.5

    //Base del robot
    base = new THREE.Mesh( new THREE.CylinderGeometry(50, 50, 15, 32), material_brazo)
    base.castShadow = true
    base.receiveShadow = true
    robot.add(base)
    base.add(brazo)
    
    //Eje
    const eje = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 18, 32), material_brazo)
    eje.castShadow = true
    eje.receiveShadow = true
    brazo.add(eje)
    eje.rotation.x = -Math.PI/2
    
    //Esparrago
    const esparrago = new THREE.Mesh(new THREE.BoxGeometry(18, 120, 18), material_brazo)
    brazo.add(esparrago)
    esparrago.position.y = 60
    esparrago.castShadow = true

    //Rotula
    rotula = new THREE.Mesh(new THREE.SphereGeometry(20), material_rotula)
    brazo.add(rotula)
    rotula.position.y = 137.5
    rotula.add(antebrazo)

    //Disco
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 6, 32), material_ante)
    antebrazo.add(disco)
    disco.castShadow = true

    //Nervios
    const nervio1 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material_ante)
    nervio1.position.x = 10
    nervio1.position.z = -5
    nervio1.castShadow = true
    nervio1.receiveShadow = true
    nervios.add(nervio1)
    const nervio2 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material_ante)
    nervio2.position.x = -10
    nervio2.position.z = -5
    nervio2.castShadow=true
    nervio2.receiveShadow=true
    nervios.add(nervio2)
    const nervio3 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material_ante)
    nervio3.position.x = -10
    nervio3.position.z = 5
    nervio3.castShadow = true
    nervio3.receiveShadow = true
    nervios.add(nervio3)
    const nervio4 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material_ante)
    nervio4.position.x = 10
    nervio4.position.z = 5
    nervio4.castShadow = true
    nervio4.receiveShadow = true
    nervios.add(nervio4)
    antebrazo.add(nervios)
    nervios.position.y = 50
    
    const mano = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 40, 32), material_ante)
    mano.castShadow = true
    mano.position.y = 87.5
    antebrazo.add(mano)
    mano.rotation.x = -Math.PI/2   
    const vertices = [ //12 vertices x 3 coord = 36
    0, 0, 4,  19, 0, 4,  //0 y 1 (base exterior abajo)
    0, 0, 0,  19, 0, 0, //2 y 3 (base interior abajo)
    0, 20, 4, 19, 20, 4, //4, 5 (base exterior arriba)
    0, 20, 0, 19, 20, 0, //6, 7 (base interior arriba)
    38, 5, 2, 38, 15, 2, // 8 y 9 (base exterior pinza)
    38, 5, 0, 38, 15, 0, //  10 y 11 (base interior pinza)
    ]
    pinzaGeometry = new THREE.BufferGeometry()
    const indices = [
        1, 5, 0, 5, 4, 0,
        3, 2, 6, 3, 6, 7,
        2, 0, 4, 2, 4, 6,
        1, 3, 7, 1, 7, 5,
        5, 7, 6, 5, 6, 4,
        0, 1, 3, 0, 3, 2,
        9, 11, 7, 9, 7, 5,
        8, 10, 3, 8, 3, 1,
        1, 8, 9, 1, 9, 5,
        10, 3, 7, 10, 7, 11,
        8, 10, 11, 8, 11, 9,
        1, 0, 2, 1, 2, 3,
        8, 1, 3, 8, 3, 10, 
    ]
    const uvs = [
        0, 0, 1, 0,
        0, 1, 1, 1,
        0, 0, 1, 0,
        0, 0, 1, 0,
        0, 1, 1, 1,
        0, 0, 1, 0,
    ];
    
    pinzaGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    pinzaGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    pinzaGeometry.computeVertexNormals()
    pinzaGeometry.setIndex(indices) // esta instruccion es la ultima para calcular los vectores normales de cada vértice en cada cara
    pinzaD = new THREE.Mesh(pinzaGeometry, material_pinzas)
    pinzaD.castShadow = true
    pinzaD.rotation.x = -Math.PI/2
    pinzaI = pinzaD.clone()
    pinzaI.rotation.x = Math.PI/2
    pinzaD.position.y = 10
    pinzaI.position.y = -10
    pinzaD.position.z = 10
    pinzaI.position.z = -10
    pinzas.add(pinzaD)
    pinzas.add(pinzaI)
    mano.add(pinzas)
    

    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 100, 100), material_suelo) 
    suelo.rotation.x = -Math.PI/2;
    suelo.receiveShadow = true
    
    //Habitacion 
    const paredes = []
    paredes.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: texture_loader.load(entorno[0])
    }))
    paredes.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: texture_loader.load(entorno[1])
    }))
    paredes.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: texture_loader.load(entorno[2])
    }))
    paredes.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: texture_loader.load(entorno[3])
    }))
    paredes.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: texture_loader.load(entorno[4])
    }))
    paredes.push(new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: texture_loader.load(entorno[5])
    }))
    const habitacion = new THREE.Mesh(new THREE.BoxGeometry(1010, 1010, 1010), paredes)

    
    robot.add(base)
    robot.add(brazo)
    
    
    
    scene.add(new THREE.AxesHelper(200))
    robot.castShadow = true
    scene.add(robot)
    scene.add(suelo)
    scene.add(habitacion)
    renderer.antialias = true
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function render() {
    requestAnimationFrame(render)
    let x = Math.min(window.innerWidth, window.innerHeight) / 4
    renderer.clear()
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
    renderer.setViewport(0, window.innerHeight - x, x, x)
    update()
    renderer.render(scene, planta)
}

function update() {
    TWEEN.update()
    robot.rotation.y = effectController.giroBase * Math.PI/180
    brazo.rotation.z = effectController.giroBrazo * Math.PI/180
    rotula.rotation.y = effectController.giroAnteBrazoY * Math.PI/180
    rotula.rotation.z = effectController.giroAnteBrazoZ * Math.PI/180
    pinzas.rotation.y = -effectController.giroPinza * Math.PI/180
    

    pinzaD.position.y = effectController.aperturaMano
    pinzaI.position.y = -effectController.aperturaMano

    material_suelo.wireframe = effectController.wireframe
    material_rotula.wireframe = effectController.wireframe
    material_ante.wireframe = effectController.wireframe
    material_brazo.wireframe = effectController.wireframe
    material_pinzas.wireframe = effectController.wireframe
    material_robot.wireframe = effectController.wireframe
}

function animate() {
    new TWEEN.Tween(effectController).
    to({
    aperturaMano:[15, 0, 10, 0, 15, 0, 10],
    giroBase:[-69, 69, 0],
    giroBrazo: [-45, 10, -30, 45, 0],
    giroAnteBrazoY: [-90, 90, 0],
    giroAnteBrazoZ: [-90, 90, 0],
    giroPinza: [-40, 150, 0],

    }, 10000).
    easing(TWEEN.Easing.Sinusoidal.InOut).
    start();
}

function movimientoRobot(e) {
    if(e.key == "ArrowUp")
        robot.position.z -= 1
    if (e.key == "ArrowDown")
        robot.position.z += 1
    if (e.key == "ArrowRight")
        robot.position.x += 1
    if (e.key == "ArrowLeft")
        robot.position.x -= 1
}