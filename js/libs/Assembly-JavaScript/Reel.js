class Reel extends GameBehavior
{
    #active = false;
    #dragging = false;
    #targetActivation = false;
    #activationValue = 0;
    #activationDuration = 0.125;
    #handleSize = 0.3;
    #turnRadius = 0;
    #rotation = 0;
    #lastInput = 0;
    #struggle = 0;
    #struggleTime = 0;
    #struggleStartTime = 0;
    #struggleStartDuration = 1;
    #dragStart = Vector2.zero;

    #sprRenderer = null;
    #handle = null;

    maxSpeed = 1;  // rps
    fihStrength = new Vector2(0.1, 1);
    fihBurstStrength = new Vector2(4, 6);
    fihBurstChance = 5;

    get turns ()
    {
        return this.transform.localRotation / 360;
    }

    Start ()
    {
        this.#sprRenderer = this.GetComponent(SpriteRenderer);
        this.#sprRenderer.color.a = 0;

        this.#handle = this.transform.Find("reel_handle").GetComponent(CircleRenderer);
        this.#handle.radius = this.#handleSize;
        this.#handle.color.a = 0;
        this.#turnRadius = this.#handle.transform.localPosition.x;
    }

    Update ()
    {
        this.#UpdateActiveState();

        if (!this.#active) return;

        this.#UpdateStruggle();
        this.#UpdateInputs();
    }

    #UpdateActiveState ()
    {
        if (this.#dragging && !this.#active && (TouchInput.Ended() || Input.GetMouseButtonUp(0)))
        {
            this.#dragging = false;

            CursorInput.visible = true;
            CursorInput.UnlockCircle();
            
            TouchInput.Track(null);
        }

        if (this.#targetActivation && !this.#active)
        {
            this.#activationValue = Math.min(
                this.#activationValue + Time.deltaTime / this.#activationDuration,
                1
            );
            this.#sprRenderer.color.a = this.#activationValue;

            if (this.#activationValue >= 1) this.#active = true;
        }
        else if (!this.#targetActivation && this.#active)
        {
            this.#activationValue = Math.max(
                this.#activationValue - Time.deltaTime / this.#activationDuration,
                0
            );
            this.#sprRenderer.color.a = this.#activationValue;

            if (this.#activationValue <= 0)
            {
                this.Reset();
                this.#active = false;
            }
        }
    }

    #UpdateStruggle ()
    {
        if (this.#struggleStartTime <= this.#struggleStartDuration)
        {
            this.#struggleStartTime += Time.deltaTime;
            return;
        }

        this.#struggleTime -= Time.deltaTime;

        if (this.#struggleTime <= 0)
        {
            const shouldBurst = this.#dragging && Math.random() <= 0.01 * this.fihBurstChance;
            const fihStrength = shouldBurst ? this.fihBurstStrength : this.fihStrength;

            this.#struggle = Math.RandomRanged(fihStrength.x, fihStrength.y);
            this.#struggleTime = shouldBurst ? 0.125 : Math.random() * 3;
        }
        
        this.#rotation -= 360 * this.#struggle * Time.deltaTime;
    }

    #UpdateInputs ()
    {
        this.#rotation = Math.min(
            this.#rotation,
            360 * (Math.floor(this.transform.localRotation / 360) + 1)
        );

        const fAngle = 360 * this.maxSpeed * Time.deltaTime;
        this.transform.localRotation = Math.Clamp(
            this.#rotation,
            -Infinity,
            this.transform.localRotation + fAngle,
        );

        if (!this.#dragging)
        {
            const touch = Input.touches.find(item => {
                if (item.phase !== TouchPhase.Began) return false;

                const pos = TouchInput.camera.ScreenToWorldPoint(item.position);

                return Vector2.Distance(pos, this.#handle.transform.position) <= this.#handleSize;
            });
            
            if (touch != null)
            {
                TouchInput.Track(touch);

                const pos = TouchInput.camera.ScreenToWorldPoint(touch.position);

                this.#dragging = true;
                this.#dragStart = Vector2.Subtract(pos, this.#handle.transform.position);
            }
            else if (Vector2.Distance(CursorInput.screenPos, this.#handle.transform.position) <= this.#handleSize)
            {
                // hover

                // drag start
                if (Input.GetMouseButtonDown(0))
                {
                    this.#dragging = true;
                    this.#dragStart = Vector2.Subtract(CursorInput.screenPos, this.#handle.transform.position);
                    this.#struggleStartTime = this.#struggleStartDuration;

                    CursorInput.visible = false;
                }
            }

            return;
        }

        // let go
        if (TouchInput.Ended() || Input.GetMouseButtonUp(0))
        {
            this.#dragging = false;

            this.#OnLetgo();

            CursorInput.visible = true;
            CursorInput.UnlockCircle();
            
            return;
        }

        CursorInput.LockToCircle(
            this.transform.localPosition,
            this.#turnRadius
        );
        TouchInput.LockToCircle(
            this.transform.localPosition,
            this.#turnRadius
        );

        const pos = Vector2.Subtract(
            Vector2.Subtract(TouchInput.isTracking ? TouchInput.screenPos : CursorInput.screenPos, this.#dragStart),
            this.transform.localPosition
        );

        let newAngle = 180 * Math.atan2(pos.y, pos.x) / Math.PI;
        const deltaInputAngle = Math.DeltaAngle(this.#lastInput, newAngle);
        this.#lastInput = newAngle;

        if (deltaInputAngle > 0) this.#rotation += deltaInputAngle;
    }

    #OnLetgo ()
    {
        this.#lastInput = this.transform.localRotation;
        this.#rotation = this.transform.localRotation;

        TouchInput.UnlockCircle();
    }

    Reset ()
    {
        this.transform.localRotation = 0;
        this.#dragStart = Vector2.zero;
        this.#struggle = 0;
        this.#struggleTime = 0;
        this.#struggleStartTime = 0;

        this.#OnLetgo();
    }

    Show ()
    {
        if (this.#active || this.#targetActivation) return;
        this.#targetActivation = true;
    }

    Hide ()
    {
        if (!this.#active || !this.#targetActivation) return;

        this.#targetActivation = false;
    }
}