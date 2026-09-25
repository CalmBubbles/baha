// Baha/Circle

precision mediump float;

#if defined(VERTEX)
    uniform mat3 uMatrix;

    layout(location = 0) in vec2 aVertexPos;

    out vec2 vPos;

    void main ()
    {
        vPos = aVertexPos;
        gl_Position = vec4(uMatrix * vec3(aVertexPos, 1), 1);
    }

#elif defined(FRAGMENT)
    uniform vec4 uColor;
    uniform float uRadius;
    uniform vec4 uStrokeColor;
    uniform float uStrokeThickness;

    in vec2 vPos;
    
    layout(location = 0) out vec4 fragColor;

    void main ()
    {
        float distance = length(vPos);
        float delta = fwidth(distance);

        float mask = 1.0 - smoothstep(uRadius - uStrokeThickness - delta, uRadius - uStrokeThickness, distance);
        float strokeMask = 1.0 - smoothstep(uRadius - delta, uRadius, distance);

        float outline = strokeMask - mask;

        vec4 color = mix(vec4(0), uColor, mask);
        fragColor = mix(color, uStrokeColor, outline);
    }

#endif