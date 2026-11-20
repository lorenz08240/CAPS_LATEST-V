#define varying in
layout(location = 0) out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
#define gl_FragDepthEXT gl_FragDepth
#define texture2D texture
#define textureCube texture
#define texture2DProj textureProj
#define texture2DLodEXT textureLod
#define texture2DProjLodEXT textureProjLod
#define textureCubeLodEXT textureLod
#define texture2DGradEXT textureGrad
#define texture2DProjGradEXT textureProjGrad
#define textureCubeGradEXT textureGrad
precision highp float;
precision highp int;
#define HIGH_PRECISION
#define PHONG 1
#define USE_COLOR
#define USE_SHADOWMAP
#define SHADOWMAP_TYPE_PCF
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;
#define DITHERING
#define OPAQUE
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 linearToOutputTexel( vec4 value ) { return LinearToLinear( value ); }
#ifdef TEXTURE_LOD_EXT
	#define texCube(a, b) textureCube(a, b)
	#define texCubeBias(a, b, c) textureCubeLodEXT(a, b, c)
	#define tex2D(a, b) texture2D(a, b)
	#define tex2DBias(a, b, c) texture2DLodEXT(a, b, c)
#else
	#define texCube(a, b) textureCube(a, b)
	#define texCubeBias(a, b, c) textureCube(a, b, c)
	#define tex2D(a, b) texture2D(a, b)
	#define tex2DBias(a, b, c) texture2D(a, b, c)
#endif
			// NOTE: Include Spline's blending modes. This could be part of BlendNode
			#define SPE_BLENDING_NORMAL 0
			#define SPE_BLENDING_MULTIPLY 1
			#define SPE_BLENDING_SCREEN 2
			#define SPE_BLENDING_OVERLAY 3
			vec3 spe_normalBlend( vec3 a, vec3 b, float alpha ) {
				return mix( a, b, alpha );
			}
			vec3 spe_multiplyBlend( vec3 a, vec3 b, float alpha ) {
				return mix( a, a * b, alpha );
			}
			vec3 spe_screenBlend( vec3 a, vec3 b, float alpha ) {
				vec3 tmp = 1.0 - ( 1.0 - a ) * ( 1.0 - b );
				return mix( a, tmp, alpha );
			}
			vec3 spe_overlayBlend( vec3 a, vec3 b, float alpha ) {
				vec3 tmp = mix( 1. - 2. * (1. - a) * (1. - b), 2. * a * b, step( a, vec3(.5) ) );
				return clamp( mix( a, tmp, alpha ), 0.0, 1.0 );
			}
			vec3 spe_blend( vec3 a, vec3 b, float alpha, int mode ) {
				if ( mode == SPE_BLENDING_NORMAL ) return spe_normalBlend( a, b, alpha );
				else if ( mode == SPE_BLENDING_MULTIPLY ) return spe_multiplyBlend( a, b, alpha );
				else if ( mode == SPE_BLENDING_SCREEN ) return spe_screenBlend( a, b, alpha );
				else if ( mode == SPE_BLENDING_OVERLAY ) return spe_overlayBlend( a, b, alpha );
				return vec3( 1.0 );
			}
vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
	return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * invClipZ - far );
}
#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
float accumAlpha = 0.0;
void accumulateAlpha(float alpha) {
					accumAlpha += (1.0 - accumAlpha) * alpha;
				}
layout(location = 1) out vec4 gVelocity;
uniform int frameIndex;
uniform vec2 resolution;
varying vec4 vCurrentPosition;
varying vec4 vPreviousPosition;
const vec2 haltonSequence[16] = vec2[16](
vec2( 0.000000,-0.333334),
vec2(-0.500000, 0.333334),
vec2( 0.500000,-0.777778),
vec2(-0.750000,-0.111112),
vec2( 0.250000, 0.555556),
vec2(-0.250000,-0.555556),
vec2( 0.750000, 0.111112),
vec2(-0.875000, 0.777778),
vec2(0.125000, -0.925926),
vec2(-0.375000, -0.259260),
vec2(0.625000, 0.407408),
vec2(-0.625000, -0.703704),
vec2(0.375000, -0.037038),
vec2(-0.125000, 0.629630),
vec2(0.875000, -0.481482),
vec2(-0.937500, 0.185186));
vec2 vogelDiskSample(int sampleIndex, int sampleCount, float angle) {
  const float goldenAngle = 2.399963f; // radians
  float r = sqrt(float(sampleIndex) + 0.5f) / sqrt(float(sampleCount));
  float theta = float(sampleIndex) * goldenAngle + angle;
  float sine = sin(theta);
  float cosine = cos(theta);
  return vec2(cosine, sine) * r;
}
// Derived from the interleaved gradient function from Jimenez 2014 http:goo.gl/eomGso
float getNoiseInterleavedGradient(vec2 screenPos) {
    vec3 magic = vec3(0.06711056f, 0.00583715f, 52.9829189f);
    return fract(magic.z * fract(dot(screenPos, magic.xy)));
}
varying vec3 vWPosition;
uniform vec3 emissive;
uniform float penumbraSize[5];
uniform sampler2D aoMap;
uniform bool aoEnabled;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif
#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float roughness ) {
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
	float D = D_GGX( alpha, dotNH );
	return F * ( V * D );
}
#ifdef USE_IRIDESCENCE
	vec3 BRDF_GGX_Iridescence( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 f0, const in float f90, const in float iridescence, const in vec3 iridescenceFresnel, const in float roughness ) {
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = mix( F_Schlick( f0, f90, dotVH ), iridescenceFresnel, iridescence );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( PHYSICALLY_CORRECT_LIGHTS )
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#else
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if 1 > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ 1 ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if 0 > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ 0 ];
	void getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometry.position;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if 1 > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ 1 ];
	void getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometry.position;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if 0 > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ 0 ];
