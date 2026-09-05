class Fisher extends GameBehavior
{
    #dragging = false;
    #dragStartPos = 0;
    #dragEndPos = 0;
    #dragTime = 0;
    #dragDuration = 0.25;
    #minDistance = 1;
    #maxDistance = 5;

    #cam = null;

    Start ()
    {
        this.#cam = Camera.main;
    }

    Update ()
    {
        const mode = 0;
        const pos = this.#cam.ScreenToWorldPoint(Input.mousePosition).y;

        if (mode === 0)
        {
            if (Input.GetMouseButtonDown(0) && !this.#dragging)
            {
                this.#dragging = true;
                this.#dragStartPos = pos;
                this.#dragEndPos = pos;

                console.log("startdrag");
            }

            if (this.#dragging)
            {
                this.#dragTime += Time.deltaTime;

                if (pos < this.#dragEndPos - 1 || this.#dragTime > this.#dragDuration) this.#ResetDrag();
                else if (pos > this.#dragEndPos) this.#dragEndPos = pos;
            }

            if (Input.GetMouseButtonUp(0) && this.#dragging)
            {
                if (this.#dragEndPos > this.#dragStartPos) this.#Cast(this.#dragEndPos - this.#dragStartPos);
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

    #Cast (distance)
    {
        if (distance < this.#minDistance) return;
        if (distance > this.#maxDistance) distance = this.#maxDistance;

        console.log(`casted: ${distance}`);
    }
}