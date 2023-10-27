import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from "../lib/OrbitControls.module.js"

//variables estandar
let renderer, scene, camera;
let alzado, planta, perfil;
const      
//Otras globales
let esferaCubo;
let angulo = 0;

//Acciones
init();
loadScene();
render();

function setCameras(ar) {
    let cameraOrto;
    if(ar > 1) {
        cameraOrto = new THREE.OrthographicCamera(-L*ar, L*ar, L, -L, -10, 100)
    } else {
        cameraOrto = new THREE.OrthographicCamera(-L, L, L/ar, -L/ar, -10, 100)
    }

    alzado = cameraOrto.clone()
    alzado.position.set(0, 0, 10)
    alzado.lookAt(0, 0, 0)

    perfil = cameraOrto.clone()
    perfil.position.set(10, 0, 0)
    perfil.lookAt(0, 0, 0)

    planta = cameraOrto.clone()
    alzado.position.set(0, 10, 0)
    alzado.lookAt(0, 0, 0)
    alzado.up = new THREE.Vector3(0, 0, -1)
}


function init() {
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0xAAAAAA)
    renderer.autoClear = false
    document.getElementById('container').appendChild(renderer.domElement)


    //Instanciar el nodo raíz
    scene = new THREE.Scene()
    //scene.background = new THREE.Color(0.5, 0.05, 0.05)

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 100)
    //COntrol de camera
    const controls = new OrbitControls(camera, renderer.domElement)
    const ar = window.innerWidth/window.innerHeight;
    setCameras(ar)
    camera.position.set(0.5, 2, 7)
    camera.lookAt(0, 1, 0)
    window.addEventListener('resize', updateAspectRatio)
    window.addEventListener('dblclick', rotateShape)
}

function updateAspectRatio(){
    // Cambia las dimensiones del canvas
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Nuevo razon de aspecto
    const ar = window.innerWidth / window.innerHeight;

    // perspectiva
    camera.aspect = ar;
    camera.updateProjectionMatrix();

    // ortografica
    if(ar>1) {
        alzado.left = planta.left = perfil.left = -L*ar;
        alzado.right = planta.right = perfil.right = L*ar;
        alzado.bottom = planta.bottom = perfil.bottom = -L;
        alzado.top = planta.top = perfil.top = L;
    }
        
    else {
        alzado.left = planta.left = perfil.left = -L;
        alzado.right = planta.right = perfil.right = L;
        alzado.bottom = planta.bottom = perfil.bottom = -L/ar;
        alzado.top = planta.top = perfil.top = L/ar;
    }
        
    alzado.updateProjectionMatrix();
    perfil.updateProjectionMatrix();
    planta.updateProjectionMatrix();
}
/*function updateAspectRatio() {
    renderer.setSize(window.innerWidth, window,innerHeight)
    const ar = window.innerWidth / window.innerHeight

    camera.aspect = ar
    camera.updateProjectionMatrix()

    if(ar > 1) {
        alzado.left = planta.left = perfil.left = -L*ar
        alzado.right = planta.righ = perfil.right = L*ar
        alzado.bottom = planta.bottom = perfil.bottom = -L
        alzado.top = planta.top = perfil.top = L
    } else {
        alzado.left = planta.left = perfil.left = -L
        alzado.right = planta.righ = perfil.right = L
        alzado.bottom = planta.bottom = perfil.bottom = -L/ar
        alzado.top = planta.top = perfil.top = L/ar
    }
    alzado.updateProjectionMatrix()
    planta.updateProjectionMatrix()
    perfil.updateProjectionMatrix()
    
}*/
function loadScene() {
    const material = new THREE.MeshBasicMaterial({color:'yellow', wireframe:true})

    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10, 10, 10, 10), material)
    suelo.rotation.x = -Math.PI/2;
    suelo.position.y = 0.2;

    scene.add(suelo)

    const esfera = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 20, 20), material)
    const cubo = new THREE.Mesh( new THREE.BoxGeometry(2, 2, 2), material)
    esfera.position.x = 1
    cubo.position.x = -1

    esferaCubo = new THREE.Object3D()
    esferaCubo.name = "grupoEC"
    esferaCubo.add(esfera)
    esferaCubo.add(cubo)
    esferaCubo.position.y = 1.5;

    scene.add(esferaCubo)
    scene.add(new THREE.AxesHelper(3))
    cubo.add(new THREE.AxesHelper(1))


    const loader = new THREE.ObjectLoader()
    loader.load('../models/soldado/soldado.json', 
    function(objeto) {
        cubo.add(objeto)
        objeto.position.y = 1
    })

    const glloader = new GLTFLoader()
    glloader.load('../models/robota/scene.gltf',
    function(objeto) {
        esfera.add(objeto.scene)
        objeto.scene.scale.set(0.5, 0.5, 0.5)
        objeto.scene.position.y = 1
        objeto.scene.rotation.y = -Math.PI/2
        console.log("robot")
        console.log(objeto)
    })      
}

function update() {
    angulo += 0.01;
    scene.rotation.y = angulo;
}

function render() {
    requestAnimationFrame(render)
    //update();
    renderer.clear()
    let w = window.innerWidth/2
    let h = window.innerHeight/2
    //renderer.render(scene, camera)

    //renderer.setViewport(0, h, w, h)
    //renderer.render(scene, alzado)
    renderer.setViewport(0, 0, w, h)
    renderer.render(scene, planta)
    renderer.setViewport(w, h, w, h)
    renderer.render(scene, perfil)
    renderer.setViewport(w, 0, w, h)
    renderer.render(scene, camera)
}

function rotateShape(evento){
    // Capturar poisicon de doble clicj (S.R. top-left) con Y down
    let x = evento.clientX;
    let y = evento.clientY;

    // Zona click
    let derecha = false, abajo = false;
    let cam = null;
    if (x > window.innerWidth/2) {
        derecha = true;
        x -= window.innerWidth/2;
    }
    if (y > window.innerHeight/2) {
        abajo = true;
        y -= window.innerHeight/2;
    }

    // cam es la camara que recibe el doble click
    if (derecha)
        if(abajo) cam = camera;
        else cam = perfil;
    else 
        if(abajo) cam = planta;
        else cam = alzado;
        
    // Normalizar las coordenadas de click al cuadrado de 2x2
    // x*2 / w/2 -> x*4 / w
    x = (x*4 / window.innerWidth) - 1;
    y = -(y*4 / window.innerHeight) + 1;

    // Rayo e intersecciones
    const rayo = new THREE.Raycaster();
    rayo.setFromCamera(new THREE.Vector2(x,y), cam);

    const intersecciones = rayo.intersectObjects(
        scene.getObjectByName("grupoEC").children, false); // false para que no sea recursivo
    
    console.log(intersecciones)
    if(intersecciones.length > 0)
        intersecciones[0].object.rotation.y += Math.PI / 8;
    }