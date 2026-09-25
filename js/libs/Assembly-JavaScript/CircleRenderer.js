class CircleRenderer extends RendererBase
{
    #uMatrixID = 0;
    #uColorID = 0;
    #uRadiusID = 0;
    #uStrokeColorID = 0;
    #uStrokeThicknessID = 0;
    #geometryBufferID = 0;
    #aVertexPosID = 0;
    #radius = 1;
    #strokeThickness = 0;

    #material = null;
    #colorOld = null;
    #strokeColorOld = null;

    strokeColor = Color.black;

    get isLoaded ()
    {
        return true;
    }

    get bounds ()
    {
        return new Bounds();
    }

    get localToWorldMatrix ()
    {
        return this.transform.localToWorldMatrix;
    }

    get radius ()
    {
        return this.#radius;
    }

    set radius (value)
    {
        if (this.#radius === value) return;

        this.#radius = value;
        this.#material.SetFloat(this.#uRadiusID, value);
    }

    get strokeThickness ()
    {
        return this.#strokeThickness;
    }

    set strokeThickness (value)
    {
        if (this.#strokeThickness === value) return;

        this.#strokeThickness = value;
        this.#material.SetFloat(this.#uStrokeColorID, value);
    }

    constructor ()
    {
        super();
        
        this.#material = new Material(Shader.Find("Baha/Circle"));

        this.#uMatrixID = this.#material.GetPropertyNameID("uMatrix");
        this.#uColorID = this.#material.GetPropertyNameID("uColor");
        this.#uRadiusID = this.#material.GetPropertyNameID("uRadius");
        this.#uStrokeColorID = this.#material.GetPropertyNameID("uStrokeColor");
        this.#uStrokeThicknessID = this.#material.GetPropertyNameID("uStrokeThickness");

        this.#geometryBufferID = this.#material.AddBuffer("geometry", null, 2);
        this.#aVertexPosID = this.#material.GetAttributeNameID("aVertexPos");

        this.#colorOld = this.color.Duplicate();
        this.#material.SetVector(this.#uColorID,
            this.#colorOld.r,
            this.#colorOld.g,
            this.#colorOld.b,
            this.#colorOld.a
        );

        this.#strokeColorOld = this.strokeColor.Duplicate();
        this.#material.SetVector(this.#uStrokeColorID,
            this.#strokeColorOld.r,
            this.#strokeColorOld.g,
            this.#strokeColorOld.b,
            this.#strokeColorOld.a
        );

        this.#material.SetFloat(this.#uRadiusID, this.#radius);
        this.#material.SetFloat(this.#uStrokeThicknessID, this.#strokeThickness);

        this.#material.SetBuffer(this.#geometryBufferID, [
            -1, -1,
            -1, 1,
            1, -1,

            -1, 1,
            1, 1,
            1, -1
        ]);
    }

    Render ()
    {
        const gl = this.#material.gl;
        
        const renderMatrix = this.renderMatrix;
        this.#material.SetMatrix(this.#uMatrixID,
            renderMatrix.matrix[0][0],
            renderMatrix.matrix[0][1],
            renderMatrix.matrix[0][2],
            renderMatrix.matrix[1][0],
            renderMatrix.matrix[1][1],
            renderMatrix.matrix[1][2],
            renderMatrix.matrix[2][0],
            renderMatrix.matrix[2][1],
            renderMatrix.matrix[2][2]
        );

        if (!this.#colorOld.Equals(this.color))
        {
            this.#colorOld = this.color.Duplicate();
            this.#material.SetVector(this.#uColorID,
                this.#colorOld.r,
                this.#colorOld.g,
                this.#colorOld.b,
                this.#colorOld.a
            );
        }

        if (!this.#strokeColorOld.Equals(this.strokeColor))
        {
            this.#strokeColorOld = this.strokeColor.Duplicate();
            this.#material.SetVector(this.#uStrokeColorID,
                this.#strokeColorOld.r,
                this.#strokeColorOld.g,
                this.#strokeColorOld.b,
                this.#strokeColorOld.a
            );
        }
        
        this.#material.SetAttribute(this.#aVertexPosID, this.#geometryBufferID);

        gl.useProgram(this.#material.program);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 5);
        gl.useProgram(null);
    }
}