#endif
#if 1 > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ 1 ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong
// PCSS implementation based on:
// https://www.gamedev.net/articles/programming/graphics/contact-hardening-soft-shadows-made-fast-r4906/
// NOTE: This number affects how big the shadow blur can
// possibly get. Bigger number == bigger blur, but less precise results
const float  gPenumbraFilterSize = 80.0;
const int   gPenumbraSamples = 16;
const int gShadowSamples = 16;
const float gShadowSamplesRpc = 1.0f / float(gShadowSamples);
#ifdef USE_SHADOWMAP
    #if 0 > 0
        uniform sampler2D directionalShadowMap[ 0 ];
        varying vec4 vDirectionalShadowCoord[ 0 ];
        struct DirectionalLightShadow {
            float shadowBias;
            float shadowNormalBias;
            float shadowRadius;
            vec2 shadowMapSize;
        };
        uniform DirectionalLightShadow directionalLightShadows[ 0 ];
    #endif
    #if 1 > 0
        uniform sampler2D spotShadowMap[ 1 ];
        varying vec4 vSpotLightCoord[ 1 ];
        struct SpotLightShadow {
            float shadowBias;
            float shadowNormalBias;
            float shadowRadius;
            vec2 shadowMapSize;
        };
        uniform SpotLightShadow spotLightShadows[ 1 ];
    #endif
    #if 0 > 0
        uniform sampler2D pointShadowMap[ 0 ];
        varying vec4 vPointShadowCoord[ 0 ];
        struct PointLightShadow {
            float shadowBias;
            float shadowNormalBias;
            float shadowRadius;
            vec2 shadowMapSize;
            float shadowCameraNear;
            float shadowCameraFar;
        };
        uniform PointLightShadow pointLightShadows[ 0 ];
    #endif
    /*
    #if 0 > 0
        // TODO (abelnation): create uniforms for area light shadows
    #endif
    */
float computePenumbra(int index, sampler2D shadowMap, float temporalAngle, float texelSize, vec2 uv, float compare, float texelScalar, float shadowRadius)
{
    float penumbra = 1.0;
    float blockerDepthAvg = 0.0;
    float blockerCount = 0.0;
    #pragma unroll_loop_start
    for(int i = 0; i < gPenumbraSamples; i ++)
    {
        vec2 offset = (vogelDiskSample(i, gShadowSamples, temporalAngle) * texelSize) * texelScalar;
        float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + offset ) );
        if(depth < compare + 0.0001)
        {
            blockerDepthAvg += depth;
            blockerCount++;
        }
    }
    #pragma unroll_loop_end
    if (blockerCount > 0.0)
    {
        blockerDepthAvg /= blockerCount;
        // Compute penumbra
        penumbra = (compare - blockerDepthAvg) / (blockerDepthAvg);
        penumbra *= penumbra;
        penumbra *= 200.0 * penumbraSize[min(index, 5 - 1)]; // Magic number that affects how quickly the penumbra grows
        return clamp(penumbra, 0.00, 1.0);
    }
    return 0.0;
}
float vogelShadow(int index, sampler2D shadowMap, vec2 uv, float texelSize, float compare, float shadowRadius)
{
    float shadow         = 0.0f;
    // NOTE: When using TAA, we should use screen space interleaved gradient noise
    vec2 halton = haltonSequence[frameIndex];
    float temporalOffset = getNoiseInterleavedGradient(gl_FragCoord.xy + halton);
    float temporalAngle  = temporalOffset * PI2;
    float texelScalar = (gPenumbraFilterSize) / (texelSize * 1024.);
    float penumbra = computePenumbra(index, shadowMap, temporalAngle, texelSize, uv, compare, texelScalar, shadowRadius);
    if (penumbra == -1.0) {
        return 1.0;
    }
    #pragma unroll_loop_start
    for (int i = 0; i < gShadowSamples; i++)
    {
        vec2 vogelSample =  vogelDiskSample(i, gShadowSamples, temporalAngle) * texelSize;
        // Overall blurring offset
        vec2 offset = vogelSample * (shadowRadius * 2.);
        // Penumbra offset
        offset += vogelSample * (penumbra * texelScalar);
        shadow += step( compare, unpackRGBAToDepth( texture2D( shadowMap, uv + offset ) ) );
    }
    #pragma unroll_loop_end
    return shadow * gShadowSamplesRpc;
}
    float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
        return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
    }
    vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
        return unpackRGBATo2Half( texture2D( shadow, uv ) );
    }
    float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
        float occlusion = 1.0;
        vec2 distribution = texture2DDistribution( shadow, uv );
        float hard_shadow = step( compare , distribution.x ); // Hard Shadow
        if (hard_shadow != 1.0 ) {
            float distance = compare - distribution.x ;
            float variance = max( 0.00000, distribution.y * distribution.y );
            float softness_probability = variance / (variance + distance * distance ); // Chebeyshevs inequality
            softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 ); // 0.3 reduces light bleed
            occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
        }
        return occlusion;
    }
    float getShadow( int i, sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
        float shadow = 1.0;
        shadowCoord.xyz /= shadowCoord.w;
        shadowCoord.z += shadowBias;
        // if ( something && something ) breaks ATI OpenGL shader compiler
        // if ( all( something, something ) ) using this instead
        bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
        bool inFrustum = all( inFrustumVec );
        bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );
        bool frustumTest = all( frustumTestVec );
        if ( frustumTest ) {
        #if defined( SHADOWMAP_TYPE_PCF )
            vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
            return vogelShadow(i, shadowMap, shadowCoord.xy, texelSize.x, shadowCoord.z, shadowRadius );
        #elif defined( SHADOWMAP_TYPE_PCF_SOFT )
            vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
            float dx = texelSize.x;
            float dy = texelSize.y;
            vec2 uv = shadowCoord.xy;
            vec2 f = fract( uv * shadowMapSize + 0.5 );
            uv -= f * texelSize;
            shadow = (
                texture2DCompare( shadowMap, uv, shadowCoord.z ) +
                texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
                texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
                texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
                mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
                     texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
                     f.x ) +
                mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
                     texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
                     f.x ) +
                mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
                     texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
                     f.y ) +
                mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
                     texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
                     f.y ) +
                mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
                          texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
                          f.x ),
                     mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
                          texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
                          f.x ),
                     f.y )
            ) * ( 1.0 / 9.0 );
        #elif defined( SHADOWMAP_TYPE_VSM )
            shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
        #else // no percentage-closer filtering:
            shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
        #endif
        }
        return shadow;
    }
    // cubeToUV() maps a 3D direction vector suitable for cube texture mapping to a 2D
    // vector suitable for 2D texture mapping. This code uses the following layout for the
    // 2D texture:
    //
    // xzXZ
    //  y Y
    //
    // Y - Positive y direction
    // y - Negative y direction
    // X - Positive x direction
    // x - Negative x direction
    // Z - Positive z direction
    // z - Negative z direction
    //
    // Source and test bed:
    // https://gist.github.com/tschw/da10c43c467ce8afd0c4
    vec2 cubeToUV( vec3 v, float texelSizeY ) {
        // Number of texels to avoid at the edge of each square
        vec3 absV = abs( v );
        // Intersect unit cube
        float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
        absV *= scaleToCube;
        // Apply scale to avoid seams
        // two texels less per square (one texel will do for NEAREST)
        v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
        // Unwrap
        // space: -1 ... 1 range for each square
        //
        // #X##         dim    := ( 4 , 2 )
        //  # #         center := ( 1 , 1 )
        vec2 planar = v.xy;
        float almostATexel = 1.5 * texelSizeY;
        float almostOne = 1.0 - almostATexel;
        if ( absV.z >= almostOne ) {
            if ( v.z > 0.0 )
                planar.x = 4.0 - v.x;
        } else if ( absV.x >= almostOne ) {
            float signX = sign( v.x );
            planar.x = v.z * signX + 2.0 * signX;
        } else if ( absV.y >= almostOne ) {
            float signY = sign( v.y );
            planar.x = v.x + 2.0 * signY + 2.0;
            planar.y = v.z * signY - 2.0;
        }
        // Transform to UV space
        // scale := 0.5 / dim
        // translate := ( center + 0.5 ) / dim
        return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
    }
    float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
        float shadow = 1.0;
        vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
        // for point lights, the uniform @vShadowCoord is re-purposed to hold
        // the vector from the light to the world-space position of the fragment.
        vec3 lightToPosition = shadowCoord.xyz;
        // dp = normalized distance from light to fragment position
        float compare = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear ); // need to clamp?
        compare += shadowBias;
        // bd3D = base direction 3D
        vec3 bd3D = normalize( lightToPosition );
        vec2 halton = haltonSequence[frameIndex];
        float temporalOffset = getNoiseInterleavedGradient(gl_FragCoord.xy + halton);
        float temporalAngle  = temporalOffset * PI2;
        #if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_VSM )
            for (int i = 0; i < gShadowSamples; i++) {
                vec2 vogelSample = vogelDiskSample(i, gShadowSamples, temporalAngle) * texelSize;
                // Overall blurring offset
                vec3 offset = vec3(vogelSample.x, vogelSample.y, -vogelSample.x) * (shadowRadius + 5.);
                // NOTE: Removed for now
                // Penumbra offset
                //offset += vec3(vogelSample.x, vogelSample.y, vogelSample.y)  * (penumbra * gPenumbraFilterSize);
                shadow += texture2DCompare( shadowMap, cubeToUV( bd3D + offset, texelSize.y ), compare );
            }
            return shadow * gShadowSamplesRpc;
        #elif defined( SHADOWMAP_TYPE_PCF_SOFT )
            for (int i = 0; i < 16; i++) {
                vec2 vogelSample = vogelDiskSample(i, gShadowSamples, temporalAngle) * texelSize;
                // Overall blurring offset
                vec3 offset = vec3(vogelSample.x, vogelSample.y, -vogelSample.x) * (shadowRadius + 5.);
                shadow += texture2DCompare( shadowMap, cubeToUV( bd3D + offset, texelSize.y ), compare );
            }
            return shadow * (1.0 / 16.0);
        #else // no percentage-closer filtering
            return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), compare );
        #endif
    }
