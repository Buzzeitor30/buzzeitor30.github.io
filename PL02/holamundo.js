// Escena cubo

// Cargar librería
import * as THREE from '../lib/three.module.js'

// Variables globales
var scene = new THREE.Scene()
scene.background = new THREE.Color( 0x220044 )

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight )

document.body.appendChild( renderer.domElement )

// Cubo
var geometry = new THREE.BoxGeometry()
var material = new THREE.MeshBasicMaterial({ color: "rgb(255, 2555, 0)", wireframe: true })
var cubo = new THREE.Mesh( geometry, material )
cubo.position.x = 2
scene.add(cubo)

// Posición camara
camera.position.z = 5
camera.position.y = 1

// Render
//renderer.render( scene, camera )

var animate = function() {
    requestAnimationFrame(animate)
    scene.rotation.y += 0.01;
    cubo.rotation.x += 0.01;
    renderer.render(scene, camera)
}

animate()