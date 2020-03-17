import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Preloader } from 'components';
import { getCorrectImageOrientation } from 'core/utils';


const Scene = ({ model }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [image, setImage] = useState(model.previewImage);
  const [isError, setIsError] = useState(false);
  const meshContainer = useRef();

  useEffect(() => {
    getCorrectImageOrientation(model.previewImage, setImage);
  }, []);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( 400, 400 );
    meshContainer.current.appendChild( renderer.domElement );
    const loader = new PLYLoader();
    loader.load( model.model,
      function ( geometry ) {
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        scene.background = new THREE.Color( 'black' );
        geometry.center();
        geometry.computeBoundingBox();
        const material = new THREE.PointsMaterial({
          size: 0.003,
          vertexColors: THREE.FaceColors
        });
        material.side = THREE.DoubleSide;
        const x = geometry.boundingBox.max.x;
        const y = geometry.boundingBox.max.y;
        const z = geometry.boundingBox.max.z;
        const cameraZ = (x + y + z) * 0.75;
        const mesh = new THREE.Points(geometry, material);
        camera.position.set(0, 0, cameraZ);
        camera.lookAt(mesh);
        const controls = new OrbitControls(camera, renderer.domElement );
        controls.enableZoom = false;
        controls.autoRotate = true;
        scene.add(mesh);
        setIsLoading(false);
      }, undefined, function ( error ) {
        setIsError(true);
        setIsLoading(false);
      } );
    const animate = function () {
      requestAnimationFrame( animate );
      renderer.render( scene, camera );
    };
    animate();
  }, []);

  return (
    <div className='scene-wrapper'>
      { isError && <h1> Model can not be shown </h1> }
      { isLoading && <Preloader /> }
      {
        !isError
      &&
      <div
        ref={ meshContainer }
        className='scene-container'
      />
      }
      { isLoading && image && <img src={ image } className='preview-image' /> }
    </div>
  );
};

export default Scene