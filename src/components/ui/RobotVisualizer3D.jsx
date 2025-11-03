// src/components/ui/RobotVisualizer3D.jsx
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";

/** Parámetros de manejo (ajustables) */
const MOVE_IMPULSE   = 0.9;   // impulso al avanzar
const STRAFE_IMPULSE = 0.45;  // deriva lateral (izq/der)
const TURN_ANGLE     = 0.22;  // giro por click
const SPIN_ANGVEL    = 5.5;   // vel. angular del "girar"
const FRICTION       = 0.94;  // fricción lineal
const ANG_FRICTION   = 0.90;  // fricción angular
const MAX_SPEED      = 2.6;   // tope de velocidad
const ARENA_HALF     = 3.0;   // límites del plano
const STRAIGHT_LOCK_WINDOW = 0.35; // tiempo tras "avanzar" para alinear recto
const LATERAL_DAMP = 0.8;     // 0=sin corrección, 1=recto puro

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

/** Obtiene ejes forward (+X local) y right (+Z local) desde la orientación real del modelo */
function getForwardRightFromQuaternion(q) {
  const forward = new THREE.Vector3(1, 0, 0).applyQuaternion(q); // frente del auto (opuesto a luces traseras)
  const right   = new THREE.Vector3(0, 0, 1).applyQuaternion(q); // derecha local
  forward.y = 0; right.y = 0;
  forward.normalize(); right.normalize();
  return { forward, right };
}

