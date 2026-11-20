// Folded wave ribbon as plain typed arrays (no three.js), so it can be built in a worker like on
// stripe.com. A width x height plane with segX x segY segments is folded: left of x=-16 it is
// lifted by d, between -16 and 16 it bends round a half cylinder of radius d, right of 16 it comes
// back mirrored at -d (d = 4 in the middle rows, falling to 2 at the top and bottom edges), then it
// is shifted by width/4 and turned on its side (-90° about x, then -90° about y).

// Rotate point v around a unit axis by angle (quaternion sandwich, as in Stripe's worker).
function rotateAroundAxis(v, axis, angle) {
  const half = angle / 2;
  const s = Math.sin(half);
  const qx = axis.x * s;
  const qy = axis.y * s;
  const qz = axis.z * s;
  const qw = Math.cos(half);
  const ix = qw * v.x + qy * v.z - qz * v.y;
  const iy = qw * v.y + qz * v.x - qx * v.z;
  const iz = qw * v.z + qx * v.y - qy * v.x;
  const iw = -qx * v.x - qy * v.y - qz * v.z;
  return {
    x: ix * qw - iw * qx - iy * qz + iz * qy,
    y: iy * qw - iw * qy - iz * qx + ix * qz,
    z: iz * qw - iw * qz - ix * qy + iy * qx,
  };
}

// Same vertex order, uvs and triangle winding as three's PlaneGeometry.
function planeArrays(width, height, segX, segY) {
  const halfW = width / 2;
  const halfH = height / 2;
  const cols = segX + 1;
  const rows = segY + 1;
  const stepX = width / segX;
  const stepY = height / segY;
  const positions = new Float32Array(cols * rows * 3);
  const uvs = new Float32Array(cols * rows * 2);
  let p = 0;
  let u = 0;
  for (let row = 0; row < rows; row += 1) {
    const y = row * stepY - halfH;
    for (let col = 0; col < cols; col += 1) {
      positions[p] = col * stepX - halfW;
      positions[p + 1] = -y;
      positions[p + 2] = 0;
      p += 3;
      uvs[u] = col / segX;
      uvs[u + 1] = 1 - row / segY;
      u += 2;
    }
  }
  const indices = new Uint32Array(segX * segY * 6);
  let k = 0;
  for (let row = 0; row < segY; row += 1) {
    for (let col = 0; col < segX; col += 1) {
      const a = col + cols * row;
      const b = col + cols * (row + 1);
      const c = col + 1 + cols * (row + 1);
      const d = col + 1 + cols * row;
      indices[k] = a;
      indices[k + 1] = b;
      indices[k + 2] = d;
      indices[k + 3] = b;
      indices[k + 4] = c;
      indices[k + 5] = d;
      k += 6;
    }
  }
  return { positions, uvs, indices };
}

const X_AXIS = { x: 1, y: 0, z: 0 };
const Y_AXIS = { x: 0, y: 1, z: 0 };

export function foldedWaveArrays({ width = 400, height = 400, subdivisionsX = 128, subdivisionsY = 256 } = {}) {
  const { positions, uvs, indices } = planeArrays(width, height, subdivisionsX, subdivisionsY);
  const count = positions.length / 3;
  for (let i = 0; i < count; i += 1) {
    let x = positions[3 * i];
    const y = positions[3 * i + 1];
    let z = positions[3 * i + 2];
    const v = uvs[2 * i + 1];
    const depth = 4 - 2 * (4 * v * (1 - v)) ** 9.5;
    if (x < -16) {
      z += depth;
    } else if (x < 16) {
      z = Math.cos(((x + 16) * Math.PI) / 32) * depth;
      x = Math.cos(-Math.PI / 2 + ((x + 16) * Math.PI) / 32) * depth - 16;
    } else {
      z -= depth;
      x = -x;
    }
    x += width / 4;
    let point = rotateAroundAxis({ x, y, z }, X_AXIS, -Math.PI / 2);
    point = rotateAroundAxis(point, Y_AXIS, -Math.PI / 2);
    positions[3 * i] = point.x;
    positions[3 * i + 1] = point.y;
    positions[3 * i + 2] = point.z;
  }
  // Placeholder normals; the main thread recomputes them from the faces.
  const normals = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) normals[3 * i + 2] = 1;
  return { positions, uvs, normals, indices };
}
