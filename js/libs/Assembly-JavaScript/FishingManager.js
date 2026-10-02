class FishingManager extends GameBehavior
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

    #animator = null;
    #reel = null;
    #trackedTouch = null;

    Start ()
    {
        if (Application.isMobilePlatform) GameWindow.fullscreen = true;

        Crispixels.effect = true;

        this.#animator = this.GetComponent(Animator);

        this.#reel = GameObject.Find("reel").GetComponent("Reel");
    }

    Update ()
    {
        Caster.Update();

        const mode = 0;

        if (this.#casted)
        {   
            if (this.#bit && this.#reel.turns >= 2)
            {
                Caster.Reset();
                this.#animator.SetNumber("state", 0);

                this.#bit = false;
                this.#casted = false;

                this.#reel.Hide();
            }
            else if (!this.#bit && Caster.HasBit())
            {
                this.#bit = true;
                this.#animator.SetNumber("state", 3);

                this.#reel.Show();
            }

            return;
        }

        if (mode === 0)
        {
            const touch = this.#trackedTouch == null ? Input.touches.find(item => item.phase === TouchPhase.Began) : Input.GetTouch(this.#trackedTouch);
            const pos = Camera.main.ScreenToWorldPoint(touch == null ? CursorInput.mousePos : touch.position).y;

            if ((Input.GetMouseButtonDown(0) || touch != null) && !this.#dragging)
            {
                this.#dragging = true;
                this.#dragStartPos = pos;
                this.#dragEndPos = pos;

                this.#trackedTouch = touch?.fingerID;

                this.#animator.SetNumber("state", 1);

                console.log("startdrag");
            }

            if ((Input.GetMouseButtonUp(0) || ([TouchPhase.Ended, TouchPhase.Cancelled]).includes(touch?.phase)) && this.#dragging)
            {
                const dragDelta = this.#dragEndPos - this.#dragStartPos;

                if (dragDelta >= this.#minDragDelta) this.#Cast();
                else this.#animator.SetNumber("state", 0);
                
                this.#ResetDrag();
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
        }
    }

    #ResetDrag ()
    {
        this.#trackedTouch = null;

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