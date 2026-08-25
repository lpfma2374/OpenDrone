// OpenDrone — construtores de modelos 3D. Cada função devolve um THREE.Group
// com meshes e materiais nomeados (nomes viajam para o OBJ / GLB).

export function palette(THREE, accent) {
  return {
    shell:  new THREE.MeshStandardMaterial({ name:'shell',  color:0xe9ebea, roughness:0.42, metalness:0.22 }),
    panel:  new THREE.MeshStandardMaterial({ name:'panel',  color:0xa8adad, roughness:0.55, metalness:0.30 }),
    dark:   new THREE.MeshStandardMaterial({ name:'dark',   color:0x2b3030, roughness:0.35, metalness:0.20 }),
    accent: new THREE.MeshStandardMaterial({ name:'accent', color:accent,   roughness:0.45, metalness:0.10 }),
    metal:  new THREE.MeshStandardMaterial({ name:'metal',  color:0x8f9494, roughness:0.30, metalness:0.38 })
  };
}

function rig(THREE, name) {
  const g = new THREE.Group(); g.name = name;
  const add = (n, geo, m, fn) => {
    const mesh = new THREE.Mesh(geo, m); mesh.name = n;
    mesh.castShadow = true; mesh.receiveShadow = true;
    if (fn) fn(mesh); g.add(mesh); return mesh;
  };
  const plan = (pts, thickness, curve = 4) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false, curveSegments: curve });
    geo.rotateX(Math.PI / 2);
    return geo;
  };
  const lathe = (profile, seg = 48) => {
    const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
    geo.rotateX(Math.PI / 2);
    return geo;
  };
  return { g, add, plan, lathe };
}

function ground(THREE, g) {
  const b = new THREE.Box3().setFromObject(g);
  g.position.y -= b.min.y;
  return g;
}

/* ---------- OpenDrone_AM_S — ala voadora furtiva ---------- */
export function AM_S(THREE) {
  const mat = palette(THREE, 0x2f7d4f);
  const { g, add, plan, lathe } = rig(THREE, 'OpenDrone_AM_S');

  const wing = [[0.70,5.90],[8.20,-1.60],[8.20,-2.45],[3.40,-3.90],[0.70,-4.60]];
  for (const s of [1,-1]) {
    add(s>0?'wing_right':'wing_left', plan(wing, 0.30), mat.shell, m => { m.scale.x = s; m.position.y = 0.08; });
  }
  add('centre_body', lathe([[0.02,6.10],[0.30,5.40],[0.62,4.20],[0.86,2.40],[0.92,0.40],[0.86,-1.80],[0.70,-3.40],[0.60,-4.28],[0.0,-4.28]], 10), mat.shell, m => m.scale.set(1.5, 0.62, 1));
  add('dorsal_inlet', new THREE.BoxGeometry(1.24, 0.26, 1.70), mat.panel, m => { m.position.set(0, 0.52, 1.70); m.rotation.x = 0.05; });
  add('inlet_lip', new THREE.BoxGeometry(1.14, 0.20, 0.12), mat.dark, m => m.position.set(0, 0.56, 2.58));
  add('exhaust_slot', new THREE.BoxGeometry(1.50, 0.14, 0.50), mat.dark, m => m.position.set(0, 0.24, -4.15));
  add('sensor_window', new THREE.SphereGeometry(0.36, 32, 20), mat.dark, m => { m.scale.set(1.5, 0.30, 1.0); m.position.set(0, -0.10, 4.45); });
  for (const s of [1,-1]) {
    add(s>0?'marking_right':'marking_left', new THREE.BoxGeometry(0.90, 0.04, 0.30), mat.accent, m => m.position.set(s*3.10, 0.235, -1.10));
  }
  return ground(THREE, g);
}