#endif
#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vObjectNormal;
varying vec3 vWNormal;
varying vec3 vWorldViewDir;
uniform vec3 nodeU0;
uniform float nodeU1;
uniform sampler2D nodeU2;
uniform bool nodeU3;
uniform float nodeU4;
uniform int nodeU5;
uniform float nodeU6;
uniform float nodeU7;
uniform float nodeU8;
uniform vec3 nodeU9;
uniform float nodeU10;
uniform float nodeU11;
uniform vec3 nodeU12;
uniform bool nodeU13;
uniform float nodeU14;
uniform int nodeU15;
uniform float nodeU16;
uniform int nodeU17;
uniform vec2 nodeU18;
uniform vec4 nodeU19;
uniform vec4 nodeU20;
uniform vec2 nodeU21;
uniform float nodeU22;
uniform float nodeU23;
uniform float nodeU24;
uniform float nodeU25;
uniform float nodeU26;
uniform vec2 nodeU27;
uniform vec2 nodeU28;
uniform int nodeU29;
uniform bool nodeU30;
uniform float nodeU31;
uniform int nodeU32;
uniform vec3 nodeU33;
uniform float nodeU34;
uniform bool nodeU35;
uniform float nodeU36;
uniform int nodeU37;
uniform sampler2D nodeU38;
uniform bool nodeU39;
uniform float nodeU40;
uniform int nodeU41;
uniform float nodeU42;
uniform float nodeU43;
uniform vec3 nodeU44;
uniform float nodeU45;
uniform vec2 nodeU46;
uniform vec2 nodeU47;
uniform vec2 nodeU48;
uniform vec4 nodeU49;
uniform vec4 nodeU50;
uniform vec4 nodeU51;
uniform vec4 nodeU52;
uniform int nodeU53;
uniform float nodeU54;
uniform float nodeU55;
uniform float nodeU56;
uniform float nodeU57;
uniform int nodeU58;
uniform bool nodeU59;
uniform float nodeU60;
uniform int nodeU61;
uniform float nodeU62;
uniform float nodeU63;
const float F3 = 0.3333333;
const float G3 = 0.1666667;
const int NUM_OCTAVES = 5;
vec3 customColor(vec3 color, float mask, float alpha, out float calpha) {
				float lalpha = alpha * mask;
				calpha =  lalpha / clamp(lalpha + accumAlpha, 0.00001, 1.0);
				accumAlpha += (1.0 - accumAlpha) * lalpha;
				return color;
			}
