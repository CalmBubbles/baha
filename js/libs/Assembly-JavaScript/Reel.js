class Reel extends GameBehavior
{
    #dragging = false;
    #handleSize = 0.3;
    #dragStart = Vector2.zero;

    #handle = null;

    Start ()
    {
        this.#handle = this.transform.Find("reel_handle").GetComponent(CircleRenderer);
        this.#handle.radius = this.#handleSize;

        // this.gameObject.SetActive(false);
    }

    Update ()
    {
        if (Vector2.Distance(CursorInput.screenPos, this.#handle.transform.position) <= this.#handleSize)
        {
            // hover

            // drag start
            if (Input.GetMouseButtonDown(0) && !this.#dragging)
            {
                this.#dragging = true;
                this.#dragStart = Vector2.Subtract(CursorInput.screenPos, this.#handle.transform.position);
            }
        }
        
        if (!this.#dragging) return;

        const pos = Vector2.Subtract(
            Vector2.Subtract(CursorInput.screenPos, this.#dragStart),
            this.transform.localPosition
        );

        this.transform.rotation = 180 * Math.atan2(pos.y, pos.x) / Math.PI;
    }
}