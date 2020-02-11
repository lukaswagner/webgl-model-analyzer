precision lowp float;

#if __VERSION__ == 100
    #define fragColor gl_FragColor
#else
    #define varying in
    layout(location = 0) out vec4 fragColor;
#endif

varying vec4 v_vertex;
varying vec3 v_normal;

const vec3 globalLightColor = vec3(0.3);

const vec3 lightPos = vec3(2.0, 1.0, -3.0);
const vec3 specColor = vec3(1.0, 1.0, 1.0);

void main(void)
{
    vec3 diffuseColor = vec3(1.0, 0.0, 0.0);
    vec3 vertPos = v_vertex.xyz/v_vertex.w;
    vec3 normal = v_normal;
    normal = normalize(normal);

    vec3 lightDir = normalize(lightPos - vertPos);

    float lambertian = max(dot(lightDir,normal), 0.0);
    float specular = 0.0;

    if(lambertian > 0.0) {
        vec3 reflectDir = reflect(-lightDir, normal);
        vec3 viewDir = normalize(-vertPos);

        float specAngle = max(dot(reflectDir, viewDir), 0.0);
        specular = pow(specAngle, 4.0);
    }

    fragColor = vec4(
        lambertian*diffuseColor
        + globalLightColor*diffuseColor
        , 1.0);
}