vec3 matcap(sampler2D matcapTex, vec3 normal, bool isMask, float mask, float alpha, int mode, out float calpha, float rotation) {
					vec3 viewDir = normalize( vViewPosition );
					vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
					vec3 y = cross( viewDir, x );
					vec2 vUv = vec2( dot( x, normal ), dot( y, normal ) );
					vUv = mat2( cos(rotation), sin(rotation), -sin(rotation), cos(rotation) ) * vUv;
					vUv = vUv * 0.495 + 0.5;
					vec4 matcapColor = texture2D( matcapTex, vUv );
					float lalpha = alpha * mask;
					calpha = mix(lalpha / clamp(lalpha + accumAlpha, 0.00001, 1.0), lalpha, float(isMask));
					accumAlpha += (1.0 - accumAlpha) * lalpha * (1.0 - float(isMask));
					return matcapColor.rgb;
            	}
vec3 random3(vec3 c) {
			float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
			vec3 r;
			r.z = fract(512.0*j);
			j *= .125;
			r.x = fract(512.0*j);
			j *= .125;
			r.y = fract(512.0*j);
			return r-0.5;
		}
vec2 rotate_uv(in vec2 uv, float a, bool repeat)
				{
					const float mid = 0.5;
					float radians = a * (PI / 180.0);
					vec2 rotated = vec2(
						cos(radians) * (uv.x - mid) + sin(radians) * (uv.y - mid) + mid,
						cos(radians) * (uv.y - mid) - sin(radians) * (uv.x - mid) + mid
					);
					return repeat ? fract(rotated): rotated;
				}
float hashwithoutsine12(vec2 p)
				{
					vec3 p3 = fract(vec3(p.xyx) * .1031);
					p3 += dot(p3, p3.yzx + 33.33);
					return fract((p3.x + p3.y) * p3.z);
				}
float checkerboard(in vec2 uv, in vec2 frequency, in float size, in float variation, in float smoothness, in float zigzag, in float rotation) {
                uv *= frequency;
                vec2 i = floor(uv);
                float offset = mod(i.y, 2.0);
                uv.x += offset + zigzag * offset;
                float x = floor(uv.x);
                return mod(x, 2.0);
            }
// Uses bisection
            float udf_cos(in vec2 p, in float a, in float b, in float c, in float d) {
                // Convert all data to a primitive cosine wave
                p = c * (p - vec2(d, a));
                const float TWO_PI = PI * 2.0;
                // Reduce to principal half cycle
                p.x = mod(p.x, TWO_PI);
                if (p.x > PI) {
                    p.x = TWO_PI - p.x;
                }
                // Find zero of derivative (minimize distance)
                float xa = 0.0;
                float xb = TWO_PI;
                // 24 bit precision
                for (int i = 0; i < 24; i++) {
                    float x = 0.5 * (xa + xb);
                    float y = x - p.x + b * c * sin(x) * (p.y - b * c * cos(x));
                    if (y < 0.0) xa = x;
                    else xb = x;
                }
                float x = 0.5 * (xa + xb);
                // Compute distance
                vec2 q = vec2(x, b * c * cos(x));
                return length(p - q) / c;
            }
            float wave(in vec2 vUv, in vec2 frequency, in float size, in float variation, in float smoothness, in float zigzag, in float rotation) {
                float repeat = frequency.x;
                vUv *= repeat;
                vec2 i = floor(vUv);
                float row_offset = mod(i.y, 2.0);
                vUv.x += row_offset * zigzag;
                vec2 f = vec2(vUv.x, fract(vUv.y));
                // Generalized cosine: y(x) = a + b * cos(cx + d)
                const float amplitude = 0.125;
                float wave_frequency = frequency.y * 0.1;
                float distance_estimate = udf_cos(f, 0.50, amplitude, wave_frequency * (2.0 * PI), 0.0);
				// Different approach for variation param here
				float rand = hashwithoutsine12(vec2(i.y));
				float s = mix(size, size * rand, variation);
                return smoothstep(-smoothness, smoothness, distance_estimate - s * 0.5);
            }
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
float hashwithoutsine13(vec3 p3)
		{
			p3  = fract(p3 * .1031);
			p3 += dot(p3, p3.yzx + 33.33);
			return fract((p3.x + p3.y) * p3.z);
		}
vec3 hashwithoutsine33(vec3 p3)
		{
			p3 = fract(p3 * vec3(.1031, .1030, .0973));
			p3 += dot(p3, p3.yxz+33.33);
			return fract((p3.xxy + p3.yxx)*p3.zyx);
		}
float metric(in vec3 p)
		{
			// L2
			return length(p);
			// Chebyshev
			// vec3 a = abs(p);
			// return max(a.x, max(a.y, a.z));
		}
float smin( float a, float b, float k )
		{
			float h = smoothstep(0.0, 1.0, 0.5 + 0.5 * (b - a) / k);
			float correction = k * h * (1.0 - h);
			return mix(b, a, h) - correction;
		}
float smax( float a, float b, float k )
		{
			float h = smoothstep(1.0, 0.0, 0.5 + 0.5 * (a - b) / k);
			float correction = k * h * (1.0 - h);
			return mix(a, b, h) + correction;
		}
float remap(float value, float input_min, float input_max, float output_min, float output_max) {
			// Compute width of each interval
			float input_width = input_max - input_min;
			float output_width = output_max - output_min;
			// Convert input range into a 0-1 range
			float scaled = (value - input_min) / input_width;
			// Convert the 0-1 range into a value in output range
			return output_min + (scaled * output_width);
		}
float simplexFast(vec3 p) {
			 vec3 s = floor(p + dot(p, vec3(F3)));
			 mediump vec3 x = p - s + dot(s, vec3(G3));
			 mediump vec3 hs = s;
			 mediump vec3 e = step(vec3(0.0), x - x.yzx);
			 mediump vec3 i1 = e*(1.0 - e.zxy);
			 mediump vec3 i2 = 1.0 - e.zxy*(1.0 - e);
			 mediump vec3 x1 = x - i1 + G3;
			 mediump vec3 x2 = x - i2 + 2.0*G3;
			 mediump vec3 x3 = x - 1.0 + 3.0*G3;
			 mediump vec4 w, d;
			 w.x = dot(x, x);
			 w.y = dot(x1, x1);
			 w.z = dot(x2, x2);
			 w.w = dot(x3, x3);
			 w = max(0.6 - w, 0.0);
			 d.x = dot(random3(hs), x);
			 d.y = dot(random3(hs + i1), x1);
			 d.z = dot(random3(hs + i2), x2);
			 d.w = dot(random3(hs + 1.0), x3);
			 w *= w;
			 w *= w;
			 d *= w;
			 return dot(d, vec4(52.0));
		}
