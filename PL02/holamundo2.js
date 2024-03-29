import * as THREE from "../lib/three.module.js"
import {GLTFLoader} from "../lib/GLTFLoader.module.js"

//variables estandar
let renderer, scene, camera;
//Otras globales
let esferaCubo;
let angulo = 0;

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
    scene.background = new THREE.Color(0.5, 0.05, 0.05)

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 100)

    camera.position.set(0.5, 2, 7)
    camera.lookAt(0, 1, 0)
}

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
    update();
    renderer.render(scene, camera)
}