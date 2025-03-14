var noise =`
	vec3 mod289(vec3 x) {
	return x - floor(x * (1.0 / 289.0)) * 289.0;
	}

	vec4 mod289(vec4 x) {
	return x - floor(x * (1.0 / 289.0)) * 289.0;
	}

	vec4 permute(vec4 x) {
		return mod289(((x*34.0)+1.0)*x);
	}

	vec4 taylorInvSqrt(vec4 r)
	{ 
	return 1.79284291400159 - 0.85373472095314 * r;
	}

	float snoise(vec3 v)
	{ 
	const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
	const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

	// First corner
	vec3 i  = floor(v + dot(v, C.yyy) );
	vec3 x0 =   v - i + dot(i, C.xxx) ;

	// Other corners
	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min( g.xyz, l.zxy );
	vec3 i2 = max( g.xyz, l.zxy );

	//   x0 = x0 - 0.0 + 0.0 * C.xxx;
	//   x1 = x0 - i1  + 1.0 * C.xxx;
	//   x2 = x0 - i2  + 2.0 * C.xxx;
	//   x3 = x0 - 1.0 + 3.0 * C.xxx;
	vec3 x1 = x0 - i1 + C.xxx;
	vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
	vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

	// Permutations
	i = mod289(i); 
	vec4 p = permute( permute( permute( 
				i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
			+ i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
			+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

	// Gradients: 7x7 points over a square, mapped onto an octahedron.
	// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
	float n_ = 0.142857142857; // 1.0/7.0
	vec3  ns = n_ * D.wyz - D.xzx;

	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

	vec4 x = x_ *ns.x + ns.yyyy;
	vec4 y = y_ *ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);

	vec4 b0 = vec4( x.xy, y.xy );
	vec4 b1 = vec4( x.zw, y.zw );

	//vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
	//vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
	vec4 s0 = floor(b0)*2.0 + 1.0;
	vec4 s1 = floor(b1)*2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));

	vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
	vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

	vec3 p0 = vec3(a0.xy,h.x);
	vec3 p1 = vec3(a0.zw,h.y);
	vec3 p2 = vec3(a1.xy,h.z);
	vec3 p3 = vec3(a1.zw,h.w);

	//Normalise gradients
	vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;

	// Mix final noise value
	vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
	m = m * m;
	return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
									dot(p2,x2), dot(p3,x3) ) );
	}
	`;

var materialShaders = [];
var speed = 10;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
camera.position.set(0, 1.3, 7);
camera.lookAt(scene.position);
if (!document.getElementById("threejs-scene")) {
	var renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	var canvas = renderer.domElement;
	canvas.id = "threejs-scene";
	document.getElementById("animated-background").appendChild(canvas);
}

scene.background = new THREE.Color(0x151314);
scene.fog = new THREE.Fog(scene.background, 42.5, 50);

var controls = new THREE.OrbitControls(camera, canvas);
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 7;
controls.maxPolarAngle = Math.PI * 0.55;
controls.minPolarAngle = Math.PI * 0.25;
controls.target.set(0, 1.8, 0);
controls.update();


// GROUND AND ROAD
var planeGeom = new THREE.PlaneBufferGeometry(50, 100, 200, 200);
planeGeom.rotateX(-Math.PI * 0.5);
var planeMat = new THREE.MeshBasicMaterial({
  color: 0xB700FF
});
planeMat.onBeforeCompile = shader => {
  shader.uniforms.time = { value: 0 };
  shader.vertexShader =
    `
    uniform float time;
    varying vec3 vPos;
  ` + noise + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    `#include <begin_vertex>`,
    `#include <begin_vertex>
      vec2 tuv = uv;
      float t = time * 0.01 * ${speed}.; 
      tuv.y += t;
      float baseHeight = 8.; // Mountain height
      float frequency = 3.; // More mountains

      float noise1 = max(0.0, snoise(vec3(tuv * frequency, 0.))) * baseHeight;
      float noise2 = max(0.0, snoise(vec3(tuv * (frequency * 2.), 1.))) * (baseHeight * 0.5);
      float noise3 = max(0.0, snoise(vec3(tuv * (frequency * 4.), 2.))) * (baseHeight * 0.25);

      transformed.y = noise1 + noise2 + noise3;
      transformed.y *= smoothstep(3., 12., abs(transformed.x));
      vPos = transformed;
    `
  );
  shader.fragmentShader =
    `
    #extension GL_OES_standard_derivatives : enable

    uniform float time;
    varying vec3 vPos;

    float line(vec3 position, float width, vec3 step){
      vec3 tempCoord = position / step;
      
      vec2 coord = tempCoord.xz;
      coord.y -= time * ${speed}. / 2.;

      vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord * width);
      float line = min(grid.x, grid.y);
      
      return min(line, 1.0);
    }
  ` + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    `gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
    `
    float l = line(vPos, 2.0, vec3(2.0));
    vec3 base = mix(vec3(0.082, 0.075, 0.078), vec3(0), smoothstep(5., 7.5, abs(vPos.x)));
    vec3 c = mix(outgoingLight, base, l);
    gl_FragColor = vec4(c, diffuseColor.a);
    `
  );
  materialShaders.push(shader);
};
var plane = new THREE.Mesh(planeGeom, planeMat);
scene.add(plane);



// SUN
var sunGeom = new THREE.CircleBufferGeometry(200, 64);
var sunMat = new THREE.MeshBasicMaterial({color: 0xff8800, fog: false, transparent: true});
sunMat.onBeforeCompile = shader => {
  shader.uniforms.time = {value: 0};
  shader.vertexShader =
    `
    varying vec2 vUv;
  ` + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    `#include <begin_vertex>`,
    `#include <begin_vertex>
      vUv = uv;
    `
  );
  shader.fragmentShader = `
    varying vec2 vUv;
  ` + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
   `gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
    `gl_FragColor = vec4( outgoingLight, diffuseColor.a * smoothstep(0.5, 0.7, vUv.y));`
  );
  
  materialShaders.push(shader);
}
var sun = new THREE.Mesh(sunGeom, sunMat);
sun.position.set(0, 30, -500);
scene.add(sun);


var clock = new THREE.Clock();
var time = 0;
render();

function render() {
  if (resize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  time = clock.getElapsedTime();
  materialShaders.forEach(m => {
    m.uniforms.time.value = time;
  });
  renderer.render(scene, camera);
  //requestAnimationFrame(render);
}

function resize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}