vec2 tile_and_center(in vec2 uv, in vec2 frequency, in float variation, in float zigzag, in float rotation) {
                // Create tiles in UV-space
                uv *= frequency;
                // Integer coords
                vec2 i = floor(uv);
                // Offset every other row based on zigzag param, then compute fractional coords
                float row_offset = mod(i.y, 2.0);
                uv.x += row_offset * zigzag;
                vec2 f = fract(uv);
				// Rotate the tile itself:
				// const float mid = 0.5;
				// f = vec2(
				// 	cos(rotation) * (f.x - mid) + sin(rotation) * (f.y - mid) + mid,
				// 	cos(rotation) * (f.y - mid) - sin(rotation) * (f.x - mid) + mid
				// );
				// f = fract(f);
                f = f * 2.0 - 1.0;
				// Recompute integer coords after shifting - then, random value per tile
				i = floor(uv);
				float rand = (hashwithoutsine12(i) * 5.0 + 1.0);
				float jitter = mix(1.0, rand, variation);
				f *= jitter;
                return f;
            }
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
vec3 attenuation(vec3 wavelengths, float filmThickness, float movement, float noiseStrength, float noiseScale, vec3 offset) {
				float f = 0.0;
				if (noiseStrength != 0.0) {
					vec3 st = vPosition / noiseScale;
					float noise = simplexFast(1.6 * st + vec3(1.8, 1.5, 1.9) * simplexFast(st) + vec3(1.7, 9.2, 1.0));
					f = noise * noiseStrength;
				}
				vec3 waves = wavelengths * vec3(1.0, 0.8, 0.6) + 1.0;
				float angle = dot(normalize(vWorldViewDir + (offset * -0.001)), normalize(vWNormal));
				mediump vec3 color = cos((((filmThickness + f) / waves) * angle) + movement);
				return .5 + .5 * color;
			 }
float circle(in vec2 uv, in vec2 frequency, in float size, in float variation, in float smoothness, in float zigzag, in float rotation) {
                vec2 f = tile_and_center(uv, frequency, variation, zigzag, rotation);
                return smoothstep(
                    -smoothness,
                     smoothness,
                     length(f) - size
                );
            }
float ring(in vec2 uv, in vec2 frequency, in float size, in float variation, in float smoothness, in float zigzag, in float rotation) {
                vec2 f = tile_and_center(uv, frequency, variation, zigzag, rotation);
				float d = length(f);
                const float inner_width = 0.5;
                float outer = smoothstep(-smoothness, smoothness, d - size);
                float inner = smoothstep(-smoothness, smoothness, d - size * inner_width);
				return outer + (1.0 - inner);
            }
float sdf_ngon(in vec2 p, in float r, in int n) {
                float an = (PI * 2.0) / float(n);
                float he = r * tan(0.5 * an);
                // Rotate to first sector
                p = -p.yx;
                float bn = an * floor((atan(p.y, p.x) + 0.5 * an) / an);
                vec2  cs = vec2(cos(bn), sin(bn));
                p = mat2(cs.x, -cs.y, cs.y, cs.x)*p;
                // Side of polygon
                return length(p - vec2(r, clamp(p.y, -he, he))) * sign(p.x - r);
            }
            float polygon(in vec2 vUv, in vec2 frequency, in float size, in float variation, in float smoothness, in float zigzag, in float rotation, in int sides) {
                vec2 f = tile_and_center(vUv, frequency, variation, zigzag, rotation);
                return smoothstep(-smoothness, smoothness, sdf_ngon(f, size, sides));
            }
float sdf_cross(in vec2 p, in vec2 b, float r ) {
                p = abs(p);
				p = (p.y > p.x) ? p.yx : p.xy;
                vec2  q = p - b;
                float k = max(q.y, q.x);
                vec2  w = (k > 0.0) ? q : vec2(b.y - p.x, -k);
                return sign(k) * length(max(w, 0.0)) + r;
            }
            // Avoid namespace conflicts
            float xcross(in vec2 vUv, in vec2 frequency, in float size, in float variation, in float smoothness, in float zigzag, in float rotation) {
                vec2 f = tile_and_center(vUv, frequency, variation, zigzag, rotation);
                return smoothstep(-smoothness, smoothness, sdf_cross(f, vec2(size, size * 0.25), smoothness));
            }
float ndot(vec2 a, vec2 b) {
                return a.x*b.x - a.y*b.y;
            }
            float sdf_diamond(in vec2 p, in vec2 b) {
                p = abs(p);
                float h = clamp(ndot(b - 2.0 * p, b) / dot(b, b), -1.0, 1.0);
                float d = length(p - 0.5 * b * vec2(1.0 - h, 1.0 + h));
                return d * sign(p.x * b.y + p.y * b.x - b.x * b.y);
            }
            float diamond(in vec2 vUv, in vec2 frequency, in float size, in float variation, in float smoothness, in float zigzag, in float rotation) {
                vec2 f = tile_and_center(vUv, frequency, variation, zigzag, rotation);
	            return smoothstep(-smoothness, smoothness, sdf_diamond(f, vec2(size)));
            }
float line(in vec2 uv, in vec2 frequency, in float size, in float variation, in float smoothness, in float zigzag, in float rotation) {
                vec2 f = tile_and_center(uv, frequency, 0.0, zigzag, rotation);
				// Different approach for variation param here
				float row = floor(uv * frequency).y;
				float rand = hashwithoutsine12(vec2(row));
				float s = mix(size, size * rand, variation);
				return smoothstep(
					s - smoothness,
					s + smoothness,
					abs(f.y)
				);
            }
