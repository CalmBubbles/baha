class CursorInput extends GameBehavior
{
    static screenPos = Vector2.zero;

    #cam = null;
    #sprRenderer = null;
    
    Start ()
    {
        this.#cam = Camera.main;
        this.#sprRenderer = this.GetComponent(SpriteRenderer);
    }

    EarlyUpdate ()
    {
        Cursor.visible = !Input.mousePresent;
        this.#sprRenderer.color.a = Input.mousePresent ? 1 : 0;
        
        CursorInput.screenPos = this.#cam.ScreenToWorldPoint(Input.mousePosition);
        this.transform.localPosition = CursorInput.screenPos;
    }
}