/* ---------- OpenDrone_AC_B — combate a incêndios ---------- */
export function AC_B(THREE) {
  const mat = palette(THREE, 0xd4642a);
  const { g, add, plan, lathe } = rig(THREE, 'OpenDrone_AC_B');

  add('fuselage', lathe([[0.12,7.10],[0.46,6.80],[0.78,6.00],[0.96,4.60],[1.02,2.00],[1.02,-2.20],[0.90,-4.40],[0.68,-6.20],[0.44,-7.20],[0.0,-7.30]]), mat.shell, m => m.scale.set(1, 0.92, 1));
  const wing = [[0.90,1.90],[9.40,1.20],[9.40,-0.40],[0.90,-1.70]];
  for (const s of [1,-1]) {
    add(s>0?'wing_right':'wing_left', plan(wing, 0.38), mat.shell, m => { m.scale.x = s; m.position.y = 0.82; });
    add(s>0?'nacelle_right':'nacelle_left', new THREE.CapsuleGeometry(0.40, 1.60, 10, 24), mat.panel, m => { m.geometry.rotateX(Math.PI/2); m.position.set(s*3.60, 0.92, 2.40); });
    add(s>0?'spinner_right':'spinner_left', new THREE.ConeGeometry(0.22, 0.55, 24), mat.accent, m => { m.geometry.rotateX(Math.PI/2); m.position.set(s*3.60, 0.92, 3.55); });
    for (let b = 0; b < 4; b++) {
      add(`blade_${s>0?'r':'l'}${b+1}`, new THREE.BoxGeometry(0.15, 1.55, 0.05), mat.dark, m => {
        m.position.set(s*3.60, 0.92, 3.34); m.rotation.z = b * Math.PI/2 + 0.35;
        m.geometry.translate(0, 0.90, 0);
      });
    }
    add(s>0?'stab_right':'stab_left', plan([[0.60,-5.20],[3.20,-5.70],[3.20,-6.60],[0.60,-6.90]], 0.22), mat.shell, m => { m.scale.x = s; m.position.y = 0.55; });
  }
  add('tank', new THREE.CapsuleGeometry(0.80, 3.60, 12, 28), mat.accent, m => { m.geometry.rotateX(Math.PI/2); m.scale.set(1.10, 0.62, 1); m.position.set(0, -1.05, 0.40); });
  add('drop_door', new THREE.BoxGeometry(1.10, 0.14, 2.40), mat.dark, m => m.position.set(0, -1.52, 0.40));
  add('fin', plan([[0.0,-5.00],[0.80,-6.90],[2.60,-7.10],[2.60,-5.30]], 0.20), mat.shell, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(0, 0.55, 0); });
  add('foam_pod', new THREE.CapsuleGeometry(0.26, 1.30, 10, 20), mat.panel, m => { m.geometry.rotateX(Math.PI/2); m.position.set(0, 0.05, 5.40); });
  add('sensor_ball', new THREE.SphereGeometry(0.34, 32, 22), mat.dark, m => m.position.set(0, -0.62, 5.90));
  for (const s of [1,-1]) add(s>0?'gear_right':'gear_left', new THREE.CylinderGeometry(0.34, 0.34, 0.24, 24), mat.dark, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(s*1.40, -1.60, 1.30); });
  return ground(THREE, g);
}

/* ---------- OpenDrone_AQM — embarcação rápida de superfície ---------- */
export function AQM(THREE) {
  const mat = palette(THREE, 0x1c6f8c);
  const { g, add, plan } = rig(THREE, 'OpenDrone_AQM');

  const hullPlan = [[0.05,8.40],[1.10,6.00],[1.62,2.20],[1.68,-4.40],[1.45,-6.60],[0.05,-6.60]];
  for (const s of [1,-1]) {
    add(s>0?'hull_right':'hull_left', plan(hullPlan, 1.15), mat.shell, m => { m.scale.x = s; m.position.y = 1.90; });
    add(s>0?'chine_right':'chine_left', plan(hullPlan, 0.09), mat.accent, m => { m.scale.set(s * 1.005, 1, 1.005); m.position.y = 0.79; });
    add(s>0?'vee_right':'vee_left', plan(hullPlan, 0.80), mat.panel, m => { m.scale.set(s * 0.58, 1, 0.99); m.position.y = 0.72; });
    add(s>0?'jet_right':'jet_left', new THREE.CylinderGeometry(0.32, 0.28, 1.00, 28), mat.metal, m => { m.geometry.rotateX(Math.PI/2); m.position.set(s*0.62, 1.05, -6.90); });
    add(s>0?'rail_right':'rail_left', new THREE.BoxGeometry(0.07, 0.40, 3.40), mat.panel, m => m.position.set(s*1.48, 2.12, 4.10));
  }
  add('deck', plan(hullPlan, 0.10), mat.shell, m => { m.position.y = 1.98; });
  add('deck_port', plan(hullPlan, 0.10), mat.shell, m => { m.scale.x = -1; m.position.y = 1.98; });
  add('deckhouse', new THREE.BoxGeometry(2.10, 1.10, 4.60), mat.shell, m => m.position.set(0, 2.52, -0.60));
  add('deckhouse_roof', new THREE.BoxGeometry(1.70, 0.34, 3.40), mat.shell, m => m.position.set(0, 3.22, -0.90));
  add('deckhouse_face', new THREE.BoxGeometry(1.94, 0.56, 0.12), mat.dark, m => m.position.set(0, 2.68, 1.72));
  add('deckhouse_band', new THREE.BoxGeometry(2.14, 0.10, 4.30), mat.accent, m => m.position.set(0, 2.04, -0.60));
  add('mast', new THREE.BoxGeometry(0.20, 1.70, 0.20), mat.panel, m => m.position.set(0, 4.20, -1.40));
  add('radar_dome', new THREE.SphereGeometry(0.42, 32, 22), mat.shell, m => { m.scale.y = 0.72; m.position.set(0, 5.15, -1.40); });
  add('eo_turret', new THREE.SphereGeometry(0.28, 28, 20), mat.dark, m => m.position.set(0, 3.55, 0.40));
  add('weapon_plinth', new THREE.CylinderGeometry(0.66, 0.74, 0.36, 28), mat.panel, m => m.position.set(0, 2.18, 3.60));
  add('weapon_station', new THREE.CylinderGeometry(0.48, 0.56, 0.50, 28), mat.dark, m => m.position.set(0, 2.58, 3.60));
  add('station_barrel', new THREE.CylinderGeometry(0.08, 0.08, 1.70, 20), mat.metal, m => { m.geometry.rotateX(Math.PI/2); m.position.set(0, 2.70, 4.60); });
  add('launch_box', new THREE.BoxGeometry(1.50, 0.60, 1.70), mat.panel, m => m.position.set(0, 2.32, -4.30));
  add('launch_lid', new THREE.BoxGeometry(1.30, 0.08, 1.50), mat.dark, m => m.position.set(0, 2.64, -4.30));
  return ground(THREE, g);
}

