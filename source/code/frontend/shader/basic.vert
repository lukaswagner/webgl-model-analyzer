precision lowp float;

#if __VERSION__ == 100
    attribute vec3 a_vertex;
    attribute vec3 a_normal;
#else
    #define varying out
    layout(location = 0) in vec3 a_vertex;
    layout(location = 1) in vec3 a_normal;
    layout(location = 2) in vec3 a_value;
#endif

uniform mat4 u_model;
uniform mat4 u_viewProjection;
uniform mat3 u_modelViewInverseTranspose;

varying vec3 v_normal;
varying vec3 v_value;

void main()
{
    v_normal = normalize(u_modelViewInverseTranspose * a_normal);
    v_value = a_value;
    gl_Position = u_viewProjection * u_model * vec4(a_vertex, 1.0);
}
