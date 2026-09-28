class CursorInput extends GameBehavior
{
    static mousePos = Vector2.zero;
    static screenPos = Vector2.zero;
    static visible = true;
    static locked = false;
    static _cClamp = null;
    
    static camera = null;

    #sprRenderer = null;
    
    Start ()
    {
        CursorInput.camera = Camera.main;
        this.#sprRenderer = this.GetComponent(SpriteRenderer);
    }

    static LockToCircle (center, radius)
    {
        const cCenter = CursorInput.camera.WorldToScreenPoint(center);

        this._cClamp = {
            center: cCenter,
            radius: Vector2.Subtract(CursorInput.camera.WorldToScreenPoint(Vector2.Add(center, radius)), cCenter).x
        };
    }

    static UnlockCircle ()
    {
        this._cClamp = null;
        CursorInput.locked = false;
    }

    EarlyUpdate ()
    {
        Cursor.visible = !Input.mousePresent;
        Cursor.locked = CursorInput.locked;

        this.#sprRenderer.color.a = +(Input.mousePresent && CursorInput.visible);
        
        if (CursorInput._cClamp != null) CursorInput.locked = true;

        if (CursorInput.locked)
        {
            const excess = new Vector2(
                (GameWindow.windowWidth - GameWindow.scaledCanvasWidth) * 0.5,
                (GameWindow.windowHeight - GameWindow.scaledCanvasHeight) * 0.5
            );

            CursorInput.mousePos = Vector2.Clamp(
                Vector2.Add(CursorInput.mousePos, Input.mousePositionDelta),
                excess,
                Vector2.Add(
                    new Vector2(GameWindow.scaledCanvasWidth, GameWindow.scaledCanvasHeight),
                    excess
                )
            );
        }
        else CursorInput.mousePos = Input.mousePosition;

        if (CursorInput._cClamp != null)
        {
            const delta = Vector2.Subtract(CursorInput.mousePos, CursorInput._cClamp.center);
            const angle = Math.atan2(delta.y, delta.x);

            CursorInput.mousePos = Vector2.Add(
                CursorInput._cClamp.center,
                new Vector2(
                    CursorInput._cClamp.radius * Math.cos(angle),
                    CursorInput._cClamp.radius * Math.sin(angle)
                )
            );
        }
        
        CursorInput.screenPos = CursorInput.camera.ScreenToWorldPoint(CursorInput.mousePos);
    }

    LateUpdate ()
    {
        this.transform.localPosition = CursorInput.screenPos;
    }
}