/* ---------- OpenDrone_AQM_S — submarino de ataque ---------- */
export function AQM_S(THREE) {
  const mat = palette(THREE, 0x1c6f8c);
  const { g, add, plan, lathe } = rig(THREE, 'OpenDrone_AQM_S');

  add('pressure_hull', lathe([[0.02,9.00],[0.55,8.55],[1.00,7.70],[1.28,6.20],[1.40,4.00],[1.42,-3.20],[1.30,-5.80],[0.95,-7.60],[0.60,-8.40],[0.28,-8.80],[0.0,-8.80]]), mat.shell);
  add('sonar_dome', new THREE.SphereGeometry(0.95, 32, 24), mat.panel, m => { m.scale.set(1, 1, 1.35); m.position.set(0, 0, 8.10); });
  add('sail', new THREE.BoxGeometry(1.05, 1.20, 3.20), mat.shell, m => m.position.set(0, 1.75, 2.40));
  add('sail_mast', new THREE.BoxGeometry(0.22, 1.10, 0.22), mat.panel, m => m.position.set(0, 2.85, 1.40));
  add('sail_window', new THREE.BoxGeometry(1.08, 0.30, 1.00), mat.dark, m => m.position.set(0, 2.05, 3.30));
  for (const s of [1,-1]) {
    add(s>0?'bow_plane_right':'bow_plane_left', plan([[1.15,5.40],[3.00,5.00],[3.00,4.25],[1.15,3.85]], 0.18), mat.panel, m => { m.scale.x = s; m.position.y = 0.10; });
    add(s>0?'x_upper_right':'x_upper_left', plan([[1.10,-5.60],[3.20,-6.30],[3.20,-7.20],[1.10,-7.00]], 0.20), mat.panel, m => { m.scale.x = s; m.geometry.rotateZ(Math.PI/2); m.rotation.z = s*0.78; m.position.set(0,0,0); });
    add(s>0?'x_lower_right':'x_lower_left', plan([[1.10,-5.60],[3.20,-6.30],[3.20,-7.20],[1.10,-7.00]], 0.20), mat.panel, m => { m.scale.x = s; m.geometry.rotateZ(Math.PI/2); m.rotation.z = s*(Math.PI - 0.78); });
    add(s>0?'tube_right':'tube_left', new THREE.CylinderGeometry(0.30, 0.30, 0.30, 24), mat.dark, m => { m.geometry.rotateX(Math.PI/2); m.position.set(s*0.62, -0.30, 8.55); });
    add(s>0?'flank_array_right':'flank_array_left', new THREE.BoxGeometry(0.10, 0.44, 5.20), mat.accent, m => m.position.set(s*1.40, -0.30, 1.20));
  }
  add('propulsor_ring', new THREE.TorusGeometry(0.86, 0.16, 18, 40), mat.metal, m => m.position.set(0, 0, -9.10));
  add('propulsor_hub', new THREE.ConeGeometry(0.42, 0.90, 24), mat.dark, m => { m.geometry.rotateX(-Math.PI/2); m.position.set(0, 0, -9.20); });
  return ground(THREE, g);
}