/** event: { cmd: "avanzar" | "izquierda" | "derecha" | "girar" | "frenar", nonce: number } */
function Car({ event }) {
  const group = useRef();
  const wheelFL = useRef(), wheelFR = useRef(), wheelRL = useRef(), wheelRR = useRef();

  // estado dinámico
  const vel = useRef({ x: 0, z: 0 });
  const angVel = useRef(0);
  const spinUntil = useRef(0);
  const [isBraking, setIsBraking] = useState(false);

  // tracking para "alineado recto" tras avanzar
  const lastCmdRef = useRef(null);
  const lastCmdTime = useRef(0);

  // Aplica impulsos en cada evento (aunque el cmd se repita, gracias al nonce)
  useEffect(() => {
    if (!event || !group.current) return;
    const { cmd } = event;

    const g = group.current;
    const { forward, right } = getForwardRightFromQuaternion(g.quaternion);

    lastCmdRef.current = cmd;
    lastCmdTime.current = performance.now() / 1000;

    if (cmd === "avanzar") {
      // Avanza en la dirección real del frente del auto (opuesta a luces traseras)
      vel.current.x += forward.x * MOVE_IMPULSE;
      vel.current.z += forward.z * MOVE_IMPULSE;
      setIsBraking(false);
    } else if (cmd === "izquierda") {
      angVel.current -= TURN_ANGLE * 2.0;
      vel.current.x -= right.x * STRAFE_IMPULSE;
      vel.current.z -= right.z * STRAFE_IMPULSE;
      setIsBraking(false);
    } else if (cmd === "derecha") {
      angVel.current += TURN_ANGLE * 2.0;
      vel.current.x += right.x * STRAFE_IMPULSE;
      vel.current.z += right.z * STRAFE_IMPULSE;
      setIsBraking(false);
    } else if (cmd === "girar") {
      const now = performance.now() / 1000;
      spinUntil.current = now + 0.6;
      setIsBraking(false);
    } else if (cmd === "frenar") {
      vel.current.x = 0; vel.current.z = 0; angVel.current = 0;
      setIsBraking(true);
    }
  }, [event?.nonce]);

  useFrame((_, dt) => {
    if (!group.current) return;
    const g = group.current;
    const now = performance.now() / 1000;

    // “girar” = spin temporal
    if (now < spinUntil.current) {
      angVel.current = SPIN_ANGVEL;
    }

    // Limitar velocidad
    const speed = Math.hypot(vel.current.x, vel.current.z);
    if (speed > MAX_SPEED) {
      const k = MAX_SPEED / speed;
      vel.current.x *= k; vel.current.z *= k;
    }

    // Integración de posición
    g.position.x += vel.current.x * dt;
    g.position.z += vel.current.z * dt;

    // Alinear recto un instante tras "avanzar" (suprime derrape lateral)
    if (lastCmdRef.current === "avanzar" && now - lastCmdTime.current < STRAIGHT_LOCK_WINDOW) {
      const { forward } = getForwardRightFromQuaternion(g.quaternion);
      const v = new THREE.Vector2(vel.current.x, vel.current.z);
      const f = new THREE.Vector2(forward.x, forward.z).normalize();
      const vParallelMag = v.dot(f);
      const vParallel = f.multiplyScalar(vParallelMag);
      v.lerp(vParallel, LATERAL_DAMP);
      vel.current.x = v.x; vel.current.z = v.y;
    }

    // Fricción lineal
    vel.current.x *= FRICTION;
    vel.current.z *= FRICTION;

    // Rotación + fricción angular
    g.rotation.y += angVel.current * dt;
    angVel.current *= ANG_FRICTION;

    // Límites del área
    g.position.x = clamp(g.position.x, -ARENA_HALF, ARENA_HALF);
    g.position.z = clamp(g.position.z, -ARENA_HALF, ARENA_HALF);

    // Spin visual de ruedas
    const wheelSpin = speed * 4.0 * dt;
    [wheelFL, wheelFR, wheelRL, wheelRR].forEach((r) => {
      if (r.current) r.current.rotation.x -= wheelSpin;
    });
  });

  // Colores (tu paleta)
  const bodyColor = "#5C7A8B";
  const trimColor = "#212121";
  const rimColor  = "#D8D8D8";

  return (
    <group ref={group} position={[0, 0.2, 0]}>
      {/* cuerpo */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.35, 0.7]} />
        <meshStandardMaterial color={bodyColor} metalness={0.35} roughness={0.5} />
      </mesh>

      {/* parabrisas */}
      <mesh position={[0.1, 0.2, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.6]} />
        <meshStandardMaterial color="#A3B7C1" metalness={0.1} roughness={0.2} transparent opacity={0.85} />
      </mesh>

      {/* luces traseras (freno) */}
      <mesh position={[-0.65, 0.08,  0.23]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial
          color={isBraking ? "red" : "#400"}
          emissive={isBraking ? "red" : "#000"}
          emissiveIntensity={isBraking ? 2 : 0.3}
        />
      </mesh>
      <mesh position={[-0.65, 0.08, -0.23]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial
          color={isBraking ? "red" : "#400"}
          emissive={isBraking ? "red" : "#000"}
          emissiveIntensity={isBraking ? 2 : 0.3}
        />
      </mesh>

      {/* ruedas */}
      <group position={[ 0.45, -0.06,  0.28]} rotation={[0, 0, Math.PI / 2]} ref={wheelFR}>
        <mesh castShadow><cylinderGeometry args={[0.11, 0.11, 0.08, 20]} /><meshStandardMaterial color={trimColor} /></mesh>
        <mesh><cylinderGeometry args={[0.04, 0.04, 0.09, 8]} /><meshStandardMaterial color={rimColor} /></mesh>
      </group>
      <group position={[-0.45, -0.06,  0.28]} rotation={[0, 0, Math.PI / 2]} ref={wheelFL}>
        <mesh castShadow><cylinderGeometry args={[0.11, 0.11, 0.08, 20]} /><meshStandardMaterial color={trimColor} /></mesh>
        <mesh><cylinderGeometry args={[0.04, 0.04, 0.09, 8]} /><meshStandardMaterial color={rimColor} /></mesh>
      </group>
      <group position={[ 0.45, -0.06, -0.28]} rotation={[0, 0, Math.PI / 2]} ref={wheelRR}>
        <mesh castShadow><cylinderGeometry args={[0.11, 0.11, 0.08, 20]} /><meshStandardMaterial color={trimColor} /></mesh>
        <mesh><cylinderGeometry args={[0.04, 0.04, 0.09, 8]} /><meshStandardMaterial color={rimColor} /></mesh>
      </group>
      <group position={[-0.45, -0.06, -0.28]} rotation={[0, 0, Math.PI / 2]} ref={wheelRL}>
        <mesh castShadow><cylinderGeometry args={[0.11, 0.11, 0.08, 20]} /><meshStandardMaterial color={trimColor} /></mesh>
        <mesh><cylinderGeometry args={[0.04, 0.04, 0.09, 8]} /><meshStandardMaterial color={rimColor} /></mesh>
      </group>
    </group>
  );
}

export default function RobotVisualizer3D({ event, height = 240 }) {
  return (
    <div className="w-full rounded-2xl ring-1 ring-white/10 shadow-lg overflow-hidden bg-neutral-900" style={{ height }}>
      <Canvas shadows camera={{ position: [4, 3, 4], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />

        {/* piso */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
          <planeGeometry args={[ARENA_HALF * 2 + 1, ARENA_HALF * 2 + 1]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
        </mesh>
        {/* anillo visual de límite */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ARENA_HALF - 0.02, ARENA_HALF, 64]} />
          <meshBasicMaterial color="#2b2b2b" />
        </mesh>

        <Car event={event} />

        <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={8} blur={2.5} far={3} />
        <Environment preset="city" />
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.95} maxPolarAngle={1.25} />
      </Canvas>
    </div>
  );
}
