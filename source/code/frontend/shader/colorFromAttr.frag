precision lowp float;

#if __VERSION__ == 100
    #define fragColor gl_FragColor
#else
    #define varying in
    layout(location = 0) out vec4 fragColor;
#endif

varying vec3 v_normal;
varying vec3 v_value;

const float c_dirLightIntensity = 0.7;
const float c_envLightIntensity = 0.5;
const vec3 c_dirLightDir = vec3(5.0, 6.0, 1.0);

void main(void)
{
    vec3 normal = normalize(v_normal);
    vec3 normLightDir = normalize(c_dirLightDir);
    float shadow = max(dot(normLightDir, normal), 0.0);
    float intensity = shadow * c_dirLightIntensity + c_envLightIntensity;
    fragColor = vec4(v_value * intensity, 1.0);
}