/* ---------- OpenDrone_AQM_I — submersível de investigação ---------- */
export function AQM_I(THREE) {
  const mat = palette(THREE, 0x1c6f8c);
  const { g, add } = rig(THREE, 'OpenDrone_AQM_I');

  add('foam_block', new THREE.BoxGeometry(2.40, 1.00, 4.20), mat.shell, m => m.position.set(0, 1.70, -0.60));
  add('foam_cap', new THREE.BoxGeometry(2.00, 0.26, 3.80), mat.shell, m => m.position.set(0, 2.32, -0.60));
  add('pressure_sphere', new THREE.SphereGeometry(1.00, 40, 28), mat.panel, m => m.position.set(0, 1.05, 1.85));
  add('viewport', new THREE.SphereGeometry(0.54, 32, 22), mat.dark, m => { m.scale.z = 0.60; m.position.set(0, 1.05, 2.72); });
  add('equipment_bay', new THREE.BoxGeometry(1.80, 0.85, 2.10), mat.panel, m => m.position.set(0, 0.75, -1.30));
  for (const s of [1,-1]) {
    add(s>0?'thruster_ring_right':'thruster_ring_left', new THREE.TorusGeometry(0.42, 0.10, 16, 32), mat.metal, m => m.position.set(s*1.42, 1.55, -2.60));
    add(s>0?'thruster_hub_right':'thruster_hub_left', new THREE.CylinderGeometry(0.15, 0.15, 0.36, 20), mat.dark, m => { m.geometry.rotateX(Math.PI/2); m.position.set(s*1.42, 1.55, -2.60); });
    add(s>0?'thruster_pylon_right':'thruster_pylon_left', new THREE.BoxGeometry(0.44, 0.16, 0.16), mat.panel, m => m.position.set(s*1.24, 1.55, -2.60));
    add(s>0?'vert_ring_right':'vert_ring_left', new THREE.TorusGeometry(0.34, 0.09, 16, 32), mat.metal, m => { m.rotation.x = Math.PI/2; m.position.set(s*0.85, 2.46, -0.60); });
    add(s>0?'skid_right':'skid_left', new THREE.BoxGeometry(0.22, 0.16, 4.20), mat.panel, m => m.position.set(s*1.05, 0.08, -0.20));
    add(s>0?'skid_leg_fwd_right':'skid_leg_fwd_left', new THREE.BoxGeometry(0.13, 0.90, 0.15), mat.panel, m => m.position.set(s*1.05, 0.60, 1.30));
    add(s>0?'skid_leg_aft_right':'skid_leg_aft_left', new THREE.BoxGeometry(0.13, 0.70, 0.15), mat.panel, m => m.position.set(s*1.05, 0.50, -1.80));
    add(s>0?'light_right':'light_left', new THREE.CylinderGeometry(0.17, 0.20, 0.26, 20), mat.accent, m => { m.geometry.rotateX(Math.PI/2); m.position.set(s*1.05, 1.60, 1.35); });
    add(s>0?'camera_right':'camera_left', new THREE.CylinderGeometry(0.10, 0.10, 0.28, 18), mat.dark, m => { m.geometry.rotateX(Math.PI/2); m.position.set(s*0.40, 1.72, 1.90); });
  }
  add('arm_base', new THREE.CylinderGeometry(0.22, 0.26, 0.30, 20), mat.dark, m => m.position.set(0.62, 0.55, 1.40));
  add('arm_upper', new THREE.BoxGeometry(0.18, 0.18, 1.20), mat.accent, m => { m.position.set(0.62, 0.62, 2.05); m.rotation.x = -0.18; });
  add('arm_fore', new THREE.BoxGeometry(0.15, 0.15, 0.95), mat.panel, m => { m.position.set(0.62, 0.48, 2.90); m.rotation.x = 0.42; });
  add('gripper', new THREE.BoxGeometry(0.28, 0.12, 0.30), mat.dark, m => m.position.set(0.62, 0.30, 3.42));
  add('sonar_head', new THREE.CylinderGeometry(0.38, 0.38, 0.20, 28), mat.panel, m => m.position.set(0, 2.55, -2.10));
  return ground(THREE, g);
}

