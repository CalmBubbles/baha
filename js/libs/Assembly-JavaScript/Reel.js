class Reel extends GameBehavior
{
    #dragging = false;
    #handleSize = 0.3;
    #turnRadius = 0;
    #maxSpeed = 1;  // rps
    #angle = 0;
    #dragStart = Vector2.zero;

    #handle = null;

    Start ()
    {
        this.#handle = this.transform.Find("reel_handle").GetComponent(CircleRenderer);
        this.#handle.radius = this.#handleSize;
        this.#turnRadius = this.#handle.transform.localPosition.x;

        // this.gameObject.SetActive(false);
    }

    Update ()
    {
        if (!this.#dragging)
        {
            if (Vector2.Distance(CursorInput.screenPos, this.#handle.transform.position) <= this.#handleSize)
            {
                // hover

                // drag start
                if (Input.GetMouseButtonDown(0))
                {
                    this.#dragging = true;
                    this.#dragStart = Vector2.Subtract(CursorInput.screenPos, this.#handle.transform.position);

                    // CursorInput.visible = false;
                }
            }

            return;
        }

        // let go
        if (Input.GetMouseButtonUp(0))
        {
            this.#dragging = false;
            this.#dragStart = Vector2.zero;

            CursorInput.visible = true;
            CursorInput.UnlockCircle();

            return;
        }

        CursorInput.LockToCircle(
            this.transform.localPosition,
            this.#turnRadius
        );

        const pos = Vector2.Subtract(
            Vector2.Subtract(CursorInput.screenPos, this.#dragStart),
            this.transform.localPosition
        );
        const fAngle = 360 * this.#maxSpeed * Time.deltaTime;

        let newAngle = 180 * Math.atan2(pos.y, pos.x) / Math.PI;
        if (newAngle < 0) newAngle += 360;
        if (newAngle < this.#angle && this.#angle > 180 - fAngle) newAngle += 360;

        const deltaAngle = Math.DeltaAngle(this.transform.rotation, newAngle);

        GameWindow.SetTitle(deltaAngle);

        // TODO: fix bug where going to opposite turns the knob

        if (deltaAngle > 0) this.#angle = newAngle;
            
        this.transform.rotation = Math.Clamp(
            this.#angle,
            this.transform.rotation - fAngle,
            this.transform.rotation + fAngle,
        );

        if (this.transform.rotation >= 360)
        {
            this.#angle = this.#angle % 360;
            this.transform.rotation = this.transform.rotation % 360;
        }
    }
}