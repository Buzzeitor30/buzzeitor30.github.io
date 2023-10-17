import * as THREE from "../lib/three.module.js"

//variables estandar
let renderer, scene, camera;

let mano = new THREE.Object3D()
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
    camera.position.set(75, 75, 75)
    camera.lookAt(0, 1, 0)
}

function loadScene() {
    //material_suelo
    const material_suelo = new THREE.MeshBasicMaterial({color:'yellow', wireframe:true})
    const material_robot = new THREE.MeshBasicMaterial({color:'red', wireframe:true})
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 100, 100), material_suelo)
    suelo.rotation.x = -Math.PI/2

    const cara1 = new THREE.BufferGeometry()
    const vertices = [ //12 vertices x 3 coord = 36
    0, 0, 4,  19, 0, 4,  //0 y 1 (base exterior abajo)
    0, 0, 0,  19, 0, 0, //2 y 3 (base interior abajo)
    0, 20, 4, 19, 20, 4, //4, 5 (base exterior arriba)
    0, 20, 0, 19, 20, 0, //6, 7 (base interior arriba)
    38, 5, 2, 38, 15, 2, // 8 y 9 (base exterior pinza)
    38, 5, 0, 38, 15, 0, //  10 y 11 (base interior pinza)
 /*   38, 5, 0, 38, 15, 0,  
    19, 20, 0, 0, 20, 0 */
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

    cara1.setIndex(indices)
    cara1.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    const ejemplo = new THREE.Mesh(cara1, material_robot)
    mano.add(ejemplo)
    ejemplo.position.y = 10
    //mano.rotation.x = Math.PI
    mano.position.y +=20
    scene.add(suelo)
    scene.add(mano)
}

function update() {
    mano.rotation.x += .01
}
function render() {
    requestAnimationFrame(render)
    //update()
    renderer.render(scene, camera)
}