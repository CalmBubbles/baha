class TouchInput extends GameBehavior
{
    static touchPos = Vector2.zero;
    static screenPos = Vector2.zero;
    static _pos = null;
    static _fingerID = null;
    static _cClamp = null;

    static camera = null;

    static get isTracking ()
    {
        return this._fingerID != null;
    }

    Start ()
    {
        TouchInput.camera = Camera.main;
    }

    static Track (touch)
    {
        this._fingerID = touch?.fingerID;
        this._pos = touch?.position ?? Vector2.zero;
        this.touchPos = this._pos;
    }

    static LockToCircle (center, radius)
    {
        const cCenter = TouchInput.camera.WorldToScreenPoint(center);

        this._cClamp = {
            center: cCenter,
            radius: Vector2.Subtract(TouchInput.camera.WorldToScreenPoint(Vector2.Add(center, radius)), cCenter).x
        };
    }

    static UnlockCircle ()
    {
        this._cClamp = null;
    }

    static Ended ()
    {
        const touch = Input.GetTouch(TouchInput._fingerID);

        if (touch == null) return false;
        return ([TouchPhase.Ended, TouchPhase.Cancelled]).includes(touch.phase);
    }

    EarlyUpdate ()
    {
        const touch = Input.GetTouch(TouchInput._fingerID);

        if (touch == null) return;

        const excess = new Vector2(
            (GameWindow.windowWidth - GameWindow.scaledCanvasWidth) * 0.5,
            (GameWindow.windowHeight - GameWindow.scaledCanvasHeight) * 0.5
        );
        const deltaPos = Vector2.Subtract(touch.position, TouchInput._pos);
        TouchInput._pos = touch.position;

        TouchInput.touchPos = Vector2.Clamp(
            Vector2.Add(TouchInput.touchPos, deltaPos),
            excess,
            Vector2.Add(
                new Vector2(GameWindow.scaledCanvasWidth, GameWindow.scaledCanvasHeight),
                excess
            )
        );

        if (TouchInput._cClamp != null)
        {
            const delta = Vector2.Subtract(TouchInput.touchPos, TouchInput._cClamp.center);
            const angle = Math.atan2(delta.y, delta.x);

            TouchInput.touchPos = Vector2.Add(
                TouchInput._cClamp.center,
                new Vector2(
                    TouchInput._cClamp.radius * Math.cos(angle),
                    TouchInput._cClamp.radius * Math.sin(angle)
                )
            );
        }
        
        TouchInput.screenPos = TouchInput.camera.ScreenToWorldPoint(TouchInput.touchPos);
    }
}