float simplexFractal(vec3 m) {
			mat3 rot1 = mat3(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);
			mat3 rot2 = mat3(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);
			mat3 rot3 = mat3(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);
			return 0.5333333 * simplexFast(m * rot1)
				 + 0.2666667 * simplexFast(2.0 * m * rot2)
				 + 0.1333333 * simplexFast(4.0 * m * rot3)
				 + 0.0666667 * simplexFast(8.0 * m);
		}
float simplexAshima(vec3 v) {
		  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
		  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
		  vec3 i  = floor(v + dot(v, C.yyy) );
		  vec3 x0 =   v - i + dot(i, C.xxx) ;
		  vec3 g = step(x0.yzx, x0.xyz);
		  vec3 l = 1.0 - g;
		  vec3 i1 = min( g.xyz, l.zxy );
		  vec3 i2 = max( g.xyz, l.zxy );
		  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
		  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
		  vec3 x3 = x0 - 1. + 3.0 * C.xxx;
		  i = mod(i, 289.0 );
		  vec4 p = permute( permute( permute(
					 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
				   + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
				   + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
		  float n_ = 1.0/7.0; // N=7
		  vec3  ns = n_ * D.wyz - D.xzx;
		  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)
		  vec4 x_ = floor(j * ns.z);
		  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
		  vec4 x = x_ *ns.x + ns.yyyy;
		  vec4 y = y_ *ns.x + ns.yyyy;
		  vec4 h = 1.0 - abs(x) - abs(y);
		  vec4 b0 = vec4( x.xy, y.xy );
		  vec4 b1 = vec4( x.zw, y.zw );
		  vec4 s0 = floor(b0)*2.0 + 1.0;
		  vec4 s1 = floor(b1)*2.0 + 1.0;
		  vec4 sh = -step(h, vec4(0.0));
		  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
		  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
		  vec3 p0 = vec3(a0.xy,h.x);
		  vec3 p1 = vec3(a0.zw,h.y);
		  vec3 p2 = vec3(a1.xy,h.z);
		  vec3 p3 = vec3(a1.zw,h.w);
		  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
		  p0 *= norm.x;
		  p1 *= norm.y;
		  p2 *= norm.z;
		  p3 *= norm.w;
		  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
		  m = m * m;
		  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
										dot(p2,x2), dot(p3,x3) ) );
		}
float noise(vec3 p){
			vec3 a = floor(p);
			vec3 d = p - a;
			d = d * d * (3.0 - 2.0 * d);
			vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
			vec4 k1 = perm(b.xyxy);
			vec4 k2 = perm(k1.xyxy + b.zzww);
			vec4 c = k2 + a.zzzz;
			vec4 k3 = perm(c);
			vec4 k4 = perm(c + 1.0);
			vec4 o1 = fract(k3 * (1.0 / 41.0));
			vec4 o2 = fract(k4 * (1.0 / 41.0));
			vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
			vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
			return o4.y * d.y + o4.x * (1.0 - d.y);
		}
vec3 rainbow(float filmThickness, float movement, vec3 wavelengths, float noiseStrength, float noiseScale, vec3 offset, bool isMask, float mask, float alpha, out float calpha) {
				mediump vec3 res = clamp(attenuation(wavelengths, filmThickness, movement, noiseStrength, noiseScale, offset), 0.0, 2.0);
				float rainbowContribution = clamp(res.r + res.g + res.b, 0.0, 1.0);
				float lalpha = alpha * rainbowContribution * mask;
				calpha = mix(lalpha / clamp(lalpha + accumAlpha, 0.00001, 1.0), lalpha, float(isMask));
				accumAlpha += (1.0 - accumAlpha) * lalpha * (1.0 - float(isMask));
				return res;
			 }
float fbm(vec3 x) {
			float v = 0.0;
			float a = 0.5;
			vec3 shift = vec3(100);
			for (int i = 0; i < NUM_OCTAVES; ++i) {
				v += a * noise(x);
				x = x * 2.0 + shift;
				a *= 0.5;
			}
			return v;
		}
float perlin(vec3 P){
		  vec3 Pi0 = floor(P);
		  vec3 Pi1 = Pi0 + vec3(1.0);
		  Pi0 = mod(Pi0, 289.0);
		  Pi1 = mod(Pi1, 289.0);
		  vec3 Pf0 = fract(P);
		  vec3 Pf1 = Pf0 - vec3(1.0);
		  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
		  vec4 iy = vec4(Pi0.yy, Pi1.yy);
		  vec4 iz0 = Pi0.zzzz;
		  vec4 iz1 = Pi1.zzzz;
		  vec4 ixy = permute(permute(ix) + iy);
		  vec4 ixy0 = permute(ixy + iz0);
		  vec4 ixy1 = permute(ixy + iz1);
		  vec4 gx0 = ixy0 / 7.0;
		  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
		  gx0 = fract(gx0);
		  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
		  vec4 sz0 = step(gz0, vec4(0.0));
		  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
		  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
		  vec4 gx1 = ixy1 / 7.0;
		  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
		  gx1 = fract(gx1);
		  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
		  vec4 sz1 = step(gz1, vec4(0.0));
		  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
		  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
		  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
		  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
		  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
		  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
		  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
		  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
		  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
		  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
		  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
		  g000 *= norm0.x;
		  g010 *= norm0.y;
		  g100 *= norm0.z;
		  g110 *= norm0.w;
		  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
		  g001 *= norm1.x;
		  g011 *= norm1.y;
		  g101 *= norm1.z;
		  g111 *= norm1.w;
		  float n000 = dot(g000, Pf0);
		  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
		  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
		  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
		  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
		  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
		  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
		  float n111 = dot(g111, Pf1);
		  vec3 fade_xyz = fade(Pf0);
		  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
		  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
		  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
		  return 2.2 * n_xyz;
		}
