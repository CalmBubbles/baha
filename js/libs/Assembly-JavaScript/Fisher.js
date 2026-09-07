class Fisher extends GameBehavior
{
    #dragging = false;
    #casted = false;
    #bit = false;
    #dragStartPos = 0;
    #dragEndPos = 0;
    #dragCoyote = 0.5;
    #minDragDelta = 1;
    #dragTime = 0;
    #dragDuration = 0.25;

    #cam = null;
    #animator = null;

    Start ()
    {
        this.#cam = Camera.main;
        this.#animator = this.GetComponent(Animator);
    }

    Update ()
    {
        Caster.Update();

        const mode = 0;
        const pos = this.#cam.ScreenToWorldPoint(Input.mousePosition).y;

        if (this.#casted)
        {
            if (this.#bit && Input.GetMouseButtonDown(0))
            {
                console.log(`caught: ${Caster.GetCaught()}`);

                Caster.Reset();
                this.#animator.SetNumber("state", 0);

                this.#bit = false;
                this.#casted = false;
            }
            else if (!this.#bit && Caster.HasBit())
            {
                this.#bit = true;
                this.#animator.SetNumber("state", 3);

                console.log("bit");
            }

            return;
        }

        if (mode === 0)
        {
            if (Input.GetMouseButtonDown(0) && !this.#dragging)
            {
                this.#dragging = true;
                this.#dragStartPos = pos;
                this.#dragEndPos = pos;

                this.#animator.SetNumber("state", 1);

                console.log("startdrag");
            }

            if (this.#dragging)
            {
                this.#dragTime += Time.deltaTime;

                if (pos < this.#dragEndPos - this.#dragCoyote || this.#dragTime > this.#dragDuration)
                {
                    this.#animator.SetNumber("state", 0);
                    this.#ResetDrag();
                }
                else if (pos > this.#dragEndPos) this.#dragEndPos = pos;
            }

            if (Input.GetMouseButtonUp(0) && this.#dragging)
            {
                const dragDelta = this.#dragEndPos - this.#dragStartPos;

                if (dragDelta >= this.#minDragDelta) this.#Cast();
                else this.#animator.SetNumber("state", 0);
                
                this.#ResetDrag();
            }
        }
    }

    #ResetDrag ()
    {
        this.#dragging = false;
        this.#dragStartPos = 0;
        this.#dragEndPos = 0;
        this.#dragTime = 0;

        console.log("resetdrag");
    }

    #Cast ()
    {
        this.#casted = true;
        console.log("casted");

        this.#animator.SetNumber("state", 2);
        Caster.Cast();
    }
}