/* ---------- OpenDrone_T — plataforma terrestre de vala e cabo ---------- */
export function T(THREE) {
  const mat = palette(THREE, 0xb98424);
  const { g, add } = rig(THREE, 'OpenDrone_T');

  for (const s of [1,-1]) {
    const tag = s > 0 ? 'right' : 'left';
    add('track_body_' + tag, new THREE.BoxGeometry(0.52, 0.66, 3.90), mat.dark, m => m.position.set(s*1.16, 0.62, 0));
    add('sprocket_fwd_' + tag, new THREE.CylinderGeometry(0.44, 0.44, 0.54, 28), mat.dark, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(s*1.16, 0.55, 1.95); });
    add('sprocket_aft_' + tag, new THREE.CylinderGeometry(0.44, 0.44, 0.54, 28), mat.dark, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(s*1.16, 0.55, -1.95); });
    add('sprocket_face_fwd_' + tag, new THREE.CylinderGeometry(0.20, 0.20, 0.58, 20), mat.metal, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(s*1.16, 0.55, 1.95); });
    add('sprocket_face_aft_' + tag, new THREE.CylinderGeometry(0.20, 0.20, 0.58, 20), mat.metal, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(s*1.16, 0.55, -1.95); });
    for (let w = 0; w < 3; w++) add('roller_' + tag + (w+1), new THREE.CylinderGeometry(0.26, 0.26, 0.56, 22), mat.metal, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(s*1.16, 0.30, -1.10 + w*1.10); });
  }
  add('chassis', new THREE.BoxGeometry(1.90, 0.78, 3.50), mat.shell, m => m.position.set(0, 1.34, -0.10));
  add('chassis_deck', new THREE.BoxGeometry(2.10, 0.14, 3.30), mat.panel, m => m.position.set(0, 1.78, -0.10));
  add('chassis_band', new THREE.BoxGeometry(1.94, 0.09, 3.40), mat.accent, m => m.position.set(0, 1.02, -0.10));
  add('trench_arm', new THREE.BoxGeometry(0.30, 0.30, 2.10), mat.panel, m => { m.position.set(0, 1.05, 2.35); m.rotation.x = 0.30; });
  add('cutter_wheel', new THREE.CylinderGeometry(0.78, 0.78, 0.22, 40), mat.metal, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(0, 0.62, 3.30); });
  add('cutter_hub', new THREE.CylinderGeometry(0.24, 0.24, 0.30, 24), mat.accent, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(0, 0.62, 3.30); });
  add('cable_drum', new THREE.CylinderGeometry(0.66, 0.66, 1.20, 36), mat.accent, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(0, 2.52, -1.10); });
  add('drum_flange_a', new THREE.CylinderGeometry(0.78, 0.78, 0.09, 36), mat.panel, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(0.62, 2.52, -1.10); });
  add('drum_flange_b', new THREE.CylinderGeometry(0.78, 0.78, 0.09, 36), mat.panel, m => { m.geometry.rotateZ(Math.PI/2); m.position.set(-0.62, 2.52, -1.10); });
  add('drum_cradle', new THREE.BoxGeometry(1.60, 0.60, 0.24), mat.panel, m => m.position.set(0, 2.10, -1.10));
  add('mast', new THREE.BoxGeometry(0.18, 1.50, 0.18), mat.panel, m => m.position.set(-0.72, 2.55, 0.95));
  add('sensor_head', new THREE.BoxGeometry(0.56, 0.30, 0.38), mat.dark, m => m.position.set(-0.72, 3.42, 0.95));
  add('gnss_puck', new THREE.CylinderGeometry(0.20, 0.20, 0.12, 24), mat.shell, m => m.position.set(0.70, 1.90, -0.10));
  add('manipulator_base', new THREE.CylinderGeometry(0.24, 0.28, 0.26, 24), mat.dark, m => m.position.set(0.62, 1.96, 1.00));
  add('manipulator_arm', new THREE.BoxGeometry(0.16, 0.16, 1.40), mat.accent, m => { m.position.set(0.62, 1.88, 1.75); m.rotation.x = 0.42; });
  add('manipulator_tool', new THREE.BoxGeometry(0.24, 0.20, 0.30), mat.panel, m => m.position.set(0.62, 1.42, 2.42));
  return ground(THREE, g);
}