float voronoi(in vec3 x, in int style, in float smoothness, in float seed, in int quality)
		{
			// Integer and fractional parts of this point's coordinates
			ivec3 p = ivec3(floor(x));
			vec3 f = fract(x);
			// Different variables that we will use to construct noise:
			//
			// f1: distance to the closest feature point
			// f2: distance to the second closest feature point
			// e: distance to the closest edge (cell boundary)
			//
			// We also compute "smooth" versions of all of the above quantites, essentially
			// replacing "hard" minimums with "smooth" minimums (described by IQ)
			float f1_smooth = 8.0;
			float f1 = 8.0;
			float f2_smooth = 8.0;
			float f2 = 8.0;
			float e_smooth = 8.0;
			float e = 8.0;
			// Variables stored from closest cell
			ivec3 mb;
			vec3 mr;
			int steps = quality;
			for (int x = -steps; x <= steps; x++)
			for (int y = -steps; y <= steps; y++)
			for (int z = -steps; z <= steps; z++)
			{
				ivec3 b = ivec3(x, y, z);
				vec3 r = vec3(b) + hashwithoutsine33(vec3(p + b) + seed) - f;
				float d = length(r);
				f1_smooth = smin(d, f1_smooth, smoothness);
				// Store un-smoothed distances too
				if (d < f1)
				{
					f2 = f1;
					f1 = d;
					mb = ivec3(x, y, z);
					mr = r;
				}
				else if (d < f2)
				{
					f2 = d;
				}
			}
			// Second pass for edge distance
			// skip for styles don't need
			if (style != 0 &&  style != 5 && style != 7)
			for (int x = -steps; x <= steps; x++)
			for (int y = -steps; y <= steps; y++)
			for (int z = -steps; z <= steps; z++)
			{
				// Start search at the cell that contains the closest point to "x" (found in 1st pass)
				ivec3 b = mb + ivec3(x, y, z);
				vec3 r = vec3(b) + hashwithoutsine33(vec3(p + b) + seed) - f;
				float d1 = dot(0.5 * (mr + r), (r - mr)); 				// IQ normalizes "r - mr" but that breaks things for the smooth version?
				float d2 = dot(0.5 * (mr + r), normalize(r - mr));
				e_smooth = smin(d1, e_smooth, smoothness);
				e = min(e, d2);
				// Also compute a smooth version of F2 in this pass
				{
					ivec3 b = ivec3(x, y, z);
					if (b != mb)
					{
						vec3 r = vec3(b) + hashwithoutsine33(vec3(p + b) + seed) - f;
						float d = length(r);
						f2_smooth = smin(d, f2_smooth, smoothness);
					}
				}
			}
			// Different visualization modes
			if (style == 0)
			{
				return f1_smooth;
			}
			if (style == 1)
			{
				return f2_smooth;
			}
			if (style == 2)
			{
				return f2_smooth - f1_smooth;
				// "Pebbles" also cool
				//return step(0.2, f2_smooth - f1_smooth);
			}
			if (style == 3)
			{
				// This one is really good for rock / stone effects
				float a = f1;
				float b = f2;
				float k = 3.0;
				float h = max(k - abs(a - b), 0.0) / k;
				float final = min(a, b) - h * h * k * (1.0 / 4.0);
				return final;
			}
			if (style == 4)
			{
				// Some random adjustments to make this style stand out more
				return exp(5.0 * e_smooth);
			}
			if (style == 5)
			{
				return pow(f1_smooth, 3.0);
			}
			if (style == 6)
			{
				const float eps = 0.0125;
				// Thicker lines as the user increases the smoothness slider
				float thickness = smoothness * 0.25 + eps;
				// Blurrier lines as the user increases the smoothness slider
				float blur = pow(smoothness, 3.0) * 0.25 + eps;
				return smoothstep(
					thickness - thickness * blur,
					thickness + thickness * blur,
					e
				);
			}
			if (style == 7)
			{
				return hashwithoutsine13(vec3(p + mb) + seed);
			}
		}
vec3 g_uid65_pattern(vec3 normal, float blending, int style, vec2 offset, vec4 colorA, vec4 colorB, vec2 frequency, float size, float variation, float smoothness, float zigzag, float rotation, vec2 vertical, vec2 horizontal, int sides, bool isMask, float mask, float alpha, out float calpha) {
					const float TWO_PI = PI * 2.0;
					float smoothness_remapped = pow(smoothness, 5.0);
				vec2 custom_uv;
				custom_uv = vUv.st;
				custom_uv += offset;
				custom_uv = fract(custom_uv);
				custom_uv = rotate_uv(custom_uv, rotation, true);
				float draw = circle(custom_uv, frequency, size, variation, smoothness_remapped, zigzag, rotation);
					// Construct final output color
					vec4 color = mix(colorA, colorB, draw);
					color.a = clamp(color.a, 0.0, 1.0);
					// Apply cuts
					color.a *=
						step(vertical.x, custom_uv.y) *
						step(custom_uv.y, vertical.y);
					color.a *=
						step(horizontal.x, abs(custom_uv.x)) *
						step(abs(custom_uv.x), horizontal.y);
					// Accumulate alpha
					float lalpha = alpha * clamp(color.a, 0.0, 1.0) * mask;
					calpha = mix(lalpha / clamp(lalpha + accumAlpha, 0.00001, 1.0), lalpha, float(isMask));
					accumAlpha += (1.0 - accumAlpha) * lalpha * (1.0 - float(isMask));
					return clamp(color, 0.0, 1.0).rgb;
				}
vec3 simplexFastcustomNoise(float scale, vec3 size, float move, vec2 fA, vec2 fB, vec2 distortion, vec4 colorA, vec4 colorB, vec4 colorC, vec4 colorD, int voronoiStyle, float highCut, float lowCut, float smoothness, float seed, int quality, bool isMask, float mask, float alpha, out float calpha)
			{
                // Prevent scale of zero
				scale = max(abs(scale), 0.001);
				vec3 st = vPosition / size;
				st /= scale;
		vec3 q = vec3(simplexFast(st),
					   simplexFast(st + vec3(1.0)),
					   simplexFast(st + vec3(1.0)));
		vec3 r = vec3(simplexFast(st + vec3(distortion, 1.0) * q + vec3(fA, 1.0) + move),
					  simplexFast(st + vec3(distortion, 1.0) * q + vec3(fB, 1.0) + move),
					  simplexFast(st * q));
		float f = simplexFast(st + r);
		vec4 color;
		color = mix(colorA, colorB, clamp((f * f) * 4.0, 0.0, 1.0));
		color = mix(color, colorC, clamp(length(q), 0.0, 1.0));
		color = mix(color, colorD, clamp(length(r.x), 0.0, 1.0));
				float lalpha = alpha * color.a * mask;
				calpha = mix(lalpha / clamp(lalpha + accumAlpha, 0.00001, 1.0), lalpha, float(isMask));
				accumAlpha += (1.0 - accumAlpha) * lalpha * (1.0 - float(isMask));
				return clamp(color, 0.0, 1.0).rgb;
			}
