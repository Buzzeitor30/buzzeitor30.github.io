import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"

//variables estandar
let renderer, scene, camera;

let robot = new THREE.Object3D()
let brazo = new THREE.Object3D()
let antebrazo = new THREE.Object3D()
let nervios = new THREE.Object3D()
//Acciones
init();
loadScene();
render();


function init() {
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.getElementById('container').appendChild(renderer.domElement)
    //Instanciar el nodo raíz
    scene = new THREE.Scene()
    scene.background = new THREE.Color(1, 1, 1)
    //Instanciar la cámara perspectiva
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 500)
    camera.position.set(200, 300, 200)
    camera.lookAt(0, 1, 0)
}

function loadScene() {
    //material_suelo
    const material_suelo = new THREE.MeshBasicMaterial({color:'yellow', wireframe:true})
    const material_robot = new THREE.MeshBasicMaterial({color:'red', wireframe:true})
    const material_2 = new THREE.MeshBasicMaterial({color:'blue', wireframe:true})
    const base = new THREE.Mesh( new THREE.CylinderGeometry(50, 50, 15, 32), material_robot)
    robot.add(base)
    base.add(brazo)
    robot.position.y = 7.5

    const eje = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 18, 32), material_robot)
    brazo.add(eje)
    eje.rotation.x = -Math.PI/2

    const esparrago = new THREE.Mesh(new THREE.BoxGeometry(18, 120, 18), material_robot)
    brazo.add(esparrago)
    esparrago.position.y = 60

    const rotula = new THREE.Mesh(new THREE.SphereGeometry(20), material_robot)
    brazo.add(rotula)
    rotula.position.y = 137.5
    
    rotula.add(antebrazo)
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 6, 32), material_robot)
    antebrazo.add(disco)

    const nervio1 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material_robot)
    nervio1.position.x = 10
    nervio1.position.z = -5
    nervios.add(nervio1)
    const nervio2 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material_robot)
    nervio2.position.x = -10
    nervio2.position.z = -5
    nervios.add(nervio2)
    const nervio3 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material_robot)
    nervio3.position.x = -10
    nervio3.position.z = 5
    nervios.add(nervio3)
    const nervio4 = new THREE.Mesh(new THREE.BoxGeometry(4, 80, 4), material_robot)
    nervio4.position.x = 10
    nervio4.position.z = 5
    nervios.add(nervio4)
    antebrazo.add(nervios)
    nervios.position.y = 50

    const mano = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 40, 32), material_robot)
    mano.position.y = 87.5
    antebrazo.add(mano)
    mano.rotation.x = -Math.PI/2

    const pinzaGeometry = new THREE.BufferGeometry()
    
    const vertices = [ //12 vertices x 3 coord = 36
    0, 0, 4,  19, 0, 4,  //0 y 1 (base exterior abajo)
    0, 0, 0,  19, 0, 0, //2 y 3 (base interior abajo)
    0, 20, 4, 19, 20, 4, //4, 5 (base exterior arriba)
    0, 20, 0, 19, 20, 0, //6, 7 (base interior arriba)
    38, 5, 2, 38, 15, 2, // 8 y 9 (base exterior pinza)
    38, 5, 0, 38, 15, 0, //  10 y 11 (base interior pinza)
    ]

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
    
    pinzaGeometry.setIndex(indices)
    pinzaGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    pinzaGeometry.computeVertexNormals()
    
    const pinzaD = new THREE.Mesh(pinzaGeometry, material_2)
    pinzaD.rotation.x = -Math.PI/2
    const pinzaI = pinzaD.clone()
    pinzaI.rotation.x = Math.PI/2
    pinzaD.position.y = 10
    pinzaI.position.y = -10
    pinzaD.position.z = 10
    pinzaI.position.z = -10
    mano.add(pinzaD)
    mano.add(pinzaI)
    

    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 100, 100), material_suelo) 
    suelo.rotation.x = -Math.PI/2;
 
    robot.add(base)
    robot.add(brazo)

    scene.add(new THREE.AxesHelper(200))
    scene.add(robot)
    scene.add(suelo)
}

function render() {
    requestAnimationFrame(render)
    renderer.render(scene, camera)
}