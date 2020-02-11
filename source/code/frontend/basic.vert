precision lowp float;

#if __VERSION__ == 100
    attribute vec3 a_vertex;
    attribute vec3 a_normal;
#else
    #define varying out
    layout(location = 0) in vec3 a_vertex;
    layout(location = 1) in vec3 a_normal;
#endif

uniform mat4 u_viewProjection;
uniform mat4 u_model;

varying vec4 v_vertex;
varying vec3 v_normal;

void main()
{
    v_vertex = u_model * vec4(a_vertex, 1.0);
    vec4 normal = u_viewProjection * u_model * vec4(a_normal, 1.0);
    v_normal = normal.xyz / normal.w;
    gl_Position = u_viewProjection * v_vertex;
}