void main() {
float g_uid89_calpha;
float g_uid83_calpha;
float g_uid76_calpha;
float g_uid65_calpha;
float g_uid27_calpha;
float g_uid20_calpha;
float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	#ifdef USE_TANGENT
		vec3 tangent = normalize( vTangent );
		vec3 bitangent = normalize( vBitangent );
		#ifdef DOUBLE_SIDED
			tangent = tangent * faceDirection;
			bitangent = bitangent * faceDirection;
		#endif
		#if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )
			mat3 vTBN = mat3( tangent, bitangent, normal );
		#endif
	#endif
#endif
vec3 geometryNormal = normal;
				// NOTE: gl_FrontFacing alternative using face normal estimation.
				vec3 viewdx = dFdx(vViewPosition);
				vec3 viewdy = dFdy(vViewPosition);
				vec3 faceNormal = normalize(cross(viewdx,viewdy));
				if (dot(normal, faceNormal) < 0.0) {
					normal *= -1.0;
				}
	BlinnPhongMaterial material;
	vec3 diffuseColor = spe_blend(spe_blend(spe_blend(customColor(nodeU0,1.0,nodeU1,g_uid89_calpha),matcap(nodeU2,normal,nodeU3,1.0,nodeU4,nodeU5,g_uid83_calpha,nodeU6),( g_uid83_calpha ),nodeU5),rainbow(nodeU7,nodeU8,nodeU9,nodeU10,nodeU11,nodeU12,nodeU13,1.0,nodeU14,g_uid76_calpha),( g_uid76_calpha ),nodeU15),g_uid65_pattern(normal,nodeU16,nodeU17,nodeU18,nodeU19,nodeU20,nodeU21,nodeU22,nodeU23,nodeU24,nodeU25,nodeU26,nodeU27,nodeU28,nodeU29,nodeU30,1.0,nodeU31,g_uid65_calpha),( g_uid65_calpha ),nodeU32);
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	vec3 specular = nodeU33;
	float shininess = max( 0.0001, nodeU34 );
	float specularStrength = 1.0;
#ifdef ALPHATEST
if ( nodeU62 <= ALPHATEST ) discard;
#endif
material.diffuseColor = diffuseColor;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
#ifdef USE_CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometry.viewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( 0 > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && 0 > 0
	PointLightShadow pointLightShadow;
	#endif
#endif
#if ( 1 > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && 1 > 0
	SpotLightShadow spotLightShadow;
	#endif
		spotLight = spotLights[ 0 ];
		getSpotLightInfo( spotLight, geometry, directLight );
		#if ( 0 < 0 )
		#define SPOT_LIGHT_MAP_INDEX 0
		#elif ( 0 < 1 )
		#define SPOT_LIGHT_MAP_INDEX 0
		#else
		#define SPOT_LIGHT_MAP_INDEX ( 0 - 1 + 0 )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < 0 )
			spotLightCoord = vSpotLightCoord[ 0 ].xyz / vSpotLightCoord[ 0 ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( 0 < 1 )
		spotLightShadow = spotLightShadows[ 0 ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( 0 + 3, spotShadowMap[ 0 ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ 0 ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
#endif
#if ( 1 > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && 0 > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
		directionalLight = directionalLights[ 0 ];
		getDirectionalLightInfo( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( 0 < 0 )
		directionalLightShadow = directionalLightShadows[ 0 ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( 0, directionalShadowMap[ 0 ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ 0 ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
#endif
#if ( 0 > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
	#if ( 1 > 0 )
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ 0 ], geometry.normal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif
#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif
vec3 ao = aoEnabled && nodeU35 ? tex2D(aoMap, gl_FragCoord.xy / resolution).rgb : vec3(1.0);
vec3 outgoingLight = ((reflectedLight.directDiffuse + reflectedLight.indirectDiffuse)) + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
				if (outgoingLight != diffuseColor) {
					float lightAccu = clamp( length( reflectedLight.directSpecular + reflectedLight.indirectSpecular ), 0.0, 1.0 );
					accumAlpha += ( 1.0 - accumAlpha ) * nodeU36 * 1.0 * lightAccu;
					outgoingLight = spe_blend( diffuseColor, outgoingLight, nodeU36 * 1.0, nodeU37 );
					outgoingLight *= ao;
				}
outgoingLight = spe_blend(outgoingLight, spe_blend(spe_blend(vec3( ( outgoingLight ) ),matcap(nodeU38,normal,nodeU39,1.0,nodeU40,nodeU41,g_uid27_calpha,nodeU42),( g_uid27_calpha ),nodeU41),simplexFastcustomNoise(nodeU43,nodeU44,nodeU45,nodeU46,nodeU47,nodeU48,nodeU49,nodeU50,nodeU51,nodeU52,nodeU53,nodeU54,nodeU55,nodeU56,nodeU57,nodeU58,nodeU59,1.0,nodeU60,g_uid20_calpha),( g_uid20_calpha ),nodeU61), 1.0, SPE_BLENDING_NORMAL);
gl_FragColor = vec4( outgoingLight, accumAlpha * nodeU62);
gl_FragColor.a *= nodeU63;
gl_FragColor = linearToOutputTexel( gl_FragColor );
#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif
#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif
vec2 oldPos = vPreviousPosition.xy;
    oldPos /= vPreviousPosition.w;
    oldPos.xy = (oldPos.xy+1.)/2.0;
vec2 newPos = vCurrentPosition.xy;
    newPos /= vCurrentPosition.w;
    newPos.xy = (newPos.xy+1.)/2.0;
vec2 velocity = (newPos - oldPos);
// Discard fully transparent pixels
if (gl_FragColor.a <= 0.0) discard;
gVelocity = vec4(velocity, 0.0, 1.0);
}
